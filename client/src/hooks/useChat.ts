import { useState } from 'react';
import type { ChatMessage } from '../types/project';
export function useChat(initial: ChatMessage[] = []) { const [chatMessages, setChatMessages] = useState(initial); return { chatMessages, setChatMessages }; }
