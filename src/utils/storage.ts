import type { FormState } from '../types';

const STORAGE_KEY = 'ww_calc_saves';

export interface SaveEntry {
  id: string;
  name: string;
  timestamp: number;
  data: FormState;
}

/** 获取所有存档列表 */
export function getSaveList(): SaveEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SaveEntry[];
  } catch {
    return [];
  }
}

/** 保存一个存档 */
export function saveToLocal(name: string, data: FormState): SaveEntry {
  const saves = getSaveList();
  const entry: SaveEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    timestamp: Date.now(),
    data,
  };
  saves.push(entry);
  // 最多保留 20 个存档
  if (saves.length > 20) saves.splice(0, saves.length - 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  return entry;
}

/** 覆盖更新已有存档 */
export function updateSave(id: string, name: string, data: FormState): SaveEntry | null {
  const saves = getSaveList();
  const idx = saves.findIndex(s => s.id === id);
  if (idx === -1) return null;
  saves[idx] = { id, name, timestamp: Date.now(), data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  return saves[idx];
}

/** 删除一个存档 */
export function deleteSave(id: string): void {
  const saves = getSaveList().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

/** 导出存档为 JSON 文件下载 */
export function exportSave(data: FormState): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ww-calc-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 从 JSON 文件导入存档，返回 FormState 或 null */
export function importSaveFromFile(file: File): Promise<FormState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as FormState;
        resolve(data);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
