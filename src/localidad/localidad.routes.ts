import { Router } from "express";
import { add, findAll, findOne, remove, sanatizeLocalidadInput, update } from "./localidad.controler.js";

export const localidadRouter = Router()

localidadRouter.get('/',findAll)
localidadRouter.get('/:codigoPostal',findOne)
localidadRouter.post('/', sanatizeLocalidadInput, add)
localidadRouter.put('/:codigoPostal', sanatizeLocalidadInput,update)
localidadRouter.patch('/:codigoPostal', sanatizeLocalidadInput,update)
localidadRouter.delete('/:codigoPostal', remove)