/* =====================================================================
   SERVERHUB — shared front-end logic
===================================================================== */
(function(){

  const NAV_LINKS = [
    { href:"distribution.html", label:"IT Distribution" },
    { href:"asset-disposition.html", label:"IT Asset Disposition" },
    { href:"contact.html", label:"Contact" },
    { href:"about.html", label:"About" }
  ];
  const currentPage = (window.location.pathname.split("/").pop() || "index.html");

  function headerHTML(){
    const links = NAV_LINKS.map(l=>{
      const current = l.href === currentPage ? ' aria-current="page"' : '';
      return `<a href="${l.href}"${current}>${l.label}</a>`;
    }).join("");
    return `
    <div class="container header-row">
      <a href="index.html" class="brand"><span class="mark"><i class="fa-solid fa-server"></i></span> ServerHub</a>
      <nav class="main-nav" id="mainNav">${links}</nav>
      <div class="header-actions">
        <a href="contact.html" class="btn btn-primary">Place an Order</a>
        <button class="burger" id="openDrawer" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="drawer" id="drawer">
      <div class="drawer-overlay" data-close-drawer></div>
      <div class="drawer-panel">
        <div class="drawer-top">
          <a href="index.html" class="brand" style="font-size:12px;"><span class="mark"><i class="fa-solid fa-server"></i></span> ServerHub</a>
          <button class="drawer-close" data-close-drawer><i class="fa-solid fa-xmark"></i></button>
        </div>
        <nav class="drawer-nav">
          <a href="index.html">Home</a>
          ${NAV_LINKS.map(l=>`<a href="${l.href}">${l.label}</a>`).join("")}
        </nav>
        <div style="margin-top:22px;">
          <a href="contact.html" class="btn btn-primary btn-block">Place an Order</a>
        </div>
      </div>
    </div>`;
  }

  function footerHTML(){
    const y = new Date().getFullYear();
    return `
    <div class="container footer-grid">
      <div>
        <div class="footer-brand">ServerHub</div>
        <p>Delivering enterprise IT hardware &amp; support from the world's leading brands — servers, storage, and networking, sourced and shipped fast.</p>
      </div>
      <div>
        <h4>Navigation</h4>
        <ul>
          <li><a href="distribution.html">IT Distribution</a></li>
          <li><a href="asset-disposition.html">IT Asset Disposition</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="about.html">About</a></li>
        </ul>
      </div>
      <div>
        <h4>Get In Touch</h4>
        <ul>
          <li class="contact-line"><i class="fa-solid fa-envelope"></i> <a href="mailto:sales@serverhub-demo.com">sales@serverhub-demo.com</a></li>
          <li class="contact-line"><i class="fa-solid fa-phone"></i> <a href="tel:+18005550199">(800) 555-0199</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">&copy; ${y} ServerHub. Demo site for presentation purposes only.</div>`;
  }

  function injectChrome(){
    const h = document.querySelector('[data-site-header]');
    const f = document.querySelector('[data-site-footer]');
    if(h) h.innerHTML = headerHTML();
    if(f) f.innerHTML = footerHTML();
  }

  function initDrawer(){
    const drawer = document.getElementById('drawer');
    const burger = document.getElementById('openDrawer');
    if(!drawer || !burger) return;
    burger.addEventListener('click', ()=>{ drawer.classList.add('open'); document.body.style.overflow='hidden'; });
    drawer.querySelectorAll('[data-close-drawer]').forEach(el=> el.addEventListener('click', ()=>{
      drawer.classList.remove('open'); document.body.style.overflow='';
    }));
  }

  /* ---------------- Toast ---------------- */
  function showToast(msg){
    let t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${msg}</span>`;
    requestAnimationFrame(()=> t.classList.add('show'));
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(()=> t.classList.remove('show'), 2800);
  }
  window.SH_TOAST = showToast;

  /* ---------------- Form validation + fake submit ---------------- */
  function validateAndSubmit(form, successMsg){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[data-required]').forEach(field=>{
        const row = field.closest('.frow');
        const val = field.value.trim();
        let ok = val.length > 0;
        if(field.type === 'email') ok = /^\S+@\S+\.\S+$/.test(val);
        row.classList.toggle('invalid', !ok);
        field.classList.toggle('invalid', !ok);
        if(!ok) valid = false;
      });
      if(!valid) return;
      const btn = form.querySelector('button[type=submit]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
      setTimeout(()=>{
        btn.disabled = false;
        btn.innerHTML = original;
        form.reset();
        showToast(successMsg);
      }, 900);
    });
  }

  /* ---------------- Stat counters ---------------- */
  function initCounters(){
    const counters = document.querySelectorAll('[data-count]');
    if(!counters.length || !('IntersectionObserver' in window)){
      counters.forEach(el=> el.textContent = el.dataset.count);
      return;
    }
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const speed = Math.max(1, target/60);
        let count = 0;
        (function step(){
          count += speed;
          if(count >= target){ el.textContent = target.toLocaleString() + suffix; }
          else { el.textContent = Math.floor(count).toLocaleString() + suffix; requestAnimationFrame(step); }
        })();
        obs.unobserve(el);
      });
    }, { threshold:.4 });
    counters.forEach(c=> obs.observe(c));
  }

  /* ---------------- Init ---------------- */
  function safe(fn,label){ try{ fn(); }catch(e){ console.error('SH init error in '+label+':', e); } }
  document.addEventListener('DOMContentLoaded', function(){
    safe(injectChrome, 'injectChrome');
    safe(initDrawer, 'initDrawer');
    safe(initCounters, 'initCounters');

    document.querySelectorAll('.contact-form').forEach(f=> validateAndSubmit(f, 'Message sent — our team will reply shortly.'));
    document.querySelectorAll('.asset-form').forEach(f=> validateAndSubmit(f, 'Request received — an asset disposition specialist will follow up shortly.'));
  });

})();
