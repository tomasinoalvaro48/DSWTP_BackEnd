import { Router } from 'express'
import {
  findAll,
  remove,
  generarPedidoResolucion,
  mostrarPosiblesAnomalias,
} from './pedido_resolucion.controller.js'

export const pedidos_resolucion_router = Router()

pedidos_resolucion_router.get('/', findAll)
pedidos_resolucion_router.post('/', generarPedidoResolucion)
pedidos_resolucion_router.get('/posiblesAnomalias', mostrarPosiblesAnomalias)
pedidos_resolucion_router.delete('/:id', remove)
