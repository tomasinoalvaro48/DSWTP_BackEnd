import { Router } from 'express'
import { remove, findAll, generarPedidosAgregacion, tomarPedidosAgregacion } from './pedido_agregacion.controller.js'

export const pedidos_agregacion_router = Router()

pedidos_agregacion_router.delete('/:id', remove)
pedidos_agregacion_router.get('/', findAll)
pedidos_agregacion_router.post('/', generarPedidosAgregacion)
pedidos_agregacion_router.patch('/tomar-pedidos-agregacion/:id', tomarPedidosAgregacion)