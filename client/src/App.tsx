import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { User } from './types/user';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BuilderPage } from './pages/BuilderPage';

function Guard({ user, children }: { user: User | null; children: ReactNode }) {
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App({ user, setUser }: { user: User | null; setUser: (user: User | null) => void }) {
  return (
    <>
      <Navbar user={user} onLogout={() => setUser(null)} />
      <Routes>
        <Route path="/login" element={<LoginPage onAuth={setUser} />} />
        <Route path="/dashboard" element={<Guard user={user}><DashboardPage /></Guard>} />
        <Route path="/builder/:projectId" element={<Guard user={user}><BuilderPage /></Guard>} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}
