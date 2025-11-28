"use strict"

document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault()

  // active input elements based on the toggle
  const urlInput = document.getElementById("videoUrl")
  const fileInput = document.getElementById("localMediaFile")
  const isYouTubeMode = document.getElementById("youtubeToggle").checked

  // Store the selected file before potentially clearing the input
  let selectedFile = null
  if (!isYouTubeMode && fileInput.files && fileInput.files.length > 0) {
    selectedFile = fileInput.files[0]
  }

  // Show loading state
  const analyzeBtn = document.querySelector(".analyze-btn")
  const originalBtnText = analyzeBtn.innerHTML
  analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
  analyzeBtn.disabled = true

  try {
    if (isYouTubeMode) {
      // Handle YouTube URL
      if (!urlInput.value.trim()) {
        throw new Error("Please enter a YouTube URL")
      }

      const videoUrl = urlInput.value.trim()
      if (!isValidYouTubeUrl(videoUrl)) {
        throw new Error("Please enter a valid YouTube URL")
      }

      const videoId = extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error("Could not extract YouTube video ID")
      }

      console.log("Extracted Video ID:", videoId)
      const transcript = await fetchTranscript(videoId)

      // Save to localStorage
      saveToLocalStorage({
        id: videoId,
        type: "youtube",
        title: await fetchVideoTitle(videoId),
        sourceUrl: videoUrl,
        transcript: transcript,
        formattedContent: formatStructuredSummary(transcript),
        timestamp: new Date().toISOString(),
      })

      displayTranscript(videoId, transcript, "youtube")
    } else {
      // Handle local file
      if (!selectedFile) {
        throw new Error("Please select a media file")
      }

      if (!isValidMediaFile(selectedFile)) {
        throw new Error("Please select a valid audio or video file")
      }

      const transcript = await processLocalFile(selectedFile)
      const fileId = Date.now().toString()

      // Save to localStorage
      saveToLocalStorage({
        id: fileId,
        type: "local",
        title: selectedFile.name,
        sourceUrl: null,
        transcript: transcript,
        formattedContent: formatStructuredSummary(transcript),
        timestamp: new Date().toISOString(),
      })

      displayTranscript(URL.createObjectURL(selectedFile), transcript, "local")
    }
  } catch (error) {
    console.error("Error:", error)
    showErrorPopup(error.message)
  } finally {
    // Restore button state
    analyzeBtn.innerHTML = originalBtnText
    analyzeBtn.disabled = false
  }
})

// Fetch YouTube video title
async function fetchVideoTitle(videoId) {
  try {
    const response = await fetch(
      `http://localhost:5000/videoInfo?video_id=${videoId}`
    )
    const data = await response.json()

    if (!response.ok) {
      return "YouTube Video"
    }

    return data.title || "YouTube Video"
  } catch (error) {
    console.error("Error fetching video title:", error)
    return "YouTube Video"
  }
}

// Save summary to localStorage
function saveToLocalStorage(summaryData) {
  // Get existing summaries or initialize empty array
  const existingSummaries = JSON.parse(
    localStorage.getItem("autoNotesSummaries") || "[]"
  )

  // Add new summary to the beginning of the array
  existingSummaries.unshift(summaryData)
  const limitedSummaries = existingSummaries.slice(0, 20)
  localStorage.setItem("autoNotesSummaries", JSON.stringify(limitedSummaries))
}

//URL validation
function isValidYouTubeUrl(url) {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
    /^https?:\/\/youtu\.be\/[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
  ]
  return patterns.some((pattern) => pattern.test(url))
}

//valid media file (video or audio)
function isValidMediaFile(file) {
  const validTypes = [
    // Video types
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    // Audio types
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/mpeg",
  ]

  // If file type is empty but extension is valid, allow it
  if (!file.type) {
    const extension = file.name.split(".").pop().toLowerCase()
    const validExtensions = ["mp4", "webm", "ogg", "mov", "mp3", "wav", "mpeg"]
    return validExtensions.includes(extension)
  }

  return validTypes.includes(file.type)
}

//video ID extraction
function extractVideoId(url) {
  const regex = /(?:\/|%3D|v=|vi=)([\w-]{11})(?:[%#?&]|$)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Fetch function for YouTube Summary
async function fetchTranscript(videoId) {
  try {
    const response = await fetch("http://localhost:5000/youtubeSummary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_id: videoId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch transcript")
    }

    return data.transcript
  } catch (error) {
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Could not connect to server. Please ensure the backend service is running."
      )
    }
    throw error
  }
}

// Modified function to upload the file to the backend instead of sending the path
async function processLocalFile(file) {
  try {
    // Create FormData object to send the file
    const formData = new FormData()
    formData.append("media_file", file)

    // Show an info notification
    showNotification("Uploading file. This may take a while for large files...")

    // Send the actual file to the backend
    const response = await fetch("http://localhost:5000/localMediaSummary", {
      method: "POST",
      // No Content-Type header needed, FormData sets it with the boundary
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to process local media file")
    }

    return data.transcript
  } catch (error) {
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Could not connect to server. Please ensure the backend service is running."
      )
    }
    throw error
  }
}

// Improved error popup
function showErrorPopup(message) {
  // Remove any existing error popups
  const existingPopups = document.querySelectorAll(".error-popup")
  existingPopups.forEach((popup) => {
    document.body.removeChild(popup)
  })

  // Create new popup
  const popup = document.createElement("div")
  popup.className = "error-popup"
  popup.innerHTML = `
        <div class="error-content">
            <span class="close-btn">&times;</span>
            <h4>Error</h4>
            <p>${message}</p>
        </div>
    `

  // Add close functionality
  popup.querySelector(".close-btn").addEventListener("click", () => {
    document.body.removeChild(popup)
  })

  // Close on click outside
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      document.body.removeChild(popup)
    }
  })

  // Auto close after 5 seconds
  document.body.appendChild(popup)
  setTimeout(() => {
    if (document.body.contains(popup)) {
      document.body.removeChild(popup)
    }
  }, 5000)
}

function displayTranscript(source, transcript, sourceType) {
  // Get the dynamic results container from HTML
  const resultsContainer = document.getElementById("dynamicResults")

  // Clear previous results
  resultsContainer.innerHTML = ""

  // Create video embed container
  const videoContainer = document.createElement("div")
  videoContainer.className = "video-embed"

  // Different embed code based on source type
  if (sourceType === "youtube") {
    videoContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube-nocookie.com/embed/${source}?rel=0" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `
  } else if (sourceType === "local") {
    videoContainer.innerHTML = `
            <video 
                width="100%" 
                height="400" 
                controls>
                <source src="${source}" type="${getMediaType(source)}">
                Your browser does not support the video tag.
            </video>
        `
  }

  // Create summary container
  const summaryContainer = document.createElement("div")
  summaryContainer.className = "summary-output"
  summaryContainer.innerHTML = `
        <h2>Generated Summary</h2>
        <div class="summary-controls">
            <button id="copyBtn" class="control-btn"><i class="fas fa-copy"></i> Copy</button>
            <button id="downloadBtn" class="control-btn"><i class="fas fa-download"></i> Download</button>
            <button id="viewRecentBtn" class="control-btn"><i class="fas fa-history"></i> View Recent</button>
            <button id="editToggleBtn" class="control-btn"><i class="fas fa-edit"></i> Edit</button>
        </div>
        <div class="summary-content" id="summaryDisplay" style="text-align: left;">
            ${formatStructuredSummary(transcript)}
        </div>
        <div class="editor-container" id="editorContainer" style="display: none;">
            <div class="formatting-toolbar">
                <button type="button" class="format-btn" data-format="bold"><i class="fas fa-bold"></i></button>
                <button type="button" class="format-btn" data-format="italic"><i class="fas fa-italic"></i></button>
                <button type="button" class="format-btn" data-format="underline"><i class="fas fa-underline"></i></button>
                <button type="button" class="format-btn" data-format="heading"><i class="fas fa-heading"></i></button>
                <div class="toolbar-separator"></div>
                <button type="button" class="format-btn" data-format="alignLeft"><i class="fas fa-align-left"></i></button>
                <button type="button" class="format-btn" data-format="alignCenter"><i class="fas fa-align-center"></i></button>
                <button type="button" class="format-btn" data-format="alignRight"><i class="fas fa-align-right"></i></button>
            </div>
            <div id="editableArea" class="editable-text" contenteditable="true">${formatStructuredSummary(
              transcript
            )}</div>
            <div class="editor-controls">
                <button id="saveEditsBtn" class="control-btn primary"><i class="fas fa-save"></i> Save</button>
                <button id="cancelEditsBtn" class="control-btn"><i class="fas fa-times"></i> Cancel</button>
            </div>
        </div>
    `

  // Append elements to results container
  resultsContainer.appendChild(videoContainer)
  resultsContainer.appendChild(summaryContainer)

  // Add event listeners for copy and download buttons
  document.getElementById("copyBtn").addEventListener("click", () => {
    copyToClipboard(transcript)
  })

  document.getElementById("downloadBtn").addEventListener("click", () => {
    downloadSummaryAsPDF(
      formatStructuredSummary(transcript),
      sourceType === "youtube" ? source : "media-summary"
    )
  })

  // Add event listener for view recent button
  document.getElementById("viewRecentBtn").addEventListener("click", () => {
    window.location.href = "./recent.html"
  })

  // Add editing functionality
  setupEditingControls(transcript)

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: "smooth" })
}

// Helper function to determine media type
function getMediaType(source) {
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

// Copy summary to clipboard
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification("Summary copied to clipboard!")
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err)
      showErrorPopup("Failed to copy to clipboard")
    })
}

// Download summary as PDF file
function downloadSummaryAsPDF(htmlContent, filename) {
  // Create a new window for PDF generation
  const printWindow = window.open("", "", "height=600,width=800")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${filename}</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                background: white;
            }
            h1, h2, h3 { 
                color: #2563eb; 
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }
            h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { font-size: 20px; }
            h3 { font-size: 18px; }
            h4 { font-size: 16px; color: #7c3aed; }
            p { margin: 10px 0; }
            strong { color: #dc2626; font-weight: 600; }
            em { color: #059669; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 5px 0; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>AutoNotes Summary</h1>
            <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${htmlContent}
        <div class="footer">
            <p>Generated by AutoNotes - AI-Powered Video Summarization Tool</p>
        </div>
    </body>
    </html>
  `)

  printWindow.document.close()

  // Wait for content to load, then print as PDF
  printWindow.onload = function () {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

// Update localStorage with edited content
function updateEditedContentInStorage(editedHtmlContent) {
  const recentItems = JSON.parse(
    localStorage.getItem("autonotes_recent") || "[]"
  )

  if (recentItems.length > 0) {
    // Update the most recent item with edited content
    recentItems[0].editedContent = editedHtmlContent
    recentItems[0].lastEdited = new Date().toISOString()
    localStorage.setItem("autonotes_recent", JSON.stringify(recentItems))
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.textContent = message
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 2000)
}

//structured content
function formatStructuredSummary(text) {
  // Convert markdown-style headings
  let formatted = text
    .replace(/## (.*?)(?:\r\n|\r|\n|$)/g, "<h3>$1</h3>")
    .replace(/### (.*?)(?:\r\n|\r|\n|$)/g, "<h4>$1</h4>")

  // Convert markdown bold and italic
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic*

  // Format timestamps
  formatted = formatted.replace(
    /\[(.*?)\]/g,
    '<span class="timestamp">[$1]</span>'
  )

  // Format bullet points
  let lines = formatted.split(/\r\n|\r|\n/)
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    // Check for bullet points
    if (lines[i].trim().match(/^(\*|•|-)( +)(.+)/)) {
      // Replace the bullet with a list item
      lines[i] = lines[i].replace(/^(\*|•|-)( +)(.+)/, "<li>$3</li>")

      // If not already in a list, add the opening <ul> tag
      if (!inList) {
        lines[i] = "<ul>" + lines[i]
        inList = true
      }
    } else if (inList) {
      // If this line is not a bullet but we're in a list, close the list
      lines[i - 1] += "</ul>"
      inList = false
    }
  }

  // Close any open list at the end
  if (inList) {
    lines[lines.length - 1] += "</ul>"
  }

  formatted = lines.join("<br>")

  // Add paragraph spacing for better readability
  formatted =
    "<p>" +
    formatted
      .replace(/<br><br>/g, "</p><p>")
      .replace(/(<h[34]>.*?<\/h[34]>)/g, "</p>$1<p>")
      .replace(/<p><\/p>/g, "") +
    "</p>"

  return formatted
}

// Setup editing controls functionality
function setupEditingControls(originalTranscript) {
  const editToggleBtn = document.getElementById("editToggleBtn")
  const editorContainer = document.getElementById("editorContainer")
  const summaryDisplay = document.getElementById("summaryDisplay")
  const editableArea = document.getElementById("editableArea")
  const saveEditsBtn = document.getElementById("saveEditsBtn")
  const cancelEditsBtn = document.getElementById("cancelEditsBtn")
  const formatBtns = document.querySelectorAll(".format-btn")

  let isEditing = false

  // Toggle between view and edit mode
  editToggleBtn.addEventListener("click", () => {
    isEditing = !isEditing

    if (isEditing) {
      summaryDisplay.style.display = "none"
      editorContainer.style.display = "block"
      editToggleBtn.innerHTML = '<i class="fas fa-eye"></i> View'
      editableArea.innerHTML = summaryDisplay.innerHTML
      editableArea.focus()
    } else {
      summaryDisplay.style.display = "block"
      editorContainer.style.display = "none"
      editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Edit'
    }
  })

  // Format button functionality
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const format = btn.dataset.format
      editableArea.focus()

      switch (format) {
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
    })
  })

  // Save edits
  saveEditsBtn.addEventListener("click", () => {
    const editedContent = editableArea.innerHTML
    summaryDisplay.innerHTML = editedContent

    // Update localStorage with edited content to persist in recents
    updateEditedContentInStorage(editedContent)

    // Update copy and download to use edited content
    document.getElementById("copyBtn").onclick = () => {
      copyToClipboard(editableArea.innerText)
    }

    document.getElementById("downloadBtn").onclick = () => {
      downloadSummaryAsPDF(editedContent, "edited-summary")
    }

    // Switch back to view mode
    isEditing = false
    summaryDisplay.style.display = "block"
    editorContainer.style.display = "none"
    editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Edit'

    showNotification("Changes saved successfully!")
  })

  // Cancel edits
  cancelEditsBtn.addEventListener("click", () => {
    // Reset to original content
    editableArea.innerHTML = summaryDisplay.innerHTML

    // Switch back to view mode
    isEditing = false
    summaryDisplay.style.display = "block"
    editorContainer.style.display = "none"
    editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Edit'
  })
}
