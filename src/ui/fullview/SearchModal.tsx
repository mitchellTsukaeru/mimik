import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { getGuides, getFirstStepUrl } from "@/core/guides/service";
import type { Guide } from "@/core/guides/types";
import { navigate } from "./router";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

function getFaviconUrl(url: string): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return "";
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface GuideResult {
  guide: Guide;
  favicon: string;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuideResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadResults = useCallback(async () => {
    const guides = await getGuides();
    const withFavicons: GuideResult[] = await Promise.all(
      guides.map(async (guide) => {
        const url = await getFirstStepUrl(guide.id);
        return { guide, favicon: url ? getFaviconUrl(url) : "" };
      }),
    );
    setResults(withFavicons);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      loadResults();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, loadResults]);

  const filtered = query
    ? results.filter((r) =>
        r.guide.title.toLowerCase().includes(query.toLowerCase()),
      )
    : results;

  const handleSelect = useCallback(
    (guideId: string) => {
      onClose();
      navigate({ page: "guide", guideId });
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selected]) {
          handleSelect(filtered[selected].guide.id);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, selected, handleSelect, onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(255,255,255,0.1)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          boxShadow: "0 8px 40px rgba(69,26,3,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid #E8E2DA" }}
        >
          <Search size={18} style={{ color: "#F59E0B", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search guides..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            className="flex-1 text-[15px] font-medium outline-none border-0 bg-transparent p-0"
            style={{ color: "#451a03", fontFamily: "inherit" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-0.5 rounded"
              style={{ color: "#B45309" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "#B45309" }}>
                {query ? "No matching guides" : "No guides yet"}
              </p>
            </div>
          ) : (
            filtered.map((r, i) => (
              <div
                key={r.guide.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={
                  i === selected
                    ? {
                        background: "#451a03",
                        borderRadius: "8px",
                        margin: "0 6px",
                        padding: "10px 12px",
                      }
                    : {}
                }
                onClick={() => handleSelect(r.guide.id)}
                onMouseEnter={() => setSelected(i)}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold flex-shrink-0 overflow-hidden"
                  style={
                    i === selected
                      ? {
                          background: "rgba(253,230,138,0.15)",
                          border: "1px solid rgba(253,230,138,0.2)",
                          color: "#FDE68A",
                        }
                      : {
                          background: "#FEF3C7",
                          border: "1px solid #E8E2DA",
                          color: "#92400E",
                        }
                  }
                >
                  {r.favicon ? (
                    <img
                      src={r.favicon}
                      alt=""
                      className="w-3.5 h-3.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    r.guide.title.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: i === selected ? "#FDE68A" : "#451a03" }}
                  >
                    {r.guide.title}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color:
                        i === selected ? "rgba(253,230,138,0.6)" : "#B45309",
                    }}
                  >
                    {r.guide.stepIds.length} step
                    {r.guide.stepIds.length !== 1 ? "s" : ""} ·{" "}
                    {formatDate(r.guide.updatedAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Hints */}
        <div
          className="flex items-center gap-3 px-4 py-2"
          style={{ borderTop: "1px solid #E8E2DA" }}
        >
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "#FDE68A", color: "#92400E" }}
          >
            ↑↓
          </span>
          <span className="text-[10px]" style={{ color: "#B45309" }}>
            navigate
          </span>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "#FDE68A", color: "#92400E" }}
          >
            ↵
          </span>
          <span className="text-[10px]" style={{ color: "#B45309" }}>
            open
          </span>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "#FDE68A", color: "#92400E" }}
          >
            esc
          </span>
          <span className="text-[10px]" style={{ color: "#B45309" }}>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
