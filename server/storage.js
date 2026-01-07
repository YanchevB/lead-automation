import { promises as fs } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "leads.json");

export async function saveLead(lead) {
  await ensureFile();

  const raw = await fs.readFile(dataPath, "utf-8");
  const leads = JSON.parse(raw);

  const saved = {
    id: cryptoRandomId(),
    ...lead
  };

  leads.unshift(saved); // newest first
  await fs.writeFile(dataPath, JSON.stringify(leads, null, 2), "utf-8");

  return saved;
}

async function ensureFile() {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, "[]", "utf-8");
  }
}

function cryptoRandomId() {
  // Node 18+ has global crypto; fallback to timestamp if not present
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `lead_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
