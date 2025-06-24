import { Router } from 'express'
import {
  sanitizeTipoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './tipo_anomalia.controller.js'

export const tipoRouter = Router()

tipoRouter.get('/', findAll)
tipoRouter.get('/:id', findOne)
tipoRouter.post('/', sanitizeTipoInput, add)
tipoRouter.put('/', sanitizeTipoInput, update)
tipoRouter.patch('/', sanitizeTipoInput, update)
tipoRouter.delete('/:id', remove)
