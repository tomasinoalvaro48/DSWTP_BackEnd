import { Router } from 'express'
import { agregarAnomalia,findAll, remove } from './anomalia.controller.js'

export const anomaliaRouter = Router()

anomaliaRouter.post('/',agregarAnomalia)
anomaliaRouter.get('/', findAll)
anomaliaRouter.delete('/:id',remove)