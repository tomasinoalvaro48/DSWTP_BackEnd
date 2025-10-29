import { Router } from 'express'
import { findAll, findOne, approveCazador, rejectCazador, findPendingCazador } from './usuario.controller.js'
import { verifyToken, authorizeRoles, sanitizeUsuarioAuthInput } from '../auth/auth.controller.js'
import { registerUsuario } from '../auth/auth.controller.js'

export const usuarioRouter = Router()

usuarioRouter.get('/', verifyToken, authorizeRoles(['operador']), findAll)
usuarioRouter.get('/pending-cazadores', verifyToken, authorizeRoles(['operador']), findPendingCazador)
usuarioRouter.get('/:id', verifyToken, authorizeRoles(['denunciante', 'cazador', 'operador']), findOne)
usuarioRouter.post('/', verifyToken, authorizeRoles(['operador']), sanitizeUsuarioAuthInput, registerUsuario)
usuarioRouter.patch('/approve/:id', verifyToken, authorizeRoles(['operador']), approveCazador)
usuarioRouter.patch('/reject/:id', verifyToken, authorizeRoles(['operador']), rejectCazador)
