import { Router } from "express";
import { add, findAll, findOne, remove, update, sanitizeUsuarioImput } from './usuario.controller.js'

export const usuarioRouter = Router()

usuarioRouter.get('/', findAll)
usuarioRouter.get('/:id', findOne)
usuarioRouter.post('/',sanitizeUsuarioImput, add)
usuarioRouter.put('/:id',sanitizeUsuarioImput, update)
usuarioRouter.patch('/:id',sanitizeUsuarioImput, update)
usuarioRouter.delete('/:id', remove)