# AutoNotes

**AutoNotes** is a cross-platform AI-powered note-taking tool that generates summaries from YouTube videos and local media files.

Feat: No API keys needed.

|Service|Port|
|-------|----|
|Backend|5000|

---

## Setup Instructions

### Prerequisites

- Python3 installed
- [Ollama](https://ollama.com/install.sh) installed
- FFmpeg installed

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

### 4. Pull the required LLM Model from Ollama

```bash
ollama pull Mjh1051702/youtube:latest
```

### 5. Start the Backend (Debug Mode)

```bash
export FLASK_APP="backend/server.py"
flask run --debug
```

### 6. Go to the Webpage

```bash
Open index.html in your browser
```