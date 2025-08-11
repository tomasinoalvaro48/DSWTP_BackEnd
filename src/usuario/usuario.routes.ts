import { Router } from "express";
import { add, findAll, findOne, remove, update } from './usuario.controller.js'

export const usuarioRouter = Router()

usuarioRouter.get('/', findAll)
usuarioRouter.get('/:id', findOne)
usuarioRouter.post('/', add)
usuarioRouter.put('/:id', update)
usuarioRouter.patch('/:id', update)
usuarioRouter.delete('/:id', remove)