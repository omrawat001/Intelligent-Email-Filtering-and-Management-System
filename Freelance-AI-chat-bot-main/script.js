// Connect to WebSocket server
const socket = io('http://localhost:3000', {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket']
});

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');
const typingIndicator = document.getElementById('typing-indicator');
const connectionStatus = document.getElementById('connection-status');
const statusDot = connectionStatus.querySelector('.status-dot');
const statusText = connectionStatus.querySelector('.status-text');

// Job filter elements
const jobCategory = document.getElementById('job-category');
const jobType = document.getElementById('job-type');
const locationFilter = document.getElementById('location-filter');

// Current filters state
let currentFilters = {
    category: '',
    type: '',
    location: ''
};

// Speech recognition setup
let recognition;
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        addBotMessage("Sorry, I couldn't understand your voice command. Please try typing.");
    };
} catch (e) {
    console.warn('Speech recognition not supported');
    voiceButton.style.display = 'none';
}

// Connection status
socket.on('connect', () => {
    console.log('Connected to server');
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
    
    // Initial bot greeting
    addBotMessage("Hello! I'm your freelance job assistant. Ask me to find jobs in your field!");
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    statusText.textContent = 'Connection failed';
});

// Message from server
socket.on('bot-message', (message) => {
    hideTypingIndicator();
    addBotMessage(message.text);
    
    if (message.jobs) {
        displayJobs(message.jobs);
    }
});

socket.on('typing', () => {
    showTypingIndicator();
});

// Filter change handlers
jobCategory.addEventListener('change', updateFilters);
jobType.addEventListener('change', updateFilters);
locationFilter.addEventListener('input', updateFilters);

function updateFilters() {
    currentFilters = {
        category: jobCategory.value,
        type: jobType.value,
        location: locationFilter.value.trim()
    };
    
    // You could send these filters to the server if needed
    // socket.emit('update-filters', currentFilters);
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

voiceButton.addEventListener('click', startVoiceRecognition);

// Functions
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        
        // Show typing indicator while waiting for response
        showTypingIndicator();
        
        // Send message to server
        socket.emit('user-message', {
            text: message,
            filters: currentFilters
        });
    }
}

function startVoiceRecognition() {
    if (recognition) {
        try {
            recognition.start();
            voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            voiceButton.classList.add('active');
            
            recognition.onend = () => {
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceButton.classList.remove('active');
            };
        } catch (e) {
            console.error('Voice recognition error:', e);
        }
    }
}

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        ${text}
        <span class="message-time">${formatTime(new Date())}</span>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        ${text}
        <span class="message-time">${formatTime(new Date())}</span>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function displayJobs(jobs) {
    if (!jobs || jobs.length === 0) {
        addBotMessage("No jobs found matching your criteria. Try adjusting your filters.");
        return;
    }
    
    const jobsContainer = document.createElement('div');
    jobsContainer.className = 'jobs-container';
    
    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'job-listing';
        jobElement.innerHTML = `
            <h3>${job.title}</h3>
            <div class="job-meta">
                <span>${job.company}</span>
                <span>${job.location || 'Remote'}</span>
                <span>${job.type || 'Contract'}</span>
            </div>
            <div class="job-description">${job.description || 'No description available.'}</div>
            ${job.skills ? `<div class="job-skills">
                ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>` : ''}
            <div class="job-actions">
                <a href="${job.url}" class="view-job" target="_blank">View Job</a>
                <a href="#" class="save-job">Save</a>
            </div>
        `;
        
        // Add click handler for save button
        jobElement.querySelector('.save-job').addEventListener('click', (e) => {
            e.preventDefault();
            socket.emit('save-job', { jobId: job.id });
            e.target.textContent = 'Saved!';
            e.target.style.backgroundColor = '#4CAF50';
            e.target.style.color = 'white';
        });
        
        jobsContainer.appendChild(jobElement);
    });
    
    chatMessages.appendChild(jobsContainer);
    scrollToBottom();
}

function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initialize
updateFilters();