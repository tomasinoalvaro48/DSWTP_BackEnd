import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./zona.controler.js";


export const zonaRouter = Router()

zonaRouter.get('/',findAll)
zonaRouter.get('/:id',findOne)
zonaRouter.post('/', add)
zonaRouter.patch('/:id', update)
zonaRouter.put('/:id', update)
zonaRouter.delete('/:id', remove)