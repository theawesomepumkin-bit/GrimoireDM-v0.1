import React, { useState } from 'react';
import { createFullExport, restoreFromBackup, resetDatabaseToDefaults } from '../utils/storage.ts';
import { Download, Upload, RotateCcw, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = async () => {
    try {
      const json = await createFullExport();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grimoire_dm_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Export failed: ' + String(e) });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result as string;
        setImportText(text);
        const ok = await restoreFromBackup(text);
        if (ok) {
          setStatusMessage({ type: 'success', text: `Restored backup from ${file.name} successfully!` });
          onRefreshData();
        } else {
          setStatusMessage({ type: 'error', text: 'Invalid backup file format.' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteRestore = async () => {
    if (!importText.trim()) return;
    const ok = await restoreFromBackup(importText);
    if (ok) {
      setStatusMessage({ type: 'success', text: 'Restored backup from pasted JSON successfully!' });
      onRefreshData();
    } else {
      setStatusMessage({ type: 'error', text: 'Invalid JSON backup format.' });
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all library entries, tokens, and notes back to initial SRD defaults?')) {
      await resetDatabaseToDefaults();
      setStatusMessage({ type: 'success', text: 'Reset to default SRD library and session state!' });
      onRefreshData();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Backup & Data Management Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-100 font-fantasy tracking-wide">
              Local Data, Backups & JSON Export
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/40 border-red-800/60 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="py-4 space-y-5 text-xs text-slate-300">
          <p className="leading-relaxed text-slate-400">
            All your campaign data, monster statblocks, spells, scratchpad notes, party stats, and battle grid tokens are stored locally on your device in IndexedDB.
          </p>

          {/* Export Action */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Export All Data as JSON</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Download a complete offline backup file of your entire DM companion.
              </div>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Import / Restore Action */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Restore from Backup</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Upload a previously exported JSON backup file.
                </div>
              </div>
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="pt-2">
              <textarea
                rows={3}
                placeholder="Or paste JSON backup string here..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-amber-500 select-text"
              />
              {importText.trim() && (
                <button
                  onClick={handlePasteRestore}
                  className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium rounded-lg border border-amber-500/30 text-xs"
                >
                  Restore Pasted JSON
                </button>
              )}
            </div>
          </div>

          {/* Factory Reset */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <div className="font-semibold text-slate-300">Reset to SRD Defaults</div>
              <div className="text-[11px] text-slate-500">
                Restore pre-seeded monsters, spells, and default party.
              </div>
            </div>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-950/30 hover:bg-red-900/50 text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
