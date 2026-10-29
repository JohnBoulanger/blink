import Logo from "../Logo";
import "./style.css";

export default function Footer() {
  return (
    <footer className="Footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo to="/" blink="off" size={26} />
          <p>Built by John Boulanger</p>
        </div>
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
    </footer>
  );
}
