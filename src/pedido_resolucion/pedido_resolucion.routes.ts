import { Router } from 'express';
import {
  findAll,
  remove,
  generarPedidoResolucion,
  showMisPedidos,
  tomarPedidoResolucion,
  finalizarPedido,
} from './pedido_resolucion.controller.js';
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js';

export const pedidos_resolucion_router = Router();

pedidos_resolucion_router.get(
  '/',
  verifyToken,
  authorizeRoles(['cazador', 'operador', 'denunciante']),
  findAll
);
pedidos_resolucion_router.get(
  '/mis_pedidos',
  verifyToken,
  authorizeRoles(['cazador', 'operador', 'denunciante']),
  showMisPedidos
);
pedidos_resolucion_router.post(
  '/',
  verifyToken,
  authorizeRoles(['operador', 'denunciante']),
  generarPedidoResolucion
);
pedidos_resolucion_router.patch(
  '/tomar-pedido-resolucion/:id',
  verifyToken,
  authorizeRoles(['cazador', 'operador']),
  tomarPedidoResolucion
);
pedidos_resolucion_router.patch(
  `/finalizar-pedido-resolucion/:id`,
  verifyToken,
  authorizeRoles(['cazador', 'operador']),
  finalizarPedido
);
pedidos_resolucion_router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(['operador', 'denunciante']),
  remove
);
