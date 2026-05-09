import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../lib/apiClient';
import type { Project } from '../types/project';
import type { User } from '../types/user';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]); const [user, setUser] = useState<User>(); const [error, setError] = useState(''); const navigate = useNavigate();
  useEffect(() => { api.me().then((d) => setUser(d.user)).catch(() => navigate('/login')); api.listProjects().then((d) => setProjects(d.projects)).catch((e) => setError(e.message)); }, [navigate]);
  async function createProject() { const name = prompt('Project name', 'Untitled AI Project'); if (!name) return; const { project } = await api.createProject({ name, description: 'Created from dashboard' }); navigate(`/builder/${project.id}`); }
  async function deleteProject(id: string) { if (!confirm('Delete this project and its files?')) return; await api.deleteProject(id); setProjects((p) => p.filter((x) => x.id !== id)); }
  return <div className="min-h-screen bg-slate-50"><Navbar user={user} onNewProject={createProject}/><main className="mx-auto max-w-6xl p-6"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-3xl font-black">My Projects</h1><p className="mt-1 text-slate-600">Saved projects are persisted and reopenable.</p></div><button className="btn-primary" onClick={createProject}><Plus size={16}/><span className="ml-2">New Project</span></button></div>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <article key={project.id} className="panel rounded-2xl p-5"><h2 className="text-lg font-bold">{project.name}</h2><p className="mt-2 min-h-12 text-sm text-slate-600">{project.description || 'No description yet.'}</p><p className="mt-4 text-xs text-slate-400">Updated {new Date(project.updatedAt).toLocaleString()}</p><div className="mt-5 flex gap-2"><Link className="btn-primary flex-1" to={`/builder/${project.id}`}>Open</Link><button className="btn-secondary px-3" onClick={() => deleteProject(project.id)}><Trash2 size={16}/></button></div></article>)}{projects.length === 0 && <button onClick={createProject} className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-left hover:border-green-600"><Plus className="mb-3 text-green-600"/><h2 className="font-bold">Create your first AI project</h2><p className="mt-1 text-sm text-slate-600">Start with a prompt and watch files appear.</p></button>}</div></main></div>;
}
