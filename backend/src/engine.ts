import * as db from "./db.js";

export interface MessageIngestionResult {
  messageId: string;
  foreman: { id: string; name: string; phone: string } | null;
  project: { id: string; name: string } | null;
  actions: {
    timelineUpdated: boolean;
    changeOrderDetected: boolean;
    dailyReportUpdated: boolean;
    riskDetected: boolean;
  };
  details: {
    timelineUpdates?: string[];
    changeOrders?: string[];
    dailyReportId?: string;
    risks?: string[];
  };
}

export async function processForemanMessage(sender: string, content: string): Promise<MessageIngestionResult> {
  const timestamp = new Date().toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const result: MessageIngestionResult = {
    messageId,
    foreman: null,
    project: null,
    actions: {
      timelineUpdated: false,
      changeOrderDetected: false,
      dailyReportUpdated: false,
      riskDetected: false,
    },
    details: {
      timelineUpdates: [],
      changeOrders: [],
      risks: [],
    }
  };

  // 1. Resolve Foreman by phone number
  const foremen = await db.query(`SELECT * FROM foremen WHERE phone = '${sender}'`);
  let foremanId: string | null = null;
  let projectId: string | null = null;

  if (foremen && foremen.length > 0) {
    const f = foremen[0];
    result.foreman = { id: f.id, name: f.name, phone: f.phone };
    foremanId = f.id;

    // Resolve active project for this foreman
    const projects = await db.query(`SELECT * FROM projects WHERE foreman_id = '${f.id}' AND status = 'active'`);
    if (projects && projects.length > 0) {
      result.project = { id: projects[0].id, name: projects[0].name };
      projectId = projects[0].id;
    }
  }

  // 2. Save Message to DB
  await db.query(`
    INSERT INTO messages (id, project_id, foreman_id, sender, content, timestamp, processed)
    VALUES ('${messageId}', ${projectId ? `'${projectId}'` : "NULL"}, ${foremanId ? `'${foremanId}'` : "NULL"}, '${sender}', '${content.replace(/'/g, "''")}', '${timestamp}', 1)
  `);

  if (!projectId || !foremanId) {
    // Cannot proceed with other engines without an active project & foreman
    return result;
  }

  // 3. Project Timeline Updates Engine
  // Fetch active project tasks
  const tasks = await db.query(`SELECT * FROM project_tasks WHERE project_id = '${projectId}'`);
  if (tasks && tasks.length > 0) {
    for (const task of tasks) {
      const taskNameLower = task.name.toLowerCase();
      // Check if message mentions this task name
      if (content.toLowerCase().includes(taskNameLower)) {
        let completionPercent: number | null = null;
        let updateReason = "";

        // Regex pattern to search for percentage updates like "framing is 50%" or "framing 50% complete"
        const percentRegex = new RegExp(`${taskNameLower}[^.?!\\n]*?(\\d+)\\s*%`, "i");
        const match = content.match(percentRegex);

        if (match) {
          completionPercent = parseInt(match[1], 10);
          updateReason = `Percentage update matched: ${completionPercent}%`;
        } else {
          // Check for complete/finished/done keywords associated with the task
          const completedKeywords = ["complete", "completed", "done", "finished", "poured", "excavated", "100%"];
          const isCompleted = completedKeywords.some(kw => {
            const index = content.toLowerCase().indexOf(taskNameLower);
            const subStr = content.toLowerCase().substring(index, index + taskNameLower.length + 30);
            return subStr.includes(kw);
          });

          if (isCompleted) {
            completionPercent = 100;
            updateReason = "Completion keyword matched: 100%";
          } else if (content.toLowerCase().includes("started") || content.toLowerCase().includes("working on")) {
            completionPercent = task.completion_percentage > 0 ? task.completion_percentage : 10;
            updateReason = "Start keyword matched: marked as in-progress";
          }
        }

        if (completionPercent !== null && completionPercent >= 0 && completionPercent <= 100) {
          const newStatus = completionPercent === 100 ? "completed" : "in-progress";
          await db.query(`
            UPDATE project_tasks
            SET completion_percentage = ${completionPercent}, status = '${newStatus}'
            WHERE id = '${task.id}'
          `);
          result.actions.timelineUpdated = true;
          result.details.timelineUpdates?.push(`Task '${task.name}' updated to ${completionPercent}% (${newStatus}). Reason: ${updateReason}`);
        }
      }
    }

    // If any tasks were updated, recalculate overall project completion percentage
    if (result.actions.timelineUpdated) {
      const allTasks = await db.query(`SELECT completion_percentage FROM project_tasks WHERE project_id = '${projectId}'`);
      if (allTasks && allTasks.length > 0) {
        const sum = allTasks.reduce((acc: number, t: any) => acc + (t.completion_percentage || 0), 0);
        const avgCompletion = sum / allTasks.length;
        await db.query(`
          UPDATE projects
          SET completion_percentage = ${avgCompletion.toFixed(1)}
          WHERE id = '${projectId}'
        `);
      }
    }
  }

  // 4. Change Order Detection Engine
  const coKeywords = [
    { phrase: "move that wall", score: 0.9 },
    { phrase: "move the wall", score: 0.9 },
    { phrase: "additional work", score: 0.85 },
    { phrase: "extra work", score: 0.8 },
    { phrase: "owner requested", score: 0.95 },
    { phrase: "client requested", score: 0.95 },
    { phrase: "change order", score: 0.98 },
    { phrase: "not in drawings", score: 0.85 },
    { phrase: "not in drawing", score: 0.85 },
    { phrase: "not in scope", score: 0.9 },
    { phrase: "different material", score: 0.75 },
    { phrase: "add a door", score: 0.8 },
    { phrase: "add a window", score: 0.8 },
    { phrase: "extra cost", score: 0.8 },
    { phrase: "extra charge", score: 0.85 },
    { phrase: "RFI", score: 0.7 },
    { phrase: "can we change", score: 0.75 },
    { phrase: "can we add", score: 0.75 },
    { phrase: "modify the layout", score: 0.85 }
  ];

  let matchedCoKeyword = "";
  let coConfidence = 0;

  for (const item of coKeywords) {
    if (content.toLowerCase().includes(item.phrase)) {
      if (item.score > coConfidence) {
        coConfidence = item.score;
        matchedCoKeyword = item.phrase;
      }
    }
  }

  if (coConfidence > 0) {
    const coId = `co_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const coDesc = `Potential Change Order detected due to phrase "${matchedCoKeyword}" in message: "${content}"`;
    await db.query(`
      INSERT INTO change_orders (id, project_id, message_id, description, status, confidence_score, detected_at)
      VALUES ('${coId}', '${projectId}', '${messageId}', '${coDesc.replace(/'/g, "''")}', 'pending_review', ${coConfidence}, '${timestamp}')
    `);
    result.actions.changeOrderDetected = true;
    result.details.changeOrders?.push(`Change order detected with confidence ${coConfidence}. Keyword: "${matchedCoKeyword}"`);
  }

  // 5. Daily Report Engine
  // Check if message contains daily report info:
  // e.g. "We had 5 guys on site today. Framed the south wall. No safety issues. Waiting on concrete."
  const guysRegex = /(\d+)\s*(?:guys|workers|crew|men|people)/i;
  const guysMatch = content.match(guysRegex);
  const workersCount = guysMatch ? parseInt(guysMatch[1], 10) : 0;

  let workCompleted = "";
  let delaysEncountered = "";
  let safetyIncidents = "None reported";
  let materialsNeeded = "";

  // Very basic NLP extraction
  if (content.toLowerCase().includes("completed") || content.toLowerCase().includes("framed") || content.toLowerCase().includes("poured") || content.toLowerCase().includes("excavated") || content.toLowerCase().includes("worked on")) {
    workCompleted = content;
  }
  if (content.toLowerCase().includes("delay") || content.toLowerCase().includes("rain") || content.toLowerCase().includes("weather") || content.toLowerCase().includes("waiting")) {
    delaysEncountered = content;
  }
  if (content.toLowerCase().includes("accident") || content.toLowerCase().includes("hurt") || content.toLowerCase().includes("incident") || content.toLowerCase().includes("injured")) {
    safetyIncidents = content;
  }
  if (content.toLowerCase().includes("need") || content.toLowerCase().includes("waiting for") || content.toLowerCase().includes("shortage") || content.toLowerCase().includes("order more")) {
    materialsNeeded = content;
  }

  // Check if there is already a daily report for today
  const existingReports = await db.query(`
    SELECT * FROM daily_reports 
    WHERE project_id = '${projectId}' AND date = '${todayStr}'
  `);

  const reportId = existingReports && existingReports.length > 0 
    ? existingReports[0].id 
    : `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (existingReports && existingReports.length > 0) {
    const r = existingReports[0];
    const mergedWorkers = workersCount > 0 ? workersCount : r.workers_count;
    const mergedWork = workCompleted ? `${r.work_completed}\n${workCompleted}` : r.work_completed;
    const mergedDelays = delaysEncountered ? `${r.delays_encountered}\n${delaysEncountered}` : r.delays_encountered;
    const mergedSafety = safetyIncidents !== "None reported" ? `${r.safety_incidents}\n${safetyIncidents}` : r.safety_incidents;
    const mergedMaterials = materialsNeeded ? `${r.materials_needed}\n${materialsNeeded}` : r.materials_needed;
    
    let rawMsgIdsArr: string[] = [];
    try {
      rawMsgIdsArr = JSON.parse(r.raw_message_ids || "[]");
    } catch {
      rawMsgIdsArr = [];
    }
    if (!rawMsgIdsArr.includes(messageId)) {
      rawMsgIdsArr.push(messageId);
    }

    await db.query(`
      UPDATE daily_reports
      SET workers_count = ${mergedWorkers},
          work_completed = '${mergedWork.replace(/'/g, "''")}',
          delays_encountered = '${mergedDelays.replace(/'/g, "''")}',
          safety_incidents = '${mergedSafety.replace(/'/g, "''")}',
          materials_needed = '${mergedMaterials.replace(/'/g, "''")}',
          raw_message_ids = '${JSON.stringify(rawMsgIdsArr)}'
      WHERE id = '${r.id}'
    `);
    result.actions.dailyReportUpdated = true;
    result.details.dailyReportId = r.id;
  } else {
    // Only create a daily report if there is actually some content inside it (like guys, work done, delays etc.)
    if (workersCount > 0 || workCompleted || delaysEncountered || safetyIncidents !== "None reported" || materialsNeeded) {
      await db.query(`
        INSERT INTO daily_reports (id, project_id, date, foreman_id, work_completed, workers_count, delays_encountered, safety_incidents, materials_needed, raw_message_ids)
        VALUES (
          '${reportId}', 
          '${projectId}', 
          '${todayStr}', 
          '${foremanId}', 
          '${workCompleted.replace(/'/g, "''")}', 
          ${workersCount}, 
          '${delaysEncountered.replace(/'/g, "''")}', 
          '${safetyIncidents.replace(/'/g, "''")}', 
          '${materialsNeeded.replace(/'/g, "''")}', 
          '${JSON.stringify([messageId])}'
        )
      `);
      result.actions.dailyReportUpdated = true;
      result.details.dailyReportId = reportId;
    }
  }

  // 6. Delay Prediction Engine
  const delayKeywords = [
    { kw: "rain", type: "weather", severity: "medium", desc: "Rain delaying work" },
    { kw: "weather", type: "weather", severity: "medium", desc: "Unfavorable weather conditions" },
    { kw: "storm", type: "weather", severity: "high", desc: "Storm warning - safety halt" },
    { kw: "snow", type: "weather", severity: "medium", desc: "Snow delaying site work" },
    { kw: "cold", type: "weather", severity: "low", desc: "Extreme cold slowing down concrete curing" },
    { kw: "concrete delay", type: "materials", severity: "high", desc: "Concrete delivery delay" },
    { kw: "waiting for concrete", type: "materials", severity: "high", desc: "Waiting for concrete truck pour" },
    { kw: "waiting for lumber", type: "materials", severity: "medium", desc: "Short on framing lumber" },
    { kw: "short on lumber", type: "materials", severity: "medium", desc: "Framing lumber shortage" },
    { kw: "material delay", type: "materials", severity: "medium", desc: "General material shortage" },
    { kw: "waiting on shipment", type: "materials", severity: "medium", desc: "Shipment delivery delayed" },
    { kw: "no drywall", type: "materials", severity: "medium", desc: "Drywall material delay" },
    { kw: "short of guys", type: "labor", severity: "medium", desc: "Subcontractor labor shortage" },
    { kw: "guys didn't show", type: "labor", severity: "high", desc: "Crew did not report to work" },
    { kw: "labor shortage", type: "labor", severity: "medium", desc: "Labor constraints" },
    { kw: "sick", type: "labor", severity: "low", desc: "Workers out sick" },
    { kw: "no crew", type: "labor", severity: "high", desc: "No available crew on site" }
  ];

  for (const item of delayKeywords) {
    if (content.toLowerCase().includes(item.kw)) {
      // Determine severity adjustments
      let sev = item.severity;
      if (content.toLowerCase().includes("stuck") || content.toLowerCase().includes("stopped") || content.toLowerCase().includes("can't work") || content.toLowerCase().includes("critical") || content.toLowerCase().includes("shut down")) {
        sev = "high";
      }

      const riskId = `risk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      // Find matching milestone task if any
      let matchedMilestoneId = "NULL";
      if (tasks && tasks.length > 0) {
        const matchedTask = tasks.find((t: any) => content.toLowerCase().includes(t.name.toLowerCase()));
        if (matchedTask) {
          matchedMilestoneId = `'${matchedTask.id}'`;
        }
      }

      await db.query(`
        INSERT INTO schedule_risks (id, project_id, milestone_id, risk_type, description, severity, detected_at, resolved)
        VALUES ('${riskId}', '${projectId}', ${matchedMilestoneId}, '${item.type}', '${item.desc.replace(/'/g, "''")}: "${content.replace(/'/g, "''")}"', '${sev}', '${timestamp}', 0)
      `);
      result.actions.riskDetected = true;
      result.details.risks?.push(`Risk detected: ${item.type} (Severity: ${sev})`);
      break; // Log only the first matching risk pattern to prevent spamming
    }
  }

  return result;
}
