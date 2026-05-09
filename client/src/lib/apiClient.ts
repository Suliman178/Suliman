import type { AgentRole, ProjectType } from '../types/ai';
import type { ChatMessage, Project, ProjectFile } from '../types/project';
import type { User } from '../types/user';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

type RequestBody = unknown;

export class ApiError extends Error {
  constructor(message: string, public status: number, public payload?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return undefined;
  return response.json().catch(() => undefined);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? JSON_HEADERS : {}),
      ...(options.headers || {})
    }
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : `Request failed with ${response.status}`;
    throw new ApiError(message, response.status, data);
  }
  return data as T;
}

export function get<T>(path: string) {
  return apiRequest<T>(path);
}

export function post<T>(path: string, body?: RequestBody) {
  return apiRequest<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
}

export function patch<T>(path: string, body?: RequestBody) {
  return apiRequest<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) });
}

export function del<T>(path: string, body?: RequestBody) {
  return apiRequest<T>(path, { method: 'DELETE', body: body === undefined ? undefined : JSON.stringify(body) });
}

export const api = {
  register: (payload: { email: string; password: string; name?: string }) => post<{ user: User }>('/api/auth/register', payload),
  login: (payload: { email: string; password: string }) => post<{ user: User }>('/api/auth/login', payload),
  logout: () => post<{ ok: boolean }>('/api/auth/logout'),
  me: () => get<{ user?: User }>('/api/auth/me'),
  listProjects: () => get<{ projects: Project[] }>('/api/projects'),
  createProject: (payload: { name: string; description?: string }) => post<{ project: Project }>('/api/projects', payload),
  getProject: (id: string) => get<{ project: Project; files: ProjectFile[]; chatMessages: ChatMessage[] }>(`/api/projects/${id}`),
  updateProject: (id: string, payload: Partial<Pick<Project, 'name' | 'description'>>) => patch<{ project: Project }>(`/api/projects/${id}`, payload),
  deleteProject: (id: string) => del<{ ok: boolean }>(`/api/projects/${id}`),
  saveFile: (projectId: string, file: Pick<ProjectFile, 'path' | 'language' | 'content'>) => patch<{ file: ProjectFile }>(`/api/projects/${projectId}/files`, file),
  createFile: (projectId: string, file: Pick<ProjectFile, 'path' | 'language' | 'content'>) => post<{ file: ProjectFile }>(`/api/projects/${projectId}/files`, file),
  deleteFile: (projectId: string, path: string) => del<{ ok: boolean }>(`/api/projects/${projectId}/files`, { path }),
  ai: (route: string, payload: { projectId?: string; instruction: string; model: string; agentRole: AgentRole; projectType: ProjectType }) => post<{ project: Project; files: ProjectFile[]; message: string; projectType: ProjectType; missingApiKey?: boolean }>(`/api/ai/${route}`, payload)
};
