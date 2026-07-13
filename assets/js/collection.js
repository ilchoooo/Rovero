/* assets/js/collection.js */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const collectionName = params.get('name');

    if (!collectionName) {
        window.location.href = 'catalog.html';
        return;
    }

    // Collection info mapping (should ideally be in catalog_data.js)
    // If not found in a specialized metadata object, we can try to guess or use defaults
    const info = (typeof COLLECTIONS_METADATA !== 'undefined' && COLLECTIONS_METADATA[collectionName]) 
        ? COLLECTIONS_METADATA[collectionName] 
        : {
            title: collectionName,
            shortDesc: "Эксклюзивная коллекция мебели из массива дуба.",
            fullDesc: "<p>Эта коллекция воплощает в себе гармонию природного материала и современного минимализма. Каждое изделие создано с вниманием к деталям, чтобы обеспечить максимальный комфорт и эстетическое удовольствие в вашем интерьере.</p>",
            heroImg: `assets/images/collections/${collectionName.toLowerCase()}/${collectionName.toLowerCase()}1.webp`,
            introImg: `assets/images/collections/${collectionName.toLowerCase()}/${collectionName.toLowerCase()}2.webp`
        };

    // Update DOM
    document.title = `${info.title} | ROVERO`;
    document.getElementById('pageTitle').textContent = info.title;
    document.getElementById('pageDescShort').textContent = info.shortDesc;
    document.getElementById('introDescFull').innerHTML = info.fullDesc;
    
    const heroImgEl = document.getElementById('heroBg');
    heroImgEl.src = info.heroImg;
    heroImgEl.onerror = () => { heroImgEl.src = 'assets/images/ui/hero-bg.webp'; };

    const introImgEl = document.getElementById('introImg');
    introImgEl.src = info.introImg;
    introImgEl.onerror = () => { introImgEl.src = 'assets/images/ui/hero-bg.webp'; };

    // Filter products
    const collectionProducts = ROVERO_CATALOG.filter(p => p.collection === collectionName);
    const grid = document.getElementById('collectionGrid');

    if (collectionProducts.length === 0) {
        grid.innerHTML = '<p class="no-results">В данной коллекции пока нет товаров.</p>';
    } else {
        collectionProducts.forEach(p => {
            const card = document.createElement('a');
            card.href = `product.html?product=${p.id}`;
            card.className = 'product-card';
            card.setAttribute('data-hover', '');
            
            const imgs = p.images || [];

            const inCart = window.CartSystem ? window.CartSystem.isInCart(p.id) : false;
            const inFav = window.CartSystem ? window.CartSystem.isFav(p.id) : false;
            const btnText = inCart ? 'В корзине' : 'Добавить в корзину';
            const activeClass = inCart ? 'in-cart' : '';
            const favClass = inFav ? 'active' : '';

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${imgs[0] || ''}" alt="${p.title}" class="card-img main-img" loading="lazy">
                    ${imgs[1] ? `<img src="${imgs[1]}" alt="${p.title}" class="card-img hover-img" loading="lazy">` : ''}
                    <button class="card-fav-icon ${favClass}" data-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); toggleProductFav(this);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="card-hover-btn ${activeClass}" data-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); toggleProductCart(this);">${btnText}</button>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-price">${p.priceLabel}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Cursor interaction for cards (dynamic addition)
    const circle = document.getElementById('circle');
    document.querySelectorAll('[data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if(circle) circle.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
            if(circle) circle.classList.remove('is-hovering');
        });
    });
});
