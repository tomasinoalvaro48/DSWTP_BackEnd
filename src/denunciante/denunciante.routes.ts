import { Router } from 'express'
import { sanitizeDenuncianteInput, findAll, findOne, add, update, remove } from './denunciante.controler.js'

export const denuncianteRouter = Router()

denuncianteRouter.get('/', findAll)
denuncianteRouter.get('/:cod_den', findOne)
denuncianteRouter.post('/', sanitizeDenuncianteInput, add)
denuncianteRouter.put('/:cod_den', sanitizeDenuncianteInput, update)
denuncianteRouter.patch('/:cod_den', sanitizeDenuncianteInput, update)
denuncianteRouter.delete('/:cod_den', remove)