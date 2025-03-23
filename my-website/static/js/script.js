const socket = io();

document.getElementById('correct-grammar').addEventListener('click', () => {
    const text = document.getElementById('expected-text').value;
    const language = document.getElementById('language-select').value;

    fetch('/correct_grammar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('output').innerHTML = `<p>Corrected Text: ${data.corrected_text}</p>`;
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('detect-errors').addEventListener('click', () => {
    recordVoice();
});

function recordVoice() {
    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        const recorder = new RecordRTC(stream, { type: 'audio' });
        recorder.startRecording();

        setTimeout(() => {
            recorder.stopRecording(() => {
                const blob = recorder.getBlob();
                const formData = new FormData();
                formData.append('audio', blob);

                fetch('/upload_audio', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    socket.emit('detect_errors', { text: data.transcription, language: document.getElementById('language-select').value });
                })
                .catch(error => console.error('Error:', error));
            });
        }, 5000); // Record for 5 seconds
    }).catch(error => console.error('Error accessing microphone:', error));
}

socket.on('errors_detected', data => {
    document.getElementById('output').innerHTML += `
        <p>Original Text: ${data.original_text}</p>
        <p>Recognized Text: ${data.recognized_text}</p>
        <p>Phonetic Transcription: ${data.phonetic_transcription}</p>
        <p>Phoneme Count: ${data.phoneme_count}</p>
    `;
});
