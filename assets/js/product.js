document.addEventListener('DOMContentLoaded', () => {

    // --- INIT ---
    const urlParams  = new URLSearchParams(window.location.search);
    const productId  = urlParams.get('product') || 'Item-1';

    let productData = null;
    if (typeof itemsDB !== 'undefined') {
        productData = itemsDB.find(item => item.id === productId);
    }
    if (!productData && typeof productsDB !== 'undefined') {
        productData = productsDB[productId] || Object.values(productsDB)[0];
    }
    if (!productData) {
        console.error('Product not found:', productId);
        return;
    }

    // Helper: get images array regardless of data structure
    function getImages() {
        if (productData.images && productData.images.length > 0) {
            return productData.images;
        }
        if (productData.colors) {
            const key = productData.defaultColor || Object.keys(productData.colors)[0];
            if (productData.colors[key]) return productData.colors[key];
        }
        if (productData.image) return [productData.image];
        return [];
    }

    // DOM Elements
    const mainImg      = document.getElementById('mainImage');
    const thumbnailsRow = document.getElementById('thumbnailsRow');

    // --- POPULATE INFO ---
    document.getElementById('pTitle').innerText = productData.title;
    document.getElementById('pPrice').innerText = productData.priceLabel || productData.price || '';
    document.getElementById('pDesc').innerHTML  = productData.description || productData.desc || 'Описание товара.';

    const intProd = document.getElementById('interestedProduct');
    if (intProd) intProd.value = productData.title;

    const ROOM_DISPLAY_NAMES = {
        'СПАЛЬНЯ': 'Спальня',
        'КУХНЯ и ВИНОТЕКА': 'Кухня и винотека',
        'ГАРДЕРОБНАЯ и ПРИХОЖАЯ': 'Гардеробная и прихожая',
        'ГОСТИНАЯ и БИБЛИОТЕКА': 'Гостиная и библиотека'
    };

    const catEl = document.getElementById('pCategory');
    if (catEl) {
        let html = `<a href="index.html" class="p-cat-link">Главная</a>`;
        if (productData.categories && productData.categories.length > 0) {
            const parentCat = productData.categories[0];
            const parentDisplay = ROOM_DISPLAY_NAMES[parentCat] || parentCat;
            
            html += ` <span class="p-cat-sep">/</span> <a href="catalog.html?cat=${encodeURIComponent(parentCat)}" class="p-cat-link">${parentDisplay}</a>`;
            if (productData.categories[1]) {
                const subcat = productData.categories[1];
                html += ` <span class="p-cat-sep">/</span> <a href="catalog.html?cat=${encodeURIComponent(subcat)}" class="p-cat-link">${subcat}</a>`;
            }
        }
        catEl.innerHTML = html;
    }

    // --- DYNAMIC SPECS ---
    if (productData.specs) {
        const table = document.querySelector('.char-table');
        if (table) {
            table.innerHTML = Object.entries(productData.specs)
                .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
                .join('');
        }
    }

    // --- ABOUT COLLECTION PHILOSOPHY ---
    if (productData.collection && typeof COLLECTIONS_METADATA !== 'undefined') {
        const collectionMeta = COLLECTIONS_METADATA[productData.collection];
        if (collectionMeta && (collectionMeta.fullDesc || collectionMeta.shortDesc)) {
            const block = document.getElementById('pAboutCollectionBlock');
            const nameEl = document.getElementById('pCollectionName');
            const philosophyEl = document.getElementById('pCollectionPhilosophy');
            
            if (block && nameEl && philosophyEl) {
                nameEl.textContent = `«${productData.collection}»`;
                philosophyEl.innerHTML = collectionMeta.fullDesc || `<p>${collectionMeta.shortDesc}</p>`;
                block.style.display = 'block';
            }
        }
    }

    // --- BUTTONS LOGIC ---
    const cartBtn = document.getElementById('addToCartBtn');
    const favBtn  = document.getElementById('favBtn');
    
    // Model selection buttons
    const stdBtn = document.getElementById('modelStandardBtn');
    const custBtn = document.getElementById('modelCustomBtn');
    let isCustomSelected = false;

    if (cartBtn && favBtn && window.CartSystem) {
        function updateCartBtnUI() {
            if (window.CartSystem.isInCart(productData.id || productId, null, isCustomSelected)) {
                cartBtn.classList.add('in-cart');
                cartBtn.innerText = 'В корзине';
            } else {
                cartBtn.classList.remove('in-cart');
                cartBtn.innerText = 'В корзину';
            }
        }
        updateCartBtnUI();

        if (window.CartSystem.isFav(productData.id || productId)) {
            favBtn.classList.add('is-fav');
        }

        cartBtn.addEventListener('click', () => {
            window.CartSystem.toggleCart(productData.id || productId, null, isCustomSelected);
            updateCartBtnUI();
        });

        favBtn.addEventListener('click', () => {
            const inFav = window.CartSystem.toggleFav(productData.id || productId);
            favBtn.classList.toggle('is-fav', inFav);
        });

        // Model selection click handlers
        if (stdBtn && custBtn) {
            stdBtn.addEventListener('click', () => {
                isCustomSelected = false;
                stdBtn.classList.add('active');
                custBtn.classList.remove('active');
                // Restore original price
                document.getElementById('pPrice').innerText = productData.priceLabel || productData.price || '';
                updateCartBtnUI();
            });

            custBtn.addEventListener('click', () => {
                isCustomSelected = true;
                custBtn.classList.add('active');
                stdBtn.classList.remove('active');
                // Change price to "Цена по запросу"
                document.getElementById('pPrice').innerText = 'Цена по запросу';
                updateCartBtnUI();
            });
        }
    }

    // --- ACCORDIONS LOGIC ---
    // Initialize initial active/collapsed states for accordion contents
    document.querySelectorAll('.acc-item').forEach(item => {
        const content = item.querySelector('.acc-content');
        if (content) {
            if (item.classList.contains('active')) {
                content.style.maxHeight = 'none';
                content.style.paddingBottom = '20px';
            } else {
                content.style.maxHeight = '0';
                content.style.paddingBottom = '0';
            }
        }
    });

    document.querySelectorAll('.acc-header').forEach(header => {
        header.addEventListener('click', () => {
            const item    = header.parentElement;
            const content = item.querySelector('.acc-content');
            if (!content) return;

            if (item.classList.contains('active')) {
                // Set explicit height to start the transition
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.paddingBottom = '20px';
                // Force a reflow
                content.offsetHeight;
                
                // Animate down to 0
                content.style.maxHeight = '0';
                content.style.paddingBottom = '0';
                item.classList.remove('active');
            } else {
                // Add active class and set height to scrollHeight
                item.classList.add('active');
                content.style.paddingBottom = '20px';
                content.style.maxHeight = content.scrollHeight + 'px';
                
                // After transition ends, set max-height to none so dynamic height/resizing works
                setTimeout(() => {
                    if (item.classList.contains('active')) {
                        content.style.maxHeight = 'none';
                    }
                }, 300);
            }
        });
    });

    // --- LIGHTBOX (global so onclick= attributes work) ---
    window.openLightbox = function () {
        const lightbox    = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        if (lightboxImg) lightboxImg.src = mainImg.src;
        
        // Update lightbox counter
        const counter = document.getElementById('lightboxCounter');
        if (counter && currentImages.length) {
            counter.innerText = `${currentImageIdx + 1} / ${currentImages.length}`;
        }
        
        if (lightbox)    lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function () {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    // --- GALLERY LOGIC ---
    let currentImages = [];
    let currentImageIdx = 0;

    function updateGallery(images) {
        const arr  = Array.isArray(images) ? images : [images];
        currentImages = arr.length > 0 ? arr : getImages();
        if (!currentImages.length) return;

        currentImageIdx = 0;
        mainImg.src = currentImages[0];

        if (thumbnailsRow) {
            thumbnailsRow.innerHTML = '';
            currentImages.forEach((src, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'thumb-box' + (idx === 0 ? ' active' : '');
                thumb.innerHTML = `<img src="${src}" class="thumb-img">`;
                thumb.onclick = () => {
                    setActiveImage(idx);
                };
                thumbnailsRow.appendChild(thumb);
            });
        }
    }

    function setActiveImage(idx) {
        if (!currentImages.length) return;
        
        // Wrap index around circular navigation
        if (idx < 0) idx = currentImages.length - 1;
        if (idx >= currentImages.length) idx = 0;
        
        currentImageIdx = idx;
        const newSrc = currentImages[idx];
        
        // Apply fade-out class to main image
        if (mainImg) {
            mainImg.classList.add('fade-out');
        }
        
        setTimeout(() => {
            if (mainImg) {
                mainImg.src = newSrc;
                mainImg.classList.remove('fade-out');
            }
            
            // Update lightbox image if active
            const lightboxImg = document.getElementById('lightboxImg');
            if (lightboxImg) lightboxImg.src = newSrc;
        }, 150);

        // Update lightbox counter
        const counter = document.getElementById('lightboxCounter');
        if (counter) {
            counter.innerText = `${idx + 1} / ${currentImages.length}`;
        }

        // Update active class on thumbnails and scroll container horizontally
        const thumbs = document.querySelectorAll('.thumb-box');
        thumbs.forEach((t, i) => {
            if (i === idx) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        const container = thumbnailsRow;
        if (container && thumbs[idx]) {
            const activeThumb = thumbs[idx];
            const containerWidth = container.clientWidth;
            const thumbLeft = activeThumb.offsetLeft;
            const thumbWidth = activeThumb.clientWidth;
            container.scrollTo({
                left: thumbLeft - (containerWidth / 2) + (thumbWidth / 2),
                behavior: 'smooth'
            });
        }
    }

    // Set up main image prev/next clicks
    const mainPrevBtn = document.getElementById('mainPrevBtn');
    const mainNextBtn = document.getElementById('mainNextBtn');
    
    if (mainPrevBtn) {
        mainPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid opening lightbox
            setActiveImage(currentImageIdx - 1);
        });
    }
    if (mainNextBtn) {
        mainNextBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid opening lightbox
            setActiveImage(currentImageIdx + 1);
        });
    }

    // Touch swipe gestures for mobile gallery sliding
    const mainImgBox = document.querySelector('.main-image-box');
    if (mainImgBox) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        mainImgBox.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        mainImgBox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Horizontal swipe gesture check: must be wider than vertical movement and over 45px
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
                if (diffX > 0) {
                    setActiveImage(currentImageIdx - 1);
                } else {
                    setActiveImage(currentImageIdx + 1);
                }
            }
        }, { passive: true });
    }

    // Set up lightbox nav clicks
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');
    
    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid closing lightbox
            setActiveImage(currentImageIdx - 1);
        });
    }
    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid closing lightbox
            setActiveImage(currentImageIdx + 1);
        });
    }

    // Touch swipe gestures for lightbox full-screen view
    const lightboxEl = document.getElementById('lightbox');
    if (lightboxEl) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        lightboxEl.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        lightboxEl.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Horizontal swipe check: must be wider than vertical movement and over 45px
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
                if (diffX > 0) {
                    setActiveImage(currentImageIdx - 1);
                } else {
                    setActiveImage(currentImageIdx + 1);
                }
            }
        }, { passive: true });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                setActiveImage(currentImageIdx - 1);
            } else if (e.key === 'ArrowRight') {
                setActiveImage(currentImageIdx + 1);
            }
        }
    });

    // --- INITIAL GALLERY LOAD ---
    updateGallery(getImages());

    // --- ORDER BUTTON ---
    const orderBtn = document.getElementById('orderProductBtn');
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            window.location.href = 'request.html?type=order&product=' + encodeURIComponent(productData.title);
        });
    }

    // --- DESIGNER REQUEST BUTTON ---
    const designerBtn = document.getElementById('designerReqBtn');
    if (designerBtn) {
        designerBtn.addEventListener('click', () => {
            window.location.href = 'request.html?type=designer&product=' + encodeURIComponent(productData.title);
        });
    }

    // --- SUPABASE ---
    window.ROVERO_SUPABASE_URL      = 'https://smymexmkxqqlcpsiyfym.supabase.co';
    window.ROVERO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1leG1reHFxbGNwc2l5ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg2MDAsImV4cCI6MjA4NTEwNDYwMH0.E7f-juplaPEi6yXn2ENiyXOTsO9T1eyzIVWpLHa1l_c';
    (function initSupabase() {
        if (window.ROVERO_SUPABASE_CLIENT) return;
        try {
            var lib = typeof supabase !== 'undefined' ? supabase : window.supabase;
            if (lib && lib.createClient) {
                window.ROVERO_SUPABASE_CLIENT = lib.createClient(window.ROVERO_SUPABASE_URL, window.ROVERO_SUPABASE_ANON_KEY);
            }
        } catch (e) { console.warn('Supabase init product.js:', e); }
    })();
});
