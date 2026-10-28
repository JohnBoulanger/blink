import { Fragment } from "react";
import useDemoLogin, { DEMO_ACCOUNTS } from "../useDemoLogin";
import "./style.css";

interface DemoLinksProps {
  id?: string;
}

// one sentence with the three demo roles as inline links
export default function DemoLinks({ id }: DemoLinksProps) {
  const { enter, pending, error } = useDemoLogin();

  return (
    <div className="DemoLinks" id={id}>
      <p className="demo-links-line">
        Or open the demo as{" "}
        {DEMO_ACCOUNTS.map((account, i) => (
          <Fragment key={account.role}>
            {i === DEMO_ACCOUNTS.length - 1 ? " or " : i > 0 ? ", " : ""}
            <button
              type="button"
              className="demo-link"
              onClick={() => enter(account.role)}
              disabled={pending !== null}
              aria-busy={pending === account.role}
            >
              {account.article}
              {pending === account.role && <span className="btn-spinner" aria-hidden="true" />}
            </button>
          </Fragment>
        ))}
      </p>
      <p className="demo-links-status" role="status">
        {pending ? "Signing in…" : ""}
      </p>
      {error && (
        <p className="demo-links-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
