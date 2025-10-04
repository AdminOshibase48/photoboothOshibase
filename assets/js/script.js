// Simple Photobooth Configuration
const config = {
    frame: 'none',
    photoCount: 4,
    timer: 3,
    currentCamera: 'user'
};

// DOM Elements
const screens = {
    home: document.getElementById('homeScreen'),
    camera: document.getElementById('cameraScreen'),
    results: document.getElementById('resultsScreen')
};

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const countdown = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdownNumber');
const photoCounter = document.getElementById('photoCounter');
const photoResults = document.getElementById('photoResults');
const frameOverlay = document.getElementById('frameOverlay');

let stream = null;
let capturedPhotos = [];
let isCapturing = false;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeEventListeners();
    console.log('Photobooth initialized successfully');
}

function initializeEventListeners() {
    // Home screen elements - CHECK IF THEY EXIST FIRST
    const frameOptions = document.querySelectorAll('.frame-option');
    const numberBtns = document.querySelectorAll('.number-btn');
    const timerBtns = document.querySelectorAll('.timer-btn');
    const startSessionBtn = document.getElementById('startSession');
    
    if (frameOptions.length > 0) {
        frameOptions.forEach(option => {
            option.addEventListener('click', handleFrameSelect);
        });
    }
    
    if (numberBtns.length > 0) {
        numberBtns.forEach(btn => {
            btn.addEventListener('click', handleNumberSelect);
        });
    }
    
    if (timerBtns.length > 0) {
        timerBtns.forEach(btn => {
            btn.addEventListener('click', handleTimerSelect);
        });
    }
    
    if (startSessionBtn) {
        startSessionBtn.addEventListener('click', startSession);
    }
    
    // Camera screen elements
    const backToHomeBtn = document.getElementById('backToHome');
    const captureBtn = document.getElementById('captureBtn');
    const switchCameraBtn = document.getElementById('switchCamera');
    const frameMiniBtns = document.querySelectorAll('.frame-mini-btn');
    
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', goToHome);
    }
    
    if (captureBtn) {
        captureBtn.addEventListener('click', startCapture);
    }
    
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', switchCamera);
    }
    
    if (frameMiniBtns.length > 0) {
        frameMiniBtns.forEach(btn => {
            btn.addEventListener('click', handleFrameMiniSelect);
        });
    }
    
    // Results screen elements
    const newSessionBtn = document.getElementById('newSession');
    const downloadAllBtn = document.getElementById('downloadAll');
    const sharePhotosBtn = document.getElementById('sharePhotos');
    
    if (newSessionBtn) {
        newSessionBtn.addEventListener('click', goToHome);
    }
    
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllPhotos);
    }
    
    if (sharePhotosBtn) {
        sharePhotosBtn.addEventListener('click', sharePhotos);
    }
}

function handleFrameSelect(e) {
    const option = e.currentTarget;
    const frame = option.getAttribute('data-frame');
    
    document.querySelectorAll('.frame-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    option.classList.add('active');
    config.frame = frame;
    console.log('Frame selected:', frame);
}

function handleNumberSelect(e) {
    const button = e.currentTarget;
    const count = parseInt(button.getAttribute('data-count'));
    
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.photoCount = count;
    console.log('Photo count set to:', count);
}

function handleTimerSelect(e) {
    const button = e.currentTarget;
    const timer = parseInt(button.getAttribute('data-timer'));
    
    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.timer = timer;
    console.log('Timer set to:', timer);
}

function handleFrameMiniSelect(e) {
    const button = e.currentTarget;
    const frame = button.getAttribute('data-frame');
    
    document.querySelectorAll('.frame-mini-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    config.frame = frame;
    updateFrameOverlay();
    console.log('Frame changed to:', frame);
}

function startSession() {
    showScreen('camera');
    initializeCamera();
    updatePhotoCounter();
    updateFrameOverlay();
}

function goToHome() {
    showScreen('home');
    stopCamera();
    capturedPhotos = [];
    resetUI();
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
}

async function initializeCamera() {
    try {
        const constraints = {
            video: {
                facingMode: config.currentCamera,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (video) {
            video.srcObject = stream;
        }
        
        console.log('Camera initialized successfully');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan dan tidak ada aplikasi lain yang menggunakan kamera.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

async function switchCamera() {
    config.currentCamera = config.currentCamera === 'user' ? 'environment' : 'user';
    stopCamera();
    await initializeCamera();
}

function startCapture() {
    if (isCapturing) {
        console.log('Already capturing, please wait...');
        return;
    }
    
    if (config.timer > 0) {
        startCountdown();
    } else {
        capturePhoto();
    }
}

function startCountdown() {
    let count = config.timer;
    isCapturing = true;
    
    if (countdownNumber) countdownNumber.textContent = count;
    if (countdown) countdown.classList.add('active');
    
    const countdownInterval = setInterval(() => {
        count--;
        if (countdownNumber) countdownNumber.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            if (countdown) countdown.classList.remove('active');
            isCapturing = false;
            capturePhoto();
        }
    }, 1000);
}

function capturePhoto() {
    if (isCapturing) return;
    isCapturing = true;
    
    if (!canvas || !video) {
        console.error('Canvas or video element not found');
        isCapturing = false;
        return;
    }
    
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply frame
    applyFrame(context);
    
    // Convert to data URL and store
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    capturedPhotos.push(photoData);
    
    updatePhotoCounter();
    
    // Visual feedback
    showCaptureFeedback();
    
    console.log('Photo captured:', capturedPhotos.length);
    
    // Check if session complete
    if (capturedPhotos.length >= config.photoCount) {
        setTimeout(showResults, 500);
    } else {
        isCapturing = false;
    }
}

function applyFrame(context) {
    const width = canvas.width;
    const height = canvas.height;
    
    context.save();
    
    switch(config.frame) {
        case 'polaroid':
            // White polaroid border
            context.fillStyle = 'white';
            context.fillRect(0, 0, width, height);
            
            // Image area (smaller than canvas)
            const imgWidth = width * 0.9;
            const imgHeight = height * 0.8;
            const imgX = (width - imgWidth) / 2;
            const imgY = (height - imgHeight) / 2 - 20;
            
            // Draw the captured image
            context.drawImage(video, imgX, imgY, imgWidth, imgHeight);
            
            // Bottom area for text
            context.fillStyle = 'white';
            context.fillRect(0, imgY + imgHeight, width, height - (imgY + imgHeight));
            break;
            
        case 'heart':
            // Create heart shape clip
            context.beginPath();
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.4;
            
            // Heart shape path
            for (let i = 0; i < 360; i++) {
                const t = i * Math.PI / 180;
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                
                const scaleX = size / 16;
                const scaleY = size / 16;
                
                if (i === 0) {
                    context.moveTo(centerX + x * scaleX, centerY + y * scaleY);
                } else {
                    context.lineTo(centerX + x * scaleX, centerY + y * scaleY);
                }
            }
            context.closePath();
            context.clip();
            
            // Draw the image
            context.drawImage(video, 0, 0, width, height);
            break;
            
        case 'star':
            // Create star shape clip
            context.beginPath();
            const starCenterX = width / 2;
            const starCenterY = height / 2;
            const starSize = Math.min(width, height) * 0.4;
            const spikes = 5;
            
            let rotation = Math.PI / 2 * 3;
            let x = starCenterX;
            let y = starCenterY;
            const step = Math.PI / spikes;

            context.moveTo(starCenterX, starCenterY - starSize);
            
            for (let i = 0; i < spikes; i++) {
                x = starCenterX + Math.cos(rotation) * starSize;
                y = starCenterY + Math.sin(rotation) * starSize;
                context.lineTo(x, y);
                rotation += step;

                x = starCenterX + Math.cos(rotation) * (starSize * 0.5);
                y = starCenterY + Math.sin(rotation) * (starSize * 0.5);
                context.lineTo(x, y);
                rotation += step;
            }
            
            context.lineTo(starCenterX, starCenterY - starSize);
            context.closePath();
            context.clip();
            
            // Draw the image
            context.drawImage(video, 0, 0, width, height);
            break;
            
        case 'flower':
            // Simple flower frame (circle)
            context.beginPath();
            context.arc(width/2, height/2, Math.min(width, height) * 0.4, 0, Math.PI * 2);
            context.clip();
            context.drawImage(video, 0, 0, width, height);
            break;
            
        case 'retro':
            // Retro colored border
            context.fillStyle = '#ff6b6b';
            context.fillRect(0, 0, width, height);
            
            // Inner image area
            const borderSize = 20;
            context.drawImage(video, borderSize, borderSize, width - borderSize*2, height - borderSize*2);
            break;
            
        default:
            // No frame - just draw the image
            context.drawImage(video, 0, 0, width, height);
    }
    
    context.restore();
}

function showCaptureFeedback() {
    // Simple flash effect
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
        if (flash.parentNode) {
            document.body.removeChild(flash);
        }
    }, 300);
}

function updatePhotoCounter() {
    if (photoCounter) {
        photoCounter.textContent = `Foto: ${capturedPhotos.length}/${config.photoCount}`;
    }
}

function updateFrameOverlay() {
    if (!frameOverlay) return;
    
    // Update frame overlay preview
    frameOverlay.innerHTML = '';
    
    switch(config.frame) {
        case 'polaroid':
            frameOverlay.style.background = 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))';
            break;
        case 'heart':
            frameOverlay.style.background = 'radial-gradient(circle, transparent 60%, rgba(255,105,180,0.3) 60%)';
            break;
        case 'star':
            frameOverlay.style.background = 'radial-gradient(circle, transparent 60%, rgba(255,215,0,0.3) 60%)';
            break;
        default:
            frameOverlay.style.background = 'none';
    }
}

function showResults() {
    showScreen('results');
    displayResults();
}

function displayResults() {
    if (!photoResults) return;
    
    photoResults.innerHTML = '';
    
    capturedPhotos.forEach((photoData, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photoData;
        img.alt = `Photo ${index + 1}`;
        img.loading = 'lazy';
        
        photoItem.appendChild(img);
        photoResults.appendChild(photoItem);
    });
    
    console.log('Results displayed:', capturedPhotos.length, 'photos');
}

function downloadAllPhotos() {
    if (capturedPhotos.length === 0) {
        alert('Tidak ada foto untuk didownload!');
        return;
    }
    
    capturedPhotos.forEach((photoData, index) => {
        const link = document.createElement('a');
        link.download = `photobooth-${index + 1}.jpg`;
        link.href = photoData;
        link.click();
    });
    
    console.log('Downloaded all photos');
}

function sharePhotos() {
    if (capturedPhotos.length === 0) {
        alert('Tidak ada foto untuk dibagikan!');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'My Photobooth Photos',
            text: 'Check out my photos from the photobooth!',
            url: window.location.href
        })
        .catch(error => console.log('Error sharing:', error));
    } else {
        // Fallback: download first photo
        const link = document.createElement('a');
        link.download = 'photobooth-share.jpg';
        link.href = capturedPhotos[0];
        link.click();
    }
}

function resetUI() {
    // Reset to defaults
    const defaultFrame = document.querySelector('.frame-option[data-frame="none"]');
    const defaultNumber = document.querySelector('.number-btn[data-count="4"]');
    const defaultTimer = document.querySelector('.timer-btn[data-timer="3"]');
    const defaultFrameMini = document.querySelector('.frame-mini-btn[data-frame="none"]');
    
    if (defaultFrame) defaultFrame.classList.add('active');
    if (defaultNumber) defaultNumber.classList.add('active');
    if (defaultTimer) defaultTimer.classList.add('active');
    if (defaultFrameMini) defaultFrameMini.classList.add('active');
    
    config.frame = 'none';
    config.photoCount = 4;
    config.timer = 3;
    
    console.log('UI reset to defaults');
}

// Add flash animation style
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

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden && stream) {
        console.log('Page hidden, stopping camera');
        stopCamera();
    } else if (!document.hidden && screens.camera && screens.camera.classList.contains('active') && !stream) {
        console.log('Page visible, restarting camera');
        initializeCamera();
    }
});

// Error handling for camera
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});
