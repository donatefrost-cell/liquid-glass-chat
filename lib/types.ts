export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type ThemeMode = "dark" | "light";

export interface ToastMessage {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
}

export interface ChatApiRequest {
  messages: Array<{
    role: Role;
    content: string;
  }>;
}

