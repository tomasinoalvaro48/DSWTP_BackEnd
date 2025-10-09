import { Router } from 'express'
import { findAll, sanitizeInspeccionInput, addInspeccion, remove } from './inspeccion.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const inspeccionRouter = Router()

inspeccionRouter.get('/', verifyToken, authorizeRoles(['cazador', 'operador', 'denunciante']), findAll)
inspeccionRouter.post('/', verifyToken, authorizeRoles(['cazador', 'operador']), sanitizeInspeccionInput, addInspeccion)
inspeccionRouter.delete('/:id', verifyToken, authorizeRoles(['cazador', 'operador']), remove)
