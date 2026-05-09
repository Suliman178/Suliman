import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AgentRole } from '../types/ai';
import type { ChatMessage, ProjectFile } from '../types/project';
import { Navbar } from '../components/layout/Navbar';
import { ChatPanel } from '../components/chat/ChatPanel';
import { FileExplorer } from '../components/files/FileExplorer';
import { FileTabs } from '../components/files/FileTabs';
import { CodeEditor } from '../components/editor/CodeEditor';
import { LivePreview } from '../components/preview/LivePreview';
import { api } from '../lib/apiClient';
import { languageFromPath } from '../lib/fileLanguage';
import { useProject } from '../hooks/useProject';
import type { User } from '../types/user';

export function BuilderPage() {
  const { projectId } = useParams(); const navigate = useNavigate(); const { project, setProject, files, setFiles, chatMessages, setChatMessages, loading, error } = useProject(projectId); const [user, setUser] = useState<User>();
  const [selectedPath, setSelectedPath] = useState<string>(); const [openTabs, setOpenTabs] = useState<string[]>([]); const [model, setModel] = useState('gpt-4o-mini'); const [agent, setAgent] = useState<AgentRole>('auto'); const [aiLoading, setAiLoading] = useState(false); const [aiError, setAiError] = useState(''); const [saveStatus, setSaveStatus] = useState('Saved');
  useEffect(() => { api.me().then((d) => setUser(d.user)).catch(() => navigate('/login')); }, [navigate]);
  useEffect(() => { if (files.length && !selectedPath) openFile(files[0].path); }, [files]);
  const selectedFile = useMemo(() => files.find((f) => f.path === selectedPath), [files, selectedPath]); const tabFiles = openTabs.map((p) => files.find((f) => f.path === p)).filter(Boolean) as ProjectFile[];
  function openFile(path: string) { setSelectedPath(path); setOpenTabs((tabs) => tabs.includes(path) ? tabs : [...tabs, path]); }
  async function createProject() { const { project } = await api.createProject({ name: 'Untitled AI Project' }); navigate(`/builder/${project.id}`); }
  async function createFile() { if (!projectId) return; const path = prompt('File path', 'index.html'); if (!path) return; const language = languageFromPath(path); const { file } = await api.createFile(projectId, { path, language, content: language === 'html' ? '<!doctype html>\n<html><head><title>New App</title></head><body><h1>Hello</h1></body></html>' : '' }); setFiles((current) => [...current.filter((f) => f.path !== file.path), file].sort((a,b)=>a.path.localeCompare(b.path))); openFile(file.path); }
  async function deleteFile(path: string) { if (!projectId || !confirm(`Delete ${path}?`)) return; await api.deleteFile(projectId, path); const remaining = files.filter((f) => f.path !== path); setFiles(remaining); setOpenTabs((tabs) => tabs.filter((t) => t !== path)); if (selectedPath === path) setSelectedPath(remaining[0]?.path); }
  function closeTab(path: string) { setOpenTabs((tabs) => tabs.filter((t) => t !== path)); if (selectedPath === path) setSelectedPath(openTabs.filter((t) => t !== path)[0] || files[0]?.path); }
  function updateSelected(content: string) { if (!selectedFile || !projectId) return; setSaveStatus('Saving…'); setFiles((current) => current.map((f) => f.path === selectedFile.path ? { ...f, content } : f)); window.clearTimeout((updateSelected as any).timer); (updateSelected as any).timer = window.setTimeout(async () => { try { await api.saveFile(projectId, { path: selectedFile.path, language: selectedFile.language, content }); setSaveStatus('Saved'); } catch (e) { setSaveStatus(e instanceof Error ? e.message : 'Save failed'); } }, 700); }
  async function send(text: string) { if (!projectId) return; setAiLoading(true); setAiError(''); const temp: ChatMessage = { id: crypto.randomUUID(), projectId, role: 'user', content: text, agentRole: agent, model, createdAt: new Date().toISOString() }; setChatMessages((m) => [...m, temp]); try { const route = agent === 'reviewer' ? 'review-project' : agent === 'fixer' ? 'fix-project' : agent === 'uiux' ? 'improve-design' : files.length ? 'modify-project' : 'generate-project'; const result = await api.ai(route, { projectId, instruction: text, model, agentRole: agent }); setProject(result.project); setFiles(result.files); setChatMessages((m) => [...m, { id: crypto.randomUUID(), projectId, role: 'assistant', content: result.message + (result.missingApiKey ? '\n\nSetup note: OPENAI_API_KEY is missing, so this is a local fallback app.' : ''), agentRole: agent, model, createdAt: new Date().toISOString() }]); if (result.files[0]) openFile(result.files[0].path); } catch (e) { setAiError(e instanceof Error ? e.message : 'AI request failed'); } finally { setAiLoading(false); } }
  if (loading) return <div className="grid min-h-screen place-items-center">Loading project…</div>;
  return <div className="flex h-screen flex-col bg-slate-50"><Navbar user={user} onNewProject={createProject}/><main className="grid min-h-0 flex-1 grid-cols-[360px_minmax(420px,1fr)_minmax(360px,42vw)] gap-3 p-3"><ChatPanel messages={chatMessages} model={model} agent={agent} loading={aiLoading} error={aiError || error} onModelChange={setModel} onAgentChange={setAgent} onSend={send}/><section className="flex min-w-0 panel"><FileExplorer files={files} selectedPath={selectedPath} onSelect={openFile} onCreate={createFile} onDelete={deleteFile}/><div className="flex min-w-0 flex-1 flex-col"><div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3"><div><h1 className="truncate font-bold">{project?.name || 'AI Project'}</h1><p className="text-xs text-slate-500">{selectedFile?.path || 'No file selected'}</p></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{saveStatus}</span></div><FileTabs tabs={tabFiles} selectedPath={selectedPath} onSelect={openFile} onClose={closeTab}/><div className="min-h-0 flex-1"><CodeEditor file={selectedFile} onChange={updateSelected}/></div></div></section><LivePreview files={files}/></main></div>;
}
