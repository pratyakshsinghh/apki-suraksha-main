import React, { useState, useRef } from 'react';
import { UserCheck, Upload, Trash2, Camera, Shield, CheckCircle2, User, AlertTriangle, Plus, X } from 'lucide-react';
import { AuthorizedMember } from '../types/safety';

interface AuthorizedMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: AuthorizedMember[];
  onSaveMembers: (members: AuthorizedMember[]) => void;
}

export const AuthorizedMembersModal: React.FC<AuthorizedMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  onSaveMembers,
}) => {
  const [memberList, setMemberList] = useState<AuthorizedMember[]>(members);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Primary Resident');
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: AuthorizedMember = {
      id: `member-${Date.now()}`,
      name: name.trim(),
      role,
      notes: notes.trim() || 'Whitelisted Resident',
      photoUrl: photoPreview || '',
      addedAt: new Date().toISOString(),
    };

    const updated = [newMember, ...memberList];
    setMemberList(updated);
    onSaveMembers(updated);
    setName('');
    setNotes('');
    setPhotoPreview(null);
  };

  const handleDelete = (id: string) => {
    const updated = memberList.filter((m) => m.id !== id);
    setMemberList(updated);
    onSaveMembers(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600/70 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Authorized Community Members</h3>
              <p className="text-[11px] text-slate-400">
                Uploaded faces are classified as <strong className="text-emerald-400">NO THREAT</strong>. Unregistered persons are flagged as <strong className="text-red-400">THREATS</strong>.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Authorized Members */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Registered Safe Whitelist ({memberList.length}):
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {memberList.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[#070b16] border border-slate-800 flex items-center justify-between text-xs transition duration-200 hover:border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-500/60 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 font-extrabold uppercase">
                        AUTHORIZED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {m.role} • {m.notes}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition"
                  title="Remove from safe whitelist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {memberList.length === 0 && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No members registered yet. Add your photo below so the AI recognizes you as safe.
              </div>
            )}
          </div>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="pt-3 border-t border-slate-800 space-y-3 text-xs">
          <p className="font-bold text-slate-200 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Upload Your Photo or Add Trusted Community Member</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name / Label</label>
              <input
                type="text"
                required
                placeholder="e.g. Myself (Owner) / Sister"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Role in Household / Society</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Primary Resident">Primary Resident</option>
                <option value="Family Member">Family Member</option>
                <option value="Trusted Neighbor">Trusted Neighbor</option>
                <option value="Security Guard">Security Guard</option>
                <option value="Verified Staff">Verified Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Upload Photo (Face / Person Profile)</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-2 transition hover:scale-102"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Select Photo from Device</span>
              </button>

              {photoPreview && (
                <div className="flex items-center space-x-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                  />
                  <span className="text-[11px] text-emerald-400 font-medium">Photo Ready</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Supports JPEG / PNG. Used by Gemini Vision to verify authorized residents vs strangers.
            </p>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Notes / Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Always wears blue jacket / Flat 402 owner"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition hover:scale-102"
          >
            <UserCheck className="w-4 h-4" />
            <span>Save to Authorized Safe List</span>
          </button>
        </form>
      </div>
    </div>
  );
};
