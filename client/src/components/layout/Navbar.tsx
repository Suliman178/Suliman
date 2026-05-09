import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, LogOut } from 'lucide-react';
import type { User } from '../../types/user';
import { api } from '../../lib/apiClient';

export function Navbar({ user, onNewProject }: { user?: User | null; onNewProject?: () => void }) {
  const navigate = useNavigate();
  async function logout() { await api.logout(); navigate('/login'); }
  return <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
    <Link to="/" className="flex items-center gap-2 font-black text-slate-950"><span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white">AI</span>AI App Builder</Link>
    <nav className="flex items-center gap-3">
      <Link className="btn-secondary" to="/dashboard"><FolderOpen size={16}/> <span className="ml-2">My Projects</span></Link>
      <button className="btn-primary" onClick={onNewProject || (() => navigate('/builder/new'))}><Plus size={16}/><span className="ml-2">New Project</span></button>
      {user && <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 md:block">{user.email}</div>}
      {user && <button className="btn-secondary px-3" title="Logout" onClick={logout}><LogOut size={16}/></button>}
    </nav>
  </header>;
}
