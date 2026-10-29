import Illustration, { type IllustrationName } from "../../../../components/Illustration";
import "./style.css";

const STEPS: { title: string; text: string; illustration: IllustrationName }[] = [
  {
    title: "A clinic posts a shift",
    illustration: "storefront",
    text: "The role, the hours and an hourly range go up, and qualified professionals see it in their list.",
  },
  {
    title: "Verified staff raise a hand",
    illustration: "verified-id",
    text: "An admin checks each credential first, so every professional a clinic sees is already approved.",
  },
  {
    title: "Both sides agree in 15 minutes",
    illustration: "clock15",
    text: "Mutual interest opens a live chat with a shared clock, and the shift fills when both accept.",
  },
];

export default function HowItWorks() {
  return (
    <section className="HowItWorks" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="container">
        <h2 id="how-it-works-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((step) => (
            <li key={step.title} className="step">
              <span className="step-art">
                <Illustration name={step.illustration} size={80} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
