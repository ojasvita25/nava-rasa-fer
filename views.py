import base64
from PIL import Image
import io
import numpy as np
import cv2
from utils import recognize_faces

from flask import Blueprint, render_template, send_from_directory
from flask import request, jsonify
from emotiefflib.facial_analysis import EmotiEffLibRecognizer, get_model_list


views = Blueprint(__name__, "views")
model_name = get_model_list()[0]
print("Loading emotiefflib model...")

try:
    fer = EmotiEffLibRecognizer(engine="onnx", model_name=model_name, device="cpu")
    print("emotiefflib model loaded successfully!")
except Exception as e:
    print(f"Error loading emotiefflib model: {e}")

background_images = {
    "Adbutta": "images/hibiscus.png",
    "Bhayanak": "images/bhayanak_black_dahlia.png",
    "Hasya": "images/hasya_white_periwinkle.png",
    "Karuna": "images/karuna_grey_hydrangea.png",
    "Rudra": "images/rudra_red_petunia.png",
    "Shanta": "images/shanta_magnolia.png",
    "Shringar": "images/shringar_green_chrysanthemum.png",
    "Veera": "images/veera_marigold.png",
    "Vibhasta": "images/vibhasta_blue_pea.png",
}

rasa_audio_files = {
    "Adbutta": "audio/adbutta.mp3",
    "Bhayanak": "audio/bhayanak.mp3",
    "Hasya": "audio/hasya.mp3",
    "Karuna": "audio/karuna.mp3",
    "Rudra": "audio/rudra.mp3",
    "Shanta": "audio/shanta.mp3",
    "Shringar": "audio/shringar.mp3",
    "Veera": "audio/veera.mp3",
    "Vibhasta": "audio/vibhasta.mp3",
}

@views.route('/')
def index():
    return render_template('index.html', background_images=background_images, rasa_audio_files=rasa_audio_files)

@views.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_from_directory('./static/audio', filename)

@views.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('./static/images', filename)

@views.route('/analyze', methods=['POST'])
def serve_deepfacemodel():
    print("Received POST request at /analyze")
    try:
        data = request.get_json()
        img_data = data.get('image', '')

        if not img_data:
            return jsonify({'error': 'No image data received'}), 400

        # Decode the base64 image
        img_data = img_data.split(',')[1]  # Remove "data:image/jpeg;base64,"
        img_bytes = base64.b64decode(img_data)

        # Convert to PIL Image
        img = Image.open(io.BytesIO(img_bytes))

        # Convert to numpy array
        img_array = np.array(img)

        # Ensure the image has 3 channels (convert grayscale to RGB)
        if len(img_array.shape) == 2:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
        
        facial_images = recognize_faces(img_array, device="cpu")
        emotion, probs = fer.predict_emotions(facial_images[0], logits=False)
        
        dominant_prob = float(probs[0][np.argmax(probs)]*100)
        print( emotion[0], dominant_prob)
        return jsonify([{'dominant_emotion': emotion[0], 'probability': dominant_prob}])

    except Exception as e:
        return jsonify({'error': str(e)}), 500

