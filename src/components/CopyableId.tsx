import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";
import { Check, Copy } from "lucide-react";

interface CopyableIdProps {
  id: string;
  truncate?: number;
  className?: string;
}

export function CopyableId({ id, truncate, className }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    [id]
  );

  const display = truncate ? id.slice(0, truncate) : id;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${id}`}
      className={cn(
        "group/cid inline-flex items-center gap-1 font-mono cursor-pointer rounded px-0.5 -mx-0.5 hover:bg-muted transition-colors",
        className
      )}
    >
      {display}
      {copied ? (
        <Check className="size-2.5 text-emerald-500" />
      ) : (
        <Copy className="size-2.5 opacity-0 group-hover/cid:opacity-40 transition-opacity" />
      )}
    </button>
  );
}
