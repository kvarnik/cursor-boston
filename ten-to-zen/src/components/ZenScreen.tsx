"use client";

import { BostonHero } from "./BostonHero";
import type { Todo } from "@/lib/types";

interface ZenScreenProps {
  username: string;
  unfinished: Todo[];
}

export function ZenScreen({ username, unfinished }: ZenScreenProps) {
  return (
    <div className="screen zen-screen">
      <BostonHero compact />
      <div className="zen-content">
        <p className="zen-greeting">Peace, {username}.</p>
        <h1>Your ten minutes are complete.</h1>
        <p className="zen-prompt">
          How do you want to enjoy the rest of your day?
        </p>
        <p className="zen-encourage">
          Step away from the screen. The river keeps moving whether you watch it
          or not.
        </p>

        {unfinished.length > 0 ? (
          <section className="zen-unfinished">
            <h2>Still on your list</h2>
            <ul>
              {unfinished.map((t) => (
                <li key={t.id}>{t.body}</li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="zen-clear">All todos finished — a clean slate.</p>
        )}

        <p className="zen-footer">
          Come back tomorrow. Shift+8 unlocks demo mode for cohort reviewers.
        </p>
      </div>
    </div>
  );
}
