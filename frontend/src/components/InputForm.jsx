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
    <div className="input-container">
      <div className="toggle-container">
        <label className="toggle">
          <input
            type="radio"
            name="input-type"
            value="youtube"
            checked={inputType === "youtube"}
            onChange={(e) => setInputType(e.target.value)}
          />
          <span className="toggle-label">YouTube URL</span>
        </label>
        <label className="toggle">
          <input
            type="radio"
            name="input-type"
            value="local"
            checked={inputType === "local"}
            onChange={(e) => setInputType(e.target.value)}
          />
          <span className="toggle-label">Local Media</span>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        {inputType === "youtube" ? (
          <div id="youtubeInputSection">
            <input
              type="url"
              className="url-input"
              placeholder="Paste YouTube URL here..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
        ) : (
          <div id="localFileSection">
            <input
              type="file"
              className="file-input"
              accept="video/*,audio/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>
        )}

        <button type="submit" className="analyze-btn">
          <i className="fas fa-magic"></i> Generate Summary
        </button>
      </form>
    </div>
  )
}

export default InputForm
