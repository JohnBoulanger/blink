import "./style.css";

export default function LoadingSpinner() {
  return (
    <div className="LoadingSpinner" role="status">
      <div className="spinner" aria-hidden="true" />
      <span className="visually-hidden">Loading</span>
    </div>
  );
}
