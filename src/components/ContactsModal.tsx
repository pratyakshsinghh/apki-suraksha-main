import React, { useState } from 'react';
import { Phone, UserPlus, Trash2, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { EmergencyContact } from '../types/safety';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onSaveContacts: (newContacts: EmergencyContact[]) => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onSaveContacts,
}) => {
  const [contactList, setContactList] = useState<EmergencyContact[]>(contacts);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Family');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      relation,
      phone: phone.trim(),
      notifySms: true,
      notifyCall: true,
      isPrimary,
    };

    const updated = [...contactList, newContact];
    setContactList(updated);
    onSaveContacts(updated);
    setName('');
    setPhone('');
    setIsPrimary(false);
  };

  const handleDelete = (id: string) => {
    const updated = contactList.filter((c) => c.id !== id);
    setContactList(updated);
    onSaveContacts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-950 border border-red-800 text-red-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Contacts</h3>
              <p className="text-[11px] text-slate-400">Notified instantly on SOS dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">
            ✕ Close
          </button>
        </div>

        {/* Existing Contacts List */}
        <div className="space-y-2">
          {contactList.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl bg-[#070b16] border border-slate-800 flex items-center justify-between text-xs transition duration-200 hover:border-slate-700"
            >
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>{c.name}</span>
                  {c.isPrimary && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                      PRIMARY
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400">
                  {c.relation} • {c.phone}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${c.phone}`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition hover:scale-105"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </a>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition hover:scale-105"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAdd} className="pt-3 border-t border-slate-800 space-y-3 text-xs">
          <p className="font-bold text-slate-200 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Add Emergency Guardian / Contact</span>
          </p>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Father / Friend / Neighbor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Relation</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="Family">Family</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0"
            />
            <label htmlFor="isPrimary" className="text-slate-300 font-medium">
              Set as primary emergency priority contact
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition hover:scale-102"
          >
            <UserPlus className="w-4 h-4" />
            <span>Save Contact</span>
          </button>
        </form>
      </div>
    </div>
  );
};
