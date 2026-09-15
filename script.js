// script.js
document.addEventListener('DOMContentLoaded', () => {

    // 0. Lenis Smooth Scroll Initialization
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Marquee and Parallax scroll state
    let marqueePosition = 0;
    const marqueeContent = document.querySelector('[data-marquee-content]');
    let lastVelocity = -1; // Default direction left

    lenis.on('scroll', (e) => {
        // Reactive Marquee
        if (marqueeContent) {
            const velocity = e.velocity || 0;
            // Base speed is 1, scales up with rapid scrolling
            const speed = 1.5 + Math.abs(velocity) * 0.15; 
            // Keep moving left normally, unless scrolling up rapidly
            const direction = velocity > 10 ? -1 : (velocity < -10 ? 1 : lastVelocity);
            lastVelocity = direction;
            
            marqueePosition += speed * direction;
            
            const width = marqueeContent.scrollWidth / 3;
            // Loop boundaries
            if (marqueePosition <= -width) marqueePosition += width;
            if (marqueePosition >= 0) marqueePosition -= width;
            
            marqueeContent.style.transform = `translate3d(${marqueePosition}px, 0, 0)`;
        }

        // True Scroll Parallax relative to viewport center
        const scrollParallaxElements = document.querySelectorAll('.parallax');
        const vh = window.innerHeight;
        scrollParallaxElements.forEach(el => {
            const speedAttr = parseFloat(el.getAttribute('data-speed')) || 0.05;
            // Get parent rect to avoid self-referential translation issues
            const rect = el.parentElement.getBoundingClientRect();
            const distFromCenter = rect.top + (rect.height / 2) - (vh / 2);
            const yOffset = distFromCenter * speedAttr; 
            el.style.translate = `0px ${yOffset}px`;
        });
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 0.1 Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const cursorText = cursor.querySelector('.cursor-paragraph');
    
    // Follow mouse
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Offset the cursor so it's centered on the pointer
        // using transform for smooth animation
        cursor.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
    });

    // Handle hover states
    const cursorTargets = document.querySelectorAll('[data-cursor]');
    
    cursorTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            const text = target.getAttribute('data-cursor');
            if(text) {
                cursorText.textContent = text;
            }
        });
        target.addEventListener('mouseleave', () => {
            cursorText.textContent = '';
        });
    });

    // 0.2 Card Glow Logic
    const glowCards = document.querySelectorAll('[data-glow="true"]');
    glowCards.forEach(card => {
        let cardTicking = false;
        card.addEventListener('mousemove', e => {
            if (!cardTicking) {
                window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left; 
                    const y = e.clientY - rect.top;  
                    // Actualiza variables CSS de coordenadas
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                    cardTicking = false;
                });
                cardTicking = true;
            }
        });
    });

    // 0.3 Split Text Initialization
    const splitElements = document.querySelectorAll('[data-split-text="true"]');
    splitElements.forEach(el => {
        let html = '';
        const nodes = el.childNodes;
        nodes.forEach(node => {
            if(node.nodeType === 3) { // Text node
                const chars = node.nodeValue.split('');
                chars.forEach(c => {
                    if(c.trim() === '') html += c; // Preserve spaces
                    else html += `<span class="split-char">${c}</span>`;
                });
            } else if (node.nodeType === 1) { // HTML Element (e.g. <br>)
                html += node.outerHTML;
            }
        });
        el.innerHTML = html;
    });

    const splitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chars = entry.target.querySelectorAll('.split-char');
                chars.forEach((char, index) => {
                    setTimeout(() => {
                        char.classList.add('active');
                    }, index * 20); // 20ms stagger per letter
                });
                splitObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    splitElements.forEach(el => splitObserver.observe(el));
    
    // 1. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-up, .scale-in');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });
    
    revealElements.forEach(el => revealObserver.observe(el));


    // 2. Parallax Stickers Effect (Collage feel + Interactions)
    const parallaxElements = document.querySelectorAll('.parallax');
    
    // Allow users to click stickers to make them pop
    parallaxElements.forEach(el => {
        el.addEventListener('click', () => {
            el.style.transform = 'scale(1.3) rotate(15deg)';
            setTimeout(() => {
                el.style.transform = ''; // reset to CSS animation
            }, 300);
        });
    });

    let parallaxTicking = false;
    window.addEventListener('mousemove', (e) => {
        if (!parallaxTicking) {
            window.requestAnimationFrame(() => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.getAttribute('data-speed')) || 0.05;
                    const x = (mouseX - centerX) * speed;
                    const y = (mouseY - centerY) * speed;
                    
                    el.style.marginLeft = `${x}px`;
                    el.style.marginTop = `${y}px`;
                });
                parallaxTicking = false;
            });
            parallaxTicking = true;
        }
    });

    // 3. 3D "Inflatable Ribbon" Canvas Simulation
    function initRibbonCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let time = 0;

        function drawRibbon() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // The signature Slush 3D ribbon color is Electric Blue #4da2ff
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#2980b9'); 
            gradient.addColorStop(0.5, '#4da2ff'); // Bright Electric Blue
            gradient.addColorStop(1, '#81c0ff');
            
            ctx.beginPath();
            ctx.lineWidth = 140; // Massive thick tube
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = gradient;

            // Draw a winding sine wave across the section
            const startY = canvas.height * 0.4;
            ctx.moveTo(-200, startY + Math.sin(time) * 150);
            
            for(let x = 0; x <= canvas.width + 200; x += 50) {
                const y = startY + Math.sin((x * 0.003) + time) * 200;
                ctx.lineTo(x, y);
            }
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.stroke();

            // Inner highlight for inflated 3D effect
            ctx.beginPath();
            ctx.lineWidth = 30;
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.shadowColor = 'transparent';
            ctx.moveTo(-200, startY - 40 + Math.sin(time) * 150);
            for(let x = 0; x <= canvas.width + 200; x += 50) {
                const y = startY - 40 + Math.sin((x * 0.003) + time) * 200;
                ctx.lineTo(x, y);
            }
            ctx.stroke();

            time += 0.012;
            requestAnimationFrame(drawRibbon);
        }
        
        drawRibbon();
    }

    initRibbonCanvas('ribbon-canvas-1');
    initRibbonCanvas('ribbon-canvas-2');

    // Scroll to Top Button Logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        lenis.on('scroll', (e) => {
            if (e.scroll > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        });
    }

    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.style.display = 'none');

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.style.display = 'flex';
            }
        });
    });
});
