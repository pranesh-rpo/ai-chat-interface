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
            const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-20b:groq',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    max_tokens: 100,
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let content = data.choices[0].message.content;
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
