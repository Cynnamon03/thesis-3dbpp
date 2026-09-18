import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AccountTab({ user, logout }) {
  const { fetchUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const body = { name };
      if (password) body.password = password;

      const res = await fetch("http://localhost:3001/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
      setMsg("Profile updated successfully!");
      if (fetchUser) await fetchUser();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card" style={{ maxWidth: "600px" }}>
      <div className="card-head">
        <div>
          <div className="card-title">Account settings</div>
          <div className="card-desc">Manage your profile and preferences</div>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "20px", marginBottom: "32px", alignItems: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(155deg, var(--primary), var(--blush))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "700" }}>
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700" }}>{user.name}</div>
          <div style={{ color: "var(--ink-faint)", marginTop: "2px" }}>{user.role}</div>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="grid grid-2" style={{ marginBottom: "16px" }}>
          <div>
            <label className="field-label">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Email Address</label>
            <input type="email" value={user.email} disabled />
            <div className="field-hint">Email cannot be changed</div>
          </div>
        </div>

        <div className="divider"></div>
        <div className="section-tag">Security</div>

        <div style={{ marginBottom: "24px" }}>
          <label className="field-label">New Password</label>
          <input type="password" placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {msg && <div style={{ color: "var(--safe)", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>{msg}</div>}
        {err && <div style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>{err}</div>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => {
            setName(user.name);
            setPassword("");
            setMsg("");
            setErr("");
          }}>Cancel</button>
        </div>
      </form>

      <div className="divider"></div>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600, color: "var(--danger)" }}>Sign out</div>
          <div className="field-hint" style={{ marginTop: 0 }}>End your current session</div>
        </div>
        <button className="btn btn-danger-ghost btn-sm" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}
