import fs from "node:fs";
import path from "node:path";
import type { JobMatch, Profile } from "./types";

/**
 * File-backed store used when Supabase is not configured. It keeps the
 * prototype fully runnable without any external service. All access is
 * server-side only.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "local-db.json");

export interface LocalUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface LocalAlert {
  user_id: string;
  sent_on: string;
  job_count: number;
}

interface LocalDb {
  users: Record<string, LocalUser>;
  profiles: Record<string, Profile>;
  matches: Record<string, JobMatch[]>;
  saved: Record<string, string[]>;
  alerts: LocalAlert[];
}

const emptyDb = (): LocalDb => ({
  users: {},
  profiles: {},
  matches: {},
  saved: {},
  alerts: [],
});

function readDb(): LocalDb {
  try {
    if (!fs.existsSync(DB_FILE)) return emptyDb();
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    return {
      users: parsed.users ?? {},
      profiles: parsed.profiles ?? {},
      matches: parsed.matches ?? {},
      saved: parsed.saved ?? {},
      alerts: parsed.alerts ?? [],
    };
  } catch {
    return emptyDb();
  }
}

function writeDb(db: LocalDb): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${DB_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temp, DB_FILE);
}

/** Stable id derived from the email so repeat sign-ins reuse the same user. */
export function userIdForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return `local-${hash.toString(16).padStart(8, "0")}`;
}

export function findOrCreateUser(
  email: string,
  fullName: string | null,
): LocalUser {
  const db = readDb();
  const id = userIdForEmail(email);
  const existing = db.users[id];

  if (existing) {
    if (fullName && !existing.full_name) {
      existing.full_name = fullName;
      db.users[id] = existing;
      writeDb(db);
    }
    return existing;
  }

  const user: LocalUser = {
    id,
    email,
    full_name: fullName,
    created_at: new Date().toISOString(),
  };
  db.users[id] = user;
  writeDb(db);
  return user;
}

export function getUser(id: string): LocalUser | null {
  return readDb().users[id] ?? null;
}

export function listUsers(): LocalUser[] {
  return Object.values(readDb().users);
}

export function getProfile(id: string): Profile | null {
  return readDb().profiles[id] ?? null;
}

export function saveProfile(id: string, profile: Profile): Profile {
  const db = readDb();
  db.profiles[id] = { ...profile, id, updated_at: new Date().toISOString() };
  writeDb(db);
  return db.profiles[id];
}

export function listProfiles(): Profile[] {
  return Object.values(readDb().profiles);
}

export function getMatches(userId: string): JobMatch[] {
  return readDb().matches[userId] ?? [];
}

export function upsertMatches(userId: string, matches: JobMatch[]): void {
  const db = readDb();
  const existing = db.matches[userId] ?? [];
  const byJobId = new Map(existing.map((match) => [match.job_id, match]));

  matches.forEach((match) => byJobId.set(match.job_id, match));
  db.matches[userId] = Array.from(byJobId.values());
  writeDb(db);
}

export function listSaved(userId: string): string[] {
  return readDb().saved[userId] ?? [];
}

export function findAlert(userId: string, sentOn: string): LocalAlert | null {
  return (
    readDb().alerts.find(
      (alert) => alert.user_id === userId && alert.sent_on === sentOn,
    ) ?? null
  );
}

export function recordAlert(alert: LocalAlert): void {
  const db = readDb();
  db.alerts = db.alerts.filter(
    (existing) =>
      !(
        existing.user_id === alert.user_id && existing.sent_on === alert.sent_on
      ),
  );
  db.alerts.push(alert);
  writeDb(db);
}

export function setSaved(userId: string, jobId: string, saved: boolean): void {
  const db = readDb();
  const current = db.saved[userId] ?? [];

  db.saved[userId] = saved
    ? Array.from(new Set([...current, jobId]))
    : current.filter((id) => id !== jobId);

  writeDb(db);
}
