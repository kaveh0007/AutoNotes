const Features = () => {
  const features = [
    {
      icon: "fas fa-brain",
      title: "AI-Powered Analysis",
      description:
        "Advanced neural networks extract key insights and concepts from any content with remarkable accuracy",
    },
    {
      icon: "fas fa-project-diagram",
      title: "Knowledge Graph",
      description:
        "Visualize connections between ideas and improve retention through interactive knowledge mapping",
    },
    {
      icon: "fas fa-file-export",
      title: "Smart Export",
      description:
        "Export your summaries in multiple formats with professional styling and customizable templates",
    },
  ]

  return (
    <div className="features-grid">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <div className="feature-icon">
            <i className={feature.icon}></i>
          </div>
          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

export default Features
