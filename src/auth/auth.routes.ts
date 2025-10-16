import {
  registerDenunciante,
  registerUsuario,
  login,
  sanitizeUsuarioAuthInput,
  sanitizeDenuncianteAuthInput,
  verifyToken,
  changePassword,
  updatePerfil,
  getPerfil,
  deleteAccount,
} from './auth.controller.js'
import { Router } from 'express'

export const authRouter = Router()

authRouter.post('/register-denunciante', sanitizeDenuncianteAuthInput, registerDenunciante)
authRouter.post('/register-usuario', sanitizeUsuarioAuthInput, registerUsuario)
authRouter.post('/login', login)
authRouter.post('/change-password', verifyToken, changePassword);
authRouter.put('/update-profile', verifyToken, updatePerfil)
authRouter.get('/get-profile', verifyToken, getPerfil)
authRouter.delete('/delete-account', verifyToken, deleteAccount)