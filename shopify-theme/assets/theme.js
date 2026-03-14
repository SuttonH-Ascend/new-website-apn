/* ============================================================
   APN THEME — GLOBAL JAVASCRIPT
   Ascend Performance Nutrition
   ============================================================ */

var APN = APN || {};

/* ── CART ─────────────────────────────────────────────────── */
APN.cart = {
  open: function() {
    APN.refreshCart();
    document.getElementById('cart-drawer').style.transform = 'translateX(0)';
    document.getElementById('cart-overlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
  },
  close: function() {
    document.getElementById('cart-drawer').style.transform = 'translateX(100%)';
    document.getElementById('cart-overlay').style.display = 'none';
    document.body.style.overflow = '';
  }
};

APN.openCart  = function() { APN.cart.open(); };
APN.closeCart = function() { APN.cart.close(); };

APN.refreshCart = function() {
  fetch('/cart.js')
    .then(function(r) { return r.json(); })
    .then(function(cart) {
      var badge = document.getElementById('apn-cart-badge');
      var label = document.getElementById('cart-count-label');
      var items = document.getElementById('cart-items');
      var sub   = document.getElementById('cart-subtotal');

      if (badge) badge.textContent = cart.item_count;
      if (label) label.textContent = '(' + cart.item_count + ')';
      if (sub)   sub.textContent   = APN.formatMoney(cart.total_price);

      if (!items) return;
      if (cart.item_count === 0) {
        items.innerHTML = '<p style="text-align:center;color:#6B7280;padding:2rem 0;font-size:0.9375rem;">Your cart is empty.</p>';
        return;
      }

      items.innerHTML = cart.items.map(function(item) {
        return '<div style="display:flex;gap:1rem;padding-bottom:1.25rem;border-bottom:1px solid #E2E8F0;margin-bottom:1.25rem;">' +
          (item.image ? '<img src="' + item.image + '" alt="' + item.title + '" style="width:72px;height:72px;object-fit:contain;border-radius:6px;border:1px solid #E2E8F0;" />' : '') +
          '<div style="flex:1;min-width:0;">' +
            '<p style="font-family:\'Barlow\',sans-serif;font-weight:600;font-size:0.875rem;color:#0D0D0D;margin:0 0 0.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + item.product_title + '</p>' +
            (item.variant_title && item.variant_title !== 'Default Title' ? '<p style="font-size:0.8125rem;color:#6B7280;margin:0 0 0.5rem;">' + item.variant_title + '</p>' : '') +
            '<div style="display:flex;align-items:center;justify-content:space-between;">' +
              '<div style="display:flex;align-items:center;gap:0.5rem;">' +
                '<button onclick="APN.updateQty(' + item.key + ',' + (item.quantity - 1) + ')" style="width:24px;height:24px;border:1px solid #E2E8F0;background:#fff;border-radius:4px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;" aria-label="Decrease quantity">−</button>' +
                '<span style="font-size:0.875rem;font-weight:600;min-width:20px;text-align:center;">' + item.quantity + '</span>' +
                '<button onclick="APN.updateQty(' + item.key + ',' + (item.quantity + 1) + ')" style="width:24px;height:24px;border:1px solid #E2E8F0;background:#fff;border-radius:4px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<span style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:0.9375rem;color:#0D0D0D;">' + APN.formatMoney(item.final_line_price) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    });
};

APN.addToCart = function(variantId, quantity, btn) {
  quantity = quantity || 1;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Adding…';
  }
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: quantity })
  })
  .then(function(r) { return r.json(); })
  .then(function() {
    APN.refreshCart();
    APN.cart.open();
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Added!';
      setTimeout(function() { btn.textContent = 'Add to Cart'; }, 2000);
    }
  })
  .catch(function(err) {
    console.error('Cart error:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Add to Cart'; }
  });
};

APN.updateQty = function(key, qty) {
  if (qty < 1) {
    APN.removeItem(key);
    return;
  }
  var updates = {};
  updates[key] = qty;
  fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: updates })
  })
  .then(function() { APN.refreshCart(); });
};

APN.removeItem = function(key) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: 0 })
  })
  .then(function() { APN.refreshCart(); });
};

APN.formatMoney = function(cents) {
  return '$' + (cents / 100).toFixed(2);
};

/* ── MOBILE MENU ──────────────────────────────────────────── */
APN.toggleMenu = function() {
  var menu = document.getElementById('apn-mobile-menu');
  var btn  = document.getElementById('apn-hamburger');
  if (!menu) return;
  var open = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
};

APN.closeMenu = function() {
  var menu = document.getElementById('apn-mobile-menu');
  var btn  = document.getElementById('apn-hamburger');
  if (!menu) return;
  menu.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

/* ── FADE-UP OBSERVER ─────────────────────────────────────── */
APN.initFadeUp = function() {
  if (!window.IntersectionObserver) return;
  var els = document.querySelectorAll('.apn-fade-up');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function(el) { io.observe(el); });
};

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  APN.refreshCart();
  APN.initFadeUp();
});
