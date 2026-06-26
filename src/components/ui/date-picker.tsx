"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDateLocal, formatCheckInDate } from "@/lib/date-utils";

interface DatePickerProps {
  /** Selected date as YYYY-MM-DD. */
  value: string;
  /** Called with the newly picked YYYY-MM-DD. */
  onChange: (date: string) => void;
  /** Latest selectable date (YYYY-MM-DD). Days after this are disabled. */
  max?: string;
  /** Earliest selectable date (YYYY-MM-DD). Days before this are disabled. */
  min?: string;
  className?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Touch-friendly, dark-themed calendar date picker.
 *
 * Why custom instead of <input type="date">: the native control renders its own
 * locale text and an unstyled OS popup that clashes with the app theme. This
 * gives a consistent, phone-optimised month grid with large tap targets.
 */
export function DatePicker({ value, onChange, max, min, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // Month currently shown in the grid, anchored to the selected value.
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));
  const rootRef = useRef<HTMLDivElement>(null);

  // Keep the visible month in sync when the value changes externally.
  useEffect(() => {
    setViewMonth(startOfMonth(value));
  }, [value]);

  // Close on outside tap/click.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const grid = buildMonthGrid(viewMonth);

  function pick(dateStr: string) {
    onChange(dateStr);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left active:bg-white/[0.06] transition-colors"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays className="h-4 w-4 text-gold shrink-0" />
        <span className="flex-1 text-sm font-medium text-white">{formatCheckInDate(value)}</span>
        <ChevronRight className={cn("h-4 w-4 text-zinc-500 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/[0.08] bg-[#141414] p-3 shadow-2xl shadow-black/60"
        >
          {/* Month nav */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 active:bg-white/[0.06]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-white">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 active:bg-white/[0.06]"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="flex h-8 items-center justify-center text-[11px] font-medium text-zinc-500">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell) return <div key={i} className="h-10" />;
              const disabled = (max != null && cell > max) || (min != null && cell < min);
              const isSelected = cell === value;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(cell)}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-lg text-sm transition-colors",
                    isSelected
                      ? "bg-gold font-semibold text-black"
                      : "text-zinc-200 active:bg-white/[0.08]",
                    disabled && "cursor-not-allowed text-zinc-700 active:bg-transparent"
                  )}
                >
                  {Number(cell.slice(8, 10))}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="mt-2 flex justify-end border-t border-white/[0.06] pt-2">
            {max && (
              <button
                type="button"
                onClick={() => pick(max)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gold active:bg-white/[0.06]"
              >
                Today
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Date helpers (operate on YYYY-MM-DD via the app timezone) ──────────────

function startOfMonth(dateStr: string): Date {
  const d = parseDateLocal(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/**
 * Build a 6-week grid (leading/trailing blanks as null) of YYYY-MM-DD strings
 * for the given month.
 */
function buildMonthGrid(month: Date): (string | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(ymd(year, m + 1, day));
  }
  return cells;
}

/** Format year/month/day as a literal YYYY-MM-DD string (no timezone math). */
function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
