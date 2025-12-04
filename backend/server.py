from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import ollama
from faster_whisper import WhisperModel
import ffmpeg
import os
import tempfile
import uuid
import werkzeug

# Constants
SUMMARISATION_MODEL_LOCAL = "Mjh1051702/youtube:latest"
TEMP_DIR = tempfile.gettempdir()  # Use system temp directory

# Whisper model will be loaded lazily on first use
whisper_model = None


# Functions
def get_whisper_model():
    """Load Whisper model lazily (only when needed)"""
    global whisper_model
    if whisper_model is None:
        print("Loading Whisper model (first time may download ~140MB)...")
        # Using 'base' model for good balance of speed and accuracy
        # Options: tiny, base, small, medium, large-v2, large-v3
        whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        print("Whisper model loaded successfully!")
    return whisper_model


def mediatoAudio(input_file_path):
    """Convert media file to WAV audio"""
    # Create unique output filename in temp directory
    output_filename = f"{uuid.uuid4()}.wav"
    output_file_path = os.path.join(TEMP_DIR, output_filename)

    try:
        # Convert using ffmpeg
        ffmpeg.input(input_file_path).output(output_file_path).run(
            quiet=True, overwrite_output=True
        )
        return output_file_path
    except ffmpeg.Error as e:
        print(f"FFmpeg error: {e.stderr}")
        raise


def transcribe_audio_with_whisper(file_path):
    """Transcribe audio file to text using faster-whisper (free, local)"""
    model = get_whisper_model()  # Load model on first use
    segments, info = model.transcribe(file_path, beam_size=5)

    # Combine all segments into full transcript
    transcript = " ".join([segment.text for segment in segments])

    print(
        f"Detected language: {info.language} (probability: {info.language_probability:.2f})"
    )
    return transcript


def summaryGenerationModel(transcript):
    """Generate summary from transcript using LLM"""
    contents = (
        """"You are an expert content summarizer. Based on the content provided, produce a clear, well-structured summary that reads naturally and does not mention transcripts, sources, subtitles, or how the text was obtained. 

        Your response must:
        1) Present the summary as if you watched and understood the original video directly.
        2) Avoid phrases like "the transcript says," "the text discusses," or "the provided content."
        3) Use natural language as if describing the original material.
        4) Include a robust end-to-end summary covering everything from the video.
        5) Capture context, intent, arguments, examples, and important insights.
        6) Rewrite unclear or fragmented speech into clean, coherent prose.
        7) Ignore filler words and transcription noise.
        8) If the content feels conversational or fragmented, convert it into polished, reader-friendly writing.
        9) Use emphasis and formatting where you feel like.

        OUTPUT
        A clear, detailed well written explanation that covers the full content.

        Do not mention transcripts, text processing, AI, or summarization steps. Produce the output as if you are summarizing a video you fully understood.
"""
        + str(transcript)
    )

    messages = [{"role": "user", "content": contents}]
    response = ollama.chat(model=SUMMARISATION_MODEL_LOCAL, messages=messages)
    return response["message"]["content"]


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/videoInfo", methods=["GET"])
def videoInfo():
    """Get YouTube video information"""
    try:
        video_id = request.args.get("video_id")
        if not video_id:
            return jsonify({"error": "video_id parameter required"}), 400

        # Simple endpoint - just return success, frontend will use video_id
        return jsonify({"video_id": video_id, "status": "ok"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/youtubeSummary", methods=["POST"])
def youtubeSummary():
    """Process YouTube video and generate summary"""
    try:
        data = request.get_json()
        video_id = data.get("video_id")

        if not video_id:
            return jsonify({"error": "video_id is required"}), 400

        print(f"Fetching transcript for video: {video_id}")

        # Try to get transcript in any available language
        try:
            api = YouTubeTranscriptApi()
            transcript_list = api.fetch(video_id)
            print(f"Successfully fetched transcript")
        except Exception as e:
            print(f"Transcript fetch error: {str(e)}")
            return (
                jsonify(
                    {
                        "error": f"Could not fetch transcript. This may be due to: 1) Video has no captions/subtitles, 2) Network connectivity issues, 3) YouTube API rate limiting. Error: {str(e)}"
                    }
                ),
                400,
            )

        print("Successfully Fetched transcript")
        print("Loading/Processing Transcript(Llama Model...)")
        generatedSummary = summaryGenerationModel(transcript_list)
        print("Successfully generated summary")
        return jsonify({"transcript": generatedSummary}), 200

    except Exception as e:
        print(f"Error in youtubeSummary: {str(e)}")
        return jsonify({"error": f"Failed to process video: {str(e)}"}), 500


@app.route("/localMediaSummary", methods=["POST"])
def localMediaSummary():
    """Process uploaded media file and generate summary"""
    try:
        # Check if the request contains a file
        if "media_file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["media_file"]

        # Check if file is empty
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Save uploaded file to temporary location
        temp_input_path = os.path.join(
            TEMP_DIR, f"{uuid.uuid4()}_{werkzeug.utils.secure_filename(file.filename)}"
        )
        file.save(temp_input_path)
        print(f"Saved uploaded file to: {temp_input_path}")

        try:
            # Convert media to audio
            temp_audio_path = mediatoAudio(temp_input_path)
            print(f"Converted to audio: {temp_audio_path}")

            # Generate transcript
            generatedTranscript = transcribe_audio_with_whisper(temp_audio_path)
            print("Generated transcript")

            # Generate summary
            generatedSummary = summaryGenerationModel(generatedTranscript)
            print("Generated summary")

            return jsonify({"transcript": generatedSummary}), 200

        except Exception as e:
            print(f"Processing error: {str(e)}")
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500
        finally:
            # Clean up temporary files
            try:
                if os.path.exists(temp_input_path):
                    os.remove(temp_input_path)
                if "temp_audio_path" in locals() and os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)
            except Exception as e:
                print(f"Cleanup error: {str(e)}")

    except Exception as e:
        print(f"Request handling error: {str(e)}")
        return jsonify({"error": f"Error handling request: {str(e)}"}), 500


@app.route("/health")
def health():
    return "Backend is Running"
