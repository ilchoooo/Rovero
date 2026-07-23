
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsList = document.getElementById('cartItemsList');
    const catalogData = itemsDB; // Assuming db.js is included
    const cartLayout = document.getElementById('cartLayout');
    const emptyMsg = document.getElementById('emptyCartMsg');
    
    function render() {
        if (!window.CartSystem) return;
        const cart = window.CartSystem.getCart();
        
        if (cart.length === 0) {
            cartLayout.style.display = 'none';
            emptyMsg.style.display = 'block';
            return;
        }
        
        cartLayout.style.display = 'grid';
        cartLayout.style.opacity = '1';
        emptyMsg.style.display = 'none';
        
        cartItemsList.innerHTML = '';
        let total = 0;
        let hasOnRequest = false;
        
        cart.forEach((cartItem, index) => {
            const product = catalogData.find(p => p.id === cartItem.id);
            if (!product) return;
            
            const isCustom = !!cartItem.custom;
            const isOnRequest = isCustom || (product.priceLabel && product.priceLabel.includes('по запросу'));
            const itemPrice = isOnRequest ? 0 : product.priceValue;
            total += itemPrice * cartItem.qty;
            if (isOnRequest) hasOnRequest = true;
            
            const div = document.createElement('div');
            div.className = 'ci-item';
            div.setAttribute('data-id', cartItem.id);
            div.setAttribute('data-color', cartItem.color || '');
            div.setAttribute('data-custom', isCustom ? 'true' : 'false');
            
            // Get image for specific color if available
            let itemImg = (product.images && product.images[0]) ? product.images[0] : (product.image || '');
            if (cartItem.color && product.colors && product.colors[cartItem.color]) {
                itemImg = product.colors[cartItem.color][0];
            } else if (product.colors) {
                itemImg = product.colors[product.defaultColor || Object.keys(product.colors)[0]][0];
            }

            const modelText = isCustom ? 'под заказ' : 'стандартная';
            const priceText = isOnRequest ? 'Цена по запросу' : `${product.priceValue.toLocaleString('ru-RU')} ₽`;
            const totalText = isOnRequest ? 'Цена по запросу' : `${(product.priceValue * cartItem.qty).toLocaleString('ru-RU')} ₽`;

            div.innerHTML = `
                <div class="ci-swipe-bg">Удалить</div>
                <div class="ci-item-content">
                    <button class="ci-remove" data-id="${cartItem.id}" data-color="${cartItem.color || ''}" data-custom="${isCustom ? 'true' : 'false'}">×</button>
                    <div class="ci-img-box" style="cursor: pointer;" onclick="window.location.href='product.html?product=${product.id}'">
                        <img src="${itemImg}" class="ci-img">
                    </div>
                    <div class="ci-info">
                        <div class="ci-title" style="cursor: pointer;" onclick="window.location.href='product.html?product=${product.id}'">${product.title}</div>
                        ${cartItem.color ? `<div class="ci-variant">Цвет: ${cartItem.color}</div>` : ''}
                        <div class="ci-variant" style="color: var(--text-muted); font-size: 11px;">Модель: ${modelText}</div>
                        <div class="ci-price">${priceText}</div>
                        <div class="ci-qty-box">
                            <button class="ci-qty-btn minus" data-id="${cartItem.id}" data-color="${cartItem.color || ''}" data-custom="${isCustom ? 'true' : 'false'}">-</button>
                            <input type="text" class="ci-qty-val" value="${cartItem.qty}" readonly>
                            <button class="ci-qty-btn plus" data-id="${cartItem.id}" data-color="${cartItem.color || ''}" data-custom="${isCustom ? 'true' : 'false'}">+</button>
                        </div>
                    </div>
                    <div class="ci-item-total">
                        ${totalText}
                    </div>
                </div>
            `;
            cartItemsList.appendChild(div);
            
            // Swipe logic for mobile
            initSwipe(div, cartItem.id, cartItem.color, isCustom);
        });
        
        document.getElementById('cartTotalVal').innerText = total.toLocaleString('ru-RU') + ' ₽';
        bindEvents();
    }

    function initSwipe(el, id, color, custom) {
        const content = el.querySelector('.ci-item-content');
        const bg = el.querySelector('.ci-swipe-bg');
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        const threshold = 100;

        el.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
            content.style.transition = 'none';
        }, {passive: true});

        el.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX - startX;
            if (currentX < 0) { // Swipe left
                content.style.transform = `translateX(${currentX}px)`;
                bg.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
            }
        }, {passive: true});

        el.addEventListener('touchend', () => {
            isSwiping = false;
            content.style.transition = 'transform 0.3s ease';
            if (currentX < -threshold) {
                content.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    window.CartSystem.toggleCart(id, color, custom);
                    render();
                }, 200);
            } else {
                content.style.transform = 'translateX(0)';
                bg.style.opacity = 0;
            }
            currentX = 0;
        });
    }
    
    function bindEvents() {
        document.querySelectorAll('.ci-qty-btn.plus').forEach(btn => {
            btn.onclick = (e) => {
                const id = btn.getAttribute('data-id');
                const color = btn.getAttribute('data-color') || null;
                const custom = btn.getAttribute('data-custom') === 'true';
                const cart = window.CartSystem.getCart();
                const item = cart.find(x => x.id === id && x.color === color && !!x.custom === custom);
                if (item) {
                    window.CartSystem.updateQuantity(id, color, item.qty + 1, custom);
                    render();
                }
            };
        });
        document.querySelectorAll('.ci-qty-btn.minus').forEach(btn => {
            btn.onclick = (e) => {
                const id = btn.getAttribute('data-id');
                const color = btn.getAttribute('data-color') || null;
                const custom = btn.getAttribute('data-custom') === 'true';
                const cart = window.CartSystem.getCart();
                const item = cart.find(x => x.id === id && x.color === color && !!x.custom === custom);
                if (item) {
                    if (item.qty > 1) {
                        window.CartSystem.updateQuantity(id, color, item.qty - 1, custom);
                    } else {
                        window.CartSystem.toggleCart(id, color, custom);
                    }
                    render();
                }
            };
        });
        document.querySelectorAll('.ci-remove').forEach(btn => {
            btn.onclick = (e) => {
                const id = btn.getAttribute('data-id');
                const color = btn.getAttribute('data-color') || null;
                const custom = btn.getAttribute('data-custom') === 'true';
                window.CartSystem.toggleCart(id, color, custom);
                render();
            };
        });
    }
    
    render();
    
    // sync changes from other tabs
    window.addEventListener('storage', () => {
        render();
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.querySelector('.cs-checkout-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', () => {
            if (window.CartSystem.getCart().length === 0) {
                alert("Корзина пуста");
                return;
            }
            window.location.href = 'request.html?type=cart';
        });
    }
});
