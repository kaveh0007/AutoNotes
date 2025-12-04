# AutoNotes

**AutoNotes** is a cross-platform AI-powered note-taking tool capable of generating context aware summaries.

### Features
- Summarize YouTube videos or local audio/video files
- Fully local LLM integration using Ollama
- AutoNotes is a privacy-first tool, practically nothing leaves your machine
- There are no token or API key based limits on summarizations

---

## Local Development

### Service Ports

|Service|Port|
|-------|----|
|Backend|5000|
|Frontend|5173|

### Tech Stack

- **Frontend**: React (JavaScript) + Vite
- **Backend**: Flask
- **Speech-to-Text**: faster-whisper
- **LLM**: Ollama-7-2B
- **Media Processing**: FFmpeg
- **Primary OS for Development**: Ubuntu Linux (has cross-platform support)

### Application Flow

Frontend → Backend → Whisper STT → LLM → Summary Generated → Rendered in Frontend UI

---

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.com/install.sh) installed
- FFmpeg installed (via `sudo apt install ffmpeg`)

### 1. Install the Frontend dependencies

```bash
cd frontend
npm install
```

### 2. Setup a Python Virtual Environment

```bash
python3 -m venv <envName>
source ./<envName>/bin/activate
```

### 3. Install the Backend dependencies

```bash
pip install -r backend/requirements.txt
```

**Note**: On first run, `faster-whisper` will download the Whisper model (~140MB for 'base' model). This is a one-time download and cached locally.

### 4. Start Ollama system-wide

```bash
sudo systemctl start ollama
```

### 5. Pull the required LLM Model from Ollama

```bash
ollama pull Mjh1051702/youtube:latest
```

### 6. Start the Frontend Service (ReactJS)

```bash
cd frontend
npm run dev
```

### 7. Start the Backend Service (Flask)

```bash
export FLASK_APP="backend/server.py"
flask run --debug
```

**Note**: I advice you to try this MVP with English-language videos only for best results. Support for multilingual transcription and summarization is due in future development.

---
(c) **Under MIT License**