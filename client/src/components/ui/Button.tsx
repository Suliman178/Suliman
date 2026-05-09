import type { ButtonHTMLAttributes } from 'react';
export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={`rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-700 disabled:hover:bg-accent-600 ${className}`} {...props} />; }
export function GhostButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 ${className}`} {...props} />; }
