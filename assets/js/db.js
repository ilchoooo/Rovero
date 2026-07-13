// --- БАЗА ДАННЫХ ---
// Этот файл — обёртка над catalog_data.js

// Цвета отделки (только справочно, выбор не показывается покупателю)
const colorsDB = [
    { name: 'Натуральный',       hex: '#E5D0B1' },
    { name: 'Венге',             hex: '#3E2F28' },
    { name: 'Херос',             hex: '#664A3A' },
    { name: 'Дымчато-серый',     hex: '#8C8C91' },
    { name: 'Белый лессирующий', hex: '#F4F1E8' }
];

// Основная база — берётся из catalog_data.js (ROVERO_CATALOG)
const itemsDB = typeof ROVERO_CATALOG !== 'undefined' ? ROVERO_CATALOG : [];

// productsDB — совместимость со старым кодом (product.js, cart.js и т.д.)
const productsDB = {};
itemsDB.forEach(item => {
    item.image = item.images && item.images[0] ? item.images[0] : '';  // главное фото
    item.desc  = item.description;                                       // псевдоним
    productsDB[item.id] = item;
});
