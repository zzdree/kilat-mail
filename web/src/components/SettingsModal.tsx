import React, { useState } from 'react';
import { X, Save, Server, Globe } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDomain: string;
  onSaveDomain: (domain: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentDomain,
  onSaveDomain,
}) => {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [domainInput, setDomainInput] = useState(currentDomain);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl.trim());
    onSaveDomain(domainInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-pop">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">Pengaturan Kilat Mail</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloudflare Worker API URL</span>
            </label>
            <input
              type="text"
              placeholder="https://kilat-mail-worker.username.workers.dev"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Kosongkan untuk menggunakan <em>Local Mock Demo Mode</em> di browser.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Domain Email Aktif</span>
            </label>
            <input
              type="text"
              placeholder="domainanda.eu.org"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Domain yang sudah dikonfigurasi di Cloudflare Email Routing.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary !py-2 !px-4 text-xs">
              Batal
            </button>
            <button type="submit" className="btn-primary !py-2 !px-4 text-xs">
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
