import { Router } from 'express'
import {  findAll, remove,generarPedidosResolucionUnicoPaso,mostrarPosiblesAnomalias,CUU_2_paso_2_tomarPedidoResolucion } from './pedido_resolucion.controller.js'

export const pedidos_resolucion_router = Router()

pedidos_resolucion_router.post('/',generarPedidosResolucionUnicoPaso)
pedidos_resolucion_router.get('/', findAll)
//pedidos_resolucion_router.get('/posiblesAnomalias', mostrarPosiblesAnomalias)
pedidos_resolucion_router.patch('/tomar-pedido-resolucion/:id', CUU_2_paso_2_tomarPedidoResolucion)
pedidos_resolucion_router.delete('/:id',remove)
