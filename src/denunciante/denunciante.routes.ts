import { Router } from 'express'
import { sanitizeDenuncianteInput, findAll, findOne, add, update, remove } from './denunciante.controler.js'

export const denuncianteRouter = Router()

denuncianteRouter.get('/', findAll)
denuncianteRouter.get('/:id', findOne)
denuncianteRouter.post('/', sanitizeDenuncianteInput, add)
denuncianteRouter.put('/:id', sanitizeDenuncianteInput, update)
denuncianteRouter.patch('/:id', sanitizeDenuncianteInput, update)
denuncianteRouter.delete('/:id', remove)