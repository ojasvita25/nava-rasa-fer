
let audioElement = new Audio();
let webcamStream = null;
let isWebcamActive = false;
let inferenceInterval = 2000;
let currentRasa = null;
let inferenceIntervalId = null;
let lastInferenceTime = null;
let expressionDisplayElement = null;

const rasaMapping = {
    'Neutral': 'Shanta', 'Happiness': 'Hasya', 'Sadness': 'Karuna',
    'Anger': 'Rudra', 'Fear': 'Bhayanak', 'Disgust': 'Vibhasta',
    'Surprise': 'Adbutta', 'Contempt': 'Vibhasta'
};

const rasaAssets = {
    "Adbutta": { image: "images/test.gif", audio: "audio/adbutta.mp3" },
    "Bhayanak": { image: "images/bhayanak_black_dahlia.png", audio: "audio/bhayanak.mp3" },
    "Hasya": { image: "images/hasya_white_periwinkle.png", audio: "audio/hasya.mp3" },
    "Karuna": { image: "images/karuna_grey_hydrangea.png", audio: "audio/karuna.mp3" },
    "Rudra": { image: "images/rudra_red_petunia.png", audio: "audio/rudra.mp3" },
    "Shanta": { image: "images/shanta_magnolia.png", audio: "audio/shanta.mp3" },
    "Shringar": { image: "images/shringar_green_chrysanthemum.png", audio: "audio/shringar.mp3" },
    "Veera": { image: "images/veera_marigold.png", audio: "audio/veera.mp3" },
    "Vibhasta": { image: "images/vibhasta_blue_pea.png", audio: "audio/vibhasta.mp3" }
};

// Function to create a DOM element to display the most probable expression
function createExpressionDisplay() {
    if (expressionDisplayElement) return;  // If already created, do nothing

    // Create a div element
    expressionDisplayElement = document.createElement('div');
    expressionDisplayElement.style.position = 'absolute';
    expressionDisplayElement.style.bottom = '10px';
    expressionDisplayElement.style.right = '10px';
    expressionDisplayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    expressionDisplayElement.style.color = 'white';
    expressionDisplayElement.style.padding = '5px';
    expressionDisplayElement.style.fontSize = '16px';
    expressionDisplayElement.style.borderRadius = '5px';
    expressionDisplayElement.style.zIndex = '9999';  // Ensure it's on top
    document.body.appendChild(expressionDisplayElement);
}

function updateBackgroundAndAudio(rasa) {
    if (rasa === currentRasa) return;
    
    currentRasa = rasa;
    const assets = rasaAssets[rasa];
    if (!assets) return;
    
    document.body.style.backgroundImage = `url(${assets.image})`;
    audioElement.pause();
    audioElement.src = assets.audio;
    audioElement.loop = true;
    audioElement.play().catch(error => console.error('Error playing audio:', error));
}

function updateExpressionDisplay(expression, probability) {
    const rasa = rasaMapping[expression];
    // Remove highlight from all buttons
    document.querySelectorAll('.rasa-button').forEach(btn => {
        btn.classList.remove('highlighted');
    });

    if (expressionDisplayElement) {
        expressionDisplayElement.innerHTML = `Detected: ${rasa} (${probability.toFixed(2)}%)`;
    }
    if (probability >= 50 && rasa) {
        updateBackgroundAndAudio(rasa);
        // Highlight the predicted Rasa button
        let selectedButton = document.getElementById(`rasa-${rasa}`);
        if (selectedButton) {
            selectedButton.classList.add('highlighted');
        }
    } else {
        console.log(`Prediction probability too low: ${probability.toFixed(2)}%. No background change.`);
    }
}

function sendFrameToFlask(frame) {
    fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: frame })
    })
    .then(response => response.json())
    .then(data => {
        if (data?.[0]?.dominant_emotion) {
            updateExpressionDisplay(data[0].dominant_emotion, data[0].probability || 0);
        }
    })
    .catch(error => console.error('Error fetching emotion data:', error));
}

async function captureWebcamFrame(videoElement) {
    if (!isWebcamActive) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    const frame = canvas.toDataURL('image/jpeg');
    
    // Capture current time and calculate interval difference
    const currentTime = new Date();
    if (lastInferenceTime) {
        console.log(`Time since last inference: ${currentTime - lastInferenceTime} ms`);
    }
    lastInferenceTime = currentTime;
    createExpressionDisplay();

    sendFrameToFlask(frame);
}

// Start webcam and control model inference rate
async function startWebcam() {
    if (!isWebcamActive) {
        try {
            const video = document.createElement('video');
            video.setAttribute('autoplay', 'true');
            video.style.position = 'absolute';
            video.style.top = '-9999px';
            video.style.left = '-9999px';
            document.body.appendChild(video);

            webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = webcamStream;
            isWebcamActive = true;
            video.style.display = 'none';

            // Call the model at a fixed interval (every 2 seconds)
            inferenceIntervalId = setInterval(() => captureWebcamFrame(video), inferenceInterval);
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Failed to access webcam. Please check browser permissions.');
        }
    }
}

// Pause webcam and stop inference calls
function pauseWebcam() {
    console.log(expressionDisplayElement)
    // Remove the expression display element completely
    if (expressionDisplayElement) {
        expressionDisplayElement.remove();
        expressionDisplayElement = null;  // Optional: Reset the variable for cleanup
    }

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        isWebcamActive = false;

        if (inferenceIntervalId) {
            clearInterval(inferenceIntervalId);
            inferenceIntervalId = null;
        }

        const videoElement = document.body.querySelector('video');
        if (videoElement) {
            videoElement.remove();
        }
    }
}

// Information Modal functions
function openInfoModal() {
    document.getElementById('info-modal').style.display = 'flex';
}

function closeInfoModal() {
    document.getElementById('info-modal').style.display = 'none';
}

document.getElementById('info-btn').addEventListener('click', openInfoModal);
