let carrito:any[] = [];

export function agregarAlCarrito(
 plato:any,
 cantidad:number
){
 carrito.push({
   ...plato,
   cantidad
 });
}

export function obtenerCarrito(){
 return carrito;
}

export function limpiarCarrito(){
 carrito = [];
}