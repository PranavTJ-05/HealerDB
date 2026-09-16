"use client";

import { useState } from "react";
import { X, Database, Shield, CheckCircle2, AlertTriangle, Key, Server, Globe } from "lucide-react";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conn: any) => void;
}

export function ConnectionModal({ isOpen, onClose, onSave }: ConnectionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    host: "localhost",
    port: 5433,
    database: "healerdb",
    user: "healerdb_user",
    password: "",
    ssl: false,
    environment: "production",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  if (!isOpen) return null;

  const handleTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult("success");
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `conn-${Date.now()}`,
      status: "connected",
      lastScanned: "Just now",
      tableCount: 2,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#2b2b3d] flex items-center justify-between text-xs font-mono text-[#cbd5e1] bg-[#181824]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Register New Target Database</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#28283d] rounded text-[#94a3b8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-[#94a3b8] block">Connection Name / Identifier</label>
            <input
              type="text"
              required
              placeholder="e.g. Analytics Postgres Primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#13131d] border border-[#2b2b3d] focus:border-blue-500 rounded px-3 py-1.5 text-[#e2e8f0] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[#94a3b8] block">Host / IP</label>
              <input
                type="text"
                required
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full bg-[#13131d] border border-[#2b2b3d] focus:border-blue-500 rounded px-3 py-1.5 text-[#e2e8f0] outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#94a3b8] block">Port</label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 5432 })}
                className="w-full bg-[#13131d] border border-[#2b2b3d] focus:border-blue-500 rounded px-3 py-1.5 text-[#e2e8f0] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#94a3b8] block">Database Name</label>
              <input
                type="text"
                required
                value={formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                className="w-full bg-[#13131d] border border-[#2b2b3d] focus:border-blue-500 rounded px-3 py-1.5 text-[#e2e8f0] outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#94a3b8] block">Username</label>
              <input
                type="text"
                required
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                className="w-full bg-[#13131d] border border-[#2b2b3d] focus:border-blue-500 rounded px-3 py-1.5 text-[#e2e8f0] outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#94a3b8] block">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#13131d] border border-[#2b2b3d] focus:border-blue-500 rounded px-3 py-1.5 text-[#e2e8f0] outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2b2b3d]">
            <label className="flex items-center gap-2 cursor-pointer text-[#cbd5e1]">
              <input
                type="checkbox"
                checked={formData.ssl}
                onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                className="rounded bg-[#13131d] border-[#2b2b3d] text-blue-600 focus:ring-0"
              />
              <span>Require SSL/TLS Connection</span>
            </label>

            {testResult === "success" && (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connection verified!
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#2b2b3d] flex items-center justify-between">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="px-3 py-1.5 rounded bg-[#28283d] hover:bg-[#33334d] text-[#cbd5e1] transition-colors"
            >
              {isTesting ? "Testing Ping..." : "Test Ping"}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded hover:bg-[#28283d] text-[#94a3b8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
