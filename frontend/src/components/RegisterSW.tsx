"use client";
import { useEffect, useState } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

export default function RegisterSW() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    registerServiceWorker((worker) => {
      setWaitingWorker(worker);
    });
  }, []);

  if (!waitingWorker) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-gold/40 bg-bg-elevated px-4 py-3 text-sm shadow-lg"
    >
      <span className="text-text-primary">A new version of Amana is available.</span>
      <button
        type="button"
        onClick={() => {
          waitingWorker.postMessage({ type: "SKIP_WAITING" });
          setWaitingWorker(null);
        }}
        className="rounded-md bg-gold px-3 py-1 text-xs font-semibold text-bg-primary hover:opacity-90"
      >
        Reload
      </button>
    </div>
  );
}
