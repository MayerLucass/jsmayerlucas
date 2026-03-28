// Módulo de filtros

export class FiltrosManager {
    constructor() {
        this.categoriaActiva = 'todos';
        this.precioMin = 0;
        this.precioMax = Infinity;
    }
    
    /**
     * Aplica los filtros a la lista de productos
     */
    aplicarFiltros(productos) {
        return productos.filter(producto => {
            // Filtro por categoría
            if (this.categoriaActiva !== 'todos' && producto.categoria !== this.categoriaActiva) {
                return false;
            }
            
            // Filtro por precio
            if (producto.precio < this.precioMin || producto.precio > this.precioMax) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Establece la categoría activa
     */
    setCategoria(categoria) {
        this.categoriaActiva = categoria;
    }
    
    /**
     * Establece el rango de precios
     */
    setRangoPrecios(min, max) {
        this.precioMin = min || 0;
        this.precioMax = max || Infinity;
    }
    
    /**
     * Resetea todos los filtros
     */
    resetearFiltros() {
        this.categoriaActiva = 'todos';
        this.precioMin = 0;
        this.precioMax = Infinity;
    }
}