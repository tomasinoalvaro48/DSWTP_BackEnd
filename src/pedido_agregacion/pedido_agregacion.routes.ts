import { Router } from 'express'
import { sanitizePedidoInput, remove, findAll, generarPedidosAgregacion } from './pedido_agregacion.controller.js'

export const pedidos_agregacion_router = Router()

pedidos_agregacion_router.delete('/:id', remove)
pedidos_agregacion_router.get('/', findAll)
pedidos_agregacion_router.post('/', sanitizePedidoInput, generarPedidosAgregacion)