import { formatearPrecio, guardarLocalStorage, obtenerLocalStorage, mostrarNotificacion, confirmarAccion } from './utils.js';

export class Carrito {
    constructor() {
        this.items = [];
        this.cargarCarrito();
    }
    
    /**
     * Carga el carrito desde localStorage
     */
    cargarCarrito() {
        const carritoGuardado = obtenerLocalStorage('carrito');
        if (carritoGuardado) {
            this.items = carritoGuardado;
        }
    }
    
    /**
     * Guarda el carrito en localStorage
     */
    guardarCarrito() {
        guardarLocalStorage('carrito', this.items);
    }
    
    /**
     * Agrega un producto al carrito
     */
    agregarProducto(producto, cantidad = 1) {
        const itemExistente = this.items.find(item => item.id === producto.id);
        
        if (itemExistente) {
            const nuevaCantidad = itemExistente.cantidad + cantidad;
            if (nuevaCantidad <= producto.stock) {
                itemExistente.cantidad = nuevaCantidad;
                mostrarNotificacion('success', `Se agregó otra unidad de ${producto.nombre}`);
            } else {
                mostrarNotificacion('error', `No hay suficiente stock de ${producto.nombre}`);
                return false;
            }
        } else {
            if (cantidad <= producto.stock) {
                this.items.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: cantidad,
                    stock: producto.stock
                });
                mostrarNotificacion('success', `${producto.nombre} agregado al carrito`);
            } else {
                mostrarNotificacion('error', `No hay suficiente stock de ${producto.nombre}`);
                return false;
            }
        }
        
        this.guardarCarrito();
        return true;
    }
    
    /**
     * Elimina un producto del carrito
     */
    eliminarProducto(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const producto = this.items[index];
            this.items.splice(index, 1);
            this.guardarCarrito();
            mostrarNotificacion('info', `${producto.nombre} eliminado del carrito`);
            return true;
        }
        return false;
    }
    
    /**
     * Actualiza la cantidad de un producto
     */
    actualizarCantidad(id, nuevaCantidad) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (nuevaCantidad <= 0) {
                return this.eliminarProducto(id);
            }
            
            if (nuevaCantidad <= item.stock) {
                item.cantidad = nuevaCantidad;
                this.guardarCarrito();
                return true;
            } else {
                mostrarNotificacion('error', `No hay suficiente stock. Máximo ${item.stock} unidades`);
                return false;
            }
        }
        return false;
    }
    
    /**
     * Vacía el carrito completamente
     */
    async vaciarCarrito() {
        const confirmado = await confirmarAccion(
            'Vaciar carrito',
            '¿Estás seguro de que querés vaciar el carrito?',
            'warning'
        );
        
        if (confirmado) {
            this.items = [];
            this.guardarCarrito();
            mostrarNotificacion('info', 'Carrito vaciado');
            return true;
        }
        return false;
    }
    
    /**
     * Calcula el total del carrito
     */
    calcularTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }
    
    /**
     * Obtiene la cantidad total de items
     */
    getCantidadTotal() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }
    
    /**
     * Procesa la compra
     */
    async finalizarCompra() {
        if (this.items.length === 0) {
            mostrarNotificacion('warning', 'El carrito está vacío');
            return false;
        }
        
        const confirmado = await confirmarAccion(
            'Confirmar compra',
            `Total a pagar: ${formatearPrecio(this.calcularTotal())}\n¿Deseas confirmar la compra?`,
            'success'
        );
        
        if (confirmado) {
            // Simular procesamiento de compra
            Swal.fire({
                title: '¡Compra realizada!',
                html: `
                    <p>Gracias por tu compra</p>
                    <p><strong>Total: ${formatearPrecio(this.calcularTotal())}</strong></p>
                    <p>El comprobante fue enviado a tu email</p>
                `,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            
            this.items = [];
            this.guardarCarrito();
            return true;
        }
        return false;
    }
}