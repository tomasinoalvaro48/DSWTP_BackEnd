import { Router } from 'express'
import { findAll, sanitizeInspeccionInput, addInspeccion,remove } from './inspeccion.controller.js'

export const inspeccionRouter = Router()

inspeccionRouter.get('/',findAll)
inspeccionRouter.post('/',sanitizeInspeccionInput,addInspeccion)
inspeccionRouter.delete('/:id', remove)

