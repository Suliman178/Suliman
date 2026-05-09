import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { App } from './App';
import { api } from './lib/apiClient';
import type { User } from './types/user';

function Root() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{ user: User | null }>('/api/auth/me')
      .then((data) => setUser(data.user))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="p-8 text-gray-600">Loading AI App Builder…</div>;

  return <BrowserRouter><App user={user} setUser={setUser} /></BrowserRouter>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root /></React.StrictMode>);
