"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "./safe-link";
import { emptyDraft, hasSession, loadApplication, loadDraft, type Draft } from "@/lib/storage";

const stepNames = [
  "Before you begin",
  "Identity details",
  "Fitness & vehicle choice",
  "Documents",
  "Test slot & payment",
];

export default function HomeProgressCard() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSignedIn(hasSession());
      setDraft(loadDraft());
      setSubmitted(Boolean(loadApplication()));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const currentIndex = submitted ? 4 : Math.min(Math.max(draft.step, 0), 4);
  const completedCount = submitted ? 5 : currentIndex;
  const progress = Math.round((completedCount / 5) * 100);
  const visibleSteps = useMemo(() => {
    const start = Math.min(Math.max(currentIndex - 1, 0), 2);
    return stepNames.slice(start, start + 3).map((name, offset) => ({ name, index: start + offset }));
  }, [currentIndex]);

  if (!ready || !signedIn) {
    return (
      <aside className="journey-card" aria-label="Sign in to view learner licence progress">
        <div className="card-head"><span className="badge">Demo / Mock service</span><span>Private to this device</span></div>
        <h2>Learner Licence</h2><p>Your saved application progress appears here after sign in.</p>
        <div className="progress-row"><strong>Not signed in</strong><span>Progress hidden</span></div><div className="progress-track"><span style={{ width: "0%" }} /></div>
        <ol className="mini-steps"><li className="active"><i>1</i><span>Sign in to the demo<small>Required to view your draft</small></span></li><li><i>2</i><span>Continue your application<small>Progress loads from this device</small></span></li><li><i>3</i><span>Submit and track<small>All records are simulated</small></span></li></ol>
        <Link className="button primary full" href="/login">Sign in to continue</Link><p className="saved">Your demo data stays in this browser</p>
      </aside>
    );
  }

  const updated = draft.updatedAt
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(draft.updatedAt))
    : "Not saved yet";

  return (
    <aside className="journey-card" aria-label="Your learner licence progress">
      <div className="card-head"><span className="badge">Demo / Mock service</span><span>{submitted ? "Submitted" : "Saved locally"}</span></div>
      <h2>Learner Licence</h2><p>Your application, explained one step at a time.</p>
      <div className="progress-row"><strong>{progress}% complete</strong><span>{submitted ? "All 5 steps" : `Step ${currentIndex + 1} of 5`}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <ol className="mini-steps">{visibleSteps.map(({ name, index }) => {
        const done = submitted || index < currentIndex;
        const active = !submitted && index === currentIndex;
        return <li className={done ? "done" : active ? "active" : ""} key={name}><i>{done ? "✓" : index + 1}</i><span>{name}<small>{done ? "Completed" : active ? "Current step" : "Up next"}</small></span></li>;
      })}</ol>
      <Link className="button primary full" href={submitted ? "/track" : "/apply/learner-licence"}>{submitted ? "Track application" : progress ? "Continue application" : "Start application"}</Link><p className="saved">✓ {draft.updatedAt ? `Last saved ${updated}` : "Draft will save automatically"}</p>
    </aside>
  );
}
