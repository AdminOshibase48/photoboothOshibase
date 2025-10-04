// AI Photobooth Premium Configuration
const config = {
    photoStyle: 'single',
    aiMagic: 'neon',
    photoCount: 4,
    timer: 3,
    currentEffect: 'none',
    aiEnabled: true,
    arEnabled: false
};

// DOM Elements
const screens = {
    home: document.getElementById('homeScreen'),
    camera: document.getElementById('cameraScreen'),
    results: document.getElementById('resultsScreen')
};

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const effectCanvas = document.getElementById('effectCanvas');
const captureBtn = document.getElementById('captureBtn');
const switchCameraBtn = document.getElementById('switchCamera');
const countdown = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdownNumber');
const poseGuide = document.getElementById('poseGuide');
const arProps = document.getElementById('arProps');
const photoGallery = document.getElementById('photoGallery');

let stream = null;
let currentFacingMode = 'user';
let capturedPhotos = [];
let isCapturing = false;

// Audio Elements
const shutterSound = document.getElementById('shutterSound');
const countdownSound = document.getElementById('countdownSound');

// Initialize AI Photobooth
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createParticles();
});

function initializeApp() {
    initializeEventListeners();
    initializeAudio();
    hideLoading();
}

function initializeEventListeners() {
    // Home screen interactions
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', handleStyleSelect);
    });
    
    document.querySelectorAll('.magic-btn').forEach(btn => {
        btn.addEventListener('click', handleMagicSelect);
    });
    
    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.addEventListener('click', handleTimerSelect);
    });
    
    // Number selector
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', handleNumberChange);
    });
    
    // Start session
    document.getElementById('startAISession').addEventListener('click', startAISession);
    document.getElementById('backToHome').addEventListener('click', goToHome);
    document.getElementById('newAISession').addEventListener('click', goToHome);
    
    // Camera controls
    captureBtn.addEventListener('click', startAICaptureProcess);
    switchCameraBtn.addEventListener('click', switchCamera);
    document.getElementById('toggleAI').addEventListener('click', toggleAI);
    document.getElementById('toggleAR').addEventListener('click', toggleAR);
    
    // Effects
    document.querySelectorAll('.effect-option').forEach(btn => {
        btn.addEventListener('click', handleEffectSelect);
    });
    
    // AR Props
    document.querySelectorAll('.prop').forEach(prop => {
        prop.addEventListener('click', handlePropSelect);
    });
    
    // Results actions
    document.getElementById('downloadAll').addEventListener('click', downloadAllPhotos);
    document.getElementById('shareGallery').addEventListener('click', shareGallery);
}

function initializeAudio() {
    // Preload audio files
    try {
        shutterSound.volume = 0.3;
        countdownSound.volume = 0.2;
    } catch (error) {
        console.log('Audio initialization skipped');
    }
}

function createParticles() {
    const particles = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: ${Math.random() > 0.5 ? 'var(--primary)' : 'var(--neon)'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.1};
            animation: float ${Math.random() * 20 + 10}s linear infinite;
        `;
        particles.appendChild(particle);
    }
    
    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

function handleStyleSelect(e) {
    const button = e.currentTarget;
    const style = button.getAttribute('data-style');
    
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.photoStyle = style;
    
    // Update UI based on style
    updateStyleUI(style);
}

function handleMagicSelect(e) {
    const button = e.currentTarget;
    const magic = button.getAttribute('data-magic');
    
    document.querySelectorAll('.magic-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.aiMagic = magic;
}

function handleTimerSelect(e) {
    const button = e.currentTarget;
    const timer = parseInt(button.getAttribute('data-timer'));
    
    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.timer = timer;
}

function handleNumberChange(e) {
    const button = e.currentTarget;
    const display = button.parentElement.querySelector('.number-display');
    let current = parseInt(display.textContent);
    
    if (button.classList.contains('plus')) {
        current = Math.min(12, current + 1);
    } else {
        current = Math.max(1, current - 1);
    }
    
    display.textContent = current;
    config.photoCount = current;
}

function handleEffectSelect(e) {
    const button = e.currentTarget;
    const effect = button.getAttribute('data-effect');
    
    document.querySelectorAll('.effect-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.currentEffect = effect;
    
    // Apply effect preview
    applyEffectPreview(effect);
}

function handlePropSelect(e) {
    const prop = e.currentTarget;
    const propType = prop.getAttribute('data-prop');
    
    // Toggle prop active state
    prop.classList.toggle('active');
    
    // Add AR prop effect
    if (prop.classList.contains('active')) {
        activateARProp(propType);
    } else {
        deactivateARProp(propType);
    }
}

function updateStyleUI(style) {
    const poseGuide = document.getElementById('poseGuide');
    
    switch(style) {
        case 'single':
            poseGuide.style.display = 'block';
            break;
        case 'collage':
            poseGuide.style.display = 'block';
            // Show grid overlay for collage
            break;
        case 'boomerang':
            poseGuide.style.display = 'block';
            // Show boomerang instructions
            break;
        case '360':
            poseGuide.style.display = 'block';
            // Show 360 instructions
            break;
    }
}

function applyEffectPreview(effect) {
    // This would apply the selected effect to the live preview
    console.log('Applying effect:', effect);
    // Implementation would go in effects.js
}

function activateARProp(propType) {
    console.log('Activating AR prop:', propType);
    // AR prop activation logic would go here
}

function deactivateARProp(propType) {
    console.log('Deactivating AR prop:', propType);
    // AR prop deactivation logic would go here
}

function startAISession() {
    showScreen('camera');
    initializeAICamera();
    updatePhotoCounter();
    initializePoseDetection();
}

function goToHome() {
    showScreen('home');
    stopCamera();
    capturedPhotos = [];
    resetUI();
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

async function initializeAICamera() {
    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        // Initialize canvas sizes
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        effectCanvas.width = video.videoWidth;
        effectCanvas.height = video.videoHeight;
        
    } catch (error) {
        console.error('Error accessing AI camera:', error);
        showError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

async function switchCamera() {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    await initializeAICamera();
}

function toggleAI() {
    const aiBtn = document.getElementById('toggleAI');
    config.aiEnabled = !config.aiEnabled;
    
    if (config.aiEnabled) {
        aiBtn.classList.add('active');
        initializePoseDetection();
    } else {
        aiBtn.classList.remove('active');
        stopPoseDetection();
    }
}

function toggleAR() {
    const arBtn = document.getElementById('toggleAR');
    config.arEnabled = !config.arEnabled;
    
    if (config.arEnabled) {
        arBtn.classList.add('active');
        arProps.style.display = 'flex';
    } else {
        arBtn.classList.remove('active');
        arProps.style.display = 'none';
    }
}

function initializePoseDetection() {
    if (!config.aiEnabled) return;
    
    // Initialize AI pose detection
    console.log('AI Pose Detection initialized');
    // This would integrate with TensorFlow.js or similar AI library
}

function stopPoseDetection() {
    console.log('AI Pose Detection stopped');
    // Clean up AI resources
}

function startAICaptureProcess() {
    if (isCapturing) return;
    
    if (config.timer > 0) {
        startAICountdown();
    } else {
        captureAIPhoto();
    }
}

function startAICountdown() {
    let count = config.timer;
    isCapturing = true;
    captureBtn.style.pointerEvents = 'none';
    
    // Play countdown sound
    try {
        countdownSound.currentTime = 0;
        countdownSound.play();
    } catch (error) {
        console.log('Countdown sound not available');
    }
    
    countdownNumber.textContent = count;
    countdown.classList.add('active');
    
    const countdownInterval = setInterval(() => {
        count--;
        countdownNumber.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            countdown.classList.remove('active');
            captureBtn.style.pointerEvents = 'auto';
            isCapturing = false;
            captureAIPhoto();
        }
    }, 1000);
}

function captureAIPhoto() {
    if (isCapturing) return;
    isCapturing = true;
    
    // Play shutter sound
    try {
        shutterSound.currentTime = 0;
        shutterSound.play();
    } catch (error) {
        console.log('Shutter sound not available');
    }
    
    const context = canvas.getContext('2d');
    const effectContext = effectCanvas.getContext('2d');
    
    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Capture frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply AI effects
    applyAIEffects(context, effectContext);
    
    // Convert to data URL
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    capturedPhotos.push(photoData);
    
    // Visual feedback
    showCaptureFeedback();
    
    updatePhotoCounter();
    
    // Check if session complete
    if (capturedPhotos.length >= config.photoCount) {
        setTimeout(showAIResults, 1000);
    } else {
        isCapturing = false;
    }
}

function applyAIEffects(context, effectContext) {
    // Apply the selected AI magic and effects
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    switch(config.aiMagic) {
        case 'neon':
            applyNeonEffect(imageData);
            break;
        case 'hologram':
            applyHologramEffect(imageData);
            break;
        case 'particle':
            applyParticleEffect(imageData, effectContext);
            break;
        case 'cyber':
            applyCyberEffect(imageData);
            break;
    }
    
    switch(config.currentEffect) {
        case 'neon':
            applyNeonFilter(imageData);
            break;
        case 'retro':
            applyRetroFilter(imageData);
            break;
        case 'cyber':
            applyCyberFilter(imageData);
            break;
        case 'holo':
            applyHoloFilter(imageData);
            break;
        case 'prism':
            applyPrismFilter(imageData);
            break;
    }
    
    context.putImageData(imageData, 0, 0);
}

// Placeholder effect functions - these would be implemented in effects.js
function applyNeonEffect(imageData) {
    console.log('Applying neon AI effect');
}

function applyHologramEffect(imageData) {
    console.log('Applying hologram AI effect');
}

function applyParticleEffect(imageData, effectContext) {
    console.log('Applying particle AI effect');
}

function applyCyberEffect(imageData) {
    console.log('Applying cyber AI effect');
}

function applyNeonFilter(imageData) {
    console.log('Applying neon filter');
}

function applyRetroFilter(imageData) {
    console.log('Applying retro filter');
}

function applyCyberFilter(imageData) {
    console.log('Applying cyber filter');
}

function applyHoloFilter(imageData) {
    console.log('Applying holo filter');
}

function applyPrismFilter(imageData) {
    console.log('Applying prism filter');
}

function showCaptureFeedback() {
    // Add visual feedback for photo capture
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        opacity: 0;
        pointer-events: none;
        z-index: 1000;
        animation: flash 0.3s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        document.body.removeChild(flash);
    }, 300);
    
    // Add CSS for flash animation
    if (!document.getElementById('flash-style')) {
        const style = document.createElement('style');
        style.id = 'flash-style';
        style.textContent = `
            @keyframes flash {
                0% { opacity: 0; }
                50% { opacity: 0.7; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function updatePhotoCounter() {
    document.getElementById('currentPhoto').textContent = capturedPhotos.length;
    document.getElementById('totalPhotos').textContent = config.photoCount;
}

function showAIResults() {
    showScreen('results');
    displayAIGallery();
    generateQRCode();
}

function displayAIGallery() {
    photoGallery.innerHTML = '';
    
    capturedPhotos.forEach((photoData, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photoData;
        img.alt = `AI Enhanced Photo ${index + 1}`;
        img.loading = 'lazy';
        
        photoItem.appendChild(img);
        photoGallery.appendChild(photoItem);
    });
}

function generateQRCode() {
    const qrCode = document.getElementById('qrCode');
    
    // Simple QR code simulation
    if (capturedPhotos.length > 0) {
        qrCode.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">📸</div>
                <div>AI Photos Ready!</div>
                <div style="font-size: 10px; margin-top: 5px;">Scan to Download</div>
            </div>
        `;
    }
}

function downloadAllPhotos() {
    capturedPhotos.forEach((photoData, index) => {
        const link = document.createElement('a');
        link.download = `ai-photobooth-${index + 1}.jpg`;
        link.href = photoData;
        link.click();
        
        // Add delay between downloads
        setTimeout(() => {}, 100);
    });
}

function shareGallery() {
    if (navigator.share && capturedPhotos.length > 0) {
        navigator.share({
            title: 'My AI Photobooth Photos',
            text: 'Check out my amazing AI-enhanced photos!',
            url: window.location.href
        })
        .catch(error => console.log('Error sharing:', error));
    } else {
        // Fallback: copy first photo to clipboard or show QR
        alert('Share functionality requires Web Share API support. Use the QR code or download photos instead.');
    }
}

function resetUI() {
    document.querySelectorAll('.style-btn, .magic-btn, .timer-btn, .effect-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Reset to defaults
    document.querySelector('.style-btn[data-style="single"]').classList.add('active');
    document.querySelector('.magic-btn[data-magic="neon"]').classList.add('active');
    document.querySelector('.timer-btn[data-timer="3"]').classList.add('active');
    document.querySelector('.effect-option[data-effect="none"]').classList.add('active');
    
    document.getElementById('toggleAI').classList.add('active');
    document.getElementById('toggleAR').classList.remove('active');
    
    config.photoStyle = 'single';
    config.aiMagic = 'neon';
    config.timer = 3;
    config.currentEffect = 'none';
    config.aiEnabled = true;
    config.arEnabled = false;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--danger);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(244, 67, 54, 0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 2000);
}

// Handle visibility change for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden && stream) {
        stopCamera();
    } else if (!document.hidden && screens.camera.classList.contains('active') && !stream) {
        initializeAICamera();
    }
});
