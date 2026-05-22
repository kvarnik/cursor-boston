"use client";

import { FormEvent, useState } from "react";
import { BostonHero } from "./BostonHero";

interface WelcomeScreenProps {
  onReady: (username: string) => void;
}

export function WelcomeScreen({ onReady }: WelcomeScreenProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not register username.");
        return;
      }
      onReady(data.username);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen welcome-screen">
      <BostonHero />
      <header className="welcome-header">
        <p className="eyebrow">Cursor Boston · Cohort comms</p>
        <h1>Ten to Zen</h1>
        <p className="tagline">
          Intentional comms. Spend 10 minutes doing work. Enjoy the rest of your
          day.
        </p>
      </header>
      <form className="welcome-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Choose a username</label>
        <input
          id="username"
          name="username"
          autoComplete="off"
          placeholder="e.g. harbor_runner"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading || !username.trim()}>
          {loading ? "Checking…" : "Enter the board"}
        </button>
      </form>
      <p className="welcome-note">
        First-come username · 10 minutes per day while this tab is open
      </p>
    </div>
  );
}
