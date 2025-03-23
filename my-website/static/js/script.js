document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    const correctGrammarButton = document.getElementById('correct-grammar');
    const detectErrorsButton = document.getElementById('detect-errors');
    const expectedTextInput = document.getElementById('expected-text');
    const languageSelect = document.getElementById('language-select');
    const originalTextSpan = document.getElementById('original-text');
    const recognizedTextSpan = document.getElementById('recognized-text');
    const phoneticTranscriptionSpan = document.getElementById('phonetic-transcription');

    correctGrammarButton.addEventListener('click', function() {
        const text = expectedTextInput.value;
        const language = languageSelect.value;
        fetch('/correct_grammar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text, language: language })
        })
        .then(response => response.json())
        .then(data => {
            expectedTextInput.value = data.corrected_text;
        });
    });

    detectErrorsButton.addEventListener('click', function() {
        const text = expectedTextInput.value;
        const language = languageSelect.value;
        socket.emit('detect_errors', { text: text, language: language });
    });

    socket.on('errors_detected', function(data) {
        originalTextSpan.textContent = data.original_text;
        recognizedTextSpan.textContent = data.recognized_text;
        phoneticTranscriptionSpan.textContent = data.phonetic_transcription;

        const ctx = document.getElementById('pronunciation-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Original', 'Recognized'],
                datasets: [{
                    label: 'Number of Phonemes',
                    data: [data.phoneme_count, data.phoneme_count],
                    backgroundColor: ['#4CAF50', '#4CAF50']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
});