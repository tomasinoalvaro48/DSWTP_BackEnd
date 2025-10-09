import { Router } from 'express'
import { findAll, findOne, add, update, remove, sanitizeZonaImput } from './zona.controler.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const zonaRouter = Router()

zonaRouter.get('/', findAll)
zonaRouter.get('/:id', findOne)
zonaRouter.post('/', verifyToken, authorizeRoles(['operador']), sanitizeZonaImput, add)
zonaRouter.patch('/:id', verifyToken, authorizeRoles(['operador']), sanitizeZonaImput, update)
zonaRouter.put('/:id', verifyToken, authorizeRoles(['operador']), sanitizeZonaImput, update)
zonaRouter.delete('/:id', verifyToken, authorizeRoles(['operador']), remove)
