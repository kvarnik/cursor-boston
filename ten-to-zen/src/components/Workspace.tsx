"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MAX_ACTIVE_TODOS, POLL_INTERVAL_MS } from "@/lib/constants";
import type { Message, Todo } from "@/lib/types";
import { BostonHero } from "./BostonHero";

interface WorkspaceProps {
  username: string;
  remainingMs: number;
  progress: number;
  onLock: () => void;
}

function formatRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Workspace({
  username,
  remainingMs,
  progress,
  onLock,
}: WorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [active, setActive] = useState<Todo[]>([]);
  const [archived, setArchived] = useState<Todo[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [todoDraft, setTodoDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
  }, []);

  const fetchTodos = useCallback(async () => {
    const res = await fetch(
      `/api/todos?username=${encodeURIComponent(username)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setActive(data.active ?? []);
    setArchived(data.archived ?? []);
  }, [username]);

  useEffect(() => {
    fetchMessages();
    fetchTodos();
    const id = window.setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [fetchMessages, fetchTodos]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, body: chatDraft }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not send message.");
      return;
    }
    setChatDraft("");
    await fetchMessages();
  }

  async function addTodo(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, body: todoDraft }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add todo.");
      return;
    }
    setTodoDraft("");
    await fetchTodos();
  }

  async function completeTodo(id: string) {
    setError(null);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not complete todo.");
      return;
    }
    await fetchTodos();
  }

  useEffect(() => {
    if (remainingMs <= 0) onLock();
  }, [remainingMs, onLock]);

  const slotsLeft = MAX_ACTIVE_TODOS - active.length;

  return (
    <div className="workspace">
      <header className="workspace-header">
        <BostonHero compact />
        <div className="workspace-meta">
          <div>
            <h1>Ten to Zen</h1>
            <p className="channel-label">#cohort-global</p>
          </div>
          <div className="timer-block">
            <span className="timer-label">Time left today</span>
            <span className="timer-value">{formatRemaining(remainingMs)}</span>
            <div className="timer-bar" aria-hidden>
              <div
                className="timer-bar-fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="timer-user">@{username}</span>
          </div>
        </div>
      </header>

      {error && <p className="banner-error">{error}</p>}

      <div className="workspace-panels">
        <section className="panel chat-panel">
          <h2>Cohort stream</h2>
          <div className="message-list" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <p className="empty-state">No messages yet. Say hello.</p>
            ) : (
              messages.map((m) => (
                <article
                  key={m.id}
                  className={`message${m.username === username ? " message--self" : ""}`}
                >
                  <header>
                    <span className="message-user">@{m.username}</span>
                    <time dateTime={m.createdAt}>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </header>
                  <p>{m.body}</p>
                </article>
              ))
            )}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="Message the cohort…"
              aria-label="Message"
            />
            <button type="submit" disabled={!chatDraft.trim()}>
              Send
            </button>
          </form>
        </section>

        <section className="panel todo-panel">
          <h2>Your todos</h2>
          <p className="todo-hint">
            {slotsLeft > 0
              ? `${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left (max ${MAX_ACTIVE_TODOS} active)`
              : "Archive one to add another"}
          </p>
          <ul className="todo-list">
            {active.map((t) => (
              <li key={t.id}>
                <span>{t.body}</span>
                <button type="button" onClick={() => completeTodo(t.id)}>
                  Done
                </button>
              </li>
            ))}
          </ul>
          {active.length < MAX_ACTIVE_TODOS && (
            <form className="todo-form" onSubmit={addTodo}>
              <input
                value={todoDraft}
                onChange={(e) => setTodoDraft(e.target.value)}
                placeholder="Add a todo…"
                aria-label="New todo"
              />
              <button type="submit" disabled={!todoDraft.trim()}>
                Add
              </button>
            </form>
          )}
          <button
            type="button"
            className="archive-toggle"
            onClick={() => setShowArchive((v) => !v)}
          >
            {showArchive ? "Hide archive" : "View archive"}
          </button>
          {showArchive && (
            <ul className="todo-archive">
              {archived.length === 0 ? (
                <li className="empty-archive">Nothing archived yet.</li>
              ) : (
                archived.map((t) => (
                  <li key={t.id}>
                    <span>{t.body}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
