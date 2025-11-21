const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 1500; 
let currentPattern = 0; 

const patterns = [
    'UNIVERSE',
    'Look at the stars',
    'Look how they shine for you',
    'And everything you do',
    'Yeah, they were all yellow',
    'Happy 11th',
    'Raine ❤️',
    'I love you',
    'HEART_SHAPE'
];

const starColors = [
    'rgba(255, 223, 0, 0.9)',   
    'rgba(255, 255, 100, 0.9)', 
    'rgba(255, 250, 205, 0.9)', 
    'rgba(255, 215, 0, 0.8)',   
    'rgba(255, 255, 240, 0.9)'  
];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        this.targetX = null;
        this.targetY = null;
        this.ease = 0.05 + Math.random() * 0.05;
    }

    update() {
        if (this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.x += dx * this.ease;
            this.y += dy * this.ease;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function getTextCoordinates(text) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    let baseSize = width < 600 ? 40 : 100; 
    if (text.length > 15) {
        baseSize = width < 600 ? 30 : 70;
    }

    tempCtx.font = `bold ${baseSize}px Verdana`;
    tempCtx.fillStyle = 'white';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, width / 2, height / 2);

    const imageData = tempCtx.getImageData(0, 0, width, height).data;
    const coordinates = [];
    const gap = 4; 

    for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
            const index = (y * width + x) * 4;
            const alpha = imageData[index + 3];
            if (alpha > 128) {
                coordinates.push({ x, y });
            }
        }
    }
    return coordinates;
}

function getHeartCoordinates() {
    const coordinates = [];
    const scale = width < 600 ? 10 : 15;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        for (let i = 0; i < 10; i++) { 
             coordinates.push({
                x: centerX + (x * scale) * (0.2 + Math.random() * 0.8),
                y: centerY - (y * scale) * (0.2 + Math.random() * 0.8)
            });
        }
    }
    return coordinates;
}

function morphParticles() {
    currentPattern++;
    if (currentPattern >= patterns.length) {
        currentPattern = 0;
    }

    const patternName = patterns[currentPattern];
    let points = [];

    if (patternName === 'UNIVERSE') {
        particles.forEach(p => {
            p.targetX = null;
            p.targetY = null;
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = (Math.random() - 0.5) * 2;
        });
        return;
    } 
    
    if (patternName === 'HEART_SHAPE') {
        points = getHeartCoordinates();
    } else {
        points = getTextCoordinates(patternName);
    }

    points.sort(() => Math.random() - 0.5);

    particles.forEach((p, i) => {
        if (i < points.length) {
            p.targetX = points[i].x;
            p.targetY = points[i].y;
        } else {
            p.targetX = width/2 + (Math.random() - 0.5) * width;
            p.targetY = height/2 + (Math.random() - 0.5) * height;
        }
    });
}

// --- UPDATED EVENT LISTENERS ---
window.addEventListener('mousedown', (e) => {
    // If user clicks inside the modal or music controls, DO NOT morph particles
    if (e.target.closest('#intro-modal') || e.target.closest('.music-controls')) {
        return;
    }
    morphParticles();
});

window.addEventListener('touchstart', (e) => {
    // If user touches inside the modal or music controls, DO NOT block the default action (click)
    if (e.target.closest('#intro-modal') || e.target.closest('.music-controls')) {
        return;
    }
    // Only prevent default (zooming/scrolling) if touching the canvas background
    e.preventDefault();
    morphParticles();
}, { passive: false });

// --- ANIMATION LOOP ---
function animate() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; 
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}
animate();

// --- UI LOGIC ---
const startBtn = document.getElementById('start-btn');
const introModal = document.getElementById('intro-modal');
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');
const hint = document.querySelector('.hint');
const musicControls = document.querySelector('.music-controls');

startBtn.addEventListener('click', () => {
    introModal.style.opacity = '0';
    setTimeout(() => {
        introModal.style.display = 'none';
        hint.classList.add('visible');
        musicControls.classList.add('visible');
    }, 1000);
    
    audio.play().catch(err => console.log("Audio play error:", err));
});

if(musicBtn) {
    musicBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        toggleMusic();
    });
    // Separate touch listener for mobile responsiveness
    musicBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        toggleMusic();
    }, { passive: true });
}

function toggleMusic() {
    if (audio.paused) {
        audio.play();
        musicBtn.textContent = '⏸️ Pause Music';
    } else {
        audio.pause();
        musicBtn.textContent = '🎵 Play Music';
    }
}