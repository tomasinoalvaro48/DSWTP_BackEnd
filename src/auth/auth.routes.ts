import {registerDenunciante, registerUsuario, login, sanitizeUsuarioAuthInput, sanitizeDenuncianteAuthInput} from './auth.controller.js'
import { Router } from 'express'


export const authRouter = Router()

authRouter.post('/register-denunciante',sanitizeDenuncianteAuthInput, registerDenunciante)
authRouter.post('/register-usuario',sanitizeUsuarioAuthInput,registerUsuario)
authRouter.patch('/login',login)    //ver no creo que sea correcto usar patch