document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('prompt');
    const sendButton = document.getElementById('send');
    const messagesDiv = document.getElementById('messages');

    sendButton.addEventListener('click', sendPrompt);
    promptInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendPrompt();
        }
    });

    promptInput.addEventListener('input', function() {
        sendButton.disabled = promptInput.value.trim() === '';
    });

    async function sendPrompt() {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        // Add user message
        addMessage(prompt, 'user');
        promptInput.value = '';
        sendButton.disabled = true;

        // Add AI placeholder
        const aiMessageDiv = addMessage('Thinking...', 'ai');

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBu3nzXbZzi9HvoWDYt8o3dtvQco5kYPs0', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let content = data.candidates[0].content.parts[0].text;
            // Convert markdown bold to HTML
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Convert newlines to <br>
            content = content.replace(/\n/g, '<br>');
            aiMessageDiv.innerHTML = content;
            MathJax.typesetPromise([aiMessageDiv]);
        } catch (error) {
            console.error('Error:', error);
            aiMessageDiv.textContent = 'Sorry, there was an error processing your request.';
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return messageDiv;
    }
});
