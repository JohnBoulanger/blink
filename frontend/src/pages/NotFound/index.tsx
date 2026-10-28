import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import "./style.css";

export default function NotFound() {
  return (
    <div className="NotFound page-enter">
      <Logo blink="once" blinkKey={1} wordmark={false} size={48} />
      <h1>Page not found</h1>
      <p>The link may be old, or the page may have moved.</p>
      <Link to="/" className="btn-secondary">
        Back to home
      </Link>
    </div>
  );
}
