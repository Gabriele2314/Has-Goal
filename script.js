// ===================================
// Has Goal - Antigravity Website JavaScript
// ===================================

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHeroParticles();
    initMockupContent();
    initFeedCards();
    initScrollAnimations();
    initCTAButtons();
});

// ===================================
// Navbar Functionality
// ===================================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    mobileMenuToggle?.addEventListener('click', () => {
        alert('Mobile menu coming soon!');
    });
}

// ===================================
// Hero Particles
// ===================================

function initHeroParticles() {
    const container = document.getElementById('heroBgParticles');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${8 + Math.random() * 4}s`;
        container.appendChild(particle);
    }
}

// ===================================
// Phone Mockup Content
// ===================================

function initMockupContent() {
    const mockupContent = document.getElementById('mockupContent');

    // Create mini result cards for mockup
    const mockupCards = [
        { home: '⚫🔵', away: '🔴⚫', scoreHome: '3', scoreAway: '1', homeTeam: 'Inter', awayTeam: 'Milan' },
        { home: '⚪⚫', away: '🔵', scoreHome: '2', scoreAway: '2', homeTeam: 'Juventus', awayTeam: 'Napoli' },
    ];

    mockupCards.forEach((match, index) => {
        const card = document.createElement('div');
        card.style.cssText = `
      background: linear-gradient(135deg, #0A0A0A, #000);
      border: 1px solid rgba(57, 255, 20, 0.1);
      border-radius: 16px;
      padding: 16px;
      animation: card-float ${3 + index}s ease-in-out infinite;
      animation-delay: ${index * 0.5}s;
    `;

        card.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center;">
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 4px;">${match.home}</div>
          <div style="font-size: 11px; color: #F8F8FF; font-weight: 600;">${match.homeTeam}</div>
          <div style="font-size: 24px; color: #39FF14; font-weight: 700; margin-top: 4px;">${match.scoreHome}</div>
        </div>
        <div style="font-size: 10px; color: #666;">VS</div>
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 4px;">${match.away}</div>
          <div style="font-size: 11px; color: #F8F8FF; font-weight: 600;">${match.awayTeam}</div>
          <div style="font-size: 24px; color: #39FF14; font-weight: 700; margin-top: 4px;">${match.scoreAway}</div>
        </div>
      </div>
    `;

        mockupContent.appendChild(card);
    });
}

// ===================================
// Feed Cards
// ===================================

function initFeedCards() {
    const feedContainer = document.getElementById('feedContainer');

    const matches = [
        {
            competition: 'Serie A • Giornata 21',
            home: { name: 'Inter', logo: '⚫🔵', score: 3 },
            away: { name: 'Milan', logo: '🔴⚫', score: 1 },
            stats: { goals: 4, cards: 3 },
            likes: '1.2k',
            comments: '342'
        },
        {
            competition: 'Serie A • Giornata 21',
            home: { name: 'Juventus', logo: '⚪⚫', score: 2 },
            away: { name: 'Napoli', logo: '🔵', score: 2 },
            stats: { goals: 4, cards: 5 },
            likes: '892',
            comments: '156'
        },
        {
            competition: 'Serie A • Giornata 21',
            home: { name: 'Roma', logo: '🟡🔴', score: 1 },
            away: { name: 'Lazio', logo: '⚪🔵', score: 0 },
            stats: { goals: 1, cards: 2 },
            likes: '2.1k',
            comments: '567'
        }
    ];

    matches.forEach((match, index) => {
        const card = createResultCard(match);
        card.style.animationDelay = `${index * 0.2}s`;
        feedContainer.appendChild(card);
    });
}

function createResultCard(match) {
    const card = document.createElement('div');
    card.className = 'result-card';

    card.innerHTML = `
    <div class="result-header">
      <div class="competition-badge">
        <span>⚽</span>
        <span>${match.competition}</span>
      </div>
    </div>
    
    <div class="result-body">
      <div class="team">
        <div class="team-logo">${match.home.logo}</div>
        <h3 class="team-name">${match.home.name}</h3>
        <div class="score">${match.home.score}</div>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span class="vs-label">VS</span>
        <span class="match-time">90' FT</span>
      </div>
      
      <div class="team">
        <div class="score">${match.away.score}</div>
        <h3 class="team-name">${match.away.name}</h3>
        <div class="team-logo">${match.away.logo}</div>
      </div>
    </div>
    
    <div class="result-footer">
      <div style="display: flex; gap: 16px; font-size: 13px; color: #999;">
        <span>⚽ ${match.stats.goals} gol</span>
        <span>🟨 ${match.stats.cards} amm.</span>
      </div>
      
      <div class="actions">
        <button class="btn-action btn-like">
          <span>❤️</span>
          <span class="like-count">${match.likes}</span>
        </button>
        <button class="btn-action">
          <span>💬</span>
          <span>${match.comments}</span>
        </button>
        <button class="btn-action">
          <span>📤</span>
        </button>
      </div>
    </div>
  `;

    // Add click handlers
    const likeBtn = card.querySelector('.btn-like');
    let isLiked = false;

    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isLiked = !isLiked;

        if (isLiked) {
            likeBtn.style.borderColor = '#39FF14';
            likeBtn.style.color = '#39FF14';

            // Animate like count
            const likeCount = likeBtn.querySelector('.like-count');
            likeCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                likeCount.style.transform = 'scale(1)';
            }, 200);
        } else {
            likeBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            likeBtn.style.color = '#B3B3B3';
        }
    });

    card.addEventListener('click', () => {
        alert(`Apertura dettaglio partita ${match.home.name} vs ${match.away.name}...`);
    });

    return card;
}

// ===================================
// Scroll Animations
// ===================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ===================================
// 3D Parallax Effect for Feature Cards
// ===================================

function init3DParallax() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-12px)
      `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Initialize 3D parallax
setTimeout(init3DParallax, 1000);

// ===================================
// CTA Buttons
// ===================================

function initCTAButtons() {
    const btnGetStarted = document.getElementById('btnGetStarted');
    const btnHeroDownload = document.getElementById('btnHeroDownload');
    const btnHeroDemo = document.getElementById('btnHeroDemo');

    btnGetStarted?.addEventListener('click', () => {
        document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
    });

    btnHeroDownload?.addEventListener('click', () => {
        alert('Download app coming soon!\n\nHas Goal sarà disponibile su App Store e Google Play.');
    });

    btnHeroDemo?.addEventListener('click', () => {
        alert('Demo video coming soon!\n\nGuarda il video di presentazione di Has Goal.');
    });

    // Download buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const store = btn.classList.contains('apple') ? 'App Store' : 'Google Play';
            alert(`Download da ${store} coming soon!`);
        });
    });
}

// ===================================
// Smooth Scroll for Navigation
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// Performance: Reduce motion for users who prefer it
// ===================================

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--duration-fast', '0ms');
    document.documentElement.style.setProperty('--duration-normal', '0ms');
    document.documentElement.style.setProperty('--duration-slow', '0ms');
}

// ===================================
// Console Easter Egg
// ===================================

console.log('%c⚽ Has Goal - Antigravity Design', 'color: #39FF14; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px rgba(57, 255, 20, 0.8);');
console.log('%cIl futuro del calcio social 🚀', 'color: #F8F8FF; font-size: 14px;');
console.log('%cDesigned with Antigravity principles', 'color: #666; font-size: 12px;');
