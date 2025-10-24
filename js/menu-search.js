// Menu Search Functionality
// Maneja la búsqueda desde el menú hamburguesa

document.addEventListener('DOMContentLoaded', function() {
    const menuSearchInput = document.getElementById('menu-search-input');
    
    if (menuSearchInput) {
        // Manejar Enter en el input de búsqueda
        menuSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = this.value.trim();
                
                if (searchTerm) {
                    console.log('🔍 Búsqueda desde menú:', searchTerm);
                    
                    // Determinar la ruta correcta según la ubicación actual
                    const currentPath = window.location.pathname;
                    let searchUrl;
                    
                    if (currentPath.includes('/collections/')) {
                        // Si estamos en una página de colección, usar ruta relativa
                        searchUrl = `../buscar.html?q=${encodeURIComponent(searchTerm)}`;
                    } else {
                        // Si estamos en la raíz, usar ruta directa
                        searchUrl = `buscar.html?q=${encodeURIComponent(searchTerm)}`;
                    }
                    
                    // Redirigir a buscar.html con el término de búsqueda
                    window.location.href = searchUrl;
                }
            }
        });
        
        // También permitir búsqueda al hacer clic en el icono de búsqueda
        const searchIcon = menuSearchInput.parentElement.querySelector('svg');
        if (searchIcon) {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', function() {
                const searchTerm = menuSearchInput.value.trim();
                
                if (searchTerm) {
                    console.log('🔍 Búsqueda desde icono:', searchTerm);
                    
                    const currentPath = window.location.pathname;
                    let searchUrl;
                    
                    if (currentPath.includes('/collections/')) {
                        searchUrl = `../buscar.html?q=${encodeURIComponent(searchTerm)}`;
                    } else {
                        searchUrl = `buscar.html?q=${encodeURIComponent(searchTerm)}`;
                    }
                    
                    window.location.href = searchUrl;
                }
            });
        }
    }
});

