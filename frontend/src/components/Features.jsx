const Features = () => {
  return (
    <div className="features">
      <div className="features-grid">
        <div className="feature-card">
          <i className="fas fa-robot feature-icon"></i>
          <h3>AI-Powered Analysis</h3>
          <p>Advanced NLP extracts key points and concepts with accuracy</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-clock feature-icon"></i>
          <h3>Smart Timestamps</h3>
          <p>Automatically identify and highlight crucial moments</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-file-export feature-icon"></i>
          <h3>Export Formats</h3>
          <p>Download summaries as PDF with professional formatting</p>
        </div>
      </div>
    </div>
  )
}

export default Features
