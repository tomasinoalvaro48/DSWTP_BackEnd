import { Router } from 'express'
import { add, findAll, findOne, remove, update } from './localidad.controller.js'

export const localidadRouter = Router()

localidadRouter.get('/', findAll)
localidadRouter.get('/:id', findOne)
localidadRouter.post('/', add)
localidadRouter.put('/:id', update)
localidadRouter.patch('/:id', update)
localidadRouter.delete('/:id', remove)
