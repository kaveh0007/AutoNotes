from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import ollama  # Local Summarisation Model
from faster_whisper import WhisperModel  # Free, local Audio to Text Model
import ffmpeg  # Media to Audio Conversion
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
        "Summarise the Video by the Following transcript and list key points of the video in detail:  "
        + str(transcript)
    )

    messages = [{"role": "user", "content": contents}]
    response = ollama.chat(model=SUMMARISATION_MODEL_LOCAL, messages=messages)
    return response["message"]["content"]


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/youtubeSummary", methods=["POST"])
def youtubeSummary():
    """Process YouTube video and generate summary"""
    data = request.get_json()
    video_id = data.get("video_id")
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    print("Successfully Fetched transcript")
    print("Loading/Processing Transcript(Llama Model...)")
    generatedSummary = summaryGenerationModel(transcript_list)
    print("Successfully generated summary")
    return jsonify({"transcript": generatedSummary}), 200


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
