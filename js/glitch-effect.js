// Glitch Effect Manager - Efecto glitch para textos
// Aplica efecto glitch con cambio de caracteres y colores

// Variable para rastrear si el glitch del menú ya se ejecutó
let menuGlitchExecuted = false;

// Glitch effect on page load
function createGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
        // Guardar el texto original si no existe
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent.trim();
        }
        
        const originalText = element.dataset.originalText;
        const glitchChars = ['!', '@', '#', '$', '%', '^', '&', '*', '?', ']', '[', '~', '`'];
        
        // Si ya está en glitch, no hacer nada
        if (element.dataset.glitching === 'true') {
            return;
        }
        
        element.dataset.glitching = 'true';
        
        // Add glitch animation class
        element.classList.add('glitch-animation');
        
        // Create glitch effect
        let glitchInterval = setInterval(() => {
            let glitchedText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.3) {
                    glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    glitchedText += originalText[i];
                }
            }
            element.textContent = glitchedText;
        }, 100);
        
        // Stop glitch after 1 second
        setTimeout(() => {
            clearInterval(glitchInterval);
            element.textContent = originalText;
            element.classList.remove('glitch-animation');
            element.dataset.glitching = 'false';
        }, 1000);
    });
}

// Glitch effect for menu items
function createGlitchEffectForMenu() {
    // Solo ejecutar una vez por apertura de menú
    if (menuGlitchExecuted) {
        return;
    }
    
    menuGlitchExecuted = true;
    
    const menuGlitchElements = document.querySelectorAll('#menu-dropdown .glitch-text');
    
    menuGlitchElements.forEach(element => {
        // Guardar el texto original si no existe
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent.trim();
        }
        
        const originalText = element.dataset.originalText;
        const glitchChars = ['!', '@', '#', '$', '%', '^', '&', '*', '?', ']', '[', '~', '`'];
        
        // Add glitch animation class
        element.classList.add('glitch-animation');
        
        // Create glitch effect
        let glitchInterval = setInterval(() => {
            let glitchedText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.3) {
                    glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    glitchedText += originalText[i];
                }
            }
            element.textContent = glitchedText;
        }, 100);
        
        // Stop glitch after 1 second
        setTimeout(() => {
            clearInterval(glitchInterval);
            element.textContent = originalText;
            element.classList.remove('glitch-animation');
        }, 1000);
    });
    
    // Resetear la bandera después de 2 segundos para permitir glitch en la próxima apertura
    setTimeout(() => {
        menuGlitchExecuted = false;
    }, 2000);
}

// Setup menu glitch effect on menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuDropdown = document.getElementById('menu-dropdown');
    
    if (menuToggle && menuDropdown) {
        // Observar cuando el menú se abre
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isHidden = menuDropdown.classList.contains('hidden');
                    const isTranslated = menuDropdown.classList.contains('-translate-x-full');
                    
                    // Si el menú se acaba de abrir (no está hidden ni translated)
                    if (!isHidden && !isTranslated && !menuGlitchExecuted) {
                        setTimeout(() => {
                            createGlitchEffectForMenu();
                        }, 50);
                    }
                }
            });
        });
        
        observer.observe(menuDropdown, { attributes: true });
    }
    
    // Run glitch effect on page load for header elements (solo una vez)
    setTimeout(() => {
        createGlitchEffect();
    }, 100);
});

