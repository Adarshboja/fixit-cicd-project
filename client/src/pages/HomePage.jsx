import { Link } from 'react-router-dom';

const features = [
  { title: 'Fast reporting', text: 'Capture issues with category, priority, and location in seconds.' },
  { title: 'Status tracking', text: 'Keep everyone aligned as complaints move from pending to resolved.' },
  { title: 'Priority management', text: 'Judge urgency quickly with clear, consistent triage workflows.' },
  { title: 'Admin oversight', text: 'Monitor the entire queue and update work in one place.' },
  { title: 'Centralized records', text: 'Keep every complaint visible, searchable, and easy to revisit.' },
  { title: 'Transparent resolution', text: 'Give users confidence with clear status movement and history.' },
];

const steps = [
  { number: '01', title: 'Report', text: 'Log the issue with the right category, urgency, and location.' },
  { number: '02', title: 'Track', text: 'Monitor progress in real time through clear status updates.' },
  { number: '03', title: 'Resolve', text: 'Close the loop once the fix is complete and verified.' },
];

const stats = [
  { label: 'Complaints resolved', value: '96%' },
  { label: 'Avg. response time', value: '24h' },
  { label: 'Active teams', value: '2.4k' },
];

export default function HomePage() {
  return (
    <div className="page-shell landing-page">
      <header className="topbar landing-topbar">
        <div className="brand-row">
          <div className="brand-mark">F</div>
          <span className="brand-name">FixIt</span>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <Link to="/login">Login</Link>
        </nav>

        <Link className="button button-primary" to="/register">Get Started</Link>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Complaint management for teams</p>
            <h1>Report problems.<br />Track progress.<br />Get things fixed.</h1>
            <p className="subtitle">
              FixIt makes outcome-driven service management simple by helping users report issues,
              track progress, and resolve them from one streamlined workspace.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/register">Get Started</Link>
              <Link className="button button-secondary" to="/login">Sign in</Link>
            </div>
            <div className="hero-inline-stats">
              <span><strong>12k+</strong> issues logged</span>
              <span><strong>4.9/5</strong> user satisfaction</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="FixIt dashboard preview">
            <div className="mock-window">
              <div className="window-header">
                <span className="dot red" />
                <span className="dot amber" />
                <span className="dot green" />
              </div>

              <div className="window-body">
                <aside className="mini-sidebar">
                  <div className="mini-brand">F</div>
                  <span className="mini-pill active">Home</span>
                  <span className="mini-pill">Queue</span>
                  <span className="mini-pill">Reports</span>
                </aside>

                <div className="mini-content">
                  <div className="mini-header">
                    <div>
                      <p className="muted-label">Overview</p>
                      <h3>Service requests</h3>
                    </div>
                    <button type="button" className="mini-button">New</button>
                  </div>

                  <div className="mini-stats">
                    <div className="mini-stat">
                      <span>Total</span>
                      <strong>128</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Pending</span>
                      <strong>32</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Active</span>
                      <strong>18</strong>
                    </div>
                  </div>

                  <div className="mini-list">
                    <div className="mini-item">
                      <div>
                        <strong>AC not working</strong>
                        <span>Electrical</span>
                      </div>
                      <span className="mini-status pending">Pending</span>
                    </div>
                    <div className="mini-item">
                      <div>
                        <strong>Internet issue</strong>
                        <span>Internet</span>
                      </div>
                      <span className="mini-status in-progress">In Progress</span>
                    </div>
                    <div className="mini-item">
                      <div>
                        <strong>Plumbing leak</strong>
                        <span>Plumbing</span>
                      </div>
                      <span className="mini-status resolved">Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="content-section">
          <div className="section-heading">
            <p className="eyebrow">How FixIt works</p>
            <h2>Simple workflow for every complaint</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.number} className="step-card reveal-card">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="content-section alt-section">
          <div className="section-heading">
            <p className="eyebrow">Key features</p>
            <h2>Built to keep operations organized</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card reveal-card">
                <div className="feature-icon">✓</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          {stats.map((stat) => (
            <div className="stat-card reveal-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="cta-section">
          <div className="cta-box">
            <h2>Ready to streamline service requests?</h2>
            <Link className="button button-primary" to="/register">Start now</Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>© 2026 FixIt</span>
        <span>Built for learning CI/CD</span>
      </footer>
    </div>
  );
}
