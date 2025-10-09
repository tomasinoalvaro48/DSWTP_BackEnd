import { Router } from 'express'
import { sanitizeTipoInput, findAll, findOne, add, update, remove } from './tipo_anomalia.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const tipoRouter = Router()

tipoRouter.get('/', verifyToken, authorizeRoles(['cazador', 'denunciante', 'operador']), findAll)
tipoRouter.get('/:id', verifyToken, authorizeRoles(['cazador', 'denunciante', 'operador']), findOne)
tipoRouter.post('/', verifyToken, authorizeRoles(['cazador', 'operador']), sanitizeTipoInput, add)
tipoRouter.put('/:id', verifyToken, authorizeRoles(['operador']), sanitizeTipoInput, update)
tipoRouter.patch('/:id', verifyToken, authorizeRoles(['operador']), sanitizeTipoInput, update)
tipoRouter.delete('/:id', verifyToken, authorizeRoles(['operador']), remove)
