"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareWarning } from "lucide-react";
import { PageShell } from "./page-shell";

export function Grievance() {
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");

  return (
    <PageShell>
      <section className="tool-page content-wrap">
        <div className="tool-intro">
          <span className="tool-icon">
            <MessageSquareWarning />
          </span>
          <p className="eyebrow">Mock grievance</p>
          <h1>{done ? "Grievance submitted" : "Tell us what went wrong"}</h1>
          <p>
            {done
              ? "Your fictional service issue has been recorded for this demonstration."
              : "Three short steps: choose an issue, explain it, then submit the demo request."}
          </p>
        </div>

        {done ? (
          <div className="record-card">
            <CheckCircle2 className="good" />
            <h2>GRV-2026-00381</h2>
            <p>
              We would show status updates here. No government department
              receives this request.
            </p>
          </div>
        ) : (
          <div className="form-card" style={{ maxWidth: 700 }}>
            <label>
              <div className="field-label">
                <span>
                  Issue category <b>Required</b>
                </span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select an issue</option>
                <option>Application problem</option>
                <option>Appointment problem</option>
                <option>Document issue</option>
                <option>Challan issue</option>
                <option>Payment problem</option>
              </select>
            </label>

            <label>
              <div className="field-label">
                <span>
                  What happened? <b>Required</b>
                </span>
              </div>
              <textarea
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Use fictional information only"
              />
            </label>

            <button
              type="button"
              className="button primary"
              disabled={!category || !details}
              onClick={() => setDone(true)}
            >
              Review and submit demo
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}

