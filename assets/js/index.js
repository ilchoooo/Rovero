
window.ROVERO_SUPABASE_URL = 'https://smymexmkxqqlcpsiyfym.supabase.co';
window.ROVERO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1leG1reHFxbGNwc2l5ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg2MDAsImV4cCI6MjA4NTEwNDYwMH0.E7f-juplaPEi6yXn2ENiyXOTsO9T1eyzIVWpLHa1l_c';
window.ROVERO_SUPABASE_CLIENT = null;
(function initSupabase() {
    var url = window.ROVERO_SUPABASE_URL;
    var key = window.ROVERO_SUPABASE_ANON_KEY;
    function setClient(c) { window.ROVERO_SUPABASE_CLIENT = c; }
    try {
        var lib = typeof supabase !== 'undefined' ? supabase : window.supabase;
        if (lib && lib.createClient) { setClient(lib.createClient(url, key)); return; }
        if (lib && lib.default && lib.default.createClient) { setClient(lib.default.createClient(url, key)); return; }
    } catch (e) { console.warn('Supabase init (sync):', e); }
    import('https://esm.sh/@supabase/supabase-js@2').then(function (m) {
        setClient(m.createClient(url, key));
    }).catch(function (e) { console.warn('Supabase init (esm):', e); });
})();

(function () {
    var url = window.ROVERO_SUPABASE_URL;
    var key = window.ROVERO_SUPABASE_ANON_KEY;
    if (window.ROVERO_SUPABASE_CLIENT) return;
    try {
        var lib = typeof supabase !== 'undefined' ? supabase : window.supabase;
        if (lib && lib.createClient) { window.ROVERO_SUPABASE_CLIENT = lib.createClient(url, key); }
        else if (lib && lib.default && lib.default.createClient) { window.ROVERO_SUPABASE_CLIENT = lib.default.createClient(url, key); }
    } catch (e) { console.warn('Supabase init:', e); }
    if (!window.ROVERO_SUPABASE_CLIENT) {
        import('https://esm.sh/@supabase/supabase-js@2').then(function (m) {
            window.ROVERO_SUPABASE_CLIENT = m.createClient(url, key);
        }).catch(function (e) { console.warn('Supabase esm fallback:', e); });
    }
})();





function handleCardClick(collectionName) {
    window.location.href = 'collection.html?name=' + encodeURIComponent(collectionName);
}
window.handleCardClick = handleCardClick;

async function saveRequestToSupabase(payload) {
    var client = window.ROVERO_SUPABASE_CLIENT;
    if (!client) return false;
    try {
        var res = await client.from('requests_rovero').insert(payload);
        return !res.error;
    } catch (err) { return false; }
}




function copyPhone(element, event) {
    if (event) event.preventDefault();
    const originalText = element.innerText;
    navigator.clipboard.writeText(originalText).then(() => {
        element.innerText = "СКОПИРОВАНО";
        setTimeout(() => { element.innerText = originalText; }, 800);
    });
}

function copyEmail(element, event) {
    if (event) event.preventDefault();
    const originalText = element.innerText;
    navigator.clipboard.writeText(originalText).then(() => {
        element.innerText = "СКОПИРОВАНО";
        setTimeout(() => { element.innerText = originalText; }, 800);
    });
}

// Make them globally available
window.copyPhone = copyPhone;
window.copyEmail = copyEmail;

function showCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    // Проверяем, было ли уже дано согласие (хранится в браузере)
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            banner.classList.add('active');
        }, 2000); // Появляется через 2 секунды после захода
    }
}

function acceptCookies() {
    const banner = document.getElementById('cookieBanner');
    banner.classList.remove('active');
    // Сохраняем выбор пользователя на год (или пока не очистит кеш)
    localStorage.setItem('cookiesAccepted', 'true');
}

// Render random products on index page
function renderRandomProducts() {
    const grid = document.getElementById('randomProductsGrid');
    if (!grid) return;

    const catalog = typeof ROVERO_CATALOG !== 'undefined' ? ROVERO_CATALOG : (window.itemsDB || []);
    if (!catalog || catalog.length === 0) return;

    // Get 8 random unique products
    const shuffled = [...catalog].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);

    grid.innerHTML = '';

    selected.forEach(p => {
        const card = document.createElement('a');
        card.href = `product.html?product=${p.id}`;
        card.className = 'product-card';
        card.setAttribute('data-hover', '');

        const inCart = window.CartSystem ? window.CartSystem.isInCart(p.id) : false;
        const btnText = inCart ? 'В корзине' : 'Добавить в корзину';
        const activeClass = inCart ? 'in-cart' : '';

        const inFav = window.CartSystem ? window.CartSystem.isFav(p.id) : false;
        const favClass = inFav ? 'active' : '';

        // Clean up title (remove collection name if present)
        let displayTitle = p.title;
        if (displayTitle.includes(' — ')) {
            displayTitle = displayTitle.split(' — ')[1];
        }

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${p.images[0] || ''}" alt="${p.title}" class="card-img main-img" loading="lazy">
                ${p.images[1] ? `<img src="${p.images[1]}" alt="${p.title}" class="card-img hover-img" loading="lazy">` : ''}
                <button class="card-fav-icon ${favClass}" data-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); toggleProductFav(this);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <button class="card-hover-btn ${activeClass}" data-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); toggleProductCart(this);">${btnText}</button>
            </div>
            <div class="card-info">
                <h3 class="card-title">${displayTitle}</h3>
                <p class="card-price">${p.priceLabel}</p>
            </div>
        `;
        grid.appendChild(card);
    });

    // Rebind hover effects for custom cursor
    if (typeof window.bindHoverEvents === 'function') {
        window.bindHoverEvents();
    } else {
        const circle = document.getElementById('circle');
        if (circle) {
            document.querySelectorAll('[data-hover]').forEach(el => {
                el.addEventListener('mouseenter', () => circle.classList.add('is-hovering'));
                el.addEventListener('mouseleave', () => circle.classList.remove('is-hovering'));
            });
        }
    }
}

function renderCollectionsCarousel() {
    const grid = document.getElementById('grid-collections');
    if (!grid) return;

    const metadata = typeof COLLECTIONS_METADATA !== 'undefined' ? COLLECTIONS_METADATA : {};
    grid.innerHTML = '';

    Object.keys(metadata).forEach(name => {
        const data = metadata[name];
        const imgSrc = data.carouselImg || data.heroImg || '';
        
        const item = document.createElement('a');
        item.href = `collection.html?name=${encodeURIComponent(name)}`;
        item.className = 'cat-item';
        item.setAttribute('data-hover', '');
        item.innerHTML = `
            <div class="cat-thumb"><img src="${imgSrc}"></div>
            <span class="cat-name">${name}</span>
        `;
        grid.appendChild(item);
    });
}

// Запускаем проверку при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    // Toggle hero visual blueprint image on mobile tap for ROVERO Labs on index page
    const bespokeWrap = document.querySelector('.bespoke-img-wrap');
    if (bespokeWrap) {
        bespokeWrap.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                bespokeWrap.classList.toggle('active-tap');
            }
        });
    }

    showCookieBanner();
    renderCollectionsCarousel();
    initMainSlider();
    initCollectionsSlider();

    // Рендерим случайные товары
    renderRandomProducts();

    // Автоматическое копирование по клику на все ссылки tel: и mailto:
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        if (!link.getAttribute('onclick')) {
            link.addEventListener('click', (e) => copyPhone(link, e));
        }
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        if (!link.getAttribute('onclick')) {
            link.addEventListener('click', (e) => copyEmail(link, e));
        }
    });
});

function initCollectionsSlider() {
    const grid = document.getElementById('grid-collections');
    const track = document.getElementById('collectionsSliderTrack');
    const thumb = document.getElementById('collectionsSliderThumb');
    
    if (!grid || !track || !thumb) return;

    // Scrollbar Drag state variables
    let isDragging = false;
    let startX = 0;
    let startThumbLeft = 0;
    
    let targetScrollLeft = grid.scrollLeft;
    let isAnimatingScroll = false;

    // 1. Grid Mouse Drag-to-Scroll logic
    let isGridDragging = false;
    let gridStartX = 0;
    let gridScrollLeft = 0;
    let dragThresholdMoved = false;

    grid.addEventListener('mousedown', (e) => {
        isGridDragging = true;
        dragThresholdMoved = false;
        gridStartX = e.pageX - grid.offsetLeft;
        gridScrollLeft = grid.scrollLeft;
        grid.style.cursor = 'grabbing';
        grid.style.scrollBehavior = 'auto'; // Instant movement on drag
    });

    document.addEventListener('mousemove', (e) => {
        if (!isGridDragging) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - gridStartX) * 1.5;
        if (Math.abs(walk) > 5) {
            dragThresholdMoved = true;
        }
        grid.scrollLeft = gridScrollLeft - walk;
        targetScrollLeft = grid.scrollLeft;
        updateSliderProgress();
    });

    const endGridDrag = (e) => {
        if (!isGridDragging) return;
        isGridDragging = false;
        grid.style.cursor = 'grab';
        if (dragThresholdMoved) {
            // Prevent click routing if dragged significantly
            grid.classList.add('is-dragging-active');
            setTimeout(() => grid.classList.remove('is-dragging-active'), 50);
        }
    };

    document.addEventListener('mouseup', endGridDrag);

    // Prevent navigation click when drag occurred
    grid.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (grid.classList.contains('is-dragging-active')) {
                e.preventDefault();
            }
        });
    });

    // 2. Click arrows to slide
    const prevBtn = document.querySelector('.prev-collections');
    const nextBtn = document.querySelector('.next-collections');
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const scrollAmount = grid.clientWidth * 0.75;
            targetScrollLeft = Math.max(0, grid.scrollLeft - scrollAmount);
            grid.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        });
        nextBtn.addEventListener('click', () => {
            const scrollAmount = grid.clientWidth * 0.75;
            targetScrollLeft = Math.min(grid.scrollWidth - grid.clientWidth, grid.scrollLeft + scrollAmount);
            grid.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        });
    }
    
    function updateThumb() {
        const scrollWidth  = grid.scrollWidth;
        const clientWidth  = grid.clientWidth;
        const scrollLeft   = grid.scrollLeft;
        const trackWidth   = track.clientWidth;
        if (scrollWidth <= clientWidth) return;

        let thumbWidth = (clientWidth / scrollWidth) * trackWidth;
        if (thumbWidth < 40) thumbWidth = 40;
        thumb.style.width = thumbWidth + 'px';

        // During drag, thumb position is owned by moveDrag() — skip to avoid conflict
        if (!isDragging) {
            const maxScrollLeft = scrollWidth - clientWidth;
            const maxThumbLeft  = trackWidth - thumbWidth;
            const scrollRatio   = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
            thumb.style.left    = (scrollRatio * maxThumbLeft) + 'px';
        }
    }

    function smoothScrollLoop() {
        isAnimatingScroll = true;
        const diff = targetScrollLeft - grid.scrollLeft;
        
        if (Math.abs(diff) < 0.5 && !isDragging) {
            grid.scrollLeft   = targetScrollLeft;
            isAnimatingScroll = false;
            updateThumb();
            return;
        }
        
        // Soft deceleration — coefficient 0.07 gives a premium glide
        grid.scrollLeft += diff * 0.07;
        updateThumb();   // Keep thumb in perfect sync every frame
        
        requestAnimationFrame(smoothScrollLoop);
    }
    
    // 2. Synchronize slider thumb visibility, size and position
    function updateSliderProgress() {
        const scrollWidth = grid.scrollWidth;
        const clientWidth = grid.clientWidth;
        const scrollLeft  = grid.scrollLeft;
        const trackWidth  = track.clientWidth;

        // Sync target only for native scrolls (touch swipe, momentum scroll)
        if (!isAnimatingScroll && !isDragging) {
            targetScrollLeft = scrollLeft;
        }

        if (scrollWidth <= clientWidth) {
            track.parentElement.style.opacity = '0';
            track.style.pointerEvents = 'none';
            return;
        } else {
            track.parentElement.style.opacity = '1';
            track.style.pointerEvents = 'auto';
        }

        // Always keep thumb width correct
        let thumbWidth = (clientWidth / scrollWidth) * trackWidth;
        if (thumbWidth < 40) thumbWidth = 40;
        thumb.style.width = thumbWidth + 'px';

        // Only write thumb position when RAF loop is NOT running to avoid conflicts
        if (!isAnimatingScroll && !isDragging) {
            const maxScrollLeft = scrollWidth - clientWidth;
            const maxThumbLeft  = trackWidth - thumbWidth;
            const scrollRatio   = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
            thumb.style.left    = (scrollRatio * maxThumbLeft) + 'px';
        }
    }

    // Listen for scroll & resize events
    grid.addEventListener('scroll', updateSliderProgress);
    window.addEventListener('resize', updateSliderProgress);
    
    // Initial run and delayed runs to catch late layouts (after images load)
    updateSliderProgress();
    setTimeout(updateSliderProgress, 500);
    setTimeout(updateSliderProgress, 1500);
    
    // 3. Dragging collections slider thumb (Mouse & Touch)
    function startDrag(clientX) {
        isDragging = true;
        startX = clientX;
        startThumbLeft = parseFloat(thumb.style.left) || 0;
        targetScrollLeft = grid.scrollLeft;
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    }
    
    function moveDrag(clientX) {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        const trackWidth   = track.clientWidth;
        const thumbWidth   = thumb.clientWidth;
        const maxThumbLeft = trackWidth - thumbWidth;
        
        let targetThumbLeft = startThumbLeft + deltaX;
        if (targetThumbLeft < 0) targetThumbLeft = 0;
        if (targetThumbLeft > maxThumbLeft) targetThumbLeft = maxThumbLeft;

        // Thumb follows cursor INSTANTLY (no lag on the handle itself)
        thumb.style.left = targetThumbLeft + 'px';
        
        // Grid scrolls smoothly via lerp RAF loop
        const scrollRatio  = maxThumbLeft > 0 ? targetThumbLeft / maxThumbLeft : 0;
        const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
        targetScrollLeft    = scrollRatio * maxScrollLeft;
        
        if (!isAnimatingScroll) {
            smoothScrollLoop();
        }
    }
    
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        }
    }
    
    // Mouse events
    thumb.addEventListener('mousedown', (e) => {
        startDrag(e.clientX);
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        moveDrag(e.clientX);
    });
    
    document.addEventListener('mouseup', endDrag);
    
    // Touch events (for mobile devices)
    thumb.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0].clientX);
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        moveDrag(e.touches[0].clientX);
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
    
    // 4. Click anywhere on track to navigate
    track.addEventListener('click', (e) => {
        if (e.target === thumb) return;
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const thumbWidth = thumb.clientWidth;
        const trackWidth = track.clientWidth;
        
        let newThumbLeft = clickX - thumbWidth / 2;
        const maxThumbLeft = trackWidth - thumbWidth;
        if (newThumbLeft < 0) newThumbLeft = 0;
        if (newThumbLeft > maxThumbLeft) newThumbLeft = maxThumbLeft;
        
        const scrollRatio = maxThumbLeft > 0 ? newThumbLeft / maxThumbLeft : 0;
        const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
        
        grid.scrollTo({
            left: scrollRatio * maxScrollLeft,
            behavior: 'smooth'
        });
    });
}

function initMainSlider() {
    const slider = document.querySelector('.main-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    
    if (!slides.length) return;

    let currentIdx = Math.floor(Math.random() * slides.length);
    let interval = null;
    let isFirstShow = true;

    function showSlide(index) {
        // Reset all
        for (let i = 0; i < slides.length; i++) {
            if (isFirstShow) {
                slides[i].style.transition = 'none';
            }
            slides[i].classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        }
        
        currentIdx = (index + slides.length) % slides.length;
        
        // Activate target
        slides[currentIdx].classList.add('active');
        if (dots[currentIdx]) dots[currentIdx].classList.add('active');

        if (isFirstShow) {
            // Force browser reflow to apply state instantly
            slides[currentIdx].offsetHeight;
            // Restore transitions in the next animation frame
            requestAnimationFrame(() => {
                for (let i = 0; i < slides.length; i++) {
                    slides[i].style.transition = '';
                }
            });
            isFirstShow = false;
        }
    }

    // Initialize with the random slide instantly
    showSlide(currentIdx);

    function nextSlide() { showSlide(currentIdx + 1); }
    function prevSlide() { showSlide(currentIdx - 1); }

    function startAutoPlay() {
        stopAutoPlay();
        interval = setInterval(nextSlide, 10000);
    }

    function stopAutoPlay() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    // Controls
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            startAutoPlay();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            startAutoPlay();
        });
    }

    if (dots.length) {
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                showSlide(idx);
                startAutoPlay();
            });
        });
    }

    // Start
    startAutoPlay();
}

// --- PROJECTS LIGHTBOX LOGIC ---
function openProjectLightbox(tile) {
    const lightbox = document.getElementById('projectLightbox');
    const lightboxImg = document.getElementById('projectLightboxImg');
    const lightboxCaption = document.getElementById('projectLightboxCaption');
    
    if (!lightbox || !lightboxImg) return;
    
    let img;
    const currentSlideAttr = tile.getAttribute('data-current-slide');
    if (currentSlideAttr !== null) {
        const images = tile.querySelectorAll('.project-img');
        img = images[parseInt(currentSlideAttr, 10)] || tile.querySelector('.project-img');
    } else {
        img = tile.querySelector('.project-img');
    }
    const name = tile.querySelector('.project-name');
    
    if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    }
    
    if (name && lightboxCaption) {
        lightboxCaption.innerText = name.innerText;
    } else if (lightboxCaption) {
        lightboxCaption.innerText = '';
    }
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectLightbox() {
    const lightbox = document.getElementById('projectLightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    document.body.style.overflow = '';
}

// Global exposure
window.openProjectLightbox = openProjectLightbox;
window.closeProjectLightbox = closeProjectLightbox;

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('projectLightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeProjectLightbox();
        }
    }
});

