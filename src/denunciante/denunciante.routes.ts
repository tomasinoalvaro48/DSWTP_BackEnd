import { Router } from 'express'
import { findAll, findOne } from './denunciante.controller.js'
import { verifyToken, authorizeRoles, sanitizeDenuncianteAuthInput } from '../auth/auth.controller.js'
import { registerDenunciante } from '../auth/auth.controller.js'

export const denuncianteRouter = Router()

denuncianteRouter.get('/', verifyToken, authorizeRoles(['operador']), findAll)
denuncianteRouter.get('/:id', verifyToken, authorizeRoles(['denunciante', 'cazador', 'operador']), findOne)
denuncianteRouter.post('/', verifyToken, authorizeRoles(['operador']), sanitizeDenuncianteAuthInput, registerDenunciante)
