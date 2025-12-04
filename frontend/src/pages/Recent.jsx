import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { formatStructuredSummary, stripMarkdown } from "../utils/formatters"
import { copyToClipboard, downloadSummaryAsPDF } from "../utils/helpers"
import { getFromLocalStorage } from "../utils/localStorage"

const Recent = () => {
  const [summaries, setSummaries] = useState([])
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const loadedSummaries = getFromLocalStorage()
    setSummaries(loadedSummaries)
  }, [])

  const handleView = (index) => {
    const summary = summaries[index]
    setSelectedSummary(summary)
    setShowModal(true)
  }

  const handleCopy = (index) => {
    copyToClipboard(summaries[index].transcript)
    showNotification("Summary copied to clipboard!")
  }

  const handleDownload = (index) => {
    const summary = summaries[index]
    const contentToDownload =
      summary.editedContent || summary.formattedContent || summary.transcript
    downloadSummaryAsPDF(contentToDownload, summary.title)
  }

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this summary?")) {
      const updatedSummaries = [...summaries]
      updatedSummaries.splice(index, 1)
      localStorage.setItem(
        "autoNotesSummaries",
        JSON.stringify(updatedSummaries)
      )
      setSummaries(updatedSummaries)
      showNotification("Summary deleted successfully!")
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedSummary(null)
  }

  const showNotification = (message, isError = false) => {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification${isError ? " error" : ""}`
    notification.textContent = message

    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    // Hide and remove notification
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  if (summaries.length === 0) {
    return (
      <main className="main-container recent-page">
        <h1 className="hero-heading">Recent Summaries</h1>{" "}
        <Link to="/" className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
        <div className="recent-summaries">
          <div className="no-summaries">
            <i
              className="fas fa-folder-open"
              style={{ fontSize: "3rem", marginBottom: "1rem" }}
            ></i>
            <h3>No summaries yet</h3>
            <p>Generate some summaries on the home page to see them here.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-container recent-page">
      <h1 className="hero-heading">Recent Summaries</h1>

      <Link to="/" className="back-btn">
        <i className="fas fa-arrow-left"></i> Back to Home
      </Link>

      <div className="recent-summaries">
        {summaries.map((summary, index) => {
          const previewText =
            stripMarkdown(summary.transcript).substring(0, 150) + "..."

          return (
            <div key={summary.id} className="summary-card">
              {summary.type === "youtube" && summary.sourceUrl ? (
                <h3 className="summary-title">
                  <a
                    href={summary.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    YouTube Video
                  </a>
                </h3>
              ) : (
                <h3 className="summary-title">{summary.title}</h3>
              )}

              <div className="summary-date">
                {formatDate(summary.timestamp)}
              </div>
              <div className="summary-preview">{previewText}</div>

              <div className="summary-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => handleView(index)}
                >
                  <i className="fas fa-eye"></i> View
                </button>
                <button
                  className="action-btn copy-btn"
                  onClick={() => handleCopy(index)}
                >
                  <i className="fas fa-copy"></i> Copy
                </button>
                <button
                  className="action-btn download-btn"
                  onClick={() => handleDownload(index)}
                >
                  <i className="fas fa-download"></i> Download
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(index)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Modal */}
      {showModal && selectedSummary && (
        <div
          className="summary-modal"
          style={{ display: "flex" }}
          onClick={(e) =>
            e.target.classList.contains("summary-modal") && closeModal()
          }
        >
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>

            <h2 className="modal-title">
              {selectedSummary.type === "youtube"
                ? "YouTube Video"
                : selectedSummary.title}
            </h2>
            <div className="modal-date">
              {new Date(selectedSummary.timestamp).toLocaleString()}
            </div>

            {/* If this is a YouTube summary, embed the video iframe above the transcript */}
            {selectedSummary.type === "youtube" &&
              selectedSummary.sourceUrl && (
                <div className="video-embed">
                  <iframe
                    width="100%"
                    height="360"
                    src={
                      // Convert a regular watch URL or full URL into an embed URL when possible
                      (function () {
                        try {
                          const url = new URL(selectedSummary.sourceUrl)
                          let vid = ""
                          if (url.hostname.includes("youtube.com")) {
                            vid = url.searchParams.get("v")
                          } else if (url.hostname.includes("youtu.be")) {
                            vid = url.pathname.slice(1)
                          }
                          if (vid) return `https://www.youtube.com/embed/${vid}`
                        } catch (e) {
                          /* fallthrough */
                        }
                        return selectedSummary.sourceUrl
                      })()
                    }
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

            <div
              className="modal-content-text"
              dangerouslySetInnerHTML={{
                __html: formatStructuredSummary(selectedSummary.transcript),
              }}
            />

            <div className="modal-actions">
              <button
                className="action-btn"
                onClick={() => {
                  copyToClipboard(selectedSummary.transcript)
                  showNotification("Summary copied to clipboard!")
                }}
              >
                <i className="fas fa-copy"></i> Copy
              </button>
              <button
                className="action-btn"
                onClick={() => {
                  const contentToDownload =
                    selectedSummary.editedContent ||
                    selectedSummary.formattedContent ||
                    selectedSummary.transcript
                  downloadSummaryAsPDF(contentToDownload, selectedSummary.title)
                }}
              >
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Recent
