import { formatearPrecio } from './utils.js';

export class UIManager {
    constructor(carrito, filtrosManager) {
        this.carrito = carrito;
        this.filtrosManager = filtrosManager;
        this.productosContainer = document.getElementById('productosContainer');
        this.carritoItems = document.getElementById('carritoItems');
        this.carritoTotal = document.getElementById('carritoTotal');
        this.carritoCount = document.getElementById('carritoCount');
    }
    
    /**
     * Renderiza los productos en el grid
     */
    renderizarProductos(productos) {
        if (!this.productosContainer) return;
        
        if (productos.length === 0) {
            this.productosContainer.innerHTML = `
                <div class="empty-message">
                    <p>✨ No hay productos que coincidan con los filtros seleccionados</p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Intenta con otros criterios de búsqueda</p>
                </div>
            `;
            return;
        }
        
        this.productosContainer.innerHTML = productos.map(producto => {
            // Determinar clase de stock badge
            let stockBadgeClass = 'stock-badge';
            if (producto.stock === 0) stockBadgeClass += ' out';
            else if (producto.stock < 5) stockBadgeClass += ' low';
            
            const stockText = producto.stock === 0 ? 'Sin stock' : 
                              producto.stock < 5 ? `Últimas ${producto.stock} unidades` : 
                              `${producto.stock} unidades disponibles`;
            
            // Generar estrellas de rating
            const estrellas = '⭐'.repeat(Math.floor(producto.rating)) + 
                              (producto.rating % 1 >= 0.5 ? '½' : '');
            
            return `
                <div class="producto-card" data-id="${producto.id}">
                    <div class="producto-imagen">
                        <img src="${producto.imagen}" alt="${producto.imagen_alt || producto.nombre}" loading="lazy">
                        <div class="producto-rating">
                            ${estrellas} ${producto.rating}
                        </div>
                    </div>
                    <div class="producto-info">
                        <h3 class="producto-nombre">${producto.nombre}</h3>
                        <div class="producto-vendedor">
                            👤 ${producto.vendedor || 'Vendedor oficial'}
                        </div>
                        <p class="producto-descripcion">${producto.descripcion}</p>
                        <div class="producto-precio">${formatearPrecio(producto.precio)}</div>
                        <div class="producto-stock">
                            <span class="${stockBadgeClass}"></span>
                            ${stockText}
                        </div>
                        <button class="btn-agregar" data-id="${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>
                            ${producto.stock === 0 ? '📦 Sin stock' : '🛒 Agregar al carrito'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Renderiza el carrito
     */
    renderizarCarrito() {
        if (!this.carritoItems) return;
        
        if (this.carrito.items.length === 0) {
            this.carritoItems.innerHTML = `
                <div class="empty-message" style="padding: 2rem;">
                    <p>🛍️ Tu carrito está vacío</p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">¡Agrega productos para comenzar!</p>
                </div>
            `;
            this.carritoTotal.textContent = formatearPrecio(0);
            this.carritoCount.textContent = '0';
            return;
        }
        
        this.carritoItems.innerHTML = this.carrito.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-nombre">${item.nombre}</div>
                    <div class="cart-item-precio">${formatearPrecio(item.precio)}</div>
                </div>
                <div class="cart-item-cantidad">
                    <button class="btn-cantidad-menos" data-id="${item.id}">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.cantidad}</span>
                    <button class="btn-cantidad-mas" data-id="${item.id}">+</button>
                    <button class="btn-eliminar" data-id="${item.id}">🗑️</button>
                </div>
            </div>
        `).join('');
        
        this.carritoTotal.textContent = formatearPrecio(this.carrito.calcularTotal());
        this.carritoCount.textContent = this.carrito.getCantidadTotal();
    }
    
    /**
     * Actualiza toda la interfaz
     */
    actualizarTodo(productosFiltrados) {
        this.renderizarProductos(productosFiltrados);
        this.renderizarCarrito();
    }
}