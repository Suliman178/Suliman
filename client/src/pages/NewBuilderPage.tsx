import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient';

let pendingProjectCreation: Promise<string> | undefined;

function createOneProject() {
  if (!pendingProjectCreation) {
    pendingProjectCreation = api
      .createProject({ name: 'Untitled AI Project', description: 'Created from builder' })
      .then(({ project }) => project.id)
      .finally(() => {
        pendingProjectCreation = undefined;
      });
  }
  return pendingProjectCreation;
}

export function NewBuilderPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    createOneProject()
      .then((projectId) => {
        if (active) navigate(`/builder/${projectId}`, { replace: true });
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not create project.');
      });
    return () => { active = false; };
  }, [navigate]);

  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black">Creating your project…</h1><p className="mt-2 text-slate-600">Preparing the builder workspace.</p>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</section></main>;
}
