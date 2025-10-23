/**
 * Sistema de Notificaciones Visuales
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        // 🎯 CORRECCIÓN: Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createContainer());
        } else {
            this.createContainer();
        }
    }

    createContainer() {
        // 🎯 CORRECCIÓN: Verificar que document.body existe
        if (!document.body) {
            console.warn('⚠️ document.body no disponible, reintentando...');
            setTimeout(() => this.createContainer(), 100);
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Estilos
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 6px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            pointer-events: auto;
            cursor: pointer;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        notification.textContent = message;
        
        // Agregar al contenedor
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-remover
        setTimeout(() => {
            this.remove(notification);
        }, duration);
        
        // Click para cerrar
        notification.addEventListener('click', () => {
            this.remove(notification);
        });
        
        this.notifications.push(notification);
    }

    remove(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
        
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    getBackgroundColor(type) {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'warning': return '#F59E0B';
            case 'info': return '#3B82F6';
            default: return '#6B7280';
        }
    }

    // Métodos de conveniencia
    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Crear instancia global
window.notifications = new NotificationSystem();

// Función global para compatibilidad
window.showNotification = (message, type = 'info') => {
    window.notifications.show(message, type);
};
