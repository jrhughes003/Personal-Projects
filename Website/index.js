// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    function highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Navbar background on scroll
    function handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }

    // Scroll event listeners
    window.addEventListener('scroll', function() {
        highlightActiveSection();
        handleNavbarScroll();
        animateOnScroll();
    });

    // Animate elements on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.project-card, .skill-category, .timeline-item, .highlight-item');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // Initialize animation styles
    function initializeAnimations() {
        const elements = document.querySelectorAll('.project-card, .skill-category, .timeline-item, .highlight-item');
        
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Basic form validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission (replace with actual form handling)
            submitContactForm(name, email, subject, message);
        });
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Form submission simulation
    function submitContactForm(name, email, subject, message) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset form
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            
            // In a real application, you would send the data to your server
            console.log('Form submitted:', { name, email, subject, message });
        }, 2000);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        });

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Typing animation for hero title
    function initTypewriter() {
        const titleElement = document.querySelector('.hero-title');
        if (!titleElement) return;

        const originalText = titleElement.innerHTML;
        const nameSpan = titleElement.querySelector('.highlight');
        
        if (nameSpan) {
            const nameText = nameSpan.textContent;
            const beforeName = originalText.split('<span')[0];
            const afterName = '</span>';
            
            titleElement.innerHTML = beforeName + '<span class="highlight"></span>';
            const highlightSpan = titleElement.querySelector('.highlight');
            
            let i = 0;
            function typeWriter() {
                if (i < nameText.length) {
                    highlightSpan.textContent += nameText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            }
            
            setTimeout(typeWriter, 1000);
        }
    }

    // Parallax effect for hero section
    function initParallax() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Skill bar animations
    function animateSkillBars() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                item.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 100);
            }, index * 100);
        });
    }

    // Initialize all functionality
    function init() {
        initializeAnimations();
        animateOnScroll();
        initTypewriter();
        // initParallax(); // Uncomment if you want parallax effect
        
        // Delay skill animation
        setTimeout(animateSkillBars, 2000);
    }

    // Run initialization
    init();

    // Add click events for project links (handle missing links gracefully)
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                showNotification('This link is not yet configured. Please add your project URLs.', 'info');
            }
        });
    });

    // Add click events for social links (handle missing links gracefully)
    const socialLinks = document.querySelectorAll('.hero-social a, .footer-social a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.includes('[') || href === '#') {
                e.preventDefault();
                showNotification('Please update your social media links in the HTML.', 'info');
            }
        });
    });

    // Dark mode toggle (bonus feature)
    function initDarkModeToggle() {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
        
        Object.assign(darkModeToggle.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            zIndex: '1000'
        });

        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            // Store preference
            localStorage.setItem('darkMode', isDark);
        });

        // Check for saved preference
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        document.body.appendChild(darkModeToggle);
    }

    // Initialize dark mode toggle
    initDarkModeToggle();

    // Performance optimization: Throttle scroll events
    let ticking = false;
    function throttledScrollHandler() {
        if (!ticking) {
            requestAnimationFrame(() => {
                highlightActiveSection();
                handleNavbarScroll();
                animateOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Replace the scroll event listener with throttled version
    window.removeEventListener('scroll', function() {
        highlightActiveSection();
        handleNavbarScroll();
        animateOnScroll();
    });
    
    window.addEventListener('scroll', throttledScrollHandler);

    console.log('Portfolio website initialized successfully!');
});