// BeautyPlus Style Photobooth
const photobooth = {
    config: {
        currentTemplate: 'color-splash',
        currentFilter: 'none',
        brightness: 100,
        contrast: 100,
        saturation: 100,
        timerEnabled: false,
        gridEnabled: true,
        flashEnabled: false,
        currentCamera: 'user',
        photosPerSession: 4
    },
    
    state: {
        capturedPhotos: [],
        currentSessionPhotos: [],
        isCapturing: false
    },
    
    elements: {
        screens: {
            template: document.getElementById('templateScreen'),
            camera: document.getElementById('cameraScreen'),
            preview: document.getElementById('previewScreen'),
            gallery: document.getElementById('galleryScreen')
        },
        video: document.getElementById('video'),
        canvas: document.getElementById('canvas'),
        countdown: document.getElementById('countdown'),
        countdownNumber: document.querySelector('.countdown-number'),
        templateOverlay: document.getElementById('templateOverlay'),
        guideGrid: document.querySelector('.guide-grid'),
        previewImage: document.getElementById('previewImage'),
        photoGallery: document.getElementById('photoGallery')
    },
    
    stream: null,
    
    init() {
        this.initializeEventListeners();
        console.log('BeautyPlus Photobooth initialized');
    },
    
    initializeEventListeners() {
        // Template selection
        this.addEventListeners('.category-tab', 'click', this.handleCategoryTab.bind(this));
        this.addEventListeners('.select-template', 'click', this.handleTemplateSelect.bind(this));
        
        // Navigation
        this.addEvent('#backToTemplates', 'click', () => this.showScreen('template'));
        this.addEvent('#backToCamera', 'click', () => this.showScreen('camera'));
        this.addEvent('#backToTemplatesFromGallery', 'click', () => this.showScreen('template'));
        
        // Camera controls
        this.addEvent('#switchCamera', 'click', this.switchCamera.bind(this));
        this.addEvent('#toggleFlash', 'click', this.toggleFlash.bind(this));
        this.addEvent('#toggleTimer', 'click', this.toggleTimer.bind(this));
        this.addEvent('#toggleGrid', 'click', this.toggleGrid.bind(this));
        this.addEvent('#captureBtn', 'click', this.startCapture.bind(this));
        
        // Preview & Edit
        this.addEvent('#confirmPhoto', 'click', this.confirmPhoto.bind(this));
        this.addEventListeners('.filter-btn', 'click', this.handleFilterSelect.bind(this));
        this.addEventListeners('.adjustment input[type="range"]', 'input', this.handleAdjustment.bind(this));
        
        // Gallery
        this.addEvent('#downloadAll', 'click', this.downloadAllPhotos.bind(this));
        this.addEvent('#shareGallery', 'click', this.shareGallery.bind(this));
        this.addEvent('#newSession', 'click', () => this.showScreen('template'));
    },
    
    addEvent(selector, event, handler) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener(event, handler);
        }
    },
    
    addEventListeners(selector, event, handler) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener(event, handler);
        });
    },
    
    handleCategoryTab(e) {
        const tab = e.currentTarget;
        const category = tab.getAttribute('data-category');
        
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(t => {
            t.classList.remove('active');
        });
        tab.classList.add('active');
        
        // Filter templates
        this.filterTemplates(category);
    },
    
    filterTemplates(category) {
        const templates = document.querySelectorAll('.template-card');
        
        templates.forEach(template => {
            if (category === 'all' || template.getAttribute('data-category') === category) {
                template.style.display = 'block';
            } else {
                template.style.display = 'none';
            }
        });
    },
    
    handleTemplateSelect(e) {
        const button = e.currentTarget;
        const template = button.getAttribute('data-template');
        const templateName = button.closest('.template-info').querySelector('h3').textContent;
        
        this.config.currentTemplate = template;
        document.getElementById('currentTemplateName').textContent = templateName;
        
        this.showScreen('camera');
        this.initializeCamera();
        this.applyTemplateOverlay();
    },
    
    handleFilterSelect(e) {
        const button = e.currentTarget;
        const filter = button.getAttribute('data-filter');
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        this.config.currentFilter = filter;
        this.applyEditEffects();
    },
    
    handleAdjustment(e) {
        const input = e.target;
        const value = parseInt(input.value);
        
        switch(input.id) {
            case 'brightness':
                this.config.brightness = value;
                break;
            case 'contrast':
                this.config.contrast = value;
                break;
            case 'saturation':
                this.config.saturation = value;
                break;
        }
        
        this.applyEditEffects();
    },
    
    showScreen(screenName) {
        Object.values(this.elements.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        if (this.elements.screens[screenName]) {
            this.elements.screens[screenName].classList.add('active');
        }
        
        // Stop camera when leaving camera screen
        if (screenName !== 'camera' && this.stream) {
            this.stopCamera();
        }
    },
    
    async initializeCamera() {
        try {
            const constraints = {
                video: {
                    facingMode
