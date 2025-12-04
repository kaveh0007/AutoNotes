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
    <main className="main-container">
      <h1 className="hero-heading">
        Notes? <br /> AutoNotes.
      </h1>

      <InputForm
        onSummaryGenerated={handleSummaryGenerated}
        onLoadingChange={handleLoadingChange}
      />

      {summaryData && <ResultsDisplay data={summaryData} loading={loading} />}

      <Features />
    </main>
  )
}

export default Home
