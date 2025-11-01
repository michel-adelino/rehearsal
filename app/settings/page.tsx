'use client';

import React from 'react';
import { ManageTeachersModal } from '@/app/components/modals/ManageTeachersModal';
import { ManageGenresModal } from '@/app/components/modals/ManageGenresModal';
import { ManageLevelsModal } from '@/app/components/modals/ManageLevelsModal';

export default function SettingsPage() {
  const [teachers, setTeachers] = React.useState<{ id: string; name: string; email?: string | null }[]>([]);
  const [genres, setGenres] = React.useState<{ id: string; name: string }[]>([]);
  const [levels, setLevels] = React.useState<{ id: string; name: string; color: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openTeachers, setOpenTeachers] = React.useState(false);
  const [openGenres, setOpenGenres] = React.useState(false);
  const [openLevels, setOpenLevels] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [tRes, gRes, lRes] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/genres'),
          fetch('/api/levels')
        ]);
        const [tData, gData, lData] = await Promise.all([tRes.json(), gRes.json(), lRes.json()]);
        if (!mounted) return;
        setTeachers(tData);
        setGenres(gData);
        setLevels(lData);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900">Teachers</h2>
                <button
                  onClick={() => setOpenTeachers(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Manage
                </button>
              </div>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                {teachers.map(t => (
                  <li key={t.id} className="p-3">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    {t.email && <div className="text-sm text-gray-600">{t.email}</div>}
                  </li>
                ))}
                {teachers.length === 0 && (
                  <li className="p-4 text-gray-500 text-center">No teachers yet.</li>
                )}
              </ul>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900">Genres</h2>
                <button
                  onClick={() => setOpenGenres(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Manage
                </button>
              </div>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                {genres.map(g => (
                  <li key={g.id} className="p-3">
                    <div className="font-medium text-gray-900">{g.name}</div>
                  </li>
                ))}
                {genres.length === 0 && (
                  <li className="p-4 text-gray-500 text-center">No genres yet.</li>
                )}
              </ul>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900">Levels</h2>
                <button
                  onClick={() => setOpenLevels(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Manage
                </button>
              </div>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                {levels.map(l => (
                  <li key={l.id} className="p-3 flex items-center gap-3">
                    <span className="w-5 h-5 rounded" style={{ backgroundColor: l.color }} />
                    <div className="font-medium text-gray-900">{l.name}</div>
                  </li>
                ))}
                {levels.length === 0 && (
                  <li className="p-4 text-gray-500 text-center">No levels yet.</li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>

      <ManageTeachersModal
        isOpen={openTeachers}
        teachers={teachers}
        onClose={() => setOpenTeachers(false)}
        onChange={(next) => setTeachers(next)}
      />

      <ManageGenresModal
        isOpen={openGenres}
        genres={genres}
        onClose={() => setOpenGenres(false)}
        onChange={(next) => setGenres(next)}
      />

      <ManageLevelsModal
        isOpen={openLevels}
        levels={levels}
        onClose={() => setOpenLevels(false)}
        onChange={(next) => setLevels(next)}
      />
    </div>
  );
}


