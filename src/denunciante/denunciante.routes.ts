import { Router } from 'express'
import { sanitizeDenuncianteInput, findAll, findOne, update, remove } from './denunciante.controller.js'
import { verifyToken, authorizeRoles, sanitizeDenuncianteAuthInput } from '../auth/auth.controller.js'
import { registerDenunciante } from '../auth/auth.controller.js'

export const denuncianteRouter = Router()

denuncianteRouter.get('/', verifyToken, authorizeRoles(['operador']), findAll)
denuncianteRouter.get('/:id', verifyToken, authorizeRoles(['denunciante', 'cazador', 'operador']), findOne)
denuncianteRouter.post('/', verifyToken, authorizeRoles(['operador']), sanitizeDenuncianteAuthInput, registerDenunciante)
denuncianteRouter.put('/:id', verifyToken, authorizeRoles(['denunciante', 'operador']), sanitizeDenuncianteInput, update)
denuncianteRouter.patch('/:id', verifyToken, authorizeRoles(['denunciante', 'operador']), sanitizeDenuncianteInput, update)
denuncianteRouter.delete('/:id', verifyToken, authorizeRoles(['denunciante', 'operador']), remove)