import { Router } from 'express'
import { generarPedidosResolucion, findAll, agregarTiposAnomalias, registrarPedido, remove } from './pedido_resolucion.controller.js'

export const pedidos_resolucion = Router()

pedidos_resolucion.post('/',generarPedidosResolucion)
pedidos_resolucion.get('/', findAll)
pedidos_resolucion.patch('/agregarAnomalia/:id',agregarTiposAnomalias)
pedidos_resolucion.patch('/registrarPedido/:id',registrarPedido)
pedidos_resolucion.delete('/:id',remove)