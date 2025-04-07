# Nava Rasa 🎭

**Nava Rasa** is an interactive web experience built with Flask that explores the **9 classical emotions (Rasas)** from Indian aesthetics. Each Rasa is brought to life through visuals and audio, offering users an immersive way to engage with emotions.

## 🌟 Features

- 🌈 Tabs for each of the **9 Rasas**:
  - Shringar (Love)
  - Hasya (Laughter)
  - Karuna (Compassion)
  - Raudra (Anger)
  - Veera (Courage)
  - Bhayanaka (Fear)
  - Vibhasta (Disgust)
  - Adbutta (Wonder)
  - Shanta (Peace)

- 🎨 Custom image and 🎵 audio for each Rasa
- 🧠 Designed for emotional exploration and learning
- ⚡️ Lightweight Flask app for easy deployment

This project uses the **FER (Facial Expression Recognition)** model from the open-source [EmotiEffLib](https://github.com/sb-ai-lab/EmotiEffLib) repository by SB-AI-Lab.

## 📸 Demo

![Nava Rasa Demo](demo.gif)

## 🚀 Getting Started

### Prerequisites

- Python 3.7+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nava-rasa.git
cd nava-rasa

# Set up virtual environment
pip install virtualenv
virtualenv fer
source fer/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python -m flask --app ./app.py run

```

## 💡 How It Works

- Browse the **9 Rasa tabs**, each with its own visuals and audio.
- Click **"Interact"** to enable real-time facial emotion detection via webcam.
- The model maps your expression to the closest matching **Rasa** and updates the content.
- **7 out of 9 Rasas** can be detected automatically through interaction; the rest are for manual exploration.
- Click **"Pause"** to stop interaction and explore freely.

### 🔗 Resources

- GitHub: [https://github.com/sb-ai-lab/EmotiEffLib](https://github.com/sb-ai-lab/EmotiEffLib)

> Credit to SB-AI-Lab for open-sourcing this powerful model!