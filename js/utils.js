// Utilidades generales

/**
 * Formatea un número como precio en pesos argentinos
 */
export function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

/**
 * Muestra una notificación usando SweetAlert2
 */
export async function mostrarNotificacion(tipo, mensaje) {
    const config = {
        icon: tipo,
        title: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1f1f1f',
        color: '#ffffff',
        iconColor: tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#f59e0b'
    };
    
    Swal.fire(config);
}

/**
 * Muestra un mensaje de confirmación
 */
export async function confirmarAccion(titulo, texto, icono = 'question') {
    const result = await Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        background: '#1f1f1f',
        color: '#ffffff'
    });
    
    return result.isConfirmed;
}

/**
 * Guarda datos en localStorage
 */
export function guardarLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Obtiene datos de localStorage
 */
export function obtenerLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}