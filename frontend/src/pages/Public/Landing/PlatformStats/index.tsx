import "./style.css";

// platform trust signals — numbers that show the platform is active
const STATS = [
  { value: "15+", label: "optometry clinics on the platform" },
  { value: "12", label: "staffing position types" },
  { value: "real-time", label: "shift matching & negotiation" },
];

export default function PlatformStats() {
  return (
    <section className="platform-stats">
      <p className="section-label">by the numbers</p>
      <div className="stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
