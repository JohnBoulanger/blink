import "./style.css";

// the name as a shrinking eye-chart line, shared by the logo and the footer
const LETTERS = ["B", "L", "I", "N", "K"];

interface ChartWordmarkProps {
  className?: string;
}

// decorative: the link or element around it carries the accessible name
export default function ChartWordmark({ className = "" }: ChartWordmarkProps) {
  return (
    <span className={`ChartWordmark ${className}`.trim()} aria-hidden="true">
      {LETTERS.map((letter) => (
        <span key={letter} className="ChartWordmark-letter">
          {letter}
        </span>
      ))}
    </span>
  );
}
