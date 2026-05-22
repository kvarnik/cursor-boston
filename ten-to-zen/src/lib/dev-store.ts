import type { Message, Todo } from "./types";

interface DevState {
  users: Set<string>;
  messages: Message[];
  todos: Todo[];
}

declare global {
  var __ttzDevStore: DevState | undefined;
}

function getStore(): DevState {
  if (!global.__ttzDevStore) {
    global.__ttzDevStore = {
      users: new Set(),
      messages: [],
      todos: [],
    };
  }
  return global.__ttzDevStore;
}

function newId(): string {
  return crypto.randomUUID();
}

export const devStore = {
  hasUser(username: string): boolean {
    return getStore().users.has(username.toLowerCase());
  },

  addUser(username: string): boolean {
    const key = username.toLowerCase();
    const store = getStore();
    if (store.users.has(key)) return false;
    store.users.add(key);
    return true;
  },

  getMessages(since: Date, purgeBefore: Date): Message[] {
    const store = getStore();
    store.messages = store.messages.filter(
      (m) => new Date(m.createdAt) >= purgeBefore
    );
    return store.messages
      .filter((m) => new Date(m.createdAt) >= since)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  },

  addMessage(username: string, body: string): Message {
    const msg: Message = {
      id: newId(),
      username,
      body,
      createdAt: new Date().toISOString(),
    };
    getStore().messages.push(msg);
    return msg;
  },

  getTodos(username: string): { active: Todo[]; archived: Todo[] } {
    const key = username.toLowerCase();
    const mine = getStore().todos.filter(
      (t) => t.username.toLowerCase() === key
    );
    const active = mine
      .filter((t) => t.status === "active")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    const archived = mine
      .filter((t) => t.status === "archived")
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? b.createdAt).getTime() -
          new Date(a.completedAt ?? a.createdAt).getTime()
      );
    return { active, archived };
  },

  countActive(username: string): number {
    return devStore.getTodos(username).active.length;
  },

  addTodo(username: string, body: string): Todo {
    const todo: Todo = {
      id: newId(),
      username,
      body,
      status: "active",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    getStore().todos.push(todo);
    return todo;
  },

  archiveTodo(id: string, username: string): Todo | null {
    const key = username.toLowerCase();
    const todo = getStore().todos.find(
      (t) => t.id === id && t.username.toLowerCase() === key
    );
    if (!todo || todo.status !== "active") return null;
    todo.status = "archived";
    todo.completedAt = new Date().toISOString();
    return todo;
  },
};
