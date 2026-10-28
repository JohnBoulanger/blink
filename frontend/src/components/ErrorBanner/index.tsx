import "./style.css";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

// an error line the user can close
export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="ErrorBanner error-message" role="alert">
      <span>{message}</span>
      <button
        type="button"
        className="error-banner-close"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
