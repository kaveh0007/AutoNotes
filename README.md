# AutoNotes

**AutoNotes** is a cross-platform AI-powered note-taking tool that generates summaries from YouTube videos and local media files.

Feat: No API keys needed.

---

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.x
- [Ollama](https://ollama.com) installed
- FFmpeg installed
- `Mjh1051702/youtube:latest` model pulled via Ollama

### 2. Setup a Python Virtual Environment

```bash
python3 -m venv <envName>
source ./<envName>/bin/activate
```

### 3. Install the dependencies

```bash
pip install -r requirements.txt
```

**Note**: On first run, `faster-whisper` will download the Whisper model (~140MB for 'base' model). This is a one-time download and cached locally.

### 4. Pull the required LLM Model from OLLAMA

```bash
ollama pull Mjh1051702/youtube:latest
```

### 5. Run the Application

```bash
python backend/backendFileUpload.py
```

### 6. Open `index.html` in your browser.

### 7. Deployment

For deployment, you can use free tiers of:

- **Railway** - 500 hours/month free
- **Render** - Free tier available
- **Fly.io** - Free allowance for small apps

Note: Ollama needs to be installed on the deployment server.
