'use client';

import React from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

export interface ManageGenresModalProps {
  isOpen: boolean;
  genres: { id: string; name: string; color: string }[];
  onClose: () => void;
  onChange: (next: { id: string; name: string; color: string }[]) => void;
}

export const ManageGenresModal: React.FC<ManageGenresModalProps> = ({ isOpen, genres, onClose, onChange }) => {
  const [items, setItems] = React.useState(genres);
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#888888');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setItems(genres), [genres]);

  if (!isOpen) return null;

  const refresh = async () => {
    const res = await fetch('/api/genres');
    const data = await res.json();
    setItems(data);
    onChange(data);
  };

  const createItem = async () => {
    if (!newName.trim() || !newColor.trim()) return;
    setSaving(true);
    await fetch('/api/genres', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim(), color: newColor.trim() }) });
    setNewName('');
    setNewColor('#888888');
    await refresh();
    setSaving(false);
  };

  const updateItem = async (id: string, name: string, color: string) => {
    setSaving(true);
    await fetch(`/api/genres/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) });
    await refresh();
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    setSaving(true);
    await fetch(`/api/genres/${id}`, { method: 'DELETE' });
    await refresh();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Genres</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Genre name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-14 h-10 border border-gray-300 rounded-lg p-1"
              title="Pick color"
            />
            <button onClick={createItem} disabled={saving || !newName.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {items.map((g) => (
              <GenreRow key={g.id} genre={g} onSave={updateItem} onDelete={deleteItem} saving={saving} />
            ))}
            {items.length === 0 && (
              <div className="p-6 text-center text-gray-500">No genres yet.</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const GenreRow: React.FC<{
  genre: { id: string; name: string; color: string };
  onSave: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
  saving: boolean;
}> = ({ genre, onSave, onDelete, saving }) => {
  const [name, setName] = React.useState(genre.name);
  const [color, setColor] = React.useState(genre.color);

  return (
    <div className="flex items-center gap-2 p-3">
      <span className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-14 h-10 border border-gray-300 rounded-lg p-1 shrink-0"
        title="Pick color"
      />
      <button onClick={() => onSave(genre.id, name.trim(), color)} disabled={saving || !name.trim()} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shrink-0">
        <Save className="w-4 h-4" />
      </button>
      <button onClick={() => onDelete(genre.id)} disabled={saving} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};


