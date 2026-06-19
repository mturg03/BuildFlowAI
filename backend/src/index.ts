import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import * as db from "./db.js";
import { processForemanMessage } from "./engine.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 1. Message Ingestion API
app.post("/api/messages", async (req, res) => {
  const { sender, content } = req.body;

  if (!sender || !content) {
    return res.status(400).json({ error: "Missing required fields: sender and content" });
  }

  try {
    const result = await processForemanMessage(sender, content);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process foreman message" });
  }
});

// 2. Get All Projects (with active risks and foreman details)
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT p.*, f.name as foreman_name, f.phone as foreman_phone
      FROM projects p
      LEFT JOIN foremen f ON p.foreman_id = f.id
    `);

    // Fetch active risks count for each project
    const projectsWithRisks = await Promise.all(
      projects.map(async (p: any) => {
        const risks = await db.query(`
          SELECT COUNT(*) as count 
          FROM schedule_risks 
          WHERE project_id = '${p.id}' AND resolved = 0
        `);
        const riskCount = risks && risks.length > 0 ? risks[0].count : 0;
        return {
          ...p,
          active_risks_count: riskCount
        };
      })
    );

    res.json(projectsWithRisks);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch projects" });
  }
});

// 3. Get Project Detailed View
app.get("/api/projects/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const projects = await db.query(`
      SELECT p.*, f.name as foreman_name, f.phone as foreman_phone
      FROM projects p
      LEFT JOIN foremen f ON p.foreman_id = f.id
      WHERE p.id = '${projectId}'
    `);

    if (!projects || projects.length === 0) {
      return res.status(404).json({ error: `Project not found: ${projectId}` });
    }

    const project = projects[0];

    // Fetch tasks
    const tasks = await db.query(`
      SELECT * FROM project_tasks 
      WHERE project_id = '${projectId}'
      ORDER BY status DESC, name ASC
    `);

    // Fetch daily reports
    const reports = await db.query(`
      SELECT * FROM daily_reports 
      WHERE project_id = '${projectId}'
      ORDER BY date DESC
    `);

    // Fetch change orders
    const changeOrders = await db.query(`
      SELECT * FROM change_orders 
      WHERE project_id = '${projectId}'
      ORDER BY detected_at DESC
    `);

    // Fetch schedule risks
    const risks = await db.query(`
      SELECT * FROM schedule_risks 
      WHERE project_id = '${projectId}'
      ORDER BY resolved ASC, detected_at DESC
    `);

    // Fetch raw messages
    const messages = await db.query(`
      SELECT * FROM messages 
      WHERE project_id = '${projectId}'
      ORDER BY timestamp DESC
    `);

    res.json({
      ...project,
      tasks,
      daily_reports: reports,
      change_orders: changeOrders,
      schedule_risks: risks,
      messages
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch project details" });
  }
});

// 4. GET Project Messages
app.get("/api/projects/:id/messages", async (req, res) => {
  try {
    const messages = await db.query(`
      SELECT * FROM messages 
      WHERE project_id = '${req.params.id}'
      ORDER BY timestamp DESC
    `);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET Project Daily Reports
app.get("/api/projects/:id/reports", async (req, res) => {
  try {
    const reports = await db.query(`
      SELECT * FROM daily_reports 
      WHERE project_id = '${req.params.id}'
      ORDER BY date DESC
    `);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET Project Change Orders
app.get("/api/projects/:id/change-orders", async (req, res) => {
  try {
    const changeOrders = await db.query(`
      SELECT * FROM change_orders 
      WHERE project_id = '${req.params.id}'
      ORDER BY detected_at DESC
    `);
    res.json(changeOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET Project Schedule Risks
app.get("/api/projects/:id/risks", async (req, res) => {
  try {
    const risks = await db.query(`
      SELECT * FROM schedule_risks 
      WHERE project_id = '${req.params.id}'
      ORDER BY resolved ASC, detected_at DESC
    `);
    res.json(risks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Dedicated health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend static assets if the dist directory exists
const frontendDistPath = "/home/agent-frontend-engineer/buildflow-ai/frontend/dist";
if (fs.existsSync(frontendDistPath)) {
  console.log(`Serving static files from frontend build: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  
  // Wildcard handler for SPA routing
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  console.log(`Frontend build folder not found at ${frontendDistPath}. API server running stand-alone.`);
  app.get("/", (req, res) => {
    res.send({
      message: "BuildFlow AI Backend API is active.",
      endpoints: [
        "POST /api/messages",
        "GET /api/projects",
        "GET /api/projects/:id"
      ]
    });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BuildFlow AI Backend Server listening on port ${PORT}`);
});
