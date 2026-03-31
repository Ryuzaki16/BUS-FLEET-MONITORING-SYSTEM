/// <reference types="vite/client" />

export const projectId = import.meta.env.VITE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_PUBLIC_ANON_KEY;
export const BASE_URL = `https://${projectId}.${import.meta.env.VITE_BASE_URL}`;
