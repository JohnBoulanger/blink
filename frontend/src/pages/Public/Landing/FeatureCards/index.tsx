import "./style.css";

// platform feature highlights — why visus
const FEATURES = [
  {
    icon: "\u2714",
    title: "Verified credentials",
    description: "Qualifications are reviewed before professionals appear in search results.",
  },
  {
    icon: "\u23F1",
    title: "15-minute negotiations",
    description: "Time-boxed negotiation windows keep matching fast and decisive.",
  },
  {
    icon: "\u2726",
    title: "Flexible shifts",
    description: "Clinics post individual shifts — no long-term contracts required.",
  },
];

export default function FeatureCards() {
  return (
    <section className="features">
      <p className="section-label">why visus</p>
      <div className="features-grid">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="feature-card">
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
