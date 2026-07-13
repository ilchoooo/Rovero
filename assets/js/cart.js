// --- CART & FAVORITES LOGIC ---

window.CartSystem = {
    getCart: function() {
        return JSON.parse(localStorage.getItem('rovero_cart_obj') || '[]');
    },
    getFavs: function() {
        return JSON.parse(localStorage.getItem('rovero_favs') || '[]');
    },
    saveCart: function(cart) {
        localStorage.setItem('rovero_cart_obj', JSON.stringify(cart));
        this.updateBadges();
    },
    saveFavs: function(favs) {
        localStorage.setItem('rovero_favs', JSON.stringify(favs));
        this.updateBadges();
    },
    
    showNotification: function(text) {
        let toast = document.getElementById('rovero-global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'rovero-global-toast';
            toast.className = 'rovero-global-toast';
            document.body.appendChild(toast);
        }
        
        // Ensure reset state
        toast.classList.remove('visible');
        toast.innerText = text;
        
        // Double requestAnimationFrame is a reliable way to trigger transitions on new elements
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('visible');
            });
        });
        
        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    },
    
    // Core actions
    // toggleCart now handles objects {id: '...', color: '...', qty: 1}
    toggleCart: function(itemId, color = null, custom = false) {
        let cart = this.getCart();
        const existing = cart.find(x => x.id === itemId && x.color === color && !!x.custom === !!custom);
        if (existing) {
            cart = cart.filter(x => !(x.id === itemId && x.color === color && !!x.custom === !!custom));
            this.showNotification('Товар удален из корзины');
        } else {
            cart.push({id: itemId, color: color, qty: 1, custom: !!custom});
            this.showNotification('Товар добавлен в корзину');
        }
        this.saveCart(cart);
        return !existing;
    },
    updateQuantity: function(itemId, color, newQty, custom = false) {
        let cart = this.getCart();
        const existing = cart.find(x => x.id === itemId && x.color === color && !!x.custom === !!custom);
        if (existing) {
            if (newQty <= 0) {
                cart = cart.filter(x => !(x.id === itemId && x.color === color && !!x.custom === !!custom));
                this.showNotification('Товар удален из корзины');
            } else {
                existing.qty = newQty;
            }
            this.saveCart(cart);
        }
    },
    toggleFav: function(itemId) {
        let favs = this.getFavs();
        const exists = favs.includes(itemId);
        if (exists) {
            favs = favs.filter(id => id !== itemId);
            this.showNotification('Товар удален из избранного');
        } else {
            favs.push(itemId);
            this.showNotification('Товар добавлен в избранное');
        }
        this.saveFavs(favs);
        return !exists;
    },
    
    // Check states
    isInCart: function(itemId, color = null, custom = null) {
        return this.getCart().some(x => {
            const matchId = x.id === itemId;
            const matchColor = (color === null || color === undefined) || x.color === color;
            const matchCustom = (custom === null || custom === undefined) || (!!x.custom === !!custom);
            return matchId && matchColor && matchCustom;
        });
    },
    isFav: function(itemId) {
        return this.getFavs().includes(itemId);
    },
    setItemQuantity: function(itemId, color, qty, custom = false) {
        let cart = this.getCart();
        const existing = cart.find(x => x.id === itemId && x.color === color && !!x.custom === !!custom);
        if (existing) {
            existing.qty = qty;
            this.saveCart(cart);
        }
    },
    
    // UI Helpers
    updateBadges: function() {
        // total distinct items
        const cartLen = this.getCart().length;
        const favLen = this.getFavs().length;
        
        document.querySelectorAll('.cart-badge').forEach(el => {
            if (cartLen > 0) {
                el.innerText = cartLen;
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });

        document.querySelectorAll('.fav-badge').forEach(el => {
            if (favLen > 0) {
                el.innerText = favLen;
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }
};

// Migrate old standard array to objects if needed
try {
    let old = localStorage.getItem('rovero_cart');
    if (old && !localStorage.getItem('rovero_cart_obj')) {
        let arr = JSON.parse(old);
        let objArr = arr.map(i => ({id: i, qty: 1}));
        localStorage.setItem('rovero_cart_obj', JSON.stringify(objArr));
    }
} catch (e) {}

// Update badges on load
document.addEventListener('DOMContentLoaded', () => {
    window.CartSystem.updateBadges();
});

// --- GLOBAL CARD ACTIONS ---
window.toggleProductCart = function(button) {
    const productId = button.getAttribute('data-id');
    if (!window.CartSystem) return;
    const added = window.CartSystem.toggleCart(productId);
    
    // Update all matching hover buttons on the page
    document.querySelectorAll(`.card-hover-btn[data-id="${productId}"]`).forEach(btn => {
        if (added) {
            btn.classList.add('in-cart');
            btn.innerText = 'В корзине';
        } else {
            btn.classList.remove('in-cart');
            btn.innerText = 'Добавить в корзину';
        }
    });
};

window.toggleProductFav = function(button) {
    const productId = button.getAttribute('data-id');
    if (!window.CartSystem) return;
    const added = window.CartSystem.toggleFav(productId);
    
    // Update all matching fav icons on the page
    document.querySelectorAll(`.card-fav-icon[data-id="${productId}"]`).forEach(btn => {
        if (added) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};
