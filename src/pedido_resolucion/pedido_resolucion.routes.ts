import { Router } from 'express'
import { generarPedidosResolucion, findAll } from './pedido_resolucion.controller.js'

export const pedidos_resolucion = Router()

pedidos_resolucion.post('/',generarPedidosResolucion)
pedidos_resolucion.get('/', findAll)