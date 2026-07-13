with open('assets/js/product.js', 'r', encoding='utf-8') as f:
    js = f.read()

if 'console.log("PRODUCT JS LOADED");' not in js:
    js = 'console.log("PRODUCT JS LOADED! productId =", new URLSearchParams(window.location.search).get("product"));\n' + js
    with open('assets/js/product.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Injected console logging")
else:
    print("Already injected")
