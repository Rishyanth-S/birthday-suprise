// --- 1. CONFIGURATION ---
const targetDate = new Date('2024-01-01T00:00:00').getTime(); 

// Initialize Lucide Icons
lucide.createIcons();

// Elements
const lockScreen = document.getElementById('lock-screen');
const unlockBtn = document.getElementById('unlock-btn');
const countdownContainer = document.getElementById('countdown-container');
const music = document.getElementById('bg-music');
const mainContent = document.getElementById('main-content');
const progressBar = document.getElementById('progress-bar');
const cursorFollow = document.getElementById('cursor-follow');
const cursorGlow = document.getElementById('cursor-glow');

// --- MODERN UI LOGIC ---

// 1. Custom Cursor
document.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;
    
    // Smooth follow for the dot
    cursorFollow.style.transform = `translate(${x}px, ${y}px)`;
    
    // Smooth follow for the glow
    cursorGlow.style.left = `${x}px`;
    cursorGlow.style.top = `${y}px`;

    // Interactive elements feedback
    if (e.target.closest('button, .glass-card, .slide')) {
        cursorFollow.style.transform = `translate(${x}px, ${y}px) scale(3)`;
        cursorFollow.style.opacity = '0.3';
    } else {
        cursorFollow.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        cursorFollow.style.opacity = '1';
    }
});

// 2. Scroll Progress & Reveal
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + "%";
});

// 3. Section Reveal Observer
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 }); // Lower threshold for more reliable trigger

document.querySelectorAll('.section-reveal').forEach(el => revealObserver.observe(el));

// Force initial check
setTimeout(() => {
    window.scrollTo(window.scrollX, window.scrollY + 1);
}, 2000);

// --- CORE FUNCTIONALITY ---

// Countdown Logic
function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        if (countdownContainer) countdownContainer.style.display = 'none';
        return true;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = d.toString().padStart(2, '0');
    document.getElementById('hours').innerText = h.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = s.toString().padStart(2, '0');

    return false;
}

const timerInterval = setInterval(() => {
    if (updateCountdown()) clearInterval(timerInterval);
}, 1000);
updateCountdown();

// Unlock Logic
function unlock() {
    // 1. Immediately disable interaction with lock screen
    lockScreen.style.pointerEvents = 'none';
    
    // 2. Play music immediately (critical for mobile)
    if (music) {
        music.play().catch(() => {
            console.log("Music play blocked - adding one-time click fallback");
            document.addEventListener('click', () => music.play(), { once: true });
        });
    }

    // 3. Transform the lock screen away
    lockScreen.style.transition = 'all 1.2s cubic-bezier(0.7, 0, 0.3, 1)';
    lockScreen.style.transform = 'translateY(-100%) scale(1.1)';
    lockScreen.style.opacity = '0';
    
    // 4. Enable main content
    if (mainContent) {
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        mainContent.style.pointerEvents = 'auto';
        mainContent.classList.remove('opacity-0', 'pointer-events-none');
    }

    // 5. Celebration!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff2d75', '#ff4d94', '#9d50bb']
    });

    setTimeout(() => {
        lockScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
        
        // Trigger a tiny scroll to wake up intersection observers
        window.scrollBy(0, 1);
    }, 1200);
}

if (unlockBtn) {
    unlockBtn.addEventListener('click', unlock);
    // Support touch for mobile
    unlockBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        unlock();
    }, { passive: false });
}

// Slideshow Logic
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

document.getElementById('prev-slide')?.addEventListener('click', () => showSlide(currentSlide - 1));
document.getElementById('next-slide')?.addEventListener('click', () => showSlide(currentSlide + 1));

// Auto slide
setInterval(() => showSlide(currentSlide + 1), 5000);

// Video Logic
const startProposalBtn = document.getElementById('start-proposal');
const videoContainer = document.getElementById('video-container');
const closeVideoBtn = document.getElementById('close-video');
const proposalVideo = document.getElementById('proposal-video');
const videoOverlay = document.getElementById('video-overlay-play');

if (startProposalBtn) {
    startProposalBtn.addEventListener('click', () => {
        videoContainer.classList.remove('hidden');
        videoContainer.classList.add('flex');
        if (music) music.pause();
    });
}

if (videoOverlay) {
    videoOverlay.addEventListener('click', () => {
        videoOverlay.classList.add('hidden');
        proposalVideo.play();
    });
}

if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', () => {
        proposalVideo.pause();
        videoContainer.classList.add('hidden');
        if (music) music.play();
    });
}

// Audio Toggle
const audioToggle = document.getElementById('audio-toggle');
if (audioToggle) {
    audioToggle.addEventListener('click', () => {
        if (music.paused) {
            music.play();
            audioToggle.innerHTML = '<i data-lucide="music" class="w-6 h-6 text-pink-400"></i>';
        } else {
            music.pause();
            audioToggle.innerHTML = '<i data-lucide="volume-x" class="w-6 h-6 text-white/30"></i>';
        }
        lucide.createIcons();
    });
}

// Replay Button
const replayBtn = document.getElementById('replay-btn');
if (replayBtn) {
    replayBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Particle Hearts
setInterval(() => {
    if (document.hidden) return;
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.className = 'fixed pointer-events-none text-pink-500/20 z-0';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh';
    heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
    document.getElementById('particle-container').appendChild(heart);

    const animation = heart.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { transform: `translateY(-110vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
        duration: Math.random() * 3000 + 5000,
        easing: 'linear'
    });

    animation.onfinish = () => heart.remove();
}, 1000);
