# AutoNotes

**AutoNotes** is a cross-platform AI-powered note-taking tool that generates summaries from YouTube videos and local media files.

Feat: No API keys needed.

|Service|Port|
|-------|----|
|Backend|5000|
|Frontend|5173|

---

## Setup Instructions

### Prerequisites

- Python3 installed
- [Ollama](https://ollama.com/install.sh) installed
- FFmpeg installed

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
pip install -r requirements.txt
```

**Note**: On first run, `faster-whisper` will download the Whisper model (~140MB for 'base' model). This is a one-time download and cached locally.

### 4. Confirm that `Ollama` is up and running locally

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

**Note**: I highly recommend trying this MVP with videos in the English Language specifically! (Subsequent releases will ensure support for other languages)