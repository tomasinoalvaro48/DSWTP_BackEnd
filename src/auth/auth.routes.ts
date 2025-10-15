import {
  registerDenunciante,
  registerUsuario,
  login,
  sanitizeUsuarioAuthInput,
  sanitizeDenuncianteAuthInput,
  verifyToken,
  changePassword,
} from './auth.controller.js'
import { Router } from 'express'

export const authRouter = Router()

authRouter.post('/register-denunciante', sanitizeDenuncianteAuthInput, registerDenunciante)
authRouter.post('/register-usuario', sanitizeUsuarioAuthInput, registerUsuario)
authRouter.post('/login', login)
authRouter.post('/change-password', verifyToken, changePassword);