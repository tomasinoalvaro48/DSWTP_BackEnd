import { Router } from 'express'
import {
  findAll,
  findOne,
  remove,
  update,
  approveCazador,
  rejectCazador,
  findPendingCazador,
  sanitizeUsuarioImput,
} from './usuario.controller.js'
import { verifyToken, authorizeRoles, sanitizeUsuarioAuthInput } from '../auth/auth.controller.js'
import { registerUsuario } from '../auth/auth.controller.js'

export const usuarioRouter = Router()

usuarioRouter.get('/', verifyToken, authorizeRoles(['operador']), findAll)
usuarioRouter.get('/pending-cazadores', verifyToken, authorizeRoles(['operador']), findPendingCazador)
usuarioRouter.get('/:id', verifyToken, authorizeRoles(['denunciante', 'cazador', 'operador']), findOne)
usuarioRouter.post('/', verifyToken, authorizeRoles(['operador']), sanitizeUsuarioAuthInput, registerUsuario)
usuarioRouter.patch('/approve/:id', verifyToken, authorizeRoles(['operador']), approveCazador)
usuarioRouter.patch('/reject/:id', verifyToken, authorizeRoles(['operador']), rejectCazador)
usuarioRouter.put('/:id', verifyToken, authorizeRoles(['operador']), sanitizeUsuarioImput, update)
usuarioRouter.patch('/:id', verifyToken, authorizeRoles(['operador']), sanitizeUsuarioImput, update)
usuarioRouter.delete('/:id', verifyToken, authorizeRoles(['operador']), remove)