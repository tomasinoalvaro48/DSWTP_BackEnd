import { Router } from 'express'
import { add, findAll, findOne, remove, sanitizeLocalidadInput, update } from './localidad.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const localidadRouter = Router()

localidadRouter.get('/', findAll)
localidadRouter.get('/:id', findOne)
localidadRouter.post('/', verifyToken, authorizeRoles(['operador']), sanitizeLocalidadInput, add)
localidadRouter.put('/:id', verifyToken, authorizeRoles(['operador']), sanitizeLocalidadInput, update)
localidadRouter.patch('/:id', verifyToken, authorizeRoles(['operador']), sanitizeLocalidadInput, update)
localidadRouter.delete('/:id', verifyToken, authorizeRoles(['operador']), remove)
