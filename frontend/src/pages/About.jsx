const About = () => {
  return (
    <div className="app-container">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-heading">
              Learn More About{" "}
              <span className="hero-heading-primary">AutoNotes</span>
            </h1>

            <p className="hero-subtitle">
              Detailed information about our platform and features
              <span className="hero-highlight"> coming soon!</span>
            </p>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="section">
          <div className="container">
            <div className="coming-soon-card">
              <div className="coming-soon-icon">
                <i className="fas fa-info-circle"></i>
              </div>
              <h2 className="coming-soon-title">About Page Coming Soon</h2>
              <p className="coming-soon-description">
                We're working on creating a comprehensive about page that will
                include our mission, team information, and detailed platform
                features.
              </p>
              <p className="coming-soon-note">
                For now, enjoy using AutoNotes to transform your content into
                intelligent summaries!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About
