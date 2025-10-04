// Configuration
let config = {
    jumlahFoto: 4,
    tatanan: 'grid',
    timer: 3,
    currentEffect: 'none'
};

// DOM Elements
const screens = {
    home: document.getElementById('homeScreen'),
    camera: document.getElementById('cameraScreen'),
    results: document.getElementById('resultsScreen')
};

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const switchCameraBtn = document.getElementById('switchCamera');
const countdown = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdownNumber');
const gridOverlay = document.getElementById('gridOverlay');
const photoResults = document.getElementById('photoResults');
const photoCounter = document.getElementById('photoCounter');

let stream = null;
let currentFacingMode = 'user';
let capturedPhotos = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    hideLoading();
});

function initializeEventListeners() {
    // Home screen buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', handleOptionSelect);
    });
    
    document.getElementById('startBooth').addEventListener('click', startBooth);
    document.getElementById('backToHome').addEventListener('click', goToHome);
    document.getElementById('newSession').addEventListener('click', goToHome);
    
    // Camera controls
    captureBtn.addEventListener('click', startCaptureProcess);
    switchCameraBtn.addEventListener('click', switchCamera);
    
    // Effect buttons
    document.querySelectorAll('.effect-option').forEach(btn => {
        btn.addEventListener('click', handleEffectSelect);
    });
}

function handleOptionSelect(e) {
    const button = e.currentTarget;
    const group = button.parentElement;
    
    // Remove active class from all buttons in group
    group.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Update config based on data attributes
    if (button.hasAttribute('data-jumlah')) {
        config.jumlahFoto = parseInt(button.getAttribute('data-jumlah'));
    } else if (button.hasAttribute('data-tatanan')) {
        config.tatanan = button.getAttribute('data-tatanan');
    } else if (button.hasAttribute('data-timer')) {
        config.timer = parseInt(button.getAttribute('data-timer'));
    }
}

function handleEffectSelect(e) {
    const button = e.currentTarget;
    const effect = button.getAttribute('data-effect');
    
    // Remove active class from all effect buttons
    document.querySelectorAll('.effect-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Update current effect
    config.currentEffect = effect;
    console.log('Effect selected:', effect);
}

function startBooth() {
    showScreen('camera');
    initializeCamera();
    updatePhotoCounter();
    
    // Show grid if grid layout is selected
    if (config.tatanan === 'grid') {
        gridOverlay.classList.add('active');
    }
}

function goToHome() {
    showScreen('home');
    stopCamera();
    capturedPhotos = [];
}

function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    screens[screenName].classList.add('active');
}

async function initializeCamera() {
    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan kamu memberikan izin akses kamera.');
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
    await initializeCamera();
}

function startCaptureProcess() {
    if (config.timer > 0) {
        startCountdown();
    } else {
        capturePhoto();
    }
}

function startCountdown() {
    let count = config.timer;
    countdownNumber.textContent = count;
    countdown.classList.add('active');
    captureBtn.disabled = true;
    
    const countdownInterval = setInterval(() => {
        count--;
        countdownNumber.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            countdown.classList.remove('active');
            captureBtn.disabled = false;
            capturePhoto();
        }
    }, 1000);
}

function capturePhoto() {
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply effects
    applyEffect(context);
    
    // Convert to data URL and store
    const photoData = canvas.toDataURL('image/jpeg');
    capturedPhotos.push(photoData);
    
    updatePhotoCounter();
    
    // Check if session is complete
    if (capturedPhotos.length >= config.jumlahFoto) {
        showResults();
    }
}

function applyEffect(context) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    switch(config.currentEffect) {
        case 'vintage':
            // Apply vintage sepia effect
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            break;
            
        case 'bw':
            // Apply black and white effect
            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = brightness;
                data[i + 1] = brightness;
                data[i + 2] = brightness;
            }
            break;
            
        case 'warm':
            // Apply warm tone effect
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + 20);     // Increase red
                data[i + 1] = Math.min(255, data[i + 1] + 10); // Slight increase green
            }
            break;
            
        case 'cool':
            // Apply cool tone effect
            for (let i = 0; i < data.length; i += 4) {
                data[i + 2] = Math.min(255, data[i + 2] + 20); // Increase blue
            }
            break;
    }
    
    context.putImageData(imageData, 0, 0);
}

function updatePhotoCounter() {
    photoCounter.textContent = `Foto: ${capturedPhotos.length}/${config.jumlahFoto}`;
}

function showResults() {
    showScreen('results');
    displayCapturedPhotos();
}

function displayCapturedPhotos() {
    photoResults.innerHTML = '';
    
    capturedPhotos.forEach((photoData, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photoData;
        img.alt = `Photo ${index + 1}`;
        
        photoItem.appendChild(img);
        photoResults.appendChild(photoItem);
    });
    
    // Setup download functionality
    document.getElementById('downloadAll').addEventListener('click', downloadAllPhotos);
}

function downloadAllPhotos() {
    capturedPhotos.forEach((photoData, index) => {
        const link = document.createElement('a');
        link.download = `photobooth-${index + 1}.jpg`;
        link.href = photoData;
        link.click();
    });
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
}

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, stop camera to save resources
        if (stream && screens.camera.classList.contains('active')) {
            stopCamera();
        }
    } else {
        // Page is visible, restart camera if on camera screen
        if (!stream && screens.camera.classList.contains('active')) {
            initializeCamera();
        }
    }
});
