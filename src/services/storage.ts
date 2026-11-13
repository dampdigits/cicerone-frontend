import { PipelineResult, SavedResearchSession } from '../types/research';

const STORAGE_KEY_CURRENT = 'cicerone_current_result';
const STORAGE_KEY_HISTORY = 'cicerone_history';
const STORAGE_KEY_CHECKLISTS = 'cicerone_checklists';
const STORAGE_KEY_ACTIVE_JOB = 'cicerone_active_job';

export function saveCurrentResult(result: PipelineResult | null): void {
  try {
    if (!result) {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(result));
    }
  } catch (err) {
    console.warn('Could not save current result to localStorage:', err);
  }
}

export function getCurrentResult(): PipelineResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveJob(jobInfo: { jobId: string; provider: string; startedAt: number } | null): void {
  try {
    if (!jobInfo) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_JOB);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_JOB, JSON.stringify(jobInfo));
    }
  } catch (err) {
    console.warn('Could not save active job:', err);
  }
}

export function getActiveJob(): { jobId: string; provider: string; startedAt: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_JOB);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getHistory(): SavedResearchSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(session: SavedResearchSession): void {
  try {
    const history = getHistory().filter((s) => s.id !== session.id && s.jobId !== session.jobId);
    history.unshift(session);
    // Keep last 15 runs
    const trimmed = history.slice(0, 15);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Could not save session to history:', err);
  }
}

export function deleteSessionFromHistory(id: string): SavedResearchSession[] {
  try {
    const history = getHistory().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    return history;
  } catch {
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_CURRENT);
    localStorage.removeItem(STORAGE_KEY_CHECKLISTS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_JOB);
  } catch (err) {
    console.warn('Could not clear history:', err);
  }
}

export function getChecklistState(key: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKLISTS);
    const all = raw ? JSON.parse(raw) : {};
    return all[key] || {};
  } catch {
    return {};
  }
}

export function updateChecklistState(key: string, updates: Record<string, boolean>): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKLISTS);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = { ...(all[key] || {}), ...updates };
    localStorage.setItem(STORAGE_KEY_CHECKLISTS, JSON.stringify(all));
    return all[key];
  } catch {
    return {};
  }
}

export function toggleChecklistItem(key: string, itemKey: string): Record<string, boolean> {
  try {
    const current = getChecklistState(key);
    const updated = {
      ...current,
      [itemKey]: !current[itemKey],
    };
    const raw = localStorage.getItem(STORAGE_KEY_CHECKLISTS);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = updated;
    localStorage.setItem(STORAGE_KEY_CHECKLISTS, JSON.stringify(all));
    return updated;
  } catch {
    return {};
  }
}
