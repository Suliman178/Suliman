import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BuilderPage } from './pages/BuilderPage';
import { NewBuilderPage } from './pages/NewBuilderPage';
export function App() { return <Routes><Route path="/login" element={<LoginPage/>}/><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/builder/new" element={<NewBuilderPage/>}/><Route path="/builder/:projectId" element={<BuilderPage/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>; }
