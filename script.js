let isMuted = false;

// Custom Music Init
const customMusic = new Audio('assets/music.mp3'); 
customMusic.loop = true;
customMusic.volume = 0.4; // Slightly lowered so you can hear the voice clearly

// Sound Effects
function playChimeSFX(freq = 523.25) {
    if (isMuted) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
}

/* =========================================================
   TEXT-TO-SPEECH (BEAUTIFUL GIRL VOICE)
   ========================================================= */
function getBeautifulGirlVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    return voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Google UK English Female') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Zira') ||
        v.name.includes('Karen') ||
        v.name.includes('Female') ||
        v.name.includes('Natural') ||
        v.name.includes('Siri')
    )) || voices.find(v => v.lang.startsWith('en')) || voices[0];
}

function speakNarration(text) {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = 0.92;
        utterance.pitch = 1.25;
        utterance.volume = 1.0;
        
        const girlVoice = getBeautifulGirlVoice();
        if (girlVoice) utterance.voice = girlVoice;

        window.speechSynthesis.speak(utterance);
    } catch(e) {}
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => getBeautifulGirlVoice();
}

// Security / Lock Screen Logic
function unlockExperience() {
    const input = document.getElementById('birthday-passcode').value.trim();
    const errorEl = document.getElementById('lock-error');
    
    // Passwords: 1999, shrawan, shrawan.cloud
    if (input === "1999" || input.toLowerCase() === "shrawan" || input.toLowerCase() === "shrawan.cloud") {
        playChimeSFX(880); 
        customMusic.play().catch(e => console.log("Audio autoplay restricted by browser"));
        nextScreen('screen-start');
    } else {
        errorEl.style.opacity = 1;
        document.getElementById('birthday-passcode').value = '';
        setTimeout(() => errorEl.style.opacity = 0, 2000);
        if (window.gsap) gsap.to('#screen-lock .max-w-md', { x: [-10, 10, -10, 10, 0], duration: 0.4 });
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const icon = document.getElementById('sound-icon');
    if (isMuted) {
        icon.className = 'fas fa-volume-mute text-gray-400';
        customMusic.pause();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
        icon.className = 'fas fa-volume-up text-yellow-400';
        customMusic.play();
    }
}

// Typewriter Function
function typeWriter(elementId, textArray, speed = 40, callback = null) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = "";
    let arrayIdx = 0; let charIdx = 0;

    function typeNextChar() {
        if (arrayIdx >= textArray.length) {
            if (callback) callback();
            return;
        }
        const currentText = textArray[arrayIdx];
        if (charIdx < currentText.length) {
            el.innerHTML += currentText.charAt(charIdx);
            charIdx++;
            setTimeout(typeNextChar, speed);
        } else {
            setTimeout(() => {
                if (arrayIdx < textArray.length - 1) {
                    el.innerHTML = ""; charIdx = 0; arrayIdx++; typeNextChar();
                } else if (callback) callback();
            }, 1800);
        }
    }
    typeNextChar();
}

// 3D Background Engine
let threeScene, threeCamera, threeRenderer, starPoints, heartGroup;

function init3DWorld() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || !window.THREE) return;
    try {
        threeScene = new THREE.Scene();
        threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        threeCamera.position.z = 8;
        threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const count = 3500;
        const pos = new Float32Array(count * 3);
        for(let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 40;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.045, color: 0xffffff, transparent: true, opacity: 0.85 });
        starPoints = new THREE.Points(geo, mat);
        threeScene.add(starPoints);

        heartGroup = new THREE.Group();
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0); heartShape.bezierCurveTo(0, 0, -0.3, 0.4, -0.6, 0.4);
        heartShape.bezierCurveTo(-1.1, 0.4, -1.1, -0.2, -1.1, -0.2); heartShape.bezierCurveTo(-1.1, -0.6, -0.7, -1.0, 0, -1.4);
        heartShape.bezierCurveTo(0.7, -1.0, 1.1, -0.6, 1.1, -0.2); heartShape.bezierCurveTo(1.1, -0.2, 1.1, 0.4, 0.6, 0.4); heartShape.bezierCurveTo(0.3, 0.4, 0, 0, 0, 0);
        const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
        const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heartMat = new THREE.MeshBasicMaterial({ color: 0xff3366, wireframe: true, transparent: true, opacity: 0.35 });

        for(let h = 0; h < 25; h++) {
            const heartMesh = new THREE.Mesh(heartGeo, heartMat);
            heartMesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15);
            heartMesh.scale.setScalar(0.12 + Math.random() * 0.15);
            heartMesh.rotation.z = Math.PI;
            heartGroup.add(heartMesh);
        }
        threeScene.add(heartGroup);

        function animate() {
            requestAnimationFrame(animate);
            if (starPoints) { starPoints.rotation.y += 0.0007; starPoints.rotation.x += 0.0003; }
            if (heartGroup) {
                heartGroup.rotation.y -= 0.001;
                heartGroup.children.forEach(mesh => { mesh.rotation.x += 0.01; mesh.position.y += Math.sin(Date.now() * 0.001 + mesh.position.x) * 0.002; });
            }
            threeRenderer.render(threeScene, threeCamera);
        }
        animate();
    } catch(e) {}
}

window.addEventListener('resize', () => {
    if (threeCamera && threeRenderer) {
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Main Screen Controller
let activeScreenId = 'screen-lock'; 

function startMasterJourney() {
    playChimeSFX(587.33);
    nextScreen('screen-prologue', () => {
        // First Voice Trigger
        speakNarration("Hey Shrawan! Wishing you a very Happy Birthday! Today is your special day, filled with joy, magic, and endless growth.");
        
        typeWriter('typed-prologue', [ "Every life is a beautiful journey...", "A story of growth, passion, and big dreams." ], 45, () => {
            setTimeout(() => {
                nextScreen('screen-hero', () => {
                    // Second Voice Trigger
                    speakNarration("Happy Birthday Shrawan! May your new chapter bring you unlimited success, immense happiness, and peace.");
                    
                    typeWriter('typed-hero', [ "Today is not just my birthday.", "Today is a celebration of every dream I've chased.", "Every lesson I've learned, and every win ahead." ], 35);
                });
            }, 1200);
        });
    });
}

function nextScreen(targetId, onCompleteCallback) {
    playChimeSFX(659.25);
    const flash = document.getElementById('transition-flash');
    if (flash && window.gsap) gsap.fromTo(flash, { opacity: 0.8 }, { opacity: 0, duration: 0.7, ease: "power2.out" });

    const currentEl = document.getElementById(activeScreenId);
    const nextEl = document.getElementById(targetId);
    if (!nextEl) return;

    if (threeCamera && window.gsap) gsap.to(threeCamera.position, { z: 5, duration: 0.4, yoyo: true, repeat: 1, ease: "power2.inOut" });

    if (window.gsap && currentEl) {
        gsap.to(currentEl, {
            opacity: 0, scale: 1.1, duration: 0.7, ease: "power2.inOut",
            onComplete: () => {
                currentEl.classList.remove('active');
                nextEl.classList.add('active');
                activeScreenId = targetId;

                gsap.fromTo(nextEl, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out", onComplete: onCompleteCallback });

                // DYNAMIC 3D BOOK FLIP ENTRY FOR GALLERY
                if (targetId === 'screen-gallery') {
                    // Set up perspective for the 3D effect
                    gsap.set('.gallery-item', { transformPerspective: 1200 });
                    
                    gsap.fromTo('.gallery-item', 
                        { 
                            // Even images flip from right, odd images flip from left
                            rotationY: (i) => i % 2 === 0 ? 90 : -90, 
                            transformOrigin: (i) => i % 2 === 0 ? "left center" : "right center",
                            opacity: 0, 
                            z: -300,
                            rotationZ: () => gsap.utils.random(-8, 8) // Slight random tilt
                        },
                        { 
                            rotationY: 0, 
                            opacity: 1, 
                            z: 0, 
                            stagger: 0.06, // Deals them out rapidly
                            duration: 1.5, 
                            ease: 'expo.out',
                            onComplete: () => {
                                // Keeps the random tilt after they land
                                gsap.set('.gallery-item', { clearProps: "transformOrigin,perspective" });
                            }
                        }
                    );
                    
                    // Initialize Lightbox Clicks
                    initLightbox();
                }
            }
        });
    } else {
        if (currentEl) currentEl.classList.remove('active');
        nextEl.classList.add('active');
        activeScreenId = targetId;
        if (onCompleteCallback) onCompleteCallback();
    }
}

// Cake Cutting
function cutBirthdayCake() {
    playChimeSFX(880);
    const cutBtn = document.getElementById('cut-btn');
    const knife = document.getElementById('knife-element');
    if (cutBtn) cutBtn.style.display = 'none';
    reach12OclockMidnight();

    if (knife && window.gsap) {
        gsap.timeline()
            .to(knife, { opacity: 1, x: -80, y: 35, rotation: -15, duration: 0.5, ease: 'power2.out' })
            .to(knife, { y: 175, duration: 0.8, ease: 'power1.inOut' })
            .to('#cake-left', { x: -16, rotation: -3, duration: 0.6, ease: 'back.out(1.5)' }, "-=0.4")
            .to('#cake-right', { x: 16, rotation: 3, duration: 0.6, ease: 'back.out(1.5)' }, "-=0.6")
            .to('#center-flame', { scale: 0, opacity: 0, duration: 0.3 }, "-=0.4")
            .to(knife, { opacity: 0, duration: 0.4 }, "+=0.2")
            .call(runCountdown);
    } else { runCountdown(); }
}

function runCountdown() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center font-serif-title font-black text-7xl sm:text-9xl text-yellow-400 glow-gold bg-black/85 backdrop-blur-md';
    document.body.appendChild(overlay);
    let count = 3; overlay.innerText = count;

    const timer = setInterval(() => {
        count--;
        if (count > 0) { overlay.innerText = count; playChimeSFX(440 + (3 - count) * 150); }
        else {
            clearInterval(timer); overlay.innerText = "BOOM! 🎉";
            if (window.gsap) gsap.to(document.body, { x: 12, y: -12, repeat: 7, yoyo: true, duration: 0.04 });
            setTimeout(() => { overlay.remove(); launchFinaleScreen(); }, 850);
        }
    }, 1000);
}

// Finale & Fireworks
let fireworksActive = false; let particles = [];
function launchFinaleScreen() {
    nextScreen('screen-finale'); 
    
    // Third Voice Trigger
    speakNarration("Happy Birthday once again Shrawan! May all your wishes come true and your future shine bright!");
    
    startFireworks();
    if (window.confetti) {
        const duration = 12 * 1000; const end = Date.now() + duration;
        (function frame() {
            window.confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#ffd700', '#ec4899', '#3b82f6', '#10b981'] });
            window.confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#ffd700', '#ec4899', '#3b82f6', '#10b981'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }
}

function startFireworks() {
    const canvas = document.getElementById('fireworks-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight; fireworksActive = true;
    function createExplosion(x, y) {
        const colors = ['#ffd700', '#ff0055', '#00e5ff', '#ff9900', '#ffffff'];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 6 + 2;
            particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color: colors[Math.floor(Math.random() * colors.length)] });
        }
    }
    let lastExplosion = 0;
    function loop(timestamp) {
        if (!fireworksActive) return; ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (timestamp - lastExplosion > 400) { createExplosion(Math.random() * canvas.width, Math.random() * canvas.height * 0.6); lastExplosion = timestamp; }
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.alpha -= 0.015;
            ctx.globalAlpha = Math.max(0, p.alpha); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill();
            if (p.alpha <= 0) particles.splice(i, 1);
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

// Synchronized Clock
let simSecondsLeft = 30; let isMidnightReached = false;
function updateUnifiedTimers() {
    const clockTimeEl = document.getElementById('clock-time'); const clockDateEl = document.getElementById('clock-date'); const timer12El = document.getElementById('timer-12-display');
    if (isMidnightReached) {
        if (clockTimeEl) clockTimeEl.innerText = "12:00:00 AM"; if (clockDateEl) clockDateEl.innerText = "6 AUG 2026"; if (timer12El) timer12El.innerHTML = "🎂 12:00:00 AM - HAPPY BIRTHDAY!"; return;
    }
    if (simSecondsLeft > 0) {
        simSecondsLeft--; const currentSec = 30 + (30 - simSecondsLeft); const displaySec = String(currentSec).padStart(2, '0');
        if (clockTimeEl) clockTimeEl.innerText = `11:59:${displaySec} PM`; if (clockDateEl) clockDateEl.innerText = "5 AUG 2026";
        if (timer12El) timer12El.innerText = `00m ${String(simSecondsLeft).padStart(2, '0')}s TO 12 AM`;
    } else reach12OclockMidnight();
}
function reach12OclockMidnight() { isMidnightReached = true; simSecondsLeft = 0; }
setInterval(updateUnifiedTimers, 1000);

// Interaction & Cursors
function handlePointerMove(x, y) {
    const lensFlare = document.getElementById('lens-flare');
    if (lensFlare) { lensFlare.style.left = x + 'px'; lensFlare.style.top = y + 'px'; }
    if (Math.random() < 0.4) {
        const star = document.createElement('div'); star.className = 'star-trail'; star.style.left = x + 'px'; star.style.top = y + 'px';
        const starSymbols = ['✨', '★', '✦', '⭐']; star.innerText = starSymbols[Math.floor(Math.random() * starSymbols.length)];
        star.style.color = ['#ffd700', '#ffffff', '#f43f5e', '#3b82f6'][Math.floor(Math.random() * 4)]; document.body.appendChild(star); setTimeout(() => star.remove(), 750);
    }
}
function handlePointerClick(x, y) {
    const starSymbols = ['✨', '★', '✦', '⭐']; const colors = ['#ffd700', '#ec4899', '#00e5ff', '#ffffff', '#a855f7'];
    for (let i = 0; i < 14; i++) {
        const star = document.createElement('div'); star.className = 'click-sparkle'; star.innerText = starSymbols[Math.floor(Math.random() * starSymbols.length)];
        star.style.color = colors[Math.floor(Math.random() * colors.length)]; star.style.left = x + 'px'; star.style.top = y + 'px';
        const angle = (Math.PI * 2 / 14) * i + (Math.random() * 0.2); const distance = Math.random() * 80 + 35;
        star.style.setProperty('--dx', `${Math.cos(angle) * distance}px`); star.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        document.body.appendChild(star); setTimeout(() => star.remove(), 700);
    }
}

window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY)); window.addEventListener('click', (e) => handlePointerClick(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchstart', (e) => { if (e.touches.length > 0) handlePointerClick(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

// Keyboard shortcuts for quick visuals
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'h' && window.confetti) window.confetti({ particleCount: 30, scalar: 2, shapes: ['heart'], colors: ['#ff0055', '#ec4899'] });
    else if (key === 'b' && window.confetti) window.confetti({ particleCount: 40, spread: 100, origin: { y: 0.8 } });
    else if (key === 'c' && window.confetti) window.confetti({ particleCount: 80, spread: 120 });
});

window.onload = () => init3DWorld();

/* =========================================================
   LIGHTBOX LOGIC
   ========================================================= */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            playChimeSFX(700);
            const img = item.querySelector('img');
            const lb = document.getElementById('lightbox');
            const lbImg = document.getElementById('lightbox-img');
            
            lbImg.src = img.src;
            lb.classList.remove('hidden');
            lb.classList.add('flex');
            
            // Pop open animation
            if (window.gsap) {
                gsap.fromTo(lbImg, 
                    { scale: 0.5, opacity: 0, rotationY: 45 }, 
                    { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, ease: 'back.out(1.2)' }
                );
            }
        });
    });
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    playChimeSFX(400);
    if (window.gsap) {
        gsap.to('#lightbox-img', { 
            scale: 0.8, opacity: 0, duration: 0.3, 
            onComplete: () => {
                lb.classList.add('hidden');
                lb.classList.remove('flex');
            }
        });
    } else {
        lb.classList.add('hidden');
        lb.classList.remove('flex');
    }
}
