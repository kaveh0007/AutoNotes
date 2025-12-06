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
    // Create notification
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
      <div className="app-container">
        <main className="main-content">
          <section className="hero-section">
            <div className="container">
              <h1 className="hero-heading">Recent Summaries</h1>
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
                  <p>
                    Generate some summaries on the home page to see them here.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app-container">
      <main className="main-content">
        <section className="section">
          <div className="container">
            <h1 className="hero-heading">Recent Summaries</h1>

            <Link to="/" className="back-btn">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <div className="recent-summaries">
              {summaries.map((summary, index) => {
                const previewText =
                  stripMarkdown(summary.transcript).substring(0, 300) + "..."

                return (
                  <div key={summary.id} className="recent-item">
                    {/* Summary card - no media preview in list */}
                    <div className="summary-section">
                      <div className="summary-header">
                        <h3 className="summary-title">
                          {summary.type === "youtube" ? (
                            <a
                              href={summary.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              YouTube Video
                            </a>
                          ) : (
                            summary.title
                          )}
                        </h3>

                        <div className="summary-actions">
                          <div
                            className="summary-date"
                            style={{
                              marginRight: "1rem",
                              color: "var(--color-text-secondary)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatDate(summary.timestamp)}
                          </div>
                          <button
                            className="action-btn"
                            onClick={() => handleView(index)}
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => handleCopy(index)}
                          >
                            <i className="fas fa-copy"></i> Copy
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => handleDownload(index)}
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => handleDelete(index)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>

                      <div className="summary-content-wrapper">
                        <div
                          className="formatted-summary"
                          dangerouslySetInnerHTML={{
                            __html: formatStructuredSummary(previewText),
                          }}
                        />
                      </div>
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

                  {/* Modal: show media then summary using Results styles */}
                  {selectedSummary.type === "youtube" &&
                    selectedSummary.sourceUrl && (
                      <div
                        className="media-section"
                        style={{ marginTop: "var(--space-lg)" }}
                      >
                        <div className="media-wrapper">
                          <div className="video-embed">
                            <iframe
                              src={(() => {
                                try {
                                  const url = new URL(selectedSummary.sourceUrl)
                                  let vid = ""
                                  if (url.hostname.includes("youtube.com")) {
                                    vid = url.searchParams.get("v")
                                  } else if (
                                    url.hostname.includes("youtu.be")
                                  ) {
                                    vid = url.pathname.slice(1)
                                  }
                                  if (vid)
                                    return `https://www.youtube.com/embed/${vid}`
                                } catch (e) {
                                  /* fallthrough */
                                }
                                return selectedSummary.sourceUrl
                              })()}
                              title={selectedSummary.title || "YouTube video"}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="summary-section">
                    <div className="summary-header">
                      <h3 className="summary-title">
                        {selectedSummary.type === "youtube"
                          ? "YouTube Video"
                          : selectedSummary.title}
                      </h3>
                      <div className="summary-actions">
                        <div
                          className="summary-date"
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {new Date(selectedSummary.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="summary-content-wrapper">
                      <div
                        className="formatted-summary"
                        dangerouslySetInnerHTML={{
                          __html: formatStructuredSummary(
                            selectedSummary.transcript
                          ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Recent
