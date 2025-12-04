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
      {/* Video/Media Display */}
      <div className="video-container">
        {sourceType === "youtube" ? (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${data.id}?si=randomstring&amp;controls=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        ) : (
          <video className="local-video" controls>
            <source src={source} type={getMediaType(source)} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Summary Display */}
      <div className="summary-output">
        <h2>Generated Summary</h2>
        <div className="summary-controls">
          <button onClick={handleCopy} className="control-btn">
            <i className="fas fa-copy"></i> Copy
          </button>
          <button onClick={handleDownload} className="control-btn">
            <i className="fas fa-download"></i> Download
          </button>
          <button
            onClick={() => (window.location.href = "/recent")}
            className="control-btn"
          >
            <i className="fas fa-history"></i> View Recent
          </button>
          <button onClick={handleEditToggle} className="control-btn">
            <i className={`fas ${isEditing ? "fa-eye" : "fa-edit"}`}></i>
            {isEditing ? "View" : "Edit"}
          </button>
        </div>

        {!isEditing ? (
          <div className="summary-content" style={{ textAlign: "left" }}>
            <div
              dangerouslySetInnerHTML={{
                __html: editedContent || formattedContent,
              }}
            />
          </div>
        ) : (
          <div className="editor-container">
            <div className="formatting-toolbar">
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("bold")}
              >
                <i className="fas fa-bold"></i>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("italic")}
              >
                <i className="fas fa-italic"></i>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("underline")}
              >
                <i className="fas fa-underline"></i>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("heading")}
              >
                <i className="fas fa-heading"></i>
              </button>
              <div className="toolbar-separator"></div>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("alignLeft")}
              >
                <i className="fas fa-align-left"></i>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("alignCenter")}
              >
                <i className="fas fa-align-center"></i>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormat("alignRight")}
              >
                <i className="fas fa-align-right"></i>
              </button>
            </div>
            <div
              ref={editableRef}
              className="editable-text"
              contentEditable="true"
              dangerouslySetInnerHTML={{
                __html: editedContent || formattedContent,
              }}
            />
            <div className="editor-controls">
              <button onClick={handleSave} className="control-btn primary">
                <i className="fas fa-save"></i> Save
              </button>
              <button onClick={handleCancel} className="control-btn">
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsDisplay
