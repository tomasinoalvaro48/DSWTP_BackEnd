import { Router } from 'express'
import { generarPedidosResolucion, findAll, remove, calcularDificultad,generarPedidosResolucionUnicoPaso } from './pedido_resolucion.controller.js'

export const pedidos_resolucion_router = Router()

pedidos_resolucion_router.post('/',generarPedidosResolucionUnicoPaso)
pedidos_resolucion_router.get('/', findAll)
pedidos_resolucion_router.delete('/:id',remove)
pedidos_resolucion_router.patch('/:id',calcularDificultad)