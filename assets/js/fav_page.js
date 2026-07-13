
document.addEventListener('DOMContentLoaded', () => {
    const favGrid = document.getElementById('favGrid');
    const emptyMsg = document.getElementById('emptyFavMsg');
    
    function render() {
        if (!window.CartSystem) return;
        const favs = window.CartSystem.getFavs();
        
        if (favs.length === 0) {
            favGrid.style.display = 'none';
            emptyMsg.style.display = 'block';
            return;
        }
        
        favGrid.style.display = 'grid';
        emptyMsg.style.display = 'none';
        
        favGrid.innerHTML = '';
        
        favs.forEach(id => {
            const p = itemsDB.find(item => item.id === id);
            if (!p) return;
            
            const card = document.createElement('a');
            card.href = `product.html?product=${p.id}`;
            card.className = 'product-card';
            card.setAttribute('data-hover', '');
            
            const inCart = window.CartSystem ? window.CartSystem.isInCart(p.id) : false;
            const btnText = inCart ? 'В корзине' : 'Добавить в корзину';
            const activeClass = inCart ? 'in-cart' : '';
            
            // Clean up title (remove collection name if present)
            let displayTitle = p.title;
            if (displayTitle.includes(' — ')) {
                displayTitle = displayTitle.split(' — ')[1];
            }
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${p.images[0] || ''}" alt="${p.title}" class="card-img main-img" loading="lazy">
                    ${p.images[1] ? `<img src="${p.images[1]}" alt="${p.title}" class="card-img hover-img" loading="lazy">` : ''}
                    <button class="card-fav-icon active" data-id="${p.id}" onclick="event.preventDefault(); event.stopPropagation();">
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
            favGrid.appendChild(card);
        });
        
        // Bind unfav logic
        document.querySelectorAll('.card-fav-icon').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = e.currentTarget.getAttribute('data-id');
                window.CartSystem.toggleFav(id);
                render();
            };
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
    
    render();
    
    window.addEventListener('storage', () => {
        render();
    });
});
