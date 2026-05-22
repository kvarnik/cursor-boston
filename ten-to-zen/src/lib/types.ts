export interface Message {
  id: string;
  username: string;
  body: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  username: string;
  body: string;
  status: "active" | "archived";
  createdAt: string;
  completedAt: string | null;
}

export interface TodosResponse {
  active: Todo[];
  archived: Todo[];
}
