document.addEventListener("DOMContentLoaded", function () {
    // Load summaries from localStorage
    const summaries = JSON.parse(
        localStorage.getItem("autoNotesSummaries") || "[]"
    );
    const container = document.getElementById("recentSummariesContainer");

    // If no summaries, show a message
    if (summaries.length === 0) {
        container.innerHTML = `
            <div class="no-summaries">
              <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
              <h3>No summaries yet</h3>
              <p>Generate some summaries on the home page to see them here.</p>
            </div>
          `;
        return;
    }

    // Populate summaries
    summaries.forEach((summary, index) => {
        const date = new Date(summary.timestamp);
        const formattedDate =
            date.toLocaleDateString() + " " + date.toLocaleTimeString();
        const previewText = summary.transcript.substring(0, 150) + "...";

        const summaryCard = document.createElement("div");
        summaryCard.className = "summary-card";
        summaryCard.innerHTML = `
            <h3 class="summary-title">${summary.title}</h3>
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
          `;

        container.appendChild(summaryCard);
    });

    // Set up event listeners for actions
    // View summary
    document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            const summary = summaries[index];

            document.getElementById("modalTitle").textContent = summary.title;
            document.getElementById("modalDate").textContent = new Date(
                summary.timestamp
            ).toLocaleString();
            document.getElementById("modalContent").innerHTML =
                formatStructuredSummary(summary.transcript);

            document.getElementById("summaryModal").style.display = "flex";
        });
    });

    // Copy summary
    document.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            copyToClipboard(summaries[index].transcript);
        });
    });

    // Download summary
    document.querySelectorAll(".download-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            const summary = summaries[index];
            downloadSummary(summary.transcript, summary.title);
        });
    });

    // Delete summary
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            if (confirm("Are you sure you want to delete this summary?")) {
                summaries.splice(index, 1);
                localStorage.setItem(
                    "autoNotesSummaries",
                    JSON.stringify(summaries)
                );
                location.reload(); // Refresh to update the list
            }
        });
    });

    // Close modal
    document
        .getElementById("closeModal")
        .addEventListener("click", function () {
            document.getElementById("summaryModal").style.display = "none";
        });

    // Click outside modal to close
    document
        .getElementById("summaryModal")
        .addEventListener("click", function (e) {
            if (e.target === this) {
                this.style.display = "none";
            }
        });

    // Modal copy button
    document
        .getElementById("modalCopyBtn")
        .addEventListener("click", function () {
            const currentSummaryTitle =
                document.getElementById("modalTitle").textContent;
            const summary = summaries.find(
                (s) => s.title === currentSummaryTitle
            );
            if (summary) {
                copyToClipboard(summary.transcript);
            }
        });

    // Modal download button
    document
        .getElementById("modalDownloadBtn")
        .addEventListener("click", function () {
            const currentSummaryTitle =
                document.getElementById("modalTitle").textContent;
            const summary = summaries.find(
                (s) => s.title === currentSummaryTitle
            );
            if (summary) {
                downloadSummary(summary.transcript, summary.title);
            }
        });
});

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showNotification("Summary copied to clipboard!");
        })
        .catch((err) => {
            console.error("Failed to copy text: ", err);
            showNotification("Failed to copy to clipboard", true);
        });
}

// Download summary function
function downloadSummary(text, filename) {
    const element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute(
        "download",
        `${filename.replace(/[^a-zA-Z0-9]/g, "-")}-summary.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Show notification function
function showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.className = "notification" + (isError ? " error" : "");
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification with slight delay to allow for DOM rendering
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Format structured summary (copied from script.js for consistency)
function formatStructuredSummary(text) {
    // Convert markdown-style headings
    let formatted = text
        .replace(/## (.*?)(?:\r\n|\r|\n|$)/g, "<h3>$1</h3>")
        .replace(/### (.*?)(?:\r\n|\r|\n|$)/g, "<h4>$1</h4>");

    // Format timestamps
    formatted = formatted.replace(
        /\[(.*?)\]/g,
        '<span class="timestamp">[$1]</span>'
    );

    // Format bullet points
    let lines = formatted.split(/\r\n|\r|\n/);
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        // Check for bullet points
        if (lines[i].trim().match(/^(\*|•|-)( +)(.+)/)) {
            // Replace the bullet with a list item
            lines[i] = lines[i].replace(/^(\*|•|-)( +)(.+)/, "<li>$3</li>");

            // If not already in a list, add the opening <ul> tag
            if (!inList) {
                lines[i] = "<ul>" + lines[i];
                inList = true;
            }
        } else if (inList) {
            // If this line is not a bullet but we're in a list, close the list
            lines[i - 1] += "</ul>";
            inList = false;
        }
    }

    // Close any open list at the end
    if (inList) {
        lines[lines.length - 1] += "</ul>";
    }

    formatted = lines.join("<br>");

    // Add paragraph spacing for better readability
    formatted =
        "<p>" +
        formatted
            .replace(/<br><br>/g, "</p><p>")
            .replace(/(<h[34]>.*?<\/h[34]>)/g, "</p>$1<p>")
            .replace(/<p><\/p>/g, "") +
        "</p>";

    return formatted;
}