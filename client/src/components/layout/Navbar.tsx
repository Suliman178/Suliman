import { Link, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { post } from '../../lib/apiClient';
import type { User } from '../../types/user';
import { Button, GhostButton } from '../ui/Button';
export function Navbar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const navigate = useNavigate();
  async function logout() { await post('/api/auth/logout', {}); onLogout(); navigate('/login'); }
  return <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
    <Link to="/" className="flex items-center gap-2 font-bold"><Code2 className="h-5 w-5 text-accent-600"/>AI App Builder</Link>
    <nav className="flex items-center gap-2"><GhostButton onClick={() => navigate('/dashboard')}>My Projects</GhostButton><Button onClick={() => navigate('/builder/new')}>New Project</Button><span className="hidden text-sm text-gray-600 md:inline">{user?.email}</span>{user && <GhostButton onClick={logout}>Logout</GhostButton>}</nav>
  </header>;
}
