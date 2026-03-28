import { Carrito } from './carrito.js';
import { FiltrosManager } from './filtros.js';
import { UIManager } from './ui.js';
import { formatearPrecio, mostrarNotificacion, confirmarAccion } from './utils.js';

// Instancias globales
let carrito;
let filtrosManager;
let uiManager;
let productosGlobales = [];

// Elementos del DOM
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const closeCart = document.getElementById('closeCart');
const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
const btnComprar = document.getElementById('btnComprar');
const precioMinInput = document.getElementById('precioMin');
const precioMaxInput = document.getElementById('precioMax');
const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
const btnResetFiltros = document.getElementById('btnResetFiltros');

/**
 * Carga los productos desde el JSON
 */
async function cargarProductos() {
    try {
        const response = await fetch('./data/productos.json');
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        productosGlobales = data.productos;
        
        // Renderizar productos
        const productosFiltrados = filtrosManager.aplicarFiltros(productosGlobales);
        uiManager.actualizarTodo(productosFiltrados);
        
        mostrarNotificacion('success', 'Productos cargados correctamente');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('error', 'Error al cargar los productos');
        
        // Productos de respaldo en caso de error
        productosGlobales = [
            {
                id: 1,
                nombre: "Curso JavaScript",
                categoria: "cursos",
                precio: 29999,
                stock: 10,
                imagen: "https://via.placeholder.com/200x150?text=JS",
                descripcion: "Aprende JavaScript desde cero"
            }
        ];
        const productosFiltrados = filtrosManager.aplicarFiltros(productosGlobales);
        uiManager.actualizarTodo(productosFiltrados);
    }
}

/**
 * Maneja el clic en los botones de agregar al carrito
 */
function handleAgregarCarrito(event) {
    const button = event.target.closest('.btn-agregar');
    if (!button) return;
    
    const productoId = parseInt(button.dataset.id);
    const producto = productosGlobales.find(p => p.id === productoId);
    
    if (producto) {
        carrito.agregarProducto(producto);
        uiManager.renderizarCarrito();
        
        // Actualizar stock en UI
        const productoCard = button.closest('.producto-card');
        if (productoCard) {
            const nuevoStock = producto.stock - (carrito.items.find(i => i.id === producto.id)?.cantidad || 0);
            const stockSpan = productoCard.querySelector('.producto-stock');
            if (stockSpan) {
                stockSpan.textContent = `Stock: ${nuevoStock} unidades`;
            }
            if (nuevoStock === 0) {
                button.disabled = true;
                button.textContent = 'Sin stock';
            }
        }
    }
}

/**
 * Maneja los eventos del carrito (eliminar, cambiar cantidad)
 */
function handleCarritoEventos(event) {
    const target = event.target;
    const itemId = parseInt(target.dataset.id);
    
    if (target.classList.contains('btn-eliminar')) {
        carrito.eliminarProducto(itemId);
        uiManager.renderizarCarrito();
        // Actualizar stock en productos
        actualizarStockProductos();
    }
    
    if (target.classList.contains('btn-cantidad-menos')) {
        const item = carrito.items.find(i => i.id === itemId);
        if (item) {
            carrito.actualizarCantidad(itemId, item.cantidad - 1);
            uiManager.renderizarCarrito();
            actualizarStockProductos();
        }
    }
    
    if (target.classList.contains('btn-cantidad-mas')) {
        const item = carrito.items.find(i => i.id === itemId);
        const producto = productosGlobales.find(p => p.id === itemId);
        if (item && producto && item.cantidad < producto.stock) {
            carrito.actualizarCantidad(itemId, item.cantidad + 1);
            uiManager.renderizarCarrito();
            actualizarStockProductos();
        } else {
            mostrarNotificacion('error', 'Stock insuficiente');
        }
    }
}

/**
 * Actualiza el stock mostrado en los productos
 */
function actualizarStockProductos() {
    const productosFiltrados = filtrosManager.aplicarFiltros(productosGlobales);
    uiManager.renderizarProductos(productosFiltrados);
}

/**
 * Maneja los filtros por categoría
 */
function setupFiltrosCategoria() {
    const botonesCategoria = document.querySelectorAll('.btn-categoria');
    botonesCategoria.forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.dataset.categoria;
            
            // Actualizar UI de botones
            botonesCategoria.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            
            // Aplicar filtro
            filtrosManager.setCategoria(categoria);
            const productosFiltrados = filtrosManager.aplicarFiltros(productosGlobales);
            uiManager.renderizarProductos(productosFiltrados);
        });
    });
}

/**
 * Maneja el filtro por precio
 */
function setupFiltrosPrecio() {
    btnAplicarFiltros.addEventListener('click', () => {
        const min = parseInt(precioMinInput.value) || 0;
        const max = parseInt(precioMaxInput.value) || Infinity;
        
        filtrosManager.setRangoPrecios(min, max);
        const productosFiltrados = filtrosManager.aplicarFiltros(productosGlobales);
        uiManager.renderizarProductos(productosFiltrados);
        
        if (min > 0 || max !== Infinity) {
            mostrarNotificacion('info', `Filtrando productos entre ${formatearPrecio(min)} y ${formatearPrecio(max)}`);
        }
    });
    
    btnResetFiltros.addEventListener('click', () => {
        precioMinInput.value = '';
        precioMaxInput.value = '';
        filtrosManager.resetearFiltros();
        
        // Resetear botones de categoría
        const botonesCategoria = document.querySelectorAll('.btn-categoria');
        botonesCategoria.forEach(btn => {
            if (btn.dataset.categoria === 'todos') {
                btn.classList.add('activo');
            } else {
                btn.classList.remove('activo');
            }
        });
        
        const productosFiltrados = filtrosManager.aplicarFiltros(productosGlobales);
        uiManager.renderizarProductos(productosFiltrados);
        mostrarNotificacion('info', 'Filtros reseteados');
    });
}

/**
 * Maneja la apertura/cierre del carrito
 */
function setupCarritoUI() {
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        overlay.classList.add('open');
    });
    
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('open');
    });
    
    overlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('open');
    });
    
    btnVaciarCarrito.addEventListener('click', async () => {
        const vaciado = await carrito.vaciarCarrito();
        if (vaciado) {
            uiManager.renderizarCarrito();
            actualizarStockProductos();
        }
    });
    
    btnComprar.addEventListener('click', async () => {
        const comprado = await carrito.finalizarCompra();
        if (comprado) {
            uiManager.renderizarCarrito();
            actualizarStockProductos();
            cartSidebar.classList.remove('open');
            overlay.classList.remove('open');
        }
    });
}

/**
 * Inicializa la aplicación
 */
async function init() {
    // Inicializar instancias
    carrito = new Carrito();
    filtrosManager = new FiltrosManager();
    uiManager = new UIManager(carrito, filtrosManager);
    
    // Cargar productos
    await cargarProductos();
    
    // Configurar eventos
    document.getElementById('productosContainer').addEventListener('click', handleAgregarCarrito);
    document.getElementById('carritoItems').addEventListener('click', handleCarritoEventos);
    
    setupFiltrosCategoria();
    setupFiltrosPrecio();
    setupCarritoUI();
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);