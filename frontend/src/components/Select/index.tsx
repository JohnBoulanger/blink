import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./style.css";

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectVariant = "field" | "pill" | "search";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  // field: a visible label above; search: a small label inside the field; pill: read by screen readers only
  label: string;
  variant?: SelectVariant;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  // pill: a doubled ink border once a filter is chosen
  active?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 16;
// shows a sliver of the eighth option so a long list reads as scrollable
const MAX_PANEL_HEIGHT = 328;
const TYPEAHEAD_RESET_MS = 500;
const REQUIRED_MESSAGE = "Please select an item in the list.";

function isPrintable(e: React.KeyboardEvent) {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}

// a select-only combobox: one button opens a listbox; focus stays on the button
export default function Select({
  value,
  onChange,
  options,
  label,
  variant = "field",
  id,
  name,
  disabled = false,
  required = false,
  active = false,
  className = "",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const labelId = `${autoId}-label`;
  const listId = `${autoId}-list`;
  const optionId = (index: number) => `${autoId}-option-${index}`;

  const [openState, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const open = openState && !disabled;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ buffer: "", timer: 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // place the panel below the trigger, or above when there is more room there;
  // returns false once the trigger has scrolled out of view
  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return true;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewportHeight) return false;

    list.style.minWidth = `${rect.width}px`;
    if (variant === "field") list.style.width = `${rect.width}px`;

    const wanted = Math.min(MAX_PANEL_HEIGHT, list.scrollHeight);
    const below = viewportHeight - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
    const above = rect.top - PANEL_GAP - VIEWPORT_MARGIN;
    const placeAbove = below < wanted && above > below;
    list.style.maxHeight = `${Math.max(132, Math.min(MAX_PANEL_HEIGHT, placeAbove ? above : below))}px`;
    list.style.top = placeAbove ? "auto" : `${rect.bottom + PANEL_GAP}px`;
    list.style.bottom = placeAbove ? `${viewportHeight - rect.top + PANEL_GAP}px` : "auto";
    list.classList.toggle("is-above", placeAbove);

    const width = list.offsetWidth;
    let left = rect.left;
    if (left + width > viewportWidth - VIEWPORT_MARGIN) {
      left = Math.max(VIEWPORT_MARGIN, viewportWidth - VIEWPORT_MARGIN - width);
    }
    list.style.left = `${left}px`;
    return true;
  }, [variant]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    let frame = 0;
    function onMove() {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!place()) setOpen(false);
        });
      }
    }
    // capture catches scrolling in any container, such as a sideways filter row
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open, place]);

  // keep the active option in view inside the list
  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !option) return;
    const pad = 6;
    if (option.offsetTop - pad < list.scrollTop) {
      list.scrollTop = option.offsetTop - pad;
    } else if (option.offsetTop + option.offsetHeight + pad > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight + pad - list.clientHeight;
    }
  }, [open, activeIndex]);

  // close on a pointer press outside the field and the list
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // the hidden input carries native required validation with the select wording
  useEffect(() => {
    nativeRef.current?.setCustomValidity(required && !value ? REQUIRED_MESSAGE : "");
  }, [required, value]);

  useEffect(() => {
    const state = typeahead.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  function openList(index?: number) {
    setActiveIndex(index ?? (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  }

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close(true);
  }

  // jump to the next option whose label starts with the typed letters
  function findByTyping(char: string, from: number) {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = window.setTimeout(() => (state.buffer = ""), TYPEAHEAD_RESET_MS);
    const repeated = state.buffer.split("").every((c) => c === state.buffer[0]);
    const search = repeated ? state.buffer[0] : state.buffer;
    const start = repeated || state.buffer.length === 1 ? from + 1 : from;
    for (let i = 0; i < options.length; i++) {
      const index = (start + i) % options.length;
      if (options[index].label.toLowerCase().startsWith(search)) return index;
    }
    return -1;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        openList(e.key === "Home" ? 0 : last);
      } else if (isPrintable(e)) {
        const match = findByTyping(e.key, selectedIndex);
        openList(match >= 0 ? match : undefined);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(Math.min(last, activeIndex + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (e.altKey) choose(activeIndex);
        else setActiveIndex(Math.max(0, activeIndex - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        break;
      case "PageDown":
        e.preventDefault();
        setActiveIndex(Math.min(last, activeIndex + 10));
        break;
      case "PageUp":
        e.preventDefault();
        setActiveIndex(Math.max(0, activeIndex - 10));
        break;
      case "Enter":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case "Tab":
        close();
        break;
      default:
        if (e.key === " " && !typeahead.current.buffer) {
          e.preventDefault();
          choose(activeIndex);
        } else if (isPrintable(e)) {
          e.preventDefault();
          const match = findByTyping(e.key, activeIndex);
          if (match >= 0) setActiveIndex(match);
        }
    }
  }

  const chevron = (
    <svg
      className="Select-chevron"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const list = open
    ? createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          className={`Select-list Select-list-${variant}`}
          // keep focus on the trigger while the list is pressed or scrolled
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={`${option.value}-${index}`}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                className={`Select-option${index === activeIndex ? " is-active" : ""}`}
                onPointerMove={() => index !== activeIndex && setActiveIndex(index)}
                onClick={() => choose(index)}
              >
                <span className="Select-option-label">{option.label}</span>
                {isSelected && (
                  <svg
                    className="Select-check"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>,
        document.body
      )
    : null;

  return (
    <>
      {variant === "field" && (
        <label id={labelId} htmlFor={triggerId}>
          {label}
        </label>
      )}
      <div
        ref={rootRef}
        className={`Select Select-${variant}${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      >
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          className={`Select-trigger${active ? " is-set" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={labelId}
          aria-activedescendant={open ? optionId(activeIndex) : undefined}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => e.key === " " && e.preventDefault()}
          onBlur={() => close()}
        >
          {variant === "search" && (
            <span id={labelId} className="Select-label" aria-hidden="true">
              {label}
            </span>
          )}
          <span className="Select-value">{selected?.label ?? ""}</span>
          {chevron}
        </button>
        {variant === "pill" && (
          <span id={labelId} hidden>
            {label}
          </span>
        )}
        {required && (
          <input
            ref={nativeRef}
            className="Select-native"
            name={name}
            value={value}
            required
            tabIndex={-1}
            aria-hidden="true"
            onChange={() => {}}
            onKeyDown={(e) => {
              if (e.key === "Tab") return;
              triggerRef.current?.focus();
              handleKeyDown(e);
            }}
          />
        )}
      </div>
      {list}
    </>
  );
}
