(function(){
  'use strict';
  const PRODUCTS = Array.isArray(window.BU_PRODUCTS) ? window.BU_PRODUCTS : [];
  const WA_NUMBER = '923044129971';
  const CART_KEY = 'bucreator-cart-v2';
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const numericPrice = value => { const n=parseFloat(String(value ?? '').replace(/[^0-9.]/g,'')); return Number.isFinite(n)?n:0; };
  const priceNote = value => { const m=String(value ?? '').match(/\(([^)]+)\)/); return m ? m[1] : ''; };
  const money = n => 'PKR ' + Math.round(Number(n)||0).toLocaleString('en-PK');
  const productTitle = p => p.title || p.name || 'BU Creator Product';
  const readCart = () => { try { const raw=JSON.parse(localStorage.getItem(CART_KEY) || localStorage.getItem('bucreator-cart') || '[]'); return Array.isArray(raw)?raw.filter(x=>x&&x.id&&Number(x.qty)>0).map(x=>({id:String(x.id),qty:Math.max(1,Number(x.qty)||1)})):[]; } catch(e){ return []; } };
  let cart = readCart();
  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const findProduct = id => PRODUCTS.find(p=>p.id===id);
  const getCategory = p => String(p?.id||'').toLowerCase().startsWith('bg-') ? 'Gajra & Bangles' : String(p?.id||'').toLowerCase().startsWith('ky-') ? 'Key Rings' : 'Bracelets';
  const toast = msg => { const el=$('#toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),1800); };

  function badgeFor(p,index=0){
    if (String(p.id).endsWith('001')) return ['Bestseller',''][0];
    if (index % 7 === 1) return 'New';
    if (index % 9 === 3) return 'Hot';
    if (index % 5 === 0) return 'Bestseller';
    return '';
  }

  function productCard(p,index=0){
    const price=numericPrice(p.price), note=priceNote(p.price), badge=badgeFor(p,index);
    return `<article class="product-card" data-product-id="${esc(p.id)}">
      ${badge?`<span class="product-badge ${badge.toLowerCase()}">${esc(badge)}</span>`:''}
      <a class="product-image-link" href="product-details.html?id=${encodeURIComponent(p.id)}">
        <div class="product-image-wrap"><img src="${esc(p.image)}" alt="${esc(productTitle(p))}" loading="lazy"></div>
      </a>
      <div class="product-info">
        <a href="product-details.html?id=${encodeURIComponent(p.id)}" class="product-name">${esc(productTitle(p))}</a>
        <div class="rating"><span class="stars">★★★★★</span><span>${(4.5+(index%5)*0.1).toFixed(1)} (${12+index%31})</span></div>
        <div class="product-price-row"><strong class="product-price">${money(price)}</strong>${note?`<span class="product-unit">${esc(note)}</span>`:''}</div>
        <div class="card-actions"><button class="add-btn" type="button" data-add="${esc(p.id)}"><i class="fa-solid fa-cart-shopping"></i> &nbsp;Add to Cart</button><a class="quick-view-btn" href="product-details.html?id=${encodeURIComponent(p.id)}" aria-label="View product"><i class="fa-solid fa-eye"></i></a></div>
      </div>
    </article>`;
  }

  function setCartCount(){
    const totalItems = cart.reduce((s,x)=>s+(x.qty||0),0);
    const el=$('#cartCount'); if(el) el.textContent=totalItems;
    const mobileCount=$('#mobileCartCount'); if(mobileCount) mobileCount.textContent=totalItems;
    const mobileQuick=$('#mobileQuickCart');
    const mobileQuickCount=$('#mobileQuickCartCount');
    const mobileQuickTotal=$('#mobileQuickCartTotal');
    if(mobileQuick){
      mobileQuick.classList.toggle('show', totalItems>0);
      if(mobileQuickCount) mobileQuickCount.textContent=totalItems + (totalItems===1?' item':' items');
      if(mobileQuickTotal) mobileQuickTotal.textContent=money(cartSubtotal());
    }
  }

  function initMobileExperience(){
    // Mobile bottom navigation and floating quick-cart were intentionally removed.
    // Keep only the regular header/cart count functionality on small screens.
    setCartCount();
  }

  function toggleMobileMenu(force){
    const nav=$('#mobileBottomNav');
    const main=$('#mainNav');
    if(!nav||!main) return;
    const open=typeof force==='boolean'?force:!main.classList.contains('open');
    main.classList.toggle('open',open);
    nav.classList.toggle('expanded',open);
    const button=$('#mobileMenuButton'); if(button) button.innerHTML=open?'<i class="fa-solid fa-xmark"></i><span>Close</span>':'<i class="fa-solid fa-bars"></i><span>Menu</span>' ;
  }

  function syncMobileActiveLink(){
    const current=location.pathname.split('/').pop() || 'index.html';
    $$('.mobile-bottom-link').forEach(a=>{
      if(a.tagName!=='A') return;
      const href=a.getAttribute('href')||'';
      a.classList.toggle('active', href===current || (current==='product-details.html'&&href==='shop.html') || (current==='cart.html'&&href==='shop.html'));
    });
  }
  function cartSubtotal(){ return cart.reduce((sum,item)=>{const p=findProduct(item.id);return sum+(p?numericPrice(p.price)*(item.qty||1):0)},0); }

  function renderDrawer(){
    setCartCount();
    const box=$('#cartItems'), total=$('#cartTotal');
    if(!box||!total) return;
    if(!cart.length){ box.innerHTML='<div class="cart-empty">Your cart is empty.<br>Explore our collections and add something you love.</div>'; total.textContent=money(0); }
    else{
      let html='';
      cart.forEach(item=>{ const p=findProduct(item.id); if(!p) return; const price=numericPrice(p.price);
        html+=`<div class="cart-line">
          <img src="${esc(p.image)}" alt="${esc(productTitle(p))}">
          <div><strong>${esc(productTitle(p))}</strong><span>${money(price)}${priceNote(p.price)?' · '+esc(priceNote(p.price)):''}</span>
          <div class="mini-actions"><div class="mini-qty"><button type="button" data-dec="${esc(p.id)}">−</button><span>${item.qty||1}</span><button type="button" data-inc="${esc(p.id)}">+</button></div><button class="cart-remove" type="button" data-remove="${esc(p.id)}" aria-label="Remove"><i class="fa-solid fa-trash"></i></button></div></div>
          <strong>${money(price*(item.qty||1))}</strong>
        </div>`;
      }); box.innerHTML=html; total.textContent=money(cartSubtotal());
    }
    const checkout=$('#drawerCheckout'); if(checkout) checkout.href=cart.length?'checkout.html':'shop.html';
  }

  function openCart(){ const d=$('#cartDrawer'),o=$('#drawerOverlay'); if(!d||!o)return; renderDrawer(); d.classList.add('open');o.classList.add('open');document.body.classList.add('no-scroll'); }
  function closeCart(){ const d=$('#cartDrawer'),o=$('#drawerOverlay'); if(!d||!o)return; d.classList.remove('open');o.classList.remove('open');document.body.classList.remove('no-scroll'); }

  function addToCart(id,qty=1){ const p=findProduct(id); if(!p)return; const found=cart.find(x=>x.id===id); if(found) found.qty+=qty; else cart.push({id,qty}); saveCart(); renderDrawer(); toast('Added to cart'); }
  function changeQty(id,delta){ const item=cart.find(x=>x.id===id); if(!item)return; item.qty=Math.max(1,item.qty+delta); saveCart(); renderDrawer(); }
  function removeFromCart(id){ cart=cart.filter(x=>x.id!==id); saveCart(); renderDrawer(); toast('Removed from cart'); }

  function renderProductGrid(container, products){ if(!container)return; container.innerHTML=products.map((p,i)=>productCard(p,i)).join(''); }

  function initHeroSlider(){
    const root=$('#heroSlider');
    if(!root) return;
    const slides=$$('.hero-slide',root);
    const dots=$$('.hero-dot',root);
    if(slides.length<2) return;
    let current=slides.findIndex(el=>el.classList.contains('active'));
    if(current<0) current=0;
    let timer=null;
    let touchStartX=0, touchStartY=0, touchLastX=0;
    let touchActive=false, swipeDetected=false;
    const SWIPE_THRESHOLD=42;

    const show=(index,manual=false)=>{
      current=(index+slides.length)%slides.length;
      slides.forEach((slide,i)=>slide.classList.toggle('active',i===current));
      dots.forEach((dot,i)=>{
        const active=i===current;
        dot.classList.toggle('active',active);
        dot.setAttribute('aria-selected',active?'true':'false');
      });
      if(manual) restart();
    };
    const restart=()=>{
      clearInterval(timer);
      timer=setInterval(()=>show(current+1,false),5000);
    };

    dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i,true)));

    // Mobile swipe: left/right finger gesture changes the hero slide.
    root.style.touchAction='pan-y';
    root.addEventListener('touchstart',e=>{
      if(!e.touches || !e.touches[0]) return;
      const t=e.touches[0];
      touchStartX=touchLastX=t.clientX;
      touchStartY=t.clientY;
      touchActive=true;
      swipeDetected=false;
      clearInterval(timer);
    },{passive:true});

    root.addEventListener('touchmove',e=>{
      if(!touchActive || !e.touches || !e.touches[0]) return;
      const t=e.touches[0];
      touchLastX=t.clientX;
      const dx=t.clientX-touchStartX;
      const dy=t.clientY-touchStartY;
      // Only treat a mostly-horizontal gesture as a slider swipe.
      if(Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.15){
        swipeDetected=true;
      }
    },{passive:true});

    root.addEventListener('touchend',()=>{
      if(!touchActive) return;
      const dx=touchLastX-touchStartX;
      if(Math.abs(dx)>=SWIPE_THRESHOLD && swipeDetected){
        // Swipe left = next, swipe right = previous.
        show(current+(dx<0?1:-1),true);
      } else {
        restart();
      }
      touchActive=false;
    },{passive:true});

    root.addEventListener('touchcancel',()=>{
      touchActive=false;
      swipeDetected=false;
      restart();
    },{passive:true});

    // Prevent the anchor click that follows a swipe from navigating away.
    root.addEventListener('click',e=>{
      if(swipeDetected){
        e.preventDefault();
        e.stopPropagation();
        swipeDetected=false;
      }
    },true);

    root.addEventListener('mouseenter',()=>clearInterval(timer));
    root.addEventListener('mouseleave',restart);
    root.addEventListener('focusin',()=>clearInterval(timer));
    root.addEventListener('focusout',()=>{ setTimeout(()=>{ if(!root.contains(document.activeElement)) restart(); },0); });
    show(current,false);
    restart();
  }

  function initStatic(){
    document.body.addEventListener('click', e=>{
      const add=e.target.closest('[data-add]'); if(add){ e.preventDefault(); e.stopPropagation(); addToCart(add.dataset.add); return; }
      const inc=e.target.closest('[data-inc]'); if(inc){e.preventDefault();changeQty(inc.dataset.inc,1);return;}
      const dec=e.target.closest('[data-dec]'); if(dec){e.preventDefault();changeQty(dec.dataset.dec,-1);return;}
      const rem=e.target.closest('[data-remove]'); if(rem){e.preventDefault();removeFromCart(rem.dataset.remove);return;}
      const open=e.target.closest('#cartButton'); if(open){e.preventDefault();openCart();return;}
      const close=e.target.closest('#closeCart'); if(close){e.preventDefault();closeCart();return;}
      const overlay=e.target.closest('#drawerOverlay'); if(overlay){closeCart();return;}
      const search=e.target.closest('#searchButton'); if(search){e.preventDefault();openSearch();return;}
      const closeSearchBtn=e.target.closest('#closeSearch'); if(closeSearchBtn){e.preventDefault();closeSearch();return;}
    });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeCart(); closeSearch(); } });

    const menu=$('#menuToggle'), nav=$('#mainNav');
    if(menu&&nav){ menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false');menu.innerHTML=open?'<i class="fa-solid fa-xmark"></i>':'<i class="fa-solid fa-bars"></i>'; toggleMobileMenu(open);}); }
    $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open'); if(menu){menu.setAttribute('aria-expanded','false');menu.innerHTML='<i class="fa-solid fa-bars"></i>';} toggleMobileMenu(false);}));

    const form=$('#subscribeForm'); if(form) form.addEventListener('submit',e=>{e.preventDefault();const input=form.querySelector('input'); if(input){input.value=''; toast('Thanks for subscribing');}});
    $$('.faq-question').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.faq-item').classList.toggle('open')));
    setCartCount();
    const current=location.pathname.split('/').pop() || 'index.html'; const page=document.body?.dataset.page; $$('#mainNav a').forEach(a=>{ const href=a.getAttribute('href')||''; const nav=a.dataset.nav; const isHome=current==='index.html'&&href==='index.html'; const isShop=page==='shop'&&href==='shop.html'; const isCat=page==='categories'&&href==='categories.html'; const isAbout=page==='about'&&href==='about.html'; const isContact=page==='contact'&&href==='contact.html'; a.classList.toggle('active',isHome||isShop||isCat||isAbout||isContact); });
  }

  let searchTimer;
  function openSearch(){const o=$('#searchOverlay');if(!o)return;o.classList.add('open');o.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');const i=$('#searchInput');if(i){i.value='';renderSearch('');setTimeout(()=>i.focus(),40)}}
  function closeSearch(){const o=$('#searchOverlay');if(!o)return;o.classList.remove('open');o.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
  function renderSearch(query){const box=$('#searchResults');if(!box)return;const q=query.trim().toLowerCase();const matches=(q?PRODUCTS.filter(p=>(productTitle(p)+' '+(p.description||'')+' '+getCategory(p)).toLowerCase().includes(q)):PRODUCTS.slice(0,7)).slice(0,10);box.innerHTML=matches.length?matches.map(p=>`<a class="search-result" href="product-details.html?id=${encodeURIComponent(p.id)}"><img src="${esc(p.image)}" alt=""><div><strong>${esc(productTitle(p))}</strong><span>${money(numericPrice(p.price))} · ${esc(getCategory(p))}</span></div></a>`).join(''):'<div class="cart-empty">No matching products.</div>';}
  function initSearch(){const i=$('#searchInput'),o=$('#searchOverlay'); if(!i||!o)return;i.addEventListener('input',e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>renderSearch(e.target.value),80);});o.addEventListener('click',e=>{if(e.target===o)closeSearch();});}

  document.addEventListener('DOMContentLoaded',()=>{ initStatic(); initSearch(); initMobileExperience(); initHeroSlider(); });
  window.BUCreator={PRODUCTS,CART_KEY,WA_NUMBER,numericPrice,priceNote,money,productTitle,getCategory,readCart:()=>cart,addToCart,changeQty,removeFromCart,renderProductGrid,renderDrawer,toast};
})();
