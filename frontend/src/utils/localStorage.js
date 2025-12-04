// Save summary to localStorage
export const saveToLocalStorage = (summaryData) => {
  // Get existing summaries or initialize empty array
  const existingSummaries = JSON.parse(
    localStorage.getItem("autoNotesSummaries") || "[]"
  )

  // Add new summary to the beginning of the array
  existingSummaries.unshift(summaryData)
  const limitedSummaries = existingSummaries.slice(0, 20)
  localStorage.setItem("autoNotesSummaries", JSON.stringify(limitedSummaries))
}

// Get summaries from localStorage
export const getFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("autoNotesSummaries") || "[]")
}

// Update edited content in localStorage
export const updateEditedContentInStorage = (editedHtmlContent) => {
  const recentItems = JSON.parse(
    localStorage.getItem("autoNotesSummaries") || "[]"
  )

  if (recentItems.length > 0) {
    // Update the most recent item with edited content
    recentItems[0].editedContent = editedHtmlContent
    recentItems[0].lastEdited = new Date().toISOString()
    localStorage.setItem("autoNotesSummaries", JSON.stringify(recentItems))
  }
}

// Delete summary from localStorage
export const deleteFromLocalStorage = (index) => {
  const summaries = getFromLocalStorage()
  summaries.splice(index, 1)
  localStorage.setItem("autoNotesSummaries", JSON.stringify(summaries))
}
