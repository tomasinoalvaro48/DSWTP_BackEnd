import { Router } from 'express'
import { remove, findAll, generarPedidosAgregacion, tomarPedidosAgregacion } from './pedido_agregacion.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const pedidos_agregacion_router = Router()

pedidos_agregacion_router.get('/', verifyToken, authorizeRoles(['cazador', 'operador']), findAll)
pedidos_agregacion_router.delete('/:id', verifyToken, authorizeRoles(['cazador', 'operador']), remove)
pedidos_agregacion_router.post('/', verifyToken, authorizeRoles(['cazador', 'operador']), generarPedidosAgregacion)
pedidos_agregacion_router.patch(
  '/tomar-pedidos-agregacion/:id',
  verifyToken,
  authorizeRoles(['cazador', 'operador']),
  tomarPedidosAgregacion
)
