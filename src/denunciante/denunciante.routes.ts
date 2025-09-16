import { Router } from 'express'
import { sanitizeDenuncianteInput, findAll, findOne, add, update, remove, register, login } from './denunciante.controller.js'

export const denuncianteRouter = Router()

denuncianteRouter.get('/', findAll)
denuncianteRouter.get('/:id', findOne)
denuncianteRouter.post('/', sanitizeDenuncianteInput, add)
denuncianteRouter.put('/:id', sanitizeDenuncianteInput, update)
denuncianteRouter.patch('/:id', sanitizeDenuncianteInput, update)
denuncianteRouter.delete('/:id', remove)
denuncianteRouter.post('/register', register)
denuncianteRouter.post('/login', login)