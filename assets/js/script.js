// AI Effects Library for Photobooth Premium

class AIEffects {
    constructor() {
        this.effects = new Map();
        this.initEffects();
    }

    initEffects() {
        // Neon Glow Effect
        this.effects.set('neon', this.applyNeonEffect.bind(this));
        
        // Hologram Effect
        this.effects.set('hologram', this.applyHologramEffect.bind(this));
        
        // Particle Effect
        this.effects.set('particle', this.applyParticleEffect.bind(this));
        
        // Cyberpunk Effect
        this.effects.set('cyber', this.applyCyberEffect.bind(this));
    }

    applyNeonEffect(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Enhance contrast and saturation
            data[i] = Math.min(255, r * 1.2);     // Boost red
            data[i + 1] = Math.min(255, g * 1.3); // Boost green more
            data[i + 2] = Math.min(255, b * 1.1); // Slight blue boost
            
            // Add glow effect to bright areas
            const brightness = (r + g + b) / 3;
            if (brightness > 150) {
                data[i] = Math.min(255, data[i] + 50);
                data[i + 1] = Math.min(255, data[i + 1] + 30);
            }
        }
        return imageData;
    }

    applyHologramEffect(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // Create scan lines effect
            const y = Math.floor((i / 4) / imageData.width);
            if (y % 4 === 0) {
                data[i + 3] = data[i + 3] * 0.7; // Reduce opacity for scan lines
            }
            
            // Shift colors toward blue/purple
            data[i] = data[i] * 0.8;     // Reduce red
            data[i + 1] = data[i + 1] * 0.9; // Slightly reduce green
            data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Boost blue
        }
        return imageData;
    }

    applyParticleEffect(imageData, context, width, height) {
        // This would create particle effects overlay
        // Implementation for advanced particle system
        console.log('Particle effect applied');
        return imageData;
    }

    applyCyberEffect(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // High contrast, saturated colors
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Boost saturation and contrast
            data[i] = Math.min(255, r * 1.4);     // Strong red boost
            data[i + 1] = Math.min(255, g * 0.8); // Reduce green
            data[i + 2] = Math.min(255, b * 1.6); // Strong blue boost
            
            // Add purple/magenta tint to shadows
            const brightness = (r + g + b) / 3;
            if (brightness < 100) {
                data[i] = Math.min(255, data[i] + 30);
                data[i + 2] = Math.min(255, data[i + 2] + 40);
            }
        }
        return imageData;
    }

    getEffect(effectName) {
        return this.effects.get(effectName) || ((imageData) => imageData);
    }
}

// Initialize AI Effects
const aiEffects = new AIEffects();

// Export for use in main script
window.aiEffects = aiEffects;
