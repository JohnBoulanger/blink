import { useRef } from "react";
import "./style.css";

interface FileUploadProps {
  // what the file is, e.g. "Resume"
  title: string;
  accept: string;
  // link to the uploaded file, if there is one
  fileUrl: string | null;
  fileLabel: string;
  emptyLabel: string;
  // button text when a file exists and when it does not
  replaceLabel: string;
  uploadLabel: string;
  busy?: boolean;
  disabled?: boolean;
  onSelect: (file: File) => void;
}

// a file row: current file link plus a button that opens the hidden file picker
export default function FileUpload({
  title,
  accept,
  fileUrl,
  fileLabel,
  emptyLabel,
  replaceLabel,
  uploadLabel,
  busy = false,
  disabled = false,
  onSelect,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="FileUpload">
      <span className="file-upload-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="file-upload-text">
        <span className="file-upload-title">{title}</span>
        {fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="file-upload-link">
            {fileLabel}
          </a>
        ) : (
          <span className="file-upload-empty">{emptyLabel}</span>
        )}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          // allow picking the same file again
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="btn-secondary btn-sm file-upload-button"
        onClick={() => inputRef.current?.click()}
        disabled={busy || disabled}
      >
        {busy && <span className="btn-spinner" aria-hidden="true" />}
        {busy ? "Uploading…" : fileUrl ? replaceLabel : uploadLabel}
      </button>
    </div>
  );
}
