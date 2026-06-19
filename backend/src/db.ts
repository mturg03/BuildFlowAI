import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function query<T = any>(sql: string): Promise<T[]> {
  // Escape double quotes for shell execution
  const escapedSql = sql.replace(/"/g, '\\"');
  
  const maxRetries = 3;
  const delays = [100, 300, 900];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { stdout, stderr } = await execAsync(`team-db "${escapedSql}"`);
      if (stderr && stderr.trim() && !stdout) {
        console.warn("team-db stderr:", stderr);
      }
      return JSON.parse(stdout) as T[];
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      const isLockError = errorMessage.toLowerCase().includes("lock");

      if (isLockError && attempt < maxRetries) {
        const delay = delays[attempt];
        console.warn(`Database locked on attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${delay}ms... Error: ${errorMessage.trim()}`);
        await sleep(delay);
        continue;
      }

      console.error(`DB Query failed: ${sql}\nError:`, errorMessage);
      throw error;
    }
  }

  throw new Error("Query execution fell through retry loop unexpectedly");
}
