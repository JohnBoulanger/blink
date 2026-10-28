import { useId } from "react";
import useDemoLogin, { DEMO_ACCOUNTS } from "../useDemoLogin";
import "./style.css";

interface DemoEntryProps {
  id?: string;
}

export default function DemoEntry({ id }: DemoEntryProps) {
  const { enter, pending, error } = useDemoLogin();
  const labelId = useId();

  return (
    <div className="DemoEntry" id={id}>
      <p className="visually-hidden" id={labelId}>
        Open the demo as
      </p>
      <div className="demo-entry-buttons" role="group" aria-labelledby={labelId}>
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.role}
            type="button"
            className="demo-entry-btn"
            onClick={() => enter(account.role)}
            disabled={pending !== null}
            aria-busy={pending === account.role}
          >
            <span className="demo-entry-role">
              {account.label}
              {pending === account.role && <span className="btn-spinner" aria-hidden="true" />}
            </span>
            <span className="demo-entry-who">
              {pending === account.role ? "Signing in…" : account.who}
            </span>
            <span className="demo-entry-email">{account.email}</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="demo-entry-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
