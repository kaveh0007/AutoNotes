document.addEventListener("DOMContentLoaded", function () {
  // Load summaries from localStorage
  const summaries = JSON.parse(
    localStorage.getItem("autoNotesSummaries") || "[]"
  )
  const container = document.getElementById("recentSummariesContainer")

  // If no summaries, show a message
  if (summaries.length === 0) {
    container.innerHTML = `
            <div class="no-summaries">
              <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
              <h3>No summaries yet</h3>
              <p>Generate some summaries on the home page to see them here.</p>
            </div>
          `
    return
  }

  // Function to strip markdown formatting for clean preview text
  function stripMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
      .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
      .replace(/## (.*?)(?:\r\n|\r|\n|$)/g, "$1") // Remove ## headings
      .replace(/### (.*?)(?:\r\n|\r|\n|$)/g, "$1") // Remove ### headings
      .replace(/\[(.*?)\]/g, "$1") // Remove [timestamps]
      .replace(/^\s*[\*\-\+]\s+/gm, "") // Remove bullet points
      .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered lists
  }

  // Populate summaries
  summaries.forEach((summary, index) => {
    const date = new Date(summary.timestamp)
    const formattedDate =
      date.toLocaleDateString() + " " + date.toLocaleTimeString()
    const previewText =
      stripMarkdown(summary.transcript).substring(0, 150) + "..."

    const summaryCard = document.createElement("div")
    summaryCard.className = "summary-card"

    // Create clickable title for YouTube videos, plain title for local files
    const titleHTML =
      summary.type === "youtube" && summary.sourceUrl
        ? `<h3 class="summary-title"><a href="${summary.sourceUrl}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">${summary.title}</a></h3>`
        : `<h3 class="summary-title">${summary.title}</h3>`

    summaryCard.innerHTML = `
            ${titleHTML}
            <div class="summary-date">${formattedDate}</div>
            <div class="summary-preview">${previewText}</div>
            <div class="summary-actions">
              <button class="action-btn view-btn" data-index="${index}">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="action-btn copy-btn" data-index="${index}">
                <i class="fas fa-copy"></i> Copy
              </button>
              <button class="action-btn download-btn" data-index="${index}">
                <i class="fas fa-download"></i> Download
              </button>
              <button class="action-btn delete-btn" data-index="${index}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          `

    container.appendChild(summaryCard)
  })

  // Set up event listeners for actions
  // View summary
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      const summary = summaries[index]

      document.getElementById("modalTitle").textContent = summary.title
      document.getElementById("modalDate").textContent = new Date(
        summary.timestamp
      ).toLocaleString()
      document.getElementById("modalContent").innerHTML =
        formatStructuredSummary(summary.transcript)

      document.getElementById("summaryModal").style.display = "flex"
    })
  })

  // Copy summary
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      copyToClipboard(summaries[index].transcript)
    })
  })

  // Download summary
  document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      const summary = summaries[index]
      // Use edited content if available, otherwise use original
      const contentToDownload =
        summary.editedContent || summary.formattedContent || summary.transcript
      downloadSummaryAsPDF(contentToDownload, summary.title)
    })
  })

  // Delete summary
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      if (confirm("Are you sure you want to delete this summary?")) {
        summaries.splice(index, 1)
        localStorage.setItem("autoNotesSummaries", JSON.stringify(summaries))
        location.reload() // Refresh to update the list
      }
    })
  })

  // Close modal
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("summaryModal").style.display = "none"
  })

  // Click outside modal to close
  document
    .getElementById("summaryModal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none"
      }
    })

  // Modal copy button
  document
    .getElementById("modalCopyBtn")
    .addEventListener("click", function () {
      const currentSummaryTitle =
        document.getElementById("modalTitle").textContent
      const summary = summaries.find((s) => s.title === currentSummaryTitle)
      if (summary) {
        copyToClipboard(summary.transcript)
      }
    })

  // Modal download button
  document
    .getElementById("modalDownloadBtn")
    .addEventListener("click", function () {
      const currentSummaryTitle =
        document.getElementById("modalTitle").textContent
      const summary = summaries.find((s) => s.title === currentSummaryTitle)
      if (summary) {
        downloadSummary(summary.transcript, summary.title)
      }
    })
})

// Copy to clipboard function
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification("Summary copied to clipboard!")
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err)
      showNotification("Failed to copy to clipboard", true)
    })
}

// Download summary as PDF function
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

// Show notification function
function showNotification(message, isError = false) {
  const notification = document.createElement("div")
  notification.className = "notification" + (isError ? " error" : "")
  notification.textContent = message

  document.body.appendChild(notification)

  // Show notification with slight delay to allow for DOM rendering
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  // Hide and remove notification
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Format structured summary (copied from script.js for consistency)
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
