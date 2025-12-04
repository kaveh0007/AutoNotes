// Format structured summary with markdown-like formatting
export const formatStructuredSummary = (text) => {
  if (!text) return ""

  let formatted = text

  // Convert markdown-style formatting to HTML
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold** to <strong>
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic* to <em>
    .replace(/## (.*?)(?:\r\n|\r|\n|$)/g, "<h3>$1</h3>") // ## headings
    .replace(/### (.*?)(?:\r\n|\r|\n|$)/g, "<h4>$1</h4>") // ### subheadings

  // Handle timestamps in brackets [00:00]
  formatted = formatted.replace(
    /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g,
    '<span class="timestamp">[$1]</span>'
  )

  // Convert line breaks to HTML breaks
  const lines = formatted.split(/\r\n|\r|\n/)

  // Process bullet points
  let inList = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("• ") || lines[i].trim().startsWith("- ")) {
      lines[i] = "<li>" + lines[i].trim().substring(2) + "</li>"

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

// Strip markdown formatting for clean preview text
export const stripMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
    .replace(/## (.*?)(?:\r\n|\r|\n|$)/g, "$1") // Remove ## headings
    .replace(/### (.*?)(?:\r\n|\r|\n|$)/g, "$1") // Remove ### headings
    .replace(/\[(.*?)\]/g, "$1") // Remove [timestamps]
    .replace(/^\s*[\*\-\+]\s+/gm, "") // Remove bullet points
    .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered lists
}
