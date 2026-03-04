"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface PromoCopyButtonProps {
  code: string;
}

export function PromoCopyButton({ code }: PromoCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Promo code copied!", {
        description: `"${code}" is ready to paste`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Promo code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-1.5 transition-colors hover:bg-emerald-100/50 dark:border-emerald-800 dark:bg-emerald-900/20"
      aria-label={`Copy promo code ${code}`}
    >
      <code className="text-sm font-bold tracking-wide text-emerald-700 dark:text-emerald-400">
        {code}
      </code>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      )}
    </button>
  );
}
