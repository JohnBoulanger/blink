import { Link } from "react-router-dom";
import "./style.css";

// the name as a shrinking eye-chart line
const SIGN_OFF = ["B", "L", "I", "N", "K"];

export default function Footer() {
  return (
    <footer className="Footer">
      <div className="container footer-inner">
        <Link to="/" className="footer-signoff" aria-label="Blink home">
          {SIGN_OFF.map((letter, i) => (
            <span
              key={letter}
              className={`footer-letter footer-letter-${i + 1}`}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </Link>
        <div className="footer-row">
          <p className="footer-credit">Built by John Boulanger</p>
          <div className="footer-notes">
            <p>Demo data resets when the server restarts.</p>
            <p>
              Clinic photos are illustrative, from Unsplash.{" "}
              <a
                href="https://github.com/JohnBoulanger/blink#photo-credits"
                target="_blank"
                rel="noreferrer"
              >
                Photo credits
              </a>
            </p>
          </div>
          <a
            className="footer-link"
            href="https://github.com/JohnBoulanger/blink"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
