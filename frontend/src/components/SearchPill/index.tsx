import "./style.css";

interface SearchPillProps {
  value: string;
  onChange: (value: string) => void;
  // accessible name, e.g. "Search users"
  label: string;
  placeholder?: string;
}

// a search field drawn as a pill
export default function SearchPill({ value, onChange, label, placeholder }: SearchPillProps) {
  return (
    <label className="search-pill">
      <span className="visually-hidden">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </label>
  );
}
