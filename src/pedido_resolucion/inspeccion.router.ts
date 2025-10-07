import { Router } from 'express'
import { findAll, sanitizeInspeccionInput, addInspeccion, remove } from './inspeccion.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const inspeccionRouter = Router()

inspeccionRouter.get('/', verifyToken, findAll)
inspeccionRouter.post('/', sanitizeInspeccionInput, addInspeccion)
inspeccionRouter.delete('/:id', remove)
