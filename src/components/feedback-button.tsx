"use client";

import { useState, useEffect } from "react";
import { MessageSquarePlus, X, Send, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

const feedbackTypes = [
  { value: "feedback", label: "Feedback", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "fehler", label: "Fehler melden", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { value: "wunsch", label: "Wunsch", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "glossar", label: "Glossar", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("feedback");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");

  // Hide on admin and login pages
  const isHiddenRoute = pathname.startsWith("/admin") || pathname === "/login";

  // Check if feedback is enabled
  useEffect(() => {
    fetch("/api/settings/feedback-enabled")
      .then((res) => res.json())
      .then((data) => { if (data.enabled === false) setHidden(true); })
      .catch(() => {});
  }, []);

  if (isHiddenRoute || hidden) return null;

  function validate(): string | null {
    if (!name.trim()) return "Bitte gib deinen Namen ein.";
    if (!email.trim()) return "Bitte gib deine E-Mail-Adresse ein.";
    if (!EMAIL_REGEX.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse ein.";
    if (!message.trim()) return "Bitte gib eine Nachricht ein.";
    if (message.trim().length < 10) return "Nachricht muss mindestens 10 Zeichen lang sein.";
    return null;
  }

  async function handleSubmit() {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          page: pathname,
          website,
        }),
      });
      if (res.status === 403) {
        setHidden(true);
        return;
      }
      if (res.status === 429) {
        setError("Zu viele Anfragen. Bitte warte etwas.");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fehler beim Senden.");
        return;
      }
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
        setType("feedback");
        setError("");
      }, 1500);
    } catch {
      setError("Fehler beim Senden.");
    } finally {
      setSending(false);
    }
  }

  const placeholder = type === "glossar"
    ? "Begriff und Definition vorschlagen..."
    : "Beschreibe dein Feedback...";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-40 w-11 h-11 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Feedback geben"
        title="Feedback geben"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {sent ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">&#10003;</div>
                <p className="text-lg font-semibold text-foreground">Danke!</p>
                <p className="text-sm text-muted-foreground">Dein Feedback wurde gesendet.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-foreground mb-4">Feedback geben</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {feedbackTypes.map((ft) => (
                    <button
                      key={ft.value}
                      onClick={() => setType(ft.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        type === ft.value
                          ? ft.color + " ring-2 ring-primary/30"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name *"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-Mail *"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Honeypot field - invisible to users */}
                <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholder}
                  rows={4}
                  className="w-full rounded-xl border border-border/60 bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />

                {error && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Seite: {pathname}
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={sending || !message.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Senden
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
