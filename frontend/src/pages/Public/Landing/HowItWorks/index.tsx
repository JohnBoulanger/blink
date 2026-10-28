import "./style.css";

const STEPS = [
  {
    title: "A clinic posts a shift",
    text: "The role, the hours and an hourly range go up, and qualified professionals see it in their list.",
  },
  {
    title: "Verified staff raise a hand",
    text: "An admin checks each credential first, so every professional a clinic sees is already approved.",
  },
  {
    title: "Both sides agree in 15 minutes",
    text: "Mutual interest opens a live chat with a shared clock, and the shift fills when both accept.",
  },
];

export default function HowItWorks() {
  return (
    <section className="HowItWorks" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="container">
        <h2 id="how-it-works-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-number tabular" aria-hidden="true">
                {i + 1}
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
