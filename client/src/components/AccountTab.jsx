import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AccountTab() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState("Logistics");

  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Profile</div>
            <div className="card-desc">Your account details</div>
          </div>
          {!editing ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(false)}>
              Save
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
          <div className="avatar-btn" style={{ width: "52px", height: "52px", fontSize: "17px", cursor: "default" }}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>{user?.name || "Lydia Paula Astejada"}</div>
            <div className="field-hint">researcher@pup.edu.ph</div>
          </div>
        </div>
        <fieldset disabled={!editing} style={{ border: "none", padding: 0, margin: 0 }}>
          <label className="field-label">Full name</label>
          <input type="text" defaultValue={user?.name || "Lydia Paula Astejada"} style={{ marginBottom: "14px" }} />
          <label className="field-label">Email address</label>
          <input type="email" defaultValue="researcher@pup.edu.ph" style={{ marginBottom: "14px" }} />
          <label className="field-label">I am a...</label>
          <div className="tabs-inline" style={{ width: "100%" }}>
            <button className={role === "Logistics" ? "active" : ""} style={{ flex: 1 }} onClick={() => setRole("Logistics")}>Logistics</button>
            <button className={role === "Student" ? "active" : ""} style={{ flex: 1 }} onClick={() => setRole("Student")}>Student</button>
            <button className={role === "Other" ? "active" : ""} style={{ flex: 1 }} onClick={() => setRole("Other")}>Other</button>
          </div>
        </fieldset>
        {editing && (
          <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={() => setEditing(false)}>Save changes</button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Password &amp; security</div>
            <div className="card-desc">Change your password</div>
          </div>
        </div>
        <label className="field-label">Current password</label>
        <input type="password" defaultValue="••••••••" style={{ marginBottom: "14px" }} />
        <label className="field-label">New password</label>
        <input type="password" placeholder="At least 8 characters" style={{ marginBottom: "6px" }} />
        <div className="field-hint" style={{ marginBottom: "14px" }}>Use a mix of letters, numbers, and symbols.</div>
        <label className="field-label">Confirm new password</label>
        <input type="password" placeholder="Re-enter new password" style={{ marginBottom: "18px" }} />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary">Update password</button>
        </div>

        <div className="divider"></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--danger)" }}>Delete account</div>
            <div className="field-hint">Removes your saved runs and datasets permanently</div>
          </div>
          <button className="btn btn-danger-ghost btn-sm">Delete account</button>
        </div>
      </div>
    </div>
  );
}
