import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { FormState } from '../types';
import type { SaveEntry } from '../utils/storage';
import { getSaveList, saveToLocal, updateSave, deleteSave, exportSave, importSaveFromFile } from '../utils/storage';
import { Save, FolderOpen, Download, Upload, Trash2, X } from 'lucide-react';

interface Props {
  formState: FormState;
  onLoad: (state: FormState) => void;
}

export function SaveLoadPanel({ formState, onLoad }: Props) {
  const [showPanel, setShowPanel] = useState(false);
  const [saves, setSaves] = useState<SaveEntry[]>(() => getSaveList());
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSaves = () => setSaves(getSaveList());

  const handleSave = () => {
    const name = saveName.trim() || (formState.character.name || '未命名') + ' - ' + new Date().toLocaleString('zh-CN');
    if (editingId) {
      updateSave(editingId, name, formState);
      setEditingId(null);
    } else {
      saveToLocal(name, formState);
    }
    setSaveName('');
    refreshSaves();
  };

  const handleLoad = (entry: SaveEntry) => {
    onLoad(entry.data);
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    deleteSave(id);
    refreshSaves();
  };

  const handleExport = () => {
    exportSave(formState);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await importSaveFromFile(file);
    if (data) {
      onLoad(data);
      setShowPanel(false);
    } else {
      alert('导入失败：文件格式不正确');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (entry: SaveEntry) => {
    setSaveName(entry.name);
    setEditingId(entry.id);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => { refreshSaves(); setShowPanel(!showPanel); }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            showPanel ? 'bg-blue-500 text-white' : 'bg-white/60 text-gray-600 hover:bg-blue-100 hover:text-blue-600 border border-gray-200'
          }`}
        >
          <FolderOpen size={15} />
          存档
        </button>
      </div>

      {showPanel && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
          {/* panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <h3 className="font-semibold text-gray-800">存档管理</h3>
              <button
                type="button"
                onClick={() => setShowPanel(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* save row */}
            <div className="px-5 py-3 border-b border-gray-50 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="存档名称（留空自动命名）"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Save size={14} />
                  {editingId ? '更新' : '保存'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setSaveName(''); }}
                    className="px-2 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* import/export row */}
            <div className="px-5 py-2 border-b border-gray-50 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
              >
                <Download size={13} />
                导出当前
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
              >
                <Upload size={13} />
                导入文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* saves list */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {saves.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">暂无存档</p>
              ) : (
                <div className="space-y-1">
                  {saves
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <button
                          type="button"
                          onClick={() => handleLoad(entry)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="text-sm font-medium text-gray-700 truncate">{entry.name}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleString('zh-CN')}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(entry)}
                          className="p-1 rounded text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="重命名"
                        >
                          <Save size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="删除"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
