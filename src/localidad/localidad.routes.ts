import { Router } from 'express'
import { add, findAll, findOne, remove, sanitizeLocalidadInput, update } from './localidad.controller.js'

export const localidadRouter = Router()

localidadRouter.get('/', findAll)
localidadRouter.get('/:id', findOne)
localidadRouter.post('/', sanitizeLocalidadInput, add)
localidadRouter.put('/:id', sanitizeLocalidadInput, update)
localidadRouter.patch('/:id', sanitizeLocalidadInput, update)
localidadRouter.delete('/:id', remove)
