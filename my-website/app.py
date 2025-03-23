from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import os
import sqlite3

app = Flask(__name__)
socketio = SocketIO(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Database setup
DATABASE = 'database.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_text TEXT,
                recognized_text TEXT,
                phonetic_transcription TEXT,
                phoneme_count INTEGER,
                language TEXT
            )
        ''')
        conn.commit()

init_db()

LANGUAGE_API_URL = "https://api.example.com/language"  # Replace with actual API URL

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/correct_grammar', methods=['POST'])
def correct_grammar():
    data = request.json
    text = data.get('text')
    language = data.get('language')
    # Simulate grammar correction based on language
    corrected_text = text.replace('hallo', 'hello').replace('gogle', 'google')
    return jsonify({'corrected_text': corrected_text})

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Simulate transcription (replace with actual transcription logic)
    transcription = "Simulated transcription of the audio"
    return jsonify({'transcription': transcription})

@socketio.on('detect_errors')
def handle_detect_errors(data):
    text = data['text']
    language = data['language']
    # Simulate error detection based on language
    phonetic_transcription = 'HH AH0 L OW1'  # Example phonetic transcription
    phoneme_count = 5  # Example data

    # Save to database
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO results (original_text, recognized_text, phonetic_transcription, phoneme_count, language)
            VALUES (?, ?, ?, ?, ?)
        ''', (text, text, phonetic_transcription, phoneme_count, language))
        conn.commit()

    emit('errors_detected', {
        'original_text': text,
        'recognized_text': text,
        'phonetic_transcription': phonetic_transcription,
        'phoneme_count': phoneme_count
    })

if __name__ == '__main__':
    socketio.run(app, debug=True)
