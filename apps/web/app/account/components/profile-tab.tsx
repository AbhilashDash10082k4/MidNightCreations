"use client";

import React, { useState } from "react";

type ProfileUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
};

type OAuthAccount = {
  provider: string;
  createdAt: string;
};

interface ProfileTabProps {
  initialUser: ProfileUser;
  initialOAuths: OAuthAccount[];
  initialVerified: boolean;
}

export function ProfileTab({
  initialUser,
  initialOAuths,
  initialVerified,
}: ProfileTabProps) {
  const [user, setUser] = useState<ProfileUser>(initialUser);
  const [oauths, setOauths] = useState<OAuthAccount[]>(initialOAuths);
  const [verified, setVerified] = useState<boolean>(initialVerified);

  // Forms states
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [privacyMsg, setPrivacyMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await fetch("/api/v1/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setUser(data.profile);
      setProfileMsg({ text: "Profile updated successfully!", error: false });
    } catch (err: any) {
      setProfileMsg({ text: err.message, error: true });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/v1/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPasswordMsg({ text: "Password updated successfully!", error: false });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordMsg({ text: err.message, error: true });
    }
  };

  const handleResendVerification = async () => {
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/v1/account/verify", { method: "POST" });
      const data = await res.json();
      setVerifyMsg(data.message || "Verification email sent.");
    } catch (err) {
      setVerifyMsg("Failed to send verification email.");
    }
  };

  const handleOAuthToggle = async (provider: string, linked: boolean) => {
    try {
      if (linked) {
        const res = await fetch(`/api/v1/account/oauth?provider=${provider}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setOauths((prev) => prev.filter((o) => o.provider !== provider));
        }
      } else {
        const res = await fetch("/api/v1/account/oauth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            providerUid: `mock-${provider}-${Date.now()}`,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setOauths((prev) => [...prev, data.connected]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDataExport = async () => {
    setPrivacyMsg(null);
    try {
      const res = await fetch("/api/v1/account/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `midnight-export-${user.email}.json`;
      a.click();
      setPrivacyMsg("Data export downloaded successfully.");
    } catch (err) {
      setPrivacyMsg("Data export failed.");
    }
  };

  const handleAccountDeletion = async () => {
    if (
      !confirm(
        "Are you absolutely sure you want to request account deletion? This action is irreversible.",
      )
    )
      return;
    setPrivacyMsg(null);
    try {
      const res = await fetch("/api/v1/account/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      const data = await res.json();
      setPrivacyMsg(data.message);
    } catch (err) {
      setPrivacyMsg("Deletion request failed.");
    }
  };

  const isOAuthLinked = (provider: string) =>
    oauths.some((o) => o.provider === provider);

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Verification Status */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">Email Verification</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Verify your email address to secure your account.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {verified ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/35">
                Verified Status: Active
              </span>
            ) : (
              <>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/35">
                  Unverified Status: Pending
                </span>
                <button
                  onClick={handleResendVerification}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 cursor-pointer"
                >
                  Resend Verification Email
                </button>
              </>
            )}
          </div>
        </div>
        {verifyMsg && (
          <p className="mt-3 text-sm text-indigo-300">{verifyMsg}</p>
        )}
      </section>

      {/* Profile Info Card */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-indigo-400 bg-neutral-800 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xl font-semibold">
                  {(firstName && firstName[0]) || user.email[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-neutral-900 px-4 py-2 text-sm text-neutral-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {profileMsg && (
            <p
              className={`text-sm ${profileMsg.error ? "text-red-400" : "text-emerald-400"}`}
            >
              {profileMsg.text}
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 hover:scale-[1.02] cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </section>

      {/* Linked OAuth Accounts */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold">Linked Identity Providers</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Link or unlink your social accounts for alternative logins.
        </p>
        <div className="mt-4 space-y-3">
          {["Google", "Apple", "Facebook"].map((provider) => {
            const linked = isOAuthLinked(provider);
            return (
              <div
                key={provider}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-950/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-indigo-400" />
                  <span className="text-sm font-medium">
                    {provider} Integration
                  </span>
                </div>
                <button
                  onClick={() => handleOAuthToggle(provider, linked)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    linked
                      ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      : "bg-white text-neutral-950 hover:bg-neutral-200"
                  }`}
                >
                  {linked ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security (Password Change) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold">Security & Password</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {passwordMsg && (
            <p
              className={`text-sm ${passwordMsg.error ? "text-red-400" : "text-emerald-400"}`}
            >
              {passwordMsg.text}
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 hover:scale-[1.02] cursor-pointer"
          >
            Change Password
          </button>
        </form>
      </section>

      {/* Privacy Self-Service */}
      <section className="rounded-2xl border border-red-500/10 bg-red-950/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-red-300">
          Privacy & Personal Data
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your personal details under privacy laws (GDPR / CCPA).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleDataExport}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition cursor-pointer"
          >
            Export Account Data (JSON)
          </button>
          <button
            onClick={handleAccountDeletion}
            className="rounded-xl bg-red-600/80 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition cursor-pointer"
          >
            Delete Account Request
          </button>
        </div>
        {privacyMsg && (
          <p className="mt-3 text-sm text-indigo-300">{privacyMsg}</p>
        )}
      </section>
    </div>
  );
}
