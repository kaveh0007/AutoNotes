import { useRef, useState } from "react"
import {
  copyToClipboard,
  downloadSummaryAsPDF,
  updateEditedContentInStorage,
} from "../utils/helpers"

const ResultsDisplay = ({ data, loading }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const editableRef = useRef(null)

  const { source, sourceType, transcript, formattedContent } = data

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedContent(formattedContent)
    }
    setIsEditing(!isEditing)
  }

  const handleFormat = (command) => {
    if (editableRef.current) {
      editableRef.current.focus()

      switch (command) {
        case "bold":
          document.execCommand("bold", false, null)
          break
        case "italic":
          document.execCommand("italic", false, null)
          break
        case "underline":
          document.execCommand("underline", false, null)
          break
        case "heading":
          document.execCommand("formatBlock", false, "h3")
          break
        case "alignLeft":
          document.execCommand("justifyLeft", false, null)
          break
        case "alignCenter":
          document.execCommand("justifyCenter", false, null)
          break
        case "alignRight":
          document.execCommand("justifyRight", false, null)
          break
      }
    }
  }

  const handleSave = () => {
    const content = editableRef.current.innerHTML
    setEditedContent(content)
    updateEditedContentInStorage(content)
    setIsEditing(false)

    // Show success notification
    alert("Changes saved successfully!")
  }

  const handleCancel = () => {
    setEditedContent(formattedContent)
    setIsEditing(false)
  }

  const handleCopy = () => {
    const textToCopy = isEditing
      ? editableRef.current.innerText
      : editedContent || formattedContent
    copyToClipboard(textToCopy)
  }

  const handleDownload = () => {
    const contentToDownload = editedContent || formattedContent
    downloadSummaryAsPDF(
      contentToDownload,
      sourceType === "youtube" ? source : "media-summary"
    )
  }

  const getMediaType = (source) => {
    const extension = source.split(".").pop().toLowerCase()
    const typeMap = {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
      mov: "video/quicktime",
      mp3: "audio/mp3",
      wav: "audio/wav",
    }
    return typeMap[extension] || "video/mp4"
  }

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Processing your content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      {/* Media Display Section */}
      <div className="media-section">
        <div className="media-wrapper">
          {sourceType === "youtube" ? (
            <div className="video-embed">
              <iframe
                src={`https://www.youtube.com/embed/${data.id}?si=randomstring&amp;controls=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="local-media">
              <video className="local-video" controls>
                <source src={source} type={getMediaType(source)} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-header">
          <h2 className="summary-title">
            <i className="fas fa-file-alt"></i>
            Generated Summary
          </h2>

          <div className="summary-actions">
            <button
              onClick={handleCopy}
              className="action-btn action-btn-secondary"
            >
              <i className="fas fa-copy"></i>
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="action-btn action-btn-secondary"
            >
              <i className="fas fa-download"></i>
              Download
            </button>
            <button
              onClick={handleEditToggle}
              className="action-btn action-btn-primary"
            >
              <i className={`fas ${isEditing ? "fa-eye" : "fa-edit"}`}></i>
              {isEditing ? "View" : "Edit"}
            </button>
          </div>
        </div>

        <div className="summary-content-wrapper">
          {!isEditing ? (
            <div className="summary-content">
              <div
                className="formatted-summary"
                dangerouslySetInnerHTML={{
                  __html: editedContent || formattedContent,
                }}
              />
            </div>
          ) : (
            <div className="editor-section">
              <div className="formatting-toolbar">
                <div className="toolbar-group">
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("bold")}
                    title="Bold"
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("italic")}
                    title="Italic"
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("underline")}
                    title="Underline"
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("heading")}
                    title="Heading"
                  >
                    <i className="fas fa-heading"></i>
                  </button>
                </div>

                <div className="toolbar-separator"></div>

                <div className="toolbar-group">
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("alignLeft")}
                    title="Align Left"
                  >
                    <i className="fas fa-align-left"></i>
                  </button>
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("alignCenter")}
                    title="Align Center"
                  >
                    <i className="fas fa-align-center"></i>
                  </button>
                  <button
                    type="button"
                    className="format-btn"
                    onClick={() => handleFormat("alignRight")}
                    title="Align Right"
                  >
                    <i className="fas fa-align-right"></i>
                  </button>
                </div>
              </div>

              <div className="editor-content">
                <div
                  ref={editableRef}
                  className="editable-text"
                  contentEditable="true"
                  dangerouslySetInnerHTML={{
                    __html: editedContent || formattedContent,
                  }}
                />
              </div>

              <div className="editor-actions">
                <button
                  onClick={handleSave}
                  className="action-btn action-btn-primary"
                >
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="action-btn action-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay
