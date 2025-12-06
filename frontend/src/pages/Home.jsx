import { useState } from "react"
import Features from "../components/Features"
import InputForm from "../components/InputForm"
import ResultsDisplay from "../components/ResultsDisplay"

const Home = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSummaryGenerated = (data) => {
    setSummaryData(data)
    setLoading(false)
  }

  const handleLoadingChange = (isLoading) => {
    setLoading(isLoading)
  }

  return (
    <div className="app-container">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-heading">
              Transform Videos Into{" "}
              <span className="hero-heading-primary">Intelligent Notes</span>
            </h1>

            <p className="hero-subtitle">
              Convert tedious videos into structured summaries!
              <span className="hero-highlight">
                {" "}
                Learn Faster, Retain Better.
              </span>
            </p>
          </div>
        </section>

        {/* Input Section */}
        <section className="input-section">
          <div className="container">
            <InputForm
              onSummaryGenerated={handleSummaryGenerated}
              onLoadingChange={handleLoadingChange}
            />
          </div>
        </section>

        {/* Results Section */}
        {summaryData && (
          <section className="results-section">
            <div className="container">
              <ResultsDisplay data={summaryData} loading={loading} />
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Powerful Features</h2>
              <p className="section-subtitle">
                Consume & Grasp videos like never before, completely local, completely offline.
              </p>
            </div>
            <Features />
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
