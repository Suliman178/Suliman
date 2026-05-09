import { useState } from 'react';
import type { ChatMessage } from '../types/project';
export function useChat(initial: ChatMessage[] = []) { const [messages, setMessages] = useState(initial); return { messages, setMessages, appendMessage: (m: ChatMessage) => setMessages((prev)=>[...prev, m]) }; }
