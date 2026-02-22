/* ============================================
   FOR MY LOVE, CRISTALYN — MAIN SCRIPT
   ============================================
   Modules:
   1. Config
   2. Navigation
   3. Music (Spotify + YouTube)
   4. Gallery (GitHub + Google Drive)
   5. Lightbox
   6. Floating Hearts
   7. Scroll Reveal
   8. Tilt Effect
   9. Reasons Cards
   10. Mini Player
   11. Init
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
       1. CONFIG
       ======================================== */
    const CONFIG = {
        // GitHub
        GITHUB_USERNAME: 'rhettrina',
        GITHUB_REPO: 'formylovecristalyn',
        GITHUB_FOLDER: 'images',
        GITHUB_BRANCH: 'main',

        // Google Drive (optional)
        GDRIVE_ENABLED: false,
        GDRIVE_API_KEY: '',
        GDRIVE_FOLDER_ID: '',

        // Spotify playlist IDs
        SPOTIFY_PLAYLISTS: [
            '37i9dQZF1DX7rOY2tZUw1k', // Timeless Love Songs
            '37i9dQZF1DXar0WmW5YgAc', // Soundtrack Love Songs
            '37i9dQZF1DWXqpDKK4ed9O', // 90s Love Songs
            '37i9dQZF1EVGJJ3r00UGAt', // Romantic Mix
            '37i9dQZF1DX3YmZ0QRZVP9', // What Is Your Love Song?
        ],

        // YouTube fallback video IDs (love songs)
        YOUTUBE_VIDEOS: [
            'rtOvBOTyX00', // Perfect - Ed Sheeran
            '450p7goxZqg', // All of Me - John Legend
            'lp-EO5I60KA', // Thinking Out Loud - Ed Sheeran
            'bo_efYhYU2A', // Make You Feel My Love - Adele
            'nSDgHBxUbVQ', // Just the Way You Are - Bruno Mars
        ],

        // Hearts
        HEART_SYMBOLS: ['❤', '💕', '💖', '💗', '💓', '♥', '🩷'],
        HEART_INTERVAL: 1200,
        MAX_HEARTS: 15,
    };

    /* ========================================
       2. NAVIGATION
       ======================================== */
    function initNavigation() {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');

        if (!nav || !toggle || !links) return;

        // Scroll detection for sticky nav style
        const onScroll = () => {
            if (window.scrollY > 80) {
                nav.classList.add('nav--scrolled');
            } else {
                nav.classList.remove('nav--scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Mobile menu toggle
        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isOpen);
            links.classList.toggle('nav__links--open', !isOpen);
        });

        // Close menu on link click
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                links.classList.remove('nav__links--open');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target)) {
                toggle.setAttribute('aria-expanded', 'false');
                links.classList.remove('nav__links--open');
            }
        });
    }

    /* ========================================
       3. MUSIC (Spotify + YouTube fallback)
       ======================================== */
    let musicLoaded = false;

    function initMusic() {
        const playMusicBtn = document.getElementById('playMusicBtn');
        const scrollDownBtn = document.getElementById('scrollDownBtn');

        if (scrollDownBtn) {
            scrollDownBtn.addEventListener('click', () => {
                loadMusicIfNeeded();
                const gallery = document.getElementById('gallery');
                if (gallery) {
                    gallery.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        if (playMusicBtn) {
            playMusicBtn.addEventListener('click', () => {
                loadMusicIfNeeded();
                openMiniPlayer();
            });
        }
    }

    function loadMusicIfNeeded() {
        if (musicLoaded) return;
        musicLoaded = true;

        const embedContainer = document.getElementById('miniPlayerEmbed');
        if (!embedContainer) return;

        // Check localStorage for last track
        let savedSource = null;
        try {
            savedSource = JSON.parse(localStorage.getItem('lovesite_music'));
        } catch (e) { /* ignore */ }

        let type, id;

        if (savedSource && savedSource.type && savedSource.id) {
            type = savedSource.type;
            id = savedSource.id;
        } else {
            // Random selection: 80% Spotify, 20% YouTube
            if (Math.random() < 0.8 && CONFIG.SPOTIFY_PLAYLISTS.length > 0) {
                type = 'spotify';
                id = CONFIG.SPOTIFY_PLAYLISTS[Math.floor(Math.random() * CONFIG.SPOTIFY_PLAYLISTS.length)];
            } else if (CONFIG.YOUTUBE_VIDEOS.length > 0) {
                type = 'youtube';
                id = CONFIG.YOUTUBE_VIDEOS[Math.floor(Math.random() * CONFIG.YOUTUBE_VIDEOS.length)];
            } else {
                type = 'spotify';
                id = CONFIG.SPOTIFY_PLAYLISTS[0];
            }
        }

        // Save to localStorage
        try {
            localStorage.setItem('lovesite_music', JSON.stringify({ type, id }));
        } catch (e) { /* ignore */ }

        // Create embed
        const iframe = document.createElement('iframe');
        iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
        iframe.setAttribute('loading', 'lazy');

        if (type === 'spotify') {
            iframe.src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
            iframe.style.height = '152px';
            iframe.title = 'Spotify music player';
        } else {
            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
            iframe.style.height = '80px';
            iframe.title = 'YouTube music player';
        }

        embedContainer.innerHTML = '';
        embedContainer.appendChild(iframe);
    }

    /* ========================================
       4. GALLERY (GitHub + Google Drive)
       ======================================== */
    let allImageSources = []; // Store for lightbox navigation

    function initGallery() {
        const photosContainer = document.getElementById('photosContainer');
        const loadingEl = document.getElementById('galleryLoading');
        if (!photosContainer) return;

        const promises = [];

        // GitHub images
        promises.push(fetchGitHubImages());

        // Google Drive images (optional)
        if (CONFIG.GDRIVE_ENABLED && CONFIG.GDRIVE_API_KEY && CONFIG.GDRIVE_FOLDER_ID) {
            promises.push(fetchDriveImages());
        }

        Promise.all(promises)
            .then(results => {
                let images = results.flat();
                images = shuffle(images);
                allImageSources = images;

                if (images.length === 0) {
                    photosContainer.innerHTML = '<p style="text-align:center;color:var(--clr-text-muted);">No memories found yet. Upload some photos!</p>';
                } else {
                    renderGallery(images, photosContainer);
                }

                if (loadingEl) loadingEl.setAttribute('hidden', '');
            })
            .catch(err => {
                console.error('Error loading gallery:', err);
                photosContainer.innerHTML = '<p style="color:var(--clr-primary);">Error loading memories. Please try again later.</p>';
                if (loadingEl) loadingEl.setAttribute('hidden', '');
            });
    }

    function fetchGitHubImages() {
        const apiURL = `https://api.github.com/repos/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.GITHUB_FOLDER}`;

        return fetch(apiURL)
            .then(res => {
                if (!res.ok) throw new Error('GitHub API: ' + res.status);
                return res.json();
            })
            .then(files => {
                return files
                    .filter(f => f.type === 'file' && /\.(png|jpg|jpeg|gif|webp)$/i.test(f.name))
                    .map(f => ({
                        src: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.GITHUB_FOLDER}/${f.name}`,
                        alt: f.name,
                    }));
            })
            .catch(err => {
                console.warn('GitHub images fetch failed:', err);
                return [];
            });
    }

    function fetchDriveImages() {
        const driveURL = `https://www.googleapis.com/drive/v3/files?q='${CONFIG.GDRIVE_FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${CONFIG.GDRIVE_API_KEY}&fields=files(id,name,mimeType)`;

        return fetch(driveURL)
            .then(res => {
                if (!res.ok) throw new Error('Drive API: ' + res.status);
                return res.json();
            })
            .then(data => {
                if (!data.files) return [];
                return data.files.map(f => ({
                    src: `https://drive.google.com/uc?export=view&id=${f.id}`,
                    alt: f.name,
                }));
            })
            .catch(err => {
                console.warn('Google Drive images fetch failed:', err);
                return [];
            });
    }

    function renderGallery(images, container) {
        const fragment = document.createDocumentFragment();

        images.forEach((img, index) => {
            const box = document.createElement('div');
            box.classList.add('photo-box');
            box.setAttribute('role', 'button');
            box.setAttribute('tabindex', '0');
            box.setAttribute('aria-label', `View photo ${index + 1}`);

            const imgEl = document.createElement('img');
            imgEl.src = img.src;
            imgEl.alt = img.alt || `Memory ${index + 1}`;
            imgEl.loading = 'lazy';
            imgEl.decoding = 'async';

            box.appendChild(imgEl);
            fragment.appendChild(box);

            // Click to open lightbox
            box.addEventListener('click', () => openLightbox(index));
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });

        container.appendChild(fragment);
    }

    /* ========================================
       5. LIGHTBOX
       ======================================== */
    let currentLightboxIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.getElementById('lightboxClose');
        const prevBtn = document.getElementById('lightboxPrev');
        const nextBtn = document.getElementById('lightboxNext');
        const overlay = lightbox ? lightbox.querySelector('.lightbox__overlay') : null;

        if (!lightbox) return;

        // Close
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (overlay) overlay.addEventListener('click', closeLightbox);

        // Prev / Next
        if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('lightbox--open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });

        // Touch swipe
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) navigateLightbox(1);  // swipe left = next
                else navigateLightbox(-1);           // swipe right = prev
            }
        }, { passive: true });
    }

    function openLightbox(index) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');
        if (!lightbox || !img || allImageSources.length === 0) return;

        currentLightboxIndex = index;
        img.src = allImageSources[index].src;
        img.alt = allImageSources[index].alt || 'Memory photo';

        if (counter) {
            counter.textContent = `${index + 1} / ${allImageSources.length}`;
        }

        lightbox.removeAttribute('hidden');
        // Force reflow for transition
        void lightbox.offsetHeight;
        lightbox.classList.add('lightbox--open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightbox.classList.remove('lightbox--open');
        document.body.style.overflow = '';

        setTimeout(() => {
            lightbox.setAttribute('hidden', '');
        }, 300);
    }

    function navigateLightbox(direction) {
        if (allImageSources.length === 0) return;

        currentLightboxIndex += direction;
        if (currentLightboxIndex < 0) currentLightboxIndex = allImageSources.length - 1;
        if (currentLightboxIndex >= allImageSources.length) currentLightboxIndex = 0;

        const img = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');

        if (img) {
            img.src = allImageSources[currentLightboxIndex].src;
            img.alt = allImageSources[currentLightboxIndex].alt || 'Memory photo';
        }
        if (counter) {
            counter.textContent = `${currentLightboxIndex + 1} / ${allImageSources.length}`;
        }
    }

    /* ========================================
       6. FLOATING HEARTS
       ======================================== */
    function initHearts() {
        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const container = document.getElementById('heartsContainer');
        if (!container) return;

        function createHeart() {
            // Limit max hearts on screen
            if (container.children.length >= CONFIG.MAX_HEARTS) return;

            const heart = document.createElement('span');
            heart.classList.add('floating-heart');
            heart.setAttribute('aria-hidden', 'true');

            // Random symbol
            heart.textContent = CONFIG.HEART_SYMBOLS[Math.floor(Math.random() * CONFIG.HEART_SYMBOLS.length)];

            // Random properties
            const size = Math.random() * 20 + 12; // 12-32px
            const opacity = Math.random() * 0.4 + 0.15; // 0.15-0.55
            const duration = Math.random() * 8 + 8; // 8-16s
            const left = Math.random() * 100;
            const blur = Math.random() < 0.3 ? Math.random() * 2 + 0.5 : 0; // 30% chance of blur
            const rotate = Math.random() * 720 - 360;

            heart.style.cssText = `
                left: ${left}%;
                font-size: ${size}px;
                animation-duration: ${duration}s;
                animation-delay: ${Math.random() * 2}s;
                filter: blur(${blur}px);
                --heart-opacity: ${opacity};
                --heart-rotate: ${rotate}deg;
            `;

            container.appendChild(heart);

            // Remove after animation
            setTimeout(() => {
                if (heart.parentNode) heart.remove();
            }, (duration + 2) * 1000);
        }

        // Create hearts at interval
        setInterval(createHeart, CONFIG.HEART_INTERVAL);
        // Create a few immediately
        for (let i = 0; i < 5; i++) {
            setTimeout(createHeart, i * 300);
        }
    }

    /* ========================================
       7. SCROLL REVEAL
       ======================================== */
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (reveals.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        });

        reveals.forEach(el => observer.observe(el));
    }

    /* ========================================
       8. TILT EFFECT (Desktop only)
       ======================================== */
    function initTiltEffect() {
        // Only on devices with hover (desktop)
        if (!window.matchMedia('(hover: hover)').matches) return;

        const heroCard = document.querySelector('.hero__card');
        if (!heroCard) return;

        heroCard.addEventListener('mousemove', (e) => {
            const rect = heroCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            heroCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        heroCard.addEventListener('mouseleave', () => {
            heroCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
            heroCard.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                heroCard.style.transition = '';
            }, 500);
        });
    }

    /* ========================================
       9. REASONS CARDS (Flip interaction)
       ======================================== */
    function initReasons() {
        const cards = document.querySelectorAll('.reason-card');

        cards.forEach(card => {
            const flipCard = () => {
                const isFlipped = card.classList.contains('reason-card--flipped');
                card.classList.toggle('reason-card--flipped');
                card.setAttribute('aria-expanded', !isFlipped);
            };

            card.addEventListener('click', flipCard);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    flipCard();
                }
            });
        });
    }

    /* ========================================
       10. MINI PLAYER
       ======================================== */
    function initMiniPlayer() {
        const miniPlayer = document.getElementById('miniPlayer');
        const toggleBtn = document.getElementById('miniPlayerToggle');

        if (!miniPlayer || !toggleBtn) return;

        // Restore state from localStorage
        let isOpen = false;
        try {
            isOpen = localStorage.getItem('lovesite_player_open') === 'true';
        } catch (e) { /* ignore */ }

        if (isOpen) {
            miniPlayer.classList.add('mini-player--open');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        toggleBtn.addEventListener('click', () => {
            const nowOpen = miniPlayer.classList.toggle('mini-player--open');
            toggleBtn.setAttribute('aria-expanded', nowOpen);
            try {
                localStorage.setItem('lovesite_player_open', nowOpen);
            } catch (e) { /* ignore */ }
        });
    }

    function openMiniPlayer() {
        const miniPlayer = document.getElementById('miniPlayer');
        const toggleBtn = document.getElementById('miniPlayerToggle');
        if (!miniPlayer) return;

        miniPlayer.classList.add('mini-player--open');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        try {
            localStorage.setItem('lovesite_player_open', 'true');
        } catch (e) { /* ignore */ }
    }

    /* ========================================
       UTILITY: Fisher-Yates Shuffle
       ======================================== */
    function shuffle(array) {
        const arr = [...array];
        let currentIndex = arr.length;
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        return arr;
    }

    /* ========================================
       11. INIT — Start everything
       ======================================== */
    function init() {
        initNavigation();
        initMusic();
        initGallery();
        initLightbox();
        initHearts();
        initScrollReveal();
        initTiltEffect();
        initReasons();
        initMiniPlayer();
    }

    init();

});
