// Premium HTML Generator - $10,000+ Quality Websites

const INDUSTRY_IMAGES = {
  'Roofing': 'photo-1632778149955-e80f8ceca2e8',
  'HVAC': 'photo-1621905252472-178c8d6890b4',
  'Plumbing': 'photo-1607472586893-edb57bdc0e39',
  'Electrical': 'photo-1621905251189-08b45d6a269e',
  'Landscaping': 'photo-1558904541-efa843a96f01',
  'Painting': 'photo-1562259949-e8e7689d7828',
  'Flooring': 'photo-1600585152915-d208bec867a1',
  'Windows & Doors': 'photo-1545259741-2ea3ebf61fa3',
  'Solar': 'photo-1509391366360-2e959784a276',
  'General Contracting': 'photo-1504307651254-35680f356dfd',
  'Pool Services': 'photo-1600585152220-90363fe7e115',
  'Pest Control': 'photo-1558618666-fcd25c85cd64'
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substr(0, 2), 16),
    g: parseInt(clean.substr(2, 2), 16),
    b: parseInt(clean.substr(4, 2), 16)
  };
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getReadableColor(bgHex) {
  const lum = getLuminance(bgHex);
  return lum > 0.5 ? '#0c0c0c' : '#ffffff';
}

function rgbaFromHex(hex, alpha) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function generateHTML({ business, services, brand, aiContent }) {
  const primaryColor = brand.primary || '#2c5f4f';
  const secondaryColor = brand.secondary || '#f0c419';
  const heroImage = brand.hero || `https://images.unsplash.com/${INDUSTRY_IMAGES[business.type] || INDUSTRY_IMAGES['General Contracting']}?w=1920&q=80&fit=crop`;
  
  const primaryText = getReadableColor(primaryColor);
  const phoneClean = business.phone.replace(/\D/g, '');
  const phoneDisplay = business.phone;
  
  const servicesHtml = services.map((s, i) => `
    <div class="service-card" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="service-icon">${i + 1}</div>
      <h3>${s}</h3>
      <p>${aiContent.serviceDescriptions[s] || 'Professional ' + s.toLowerCase() + ' services with guaranteed satisfaction.'}</p>
      <a href="tel:${phoneClean}" class="service-link">Get Quote →</a>
    </div>
  `).join('');

  const galleryHtml = brand.photos && brand.photos.length > 0 ? `
    <section class="gallery" id="gallery">
      <div class="container">
        <h2 class="section-title" data-aos="fade-up">Our Work</h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="100">See the quality and craftsmanship we bring to every project</p>
        <div class="gallery-grid">
          ${brand.photos.slice(0, 6).map((photo, i) => `
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="${i * 100}">
              <img src="${photo}" alt="Project ${i + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${aiContent.seoTitle || business.name + ' | ' + business.type + ' in ' + business.city + ', ' + business.state}</title>
  <meta name="description" content="${aiContent.seoDesc || aiContent.metaDescription || ''}">
  <meta name="keywords" content="${aiContent.seoKeywords || business.type + ', ' + business.city + ' ' + business.type + ', ' + services.join(', ') + ', ' + business.state + ' ' + business.type}">
  
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  
  <style>
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --primary-rgb: ${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b};
      --text: #1a1a1a;
      --gray: #666;
      --light-gray: #f8f9fa;
      --white: #ffffff;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: var(--text);
      overflow-x: hidden;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      z-index: 1000;
      transition: all 0.3s;
    }
    
    nav.scrolled {
      padding: 0.5rem 0;
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo-img {
      height: 50px;
      width: auto;
      object-fit: contain;
      mix-blend-mode: multiply;
    }
    
    .nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    
    .nav-links a {
      text-decoration: none;
      color: var(--text);
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .nav-links a:hover {
      color: var(--primary);
    }
    
    .nav-cta {
      background: var(--primary);
      color: ${primaryText};
      padding: 0.9rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
    }
    
    .nav-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(var(--primary-rgb), 0.4);
    }
    
    /* Hero */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('${heroImage}') center/cover;
      color: white;
      padding-top: 80px;
    }
    
    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 800px;
    }
    
    .hero-badge {
      display: inline-block;
      background: var(--secondary);
      color: #0c0c0c;
      padding: 0.6rem 1.5rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .hero h1 {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 800;
      margin-bottom: 1.5rem;
      line-height: 1.1;
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    
    .hero p {
      font-size: clamp(1.1rem, 2vw, 1.4rem);
      margin-bottom: 3rem;
      opacity: 0.95;
      line-height: 1.6;
    }
    
    .hero-ctas {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    
    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 50px;
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    
    .btn-primary {
      background: var(--primary);
      color: ${primaryText};
      box-shadow: 0 8px 30px rgba(var(--primary-rgb), 0.4);
    }
    
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(var(--primary-rgb), 0.5);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-color: white;
      backdrop-filter: blur(10px);
    }
    
    .btn-secondary:hover {
      background: white;
      color: var(--text);
    }
    
    .trust-strip {
      display: flex;
      gap: 3rem;
      flex-wrap: wrap;
      margin-top: 4rem;
      padding-top: 3rem;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
      opacity: 0.9;
    }
    
    .trust-item svg {
      width: 24px;
      height: 24px;
      fill: var(--secondary);
    }
    
    /* Sections */
    section {
      padding: 6rem 0;
    }
    
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      margin-bottom: 1rem;
      color: var(--text);
    }
    
    .section-subtitle {
      font-size: 1.2rem;
      color: var(--gray);
      margin-bottom: 4rem;
      max-width: 700px;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-center .section-subtitle {
      margin-left: auto;
      margin-right: auto;
    }
    
    /* About */
    .about {
      background: white;
    }
    
    .about-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    
    .about-text h2 {
      margin-bottom: 1.5rem;
    }
    
    .about-text p {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--gray);
      margin-bottom: 1.5rem;
    }
    
    .about-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
      margin-top: 3rem;
    }
    
    .stat-card {
      text-align: center;
      padding: 2rem;
      background: var(--light-gray);
      border-radius: 15px;
    }
    
    .stat-number {
      font-family: 'Poppins', sans-serif;
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary);
      display: block;
    }
    
    .stat-label {
      color: var(--gray);
      font-weight: 500;
    }
    
    /* Services */
    .services {
      background: var(--light-gray);
    }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .service-card {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      transition: all 0.3s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    
    .service-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    .service-icon {
      width: 60px;
      height: 60px;
      background: ${rgbaFromHex(primaryColor, 0.1)};
      color: var(--primary);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
    }
    
    .service-card h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.4rem;
      margin-bottom: 1rem;
      color: var(--text);
    }
    
    .service-card p {
      color: var(--gray);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }
    
    .service-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: gap 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .service-link:hover {
      gap: 1rem;
    }
    
    /* Why Choose Us */
    .why-choose {
      background: white;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 3rem;
      margin-top: 4rem;
    }
    
    .feature {
      text-align: center;
    }
    
    .feature-icon {
      width: 80px;
      height: 80px;
      background: var(--primary);
      color: ${primaryText};
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2rem;
    }
    
    .feature h3 {
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
    }
    
    .feature p {
      color: var(--gray);
      line-height: 1.6;
    }
    
    /* Gallery */
    .gallery {
      background: var(--light-gray);
    }
    
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .gallery-item {
      position: relative;
      padding-top: 100%;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .gallery-item img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    
    .gallery-item:hover img {
      transform: scale(1.1);
    }
    
    /* FAQ */
    .faq {
      background: white;
    }
    
    .faq-container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    .faq-item {
      background: white;
      border: 2px solid #f0f0f0;
      border-radius: 15px;
      margin-bottom: 1.5rem;
      overflow: hidden;
      transition: all 0.3s;
    }
    
    .faq-item:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.1);
    }
    
    .faq-question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      cursor: pointer;
      user-select: none;
    }
    
    .faq-question h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }
    
    .faq-toggle {
      font-size: 2rem;
      color: var(--primary);
      font-weight: 300;
      transition: transform 0.3s;
      flex-shrink: 0;
      margin-left: 1rem;
    }
    
    .faq-item.active .faq-toggle {
      transform: rotate(45deg);
    }
    
    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
    }
    
    .faq-item.active .faq-answer {
      max-height: 500px;
      padding: 0 2rem 1.5rem 2rem;
    }
    
    .faq-answer p {
      color: var(--gray);
      line-height: 1.7;
      margin: 0;
    }
    
    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, var(--primary), ${rgbaFromHex(primaryColor, 0.8)}), url('${heroImage}') center/cover;
      color: ${primaryText};
      text-align: center;
      padding: 8rem 2rem;
    }
    
    .cta-section h2 {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      margin-bottom: 1.5rem;
      color: ${primaryText};
    }
    
    .cta-section p {
      font-size: 1.3rem;
      margin-bottom: 3rem;
      opacity: 0.95;
    }
    
    .cta-phone {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      background: white;
      color: var(--primary);
      padding: 1.5rem 3rem;
      border-radius: 50px;
      text-decoration: none;
      font-size: 1.8rem;
      font-weight: 800;
      font-family: 'Poppins', sans-serif;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      transition: all 0.3s;
    }
    
    .cta-phone:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow: 0 15px 50px rgba(0,0,0,0.3);
    }
    
    /* Footer */
    footer {
      background: #0c0c0c;
      color: #aaa;
      padding: 4rem 0 2rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }
    
    .footer-logo {
      height: 50px;
      width: auto;
      margin-bottom: 1.5rem;
      object-fit: contain;
      mix-blend-mode: lighten;
      filter: brightness(0) invert(1);
    }
    
    .footer-about p {
      line-height: 1.8;
      margin-bottom: 1.5rem;
    }
    
    .footer-title {
      color: white;
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      font-family: 'Poppins', sans-serif;
    }
    
    .footer-links {
      list-style: none;
    }
    
    .footer-links li {
      margin-bottom: 0.75rem;
    }
    
    .footer-links a {
      color: #aaa;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .footer-links a:hover {
      color: var(--secondary);
    }
    
    .footer-bottom {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid #222;
      color: #666;
    }
    
    /* Mobile Menu */
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .mobile-menu-btn {
        display: block;
      }
      
      .about-content {
        grid-template-columns: 1fr;
      }
      
      .services-grid {
        grid-template-columns: 1fr;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .footer-content {
        grid-template-columns: 1fr;
      }
      
      .trust-strip {
        gap: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-container">
      <img src="${brand.logo}" alt="${business.name}" class="logo-img">
      <div class="nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="tel:${phoneClean}" class="nav-cta">Call Now</a>
      </div>
      <button class="mobile-menu-btn">☰</button>
    </div>
  </nav>

  <section class="hero">
    <div class="container">
      <div class="hero-content" data-aos="fade-up">
        <div class="hero-badge">SERVING ${business.city.toUpperCase()}, ${business.state.toUpperCase()}</div>
        <h1>${aiContent.headline}</h1>
        <p>${aiContent.subheadline}</p>
        <div class="hero-ctas">
          <a href="tel:${phoneClean}" class="btn-primary">
            <span>📞</span> Get Free Quote
          </a>
          <a href="#services" class="btn-secondary">Our Services</a>
        </div>
        <div class="trust-strip">
          ${business.years ? `<div class="trust-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${business.years}+ Years</div>` : ''}
          <div class="trust-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Licensed & Insured</div>
          <div class="trust-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> 100% Satisfaction</div>
          ${business.emergency ? '<div class="trust-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> 24/7 Emergency</div>' : ''}
        </div>
      </div>
    </div>
  </section>

  <section class="about" id="about">
    <div class="container">
      <div class="about-content">
        <div class="about-text" data-aos="fade-right">
          <h2 class="section-title">About ${business.name}</h2>
          <p>${aiContent.aboutText}</p>
          ${business.warranty ? `<p><strong>Our Guarantee:</strong> ${business.warranty}</p>` : ''}
        </div>
        <div class="about-stats" data-aos="fade-left">
          ${business.years ? `
            <div class="stat-card">
              <span class="stat-number">${business.years}+</span>
              <span class="stat-label">Years Experience</span>
            </div>
          ` : ''}
          <div class="stat-card">
            <span class="stat-number">100%</span>
            <span class="stat-label">Satisfaction</span>
          </div>
          ${business.financing ? `
            <div class="stat-card">
              <span class="stat-number">💳</span>
              <span class="stat-label">Financing Available</span>
            </div>
          ` : ''}
          ${business.emergency ? `
            <div class="stat-card">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Emergency Service</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  <section class="services" id="services">
    <div class="container">
      <div class="text-center">
        <h2 class="section-title" data-aos="fade-up">Our Services</h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="100">Professional ${business.type} solutions for ${business.city} and surrounding areas</p>
      </div>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <section class="why-choose">
    <div class="container">
      <div class="text-center">
        <h2 class="section-title" data-aos="fade-up">Why Choose ${business.name}?</h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="100">Your trusted ${business.type} experts in ${business.city}, ${business.state}</p>
      </div>
      <div class="features-grid">
        <div class="feature" data-aos="zoom-in">
          <div class="feature-icon">⭐</div>
          <h3>Quality Workmanship</h3>
          <p>Every project completed to the highest standards with attention to detail.</p>
        </div>
        <div class="feature" data-aos="zoom-in" data-aos-delay="100">
          <div class="feature-icon">💰</div>
          <h3>Fair Pricing</h3>
          <p>Transparent quotes with no hidden fees. Get the best value for your investment.</p>
        </div>
        <div class="feature" data-aos="zoom-in" data-aos-delay="200">
          <div class="feature-icon">🏆</div>
          <h3>Licensed & Insured</h3>
          <p>Fully licensed, bonded, and insured for your peace of mind and protection.</p>
        </div>
        <div class="feature" data-aos="zoom-in" data-aos-delay="300">
          <div class="feature-icon">⏰</div>
          <h3>On-Time Service</h3>
          <p>We respect your time. Projects completed on schedule, every time.</p>
        </div>
      </div>
    </div>
  </section>

  ${galleryHtml}

  <section class="faq" id="faq">
    <div class="container">
      <div class="text-center">
        <h2 class="section-title" data-aos="fade-up">Frequently Asked Questions</h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="100">Get answers to common questions about our ${business.type} services</p>
      </div>
      <div class="faq-container">
        ${aiContent.faq ? aiContent.faq.map((item, i) => `
          <div class="faq-item" data-aos="fade-up" data-aos-delay="${i * 100}">
            <div class="faq-question">
              <h3>${item.question}</h3>
              <span class="faq-toggle">+</span>
            </div>
            <div class="faq-answer">
              <p>${item.answer}</p>
            </div>
          </div>
        `).join('') : ''}
      </div>
    </div>
  </section>

  <section class="cta-section" id="contact">
    <div class="container" data-aos="zoom-in">
      <h2>Ready to Get Started?</h2>
      <p>Call us today for a free, no-obligation quote</p>
      <a href="tel:${phoneClean}" class="cta-phone">
        📞 ${phoneDisplay}
      </a>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-about">
          <img src="${brand.logo}" alt="${business.name}" class="footer-logo">
          <p>${business.description || `Professional ${business.type} services in ${business.city}, ${business.state}. Your trusted local experts.`}</p>
          <p><strong>📍 ${business.address || business.city + ', ' + business.state}</strong></p>
          ${business.serviceAreas ? `<p>Service Areas: ${business.serviceAreas}</p>` : ''}
        </div>
        
        <div>
          <h3 class="footer-title">Services</h3>
          <ul class="footer-links">
            ${services.map(s => `<li><a href="tel:${phoneClean}">${s.name}</a></li>`).join('')}
          </ul>
        </div>
        
        <div>
          <h3 class="footer-title">Company</h3>
          <ul class="footer-links">
            <li><a href="#about">About Us</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="footer-title">Contact</h3>
          <ul class="footer-links">
            <li><a href="tel:${phoneClean}">📞 ${phoneDisplay}</a></li>
            <li><a href="mailto:${business.email}">✉️ ${business.email}</a></li>
            ${business.emergency ? '<li><strong>24/7 Emergency Service Available</strong></li>' : ''}
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${business.name}. All Rights Reserved. | Licensed & Insured ${business.type} | Serving ${business.city}, ${business.state}</p>
      </div>
    </div>
  </footer>

  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script>
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('nav');
      if (window.scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
    
    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const wasActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!wasActive) {
          faqItem.classList.add('active');
        }
      });
    });
    
    // Mobile menu (placeholder for future enhancement)
    document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
      alert('Mobile menu - integrate your preferred mobile nav solution');
    });
  </script>
</body>
</html>`;
}
