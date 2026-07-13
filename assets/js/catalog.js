// --- CATALOG LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('catalogGrid');
    const sortBtn = document.getElementById('sortBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const filterBtn = document.getElementById('filterBtn');
    const filterDrawer = document.getElementById('filterDrawer');
    const filterOverlay = document.getElementById('filterOverlay');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const collectionFiltersContainer = document.getElementById('collectionFilters');

    // State
    let currentSort = 'price-asc'; // default
    let activeFilters = {
        collections: [], // empty means all
        categories: [],  // empty means all
        minPrice: 0,
        maxPrice: 5000000,
        searchQuery: ''
    };

    // SEARCH LOGIC
    const searchInput = document.getElementById('catalogSearchInput');
    const searchClear = document.getElementById('catalogSearchClear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.searchQuery = e.target.value.trim().toLowerCase();

            // Show/hide clear button
            if (activeFilters.searchQuery.length > 0) {
                searchClear.classList.add('visible');
            } else {
                searchClear.classList.remove('visible');
            }

            renderGrid();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            activeFilters.searchQuery = '';
            searchClear.classList.remove('visible');
            renderGrid();
            searchInput.focus();
        });
    }

    // Helper - sync all cat checkboxes from activeFilters.categories
    function syncCatCheckboxes() {
        document.querySelectorAll('.cat-checkbox').forEach(cb => {
            cb.checked = activeFilters.categories.includes(cb.value);
            if (cb.parentElement) {
                cb.parentElement.classList.toggle('active', cb.checked);
            }
        });
        // Highlight group heads if all/some cats in that group are selected
        document.querySelectorAll('.cat-group-link').forEach(el => {
            const cats = el.getAttribute('data-cats').split(',').map(s => s.trim());
            const allSelected = cats.every(c => activeFilters.categories.includes(c));
            el.classList.toggle('active', allSelected);
        });
    }

    // 1. Используем itemsDB напрямую.
    let productsArray = itemsDB;

    // 2. Генерация фильтров коллекций — берём все 16 из COLLECTIONS_METADATA
    //    (не из itemsDB, иначе коллекции без товаров не появятся в фильтре)
    const collectionNames = (typeof COLLECTIONS_METADATA !== 'undefined')
        ? Object.keys(COLLECTIONS_METADATA)
        : [...new Set(itemsDB.map(p => p.collection))].filter(Boolean);

    collectionNames.forEach(col => {
        const label = document.createElement('label');
        label.className = 'custom-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${col}" class="collection-checkbox">
            <span class="checkmark"></span>
            ${col}
        `;
        collectionFiltersContainer.appendChild(label);
    });

    // ---- Individual subcategory checkboxes ----
    document.querySelectorAll('.cat-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                activeFilters.categories = [cb.value];
            } else {
                activeFilters.categories = [];
            }
            syncCatCheckboxes();
            renderGrid();
        });
    });

    // ---- Group header click: select/deselect all in group ----
    document.querySelectorAll('.cat-group-link').forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', (e) => {
            // Don't bubble to sub-accordion toggle
            e.stopPropagation();
            const cats = e.currentTarget.getAttribute('data-cats').split(',').map(s => s.trim());
            const allActive = cats.every(c => activeFilters.categories.includes(c));
            if (allActive) {
                activeFilters.categories = [];
            } else {
                activeFilters.categories = [...cats];
            }
            syncCatCheckboxes();
            renderGrid();
        });
    });

    // Room checkboxes removed

    // ---- Top-level accordion (Коллекции / Цена) — свёрнуты по умолчанию ----
    document.querySelectorAll('.filter-accordion-head').forEach(head => {
        head.style.cursor = 'pointer';
        const id = head.getAttribute('data-acc');
        const body = document.getElementById('acc-' + id);
        const OPEN_HEIGHT = '2000px';
        if (body) {
            body.style.overflow = 'hidden';
            body.style.transition = 'max-height 0.4s ease';
            // Всё свёрнуто по умолчанию
            body.style.maxHeight = '0px';
        }
        head.addEventListener('click', () => {
            if (!body) return;
            const isOpen = body.style.maxHeight !== '0px';
            body.style.maxHeight = isOpen ? '0px' : OPEN_HEIGHT;
            head.querySelector('.acc-arrow')?.classList.toggle('rotated', !isOpen);
        });
    });


    // Sub-group accordion logic removed since categories are now out of the drawer and always visible.

    // 3. Открытие / закрытие дропдауна сортировки
    sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('active');
    });

    // Закрываем при клике вне
    document.addEventListener('click', (e) => {
        if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.remove('active');
        }
    });

    // Обработка выбора сортировки
    const sortOptions = document.querySelectorAll('.sort-option');
    sortOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            // Убираем active у всех
            sortOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            // Запоминаем текущую
            currentSort = opt.getAttribute('data-sort');

            // Текст на кнопке менять не обязательно, или можно менять
            // sortBtn.childNodes[0].nodeValue = opt.innerText + ' ';

            sortDropdown.classList.remove('active');
            renderGrid();
        });
    });

    // 4. Открытие / закрытие фильтров
    function openFilters() {
        filterDrawer.classList.add('active');
        filterOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeFilters() {
        filterDrawer.classList.remove('active');
        filterOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    filterBtn.addEventListener('click', openFilters);
    closeFilterBtn.addEventListener('click', closeFilters);
    filterOverlay.addEventListener('click', closeFilters);

    // Применение фильтров
    applyFilterBtn.addEventListener('click', () => {
        // Собрать выбранные коллекции
        const checkboxes = document.querySelectorAll('.collection-checkbox:checked');
        activeFilters.collections = Array.from(checkboxes).map(cb => cb.value);

        activeFilters.minPrice = parseInt(minInput.value) || computedMinPrice;
        activeFilters.maxPrice = parseInt(maxInput.value) || computedMaxPrice;

        closeFilters();
        renderGrid();
    });

    // Сброс фильтров
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            // Сброс коллекций
            document.querySelectorAll('.collection-checkbox').forEach(cb => cb.checked = false);
            activeFilters.collections = [];

            // Сброс категорий
            activeFilters.categories = [];
            syncCatCheckboxes();

            // Сброс цены
            activeFilters.minPrice = computedMinPrice;
            activeFilters.maxPrice = computedMaxPrice;
            if (minRange) minRange.value = computedMinPrice;
            if (maxRange) maxRange.value = computedMaxPrice;
            if (minInput) minInput.value = computedMinPrice;
            if (maxInput) maxInput.value = computedMaxPrice;
            syncPrice('range');

            renderGrid();
        });
    }


    // --- ПРАЙС СЛАЙДЕР ЛОГИКА ---
    const minInput = document.getElementById('minPriceInput');
    const maxInput = document.getElementById('maxPriceInput');
    const minRange = document.getElementById('minPriceRange');
    const maxRange = document.getElementById('maxPriceRange');

    let computedMinPrice = 0;
    let computedMaxPrice = 5000000;

    if (productsArray && productsArray.length > 0) {
        let prices = productsArray.map(p => parseFloat(p.priceValue) || 0);
        computedMinPrice = Math.min(...prices);
        computedMaxPrice = Math.max(...prices);
    }

    if (computedMinPrice === computedMaxPrice) {
        computedMinPrice = 0;
        computedMaxPrice = computedMaxPrice > 0 ? computedMaxPrice * 2 : 100000;
    }

    // Set DOM elements attributes
    if (minRange) { minRange.min = computedMinPrice; minRange.max = computedMaxPrice; minRange.value = computedMinPrice; }
    if (maxRange) { maxRange.min = computedMinPrice; maxRange.max = computedMaxPrice; maxRange.value = computedMaxPrice; }
    if (minInput) { minInput.min = computedMinPrice; minInput.max = computedMaxPrice; minInput.value = computedMinPrice; }
    if (maxInput) { maxInput.min = computedMinPrice; maxInput.max = computedMaxPrice; maxInput.value = computedMaxPrice; }

    activeFilters.minPrice = computedMinPrice;
    activeFilters.maxPrice = computedMaxPrice;

    const rangeTrack = document.querySelector('.range-track');

    function syncPrice(source, event) {
        let minVal = parseInt(minRange.value);
        let maxVal = parseInt(maxRange.value);
        let gap = Math.floor((computedMaxPrice - computedMinPrice) * 0.05);
        if (gap < 10) gap = 10;

        if (source === 'range') {
            if (minVal > maxVal - gap) {
                if (event && event.target && event.target.id === 'minPriceRange') {
                    minRange.value = maxVal - gap;
                    minVal = maxVal - gap;
                } else if (event && event.target && event.target.id === 'maxPriceRange') {
                    maxRange.value = minVal + gap;
                    maxVal = minVal + gap;
                } else {
                    minRange.value = maxVal - gap;
                    minVal = maxVal - gap;
                }
            }
            minInput.value = minVal;
            maxInput.value = maxVal;
        } else {
            // from inputs
            minVal = parseInt(minInput.value);
            maxVal = parseInt(maxInput.value);
            if (isNaN(minVal)) minVal = computedMinPrice;
            if (isNaN(maxVal)) maxVal = computedMaxPrice;

            if (minVal > maxVal) { let tmp = minVal; minVal = maxVal; maxVal = tmp; }
            if (minVal < computedMinPrice) minVal = computedMinPrice;
            if (maxVal > computedMaxPrice) maxVal = computedMaxPrice;

            minRange.value = minVal;
            maxRange.value = maxVal;
        }

        activeFilters.minPrice = minVal;
        activeFilters.maxPrice = maxVal;

        if (rangeTrack) {
            const percent1 = computedMaxPrice === computedMinPrice ? 0 : ((minVal - computedMinPrice) / (computedMaxPrice - computedMinPrice)) * 100;
            const percent2 = computedMaxPrice === computedMinPrice ? 100 : ((maxVal - computedMinPrice) / (computedMaxPrice - computedMinPrice)) * 100;
            rangeTrack.style.background = `linear-gradient(to right, #e0dcd3 ${percent1}%, var(--gold, #C5A065) ${percent1}%, var(--gold, #C5A065) ${percent2}%, #e0dcd3 ${percent2}%)`;
        }
    }

    if (minRange) minRange.addEventListener('input', (event) => syncPrice('range', event));
    if (maxRange) maxRange.addEventListener('input', (event) => syncPrice('range', event));
    if (minInput) minInput.addEventListener('change', (event) => syncPrice('input', event));
    if (maxInput) maxInput.addEventListener('change', (event) => syncPrice('input', event));

    // Initialize track color
    syncPrice('range');


    // 5. Рендер сетки
    function renderGrid() {
        grid.innerHTML = '';

        // --- ФИЛЬТРАЦИЯ ---
        let filtered = productsArray.filter(p => {
            // Search query filter
            if (activeFilters.searchQuery) {
                const words = activeFilters.searchQuery.split(/\s+/).filter(w => w.length > 0);
                const allWordsMatch = words.every(word => {
                    const titleMatch = p.title.toLowerCase().includes(word);
                    const descMatch = p.description ? p.description.toLowerCase().includes(word) : false;
                    const collMatch = p.collection ? p.collection.toLowerCase().includes(word) : false;
                    const catMatch = p.categories ? p.categories.some(c => c.toLowerCase().includes(word)) : false;
                    const tagMatch = p.tags ? p.tags.some(t => t.toLowerCase().includes(word)) : false;
                    return titleMatch || descMatch || collMatch || catMatch || tagMatch;
                });

                if (!allWordsMatch) return false;
            }

            // Если выбран хоть один фильтр коллекции, проверяем
            if (activeFilters.collections.length > 0) {
                if (!p.collection) return false;
                // p.collection is like 'Luce', the checkboxes contain 'Luce'
                // the checkbox values from productsDB keys might be lowercase ('luce') or title case. Wait, in db.js productsDB keys are 'Diamante', 'Luce' - capital case.
                if (!activeFilters.collections.includes(p.collection)) return false;
            }

            if (activeFilters.categories.length > 0) {
                if (!p.categories) return false;
                // Pass if product has at least ONE matching category
                const match = activeFilters.categories.some(c => p.categories.includes(c));
                if (!match) return false;
            }

            if (p.priceValue < activeFilters.minPrice || p.priceValue > activeFilters.maxPrice) {
                return false;
            }

            return true;
        });

        // --- СОРТИРОВКА ---
        filtered.sort((a, b) => {
            if (currentSort === 'price-asc') return a.priceValue - b.priceValue;
            if (currentSort === 'price-desc') return b.priceValue - a.priceValue;
            if (currentSort === 'name-asc') return a.title.localeCompare(b.title);
            if (currentSort === 'name-desc') return b.title.localeCompare(a.title);
            return 0;
        });

        // --- ГЕНЕРАЦИЯ HTML ---
        if (filtered.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; font-family: Montserrat;">Ничего не найдено по вашему запросу.</p>';
            return;
        }

        filtered.forEach(p => {
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

        // Перепривязываем hover эффекты для кастомного курсора
        if (typeof window.bindHoverEvents === 'function') {
            window.bindHoverEvents();
        } else {
            // Простой fallback для курсора
            const circle = document.getElementById('circle');
            if (circle) {
                document.querySelectorAll('[data-hover]').forEach(el => {
                    el.addEventListener('mouseenter', () => circle.classList.add('is-hovering'));
                    el.addEventListener('mouseleave', () => circle.classList.remove('is-hovering'));
                });
            }
        }
    }

    // -----------------------------------------------
    // Handle ?cat= URL parameter from sidebar links
    // Maps group names to their subcategory arrays
    // -----------------------------------------------
    const CAT_GROUP_MAP = {
        'Хранение': [
            'Шкафы', 'Комоды', 'ТВ тумбы', 'Сейфы', 'Стеллажи', 'Книжные полки', 'Консоли',
            'Винные стеллажи', 'Гардеробные модули', 'Прямые гардеробы', 'Угловые гардеробы',
            'П-образные гардеробы', 'Гардеробы с островом', 'Гардеробные острова',
            'Прямые кухни', 'Угловые кухни', 'П-образные кухни', 'Кухни с островом', 'Кухонные острова'
        ],
        'Столы стулья': ['Обеденные столы', 'Стулья', 'Туалетные столики'],
        'Кровати диваны': ['Кровати', 'Диваны', 'Прикроватные тумбы'],
        'Декор': ['Зеркала', 'Ширмы', 'Декор'],
        'СПАЛЬНЯ': ['Кровати', 'Прикроватные тумбы', 'Туалетные столики'],
        'КУХНЯ и ВИНОТЕКА': ['Винные стеллажи', 'Прямые кухни', 'Угловые кухни', 'П-образные кухни', 'Кухни с островом', 'Кухонные острова'],
        'ГАРДЕРОБНАЯ и ПРИХОЖАЯ': ['Гардеробные модули', 'Прямые гардеробы', 'Угловые гардеробы', 'П-образные гардеробы', 'Гардеробы с островом', 'Гардеробные острова'],
        'ГОСТИНАЯ и БИБЛИОТЕКА': ['Стеллажи', 'Комоды', 'Консоли', 'Книжные полки']
    };

    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle ?cat=
    const catParam = urlParams.get('cat');
    if (catParam) {
        const decoded = decodeURIComponent(catParam);
        if (CAT_GROUP_MAP[decoded]) {
            activeFilters.categories = CAT_GROUP_MAP[decoded];
        } else {
            activeFilters.categories = [decoded];
        }
        syncCatCheckboxes();
    }

    // URL Params for Room removed

    // Handle ?collection=
    const collParam = urlParams.get('collection');
    if (collParam) {
        const decoded = decodeURIComponent(collParam);
        activeFilters.collections = [decoded];
        // Note: Collection checkboxes are generated dynamically, so we might need a small delay or check after they are created
        document.querySelectorAll('.collection-checkbox').forEach(cb => {
            if (cb.value === decoded) cb.checked = true;
        });
    }

    // Инициализация при загрузке
    renderGrid();
});
