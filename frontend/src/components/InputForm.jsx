import axios from "axios"
import { useState } from "react"
import { formatStructuredSummary } from "../utils/formatters"
import { saveToLocalStorage } from "../utils/localStorage"

const InputForm = ({ onSummaryGenerated, onLoadingChange }) => {
  const [inputType, setInputType] = useState("youtube")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)

  const extractVideoId = (url) => {
    const regex = /(?:\/|%3D|v=|vi=)([\w-]{11})(?:[%#?&]|$)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const isValidYouTubeUrl = (url) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
      /^https?:\/\/youtu\.be\/[\w-]{11}/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
    ]
    return patterns.some((pattern) => pattern.test(url))
  }

  const fetchVideoTitle = async (videoId) => {
    try {
      const response = await axios.post("http://localhost:5000/videoInfo", {
        video_id: videoId,
      })
      return response.data.title || `YouTube Video ${videoId}`
    } catch (error) {
      console.error("Failed to fetch video title:", error)
      return `YouTube Video ${videoId}`
    }
  }

  const fetchTranscript = async (videoId) => {
    const response = await axios.post("http://localhost:5000/youtubeSummary", {
      video_id: videoId,
    })

    if (!response.data) {
      throw new Error("Failed to fetch transcript")
    }

    return response.data.transcript
  }

  const processLocalFile = async (file) => {
    const formData = new FormData()
    formData.append("media_file", file)

    const response = await axios.post(
      "http://localhost:5000/localFileSummary",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    if (!response.data) {
      throw new Error("Failed to process file")
    }

    return response.data.transcript
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    onLoadingChange(true)

    try {
      if (inputType === "youtube") {
        if (!youtubeUrl.trim()) {
          throw new Error("Please enter a YouTube URL")
        }

        if (!isValidYouTubeUrl(youtubeUrl)) {
          throw new Error("Please enter a valid YouTube URL")
        }

        const videoId = extractVideoId(youtubeUrl)
        if (!videoId) {
          throw new Error("Could not extract YouTube video ID")
        }

        const transcript = await fetchTranscript(videoId)
        const title = await fetchVideoTitle(videoId)

        const summaryData = {
          id: videoId,
          type: "youtube",
          title: title,
          sourceUrl: youtubeUrl,
          transcript: transcript,
          formattedContent: formatStructuredSummary(transcript),
          timestamp: new Date().toISOString(),
        }

        saveToLocalStorage(summaryData)
        onSummaryGenerated({
          ...summaryData,
          source: youtubeUrl,
          sourceType: "youtube",
        })
      } else {
        if (!selectedFile) {
          throw new Error("Please select a file")
        }

        const transcript = await processLocalFile(selectedFile)
        const fileId = Date.now().toString()

        const summaryData = {
          id: fileId,
          type: "local",
          title: selectedFile.name,
          sourceUrl: null,
          transcript: transcript,
          formattedContent: formatStructuredSummary(transcript),
          timestamp: new Date().toISOString(),
        }

        saveToLocalStorage(summaryData)
        onSummaryGenerated({
          ...summaryData,
          source: URL.createObjectURL(selectedFile),
          sourceType: "local",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      alert(error.message)
      onLoadingChange(false)
    }
  }

  return (
    <div className="input-card">
      <div className="card-header">
        <h3 className="card-title">Start Processing Content</h3>
        <p className="card-description">
          Choose your input method and let AI transform your content into
          structured notes
        </p>
      </div>

      <div className="input-type-selector">
        <div className="selector-buttons">
          <button
            type="button"
            className={`selector-btn ${
              inputType === "youtube" ? "active" : ""
            }`}
            onClick={() => setInputType("youtube")}
          >
            <i className="fab fa-youtube"></i>
            <span>YouTube Video</span>
          </button>
          <button
            type="button"
            className={`selector-btn ${inputType === "local" ? "active" : ""}`}
            onClick={() => setInputType("local")}
          >
            <i className="fas fa-upload"></i>
            <span>Upload Video File</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        {inputType === "youtube" ? (
          <div className="form-group">
            <label className="form-label">YouTube URL</label>
            <input
              type="url"
              className="form-input"
              placeholder=""
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
            <div className="input-hint">
              Supports YouTube videos, shorts, and embedded links
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Upload Media File</label>
            {!selectedFile ? (
              <div
                className="file-upload-zone"
                onClick={() => document.getElementById("file-input").click()}
              >
                <div className="file-upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <div className="file-upload-text">
                  Click to upload or drag and drop
                </div>
                <div className="file-upload-hint">
                  Supports MP4, MP3, WAV, and other media formats
                </div>
              </div>
            ) : (
              <div className="file-selected">
                <div className="file-info">
                  <i className="fas fa-file-video"></i>
                  <span className="file-name">{selectedFile.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={() => setSelectedFile(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              style={{ display: "none" }}
              accept="video/*,audio/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-md">
            <i className="fas fa-magic"></i>
            Generate Summary
          </button>
        </div>
      </form>
    </div>
  )
}

export default InputForm
