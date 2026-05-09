import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { BuilderLayout } from '../components/layout/BuilderLayout';
import { ChatPanel } from '../components/chat/ChatPanel';
import { FileExplorer } from '../components/files/FileExplorer';
import { FileTabs } from '../components/files/FileTabs';
import { CodeEditor } from '../components/editor/CodeEditor';
import { LivePreview } from '../components/preview/LivePreview';
import { api, del, patch, post } from '../lib/apiClient';
import { languageFromPath } from '../lib/fileLanguage';
import type { AgentRole } from '../types/ai';
import type { ChatMessage, Project, ProjectFile } from '../types/project';

export function BuilderPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>();
  const [tabs, setTabs] = useState<string[]>([]);
  const [model, setModel] = useState('gpt-4.1-mini');
  const [agentRole, setAgentRole] = useState<AgentRole>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiNotice, setAiNotice] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved');

  useEffect(() => {
    api<{ openaiConfigured: boolean }>('/api/ai/status')
      .then((status) => {
        if (!status.openaiConfigured) setAiNotice('OPENAI_API_KEY is not configured. Add it to environment secrets to enable AI generation.');
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!projectId || projectId === 'new') {
      post<{ project: Project }>('/api/projects', { name: 'New AI Project', description: 'Describe an app in chat to generate files' })
        .then((data) => navigate(`/builder/${data.project.id}`, { replace: true }))
        .catch((err: Error) => setError(err.message));
      return;
    }

    api<{ project: Project; files: ProjectFile[]; messages: ChatMessage[] }>(`/api/projects/${projectId}`)
      .then((data) => {
        setProject(data.project);
        setFiles(data.files);
        setMessages(data.messages || []);
        if (data.files[0]) openFile(data.files[0].path, data.files);
      })
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  function openFile(path: string, source = files) {
    setSelectedPath(path);
    setTabs((previous) => (previous.includes(path) ? previous : [...previous, path]));
    if (!source.some((file) => file.path === path) && source[0]) setSelectedPath(source[0].path);
  }

  const selectedFile = files.find((file) => file.path === selectedPath);
  const tabFiles = tabs.map((path) => files.find((file) => file.path === path)).filter(Boolean) as ProjectFile[];

  async function send(text: string) {
    if (!project) return;
    setError('');
    setLoading(true);
    const optimistic: ChatMessage = { id: nanoid(), projectId: project.id, role: 'user', content: text, agentRole, model, createdAt: new Date().toISOString() };
    setMessages((current) => [...current, optimistic]);

    try {
      const endpoint = files.length ? '/api/ai/modify-project' : '/api/ai/generate-project';
      const data = await post<{ project: Project; files: ProjectFile[]; message: ChatMessage }>(endpoint, { projectId: project.id, instruction: text, model, agentRole });
      setProject(data.project);
      setFiles(data.files);
      setMessages((current) => [...current, data.message]);
      if (data.files[0]) openFile(data.files[0].path, data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateContent(content: string) {
    if (!selectedFile || !project) return;
    setSaveStatus('Unsaved');
    const updated = { ...selectedFile, content, updatedAt: new Date().toISOString() };
    setFiles((current) => current.map((file) => (file.id === selectedFile.id ? updated : file)));
    window.clearTimeout((updateContent as any).timer);
    (updateContent as any).timer = window.setTimeout(async () => {
      try {
        const data = await patch<{ file: ProjectFile }>(`/api/projects/${project.id}/files`, { path: selectedFile.path, language: selectedFile.language, content });
        setFiles((current) => current.map((file) => (file.path === data.file.path ? data.file : file)));
        setSaveStatus('Saved');
      } catch (err: any) {
        setSaveStatus('Save failed');
        setError(err.message);
      }
    }, 600);
  }

  async function createFile() {
    if (!project) return;
    const path = prompt('File path (example: index.html, src/App.js)');
    if (!path) return;
    try {
      const data = await post<{ file: ProjectFile }>(`/api/projects/${project.id}/files`, { path, language: languageFromPath(path), content: defaultContent(path) });
      const nextFiles = [...files.filter((file) => file.path !== data.file.path), data.file].sort((a, b) => a.path.localeCompare(b.path));
      setFiles(nextFiles);
      openFile(data.file.path, nextFiles);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteFile() {
    if (!project || !selectedPath) return;
    if (!confirm(`Delete ${selectedPath}?`)) return;
    const data = await del<{ files: ProjectFile[] }>(`/api/projects/${project.id}/files`, { path: selectedPath });
    setFiles(data.files);
    setTabs((current) => current.filter((path) => path !== selectedPath));
    setSelectedPath(data.files[0]?.path);
  }

  const editorPane = (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
        <strong className="truncate text-sm">{selectedFile?.path || 'No file selected'}</strong>
        <span className="text-xs text-gray-500">{saveStatus}</span>
      </div>
      <FileTabs tabs={tabFiles} selectedPath={selectedPath} onSelect={openFile} onClose={(path) => setTabs((current) => current.filter((item) => item !== path))} />
      <div className="min-h-0 flex-1"><CodeEditor file={selectedFile} onChange={updateContent} /></div>
    </div>
  );

  return <BuilderLayout chat={<ChatPanel messages={messages} onSend={send} loading={loading} model={model} setModel={setModel} agentRole={agentRole} setAgentRole={setAgentRole} error={error || aiNotice} />} files={<FileExplorer files={files} selectedPath={selectedPath} onSelect={openFile} onCreate={createFile} onDelete={deleteFile} />} editor={editorPane} preview={<LivePreview files={files} />} />;
}

function defaultContent(path: string) {
  if (path.endsWith('.html')) return '<!doctype html>\n<html><head><title>New File</title></head><body><h1>Hello</h1></body></html>';
  if (path.endsWith('.css')) return 'body { font-family: system-ui; }';
  if (path.endsWith('.js')) return 'console.log("ready");';
  return '';
}
