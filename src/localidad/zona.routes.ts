import { Router } from "express";
import { findAll, findOne, add, update, remove,sanitizeZonaImput } from "./zona.controler.js";


export const zonaRouter = Router()

zonaRouter.get('/',findAll)
zonaRouter.get('/:id',findOne)
zonaRouter.post('/',sanitizeZonaImput, add)
zonaRouter.patch('/:id',sanitizeZonaImput ,update)
zonaRouter.put('/:id', sanitizeZonaImput, update)
zonaRouter.delete('/:id', remove)