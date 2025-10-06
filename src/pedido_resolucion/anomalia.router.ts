import { Router } from 'express'
import { findAll, remove, registrarAnomaliaResuelta } from './anomalia.controller.js'

export const anomaliaRouter = Router()

//anomaliaRouter.post('/',agregarAnomalia)
anomaliaRouter.get('/', findAll)
anomaliaRouter.delete('/:id',remove)
anomaliaRouter.patch('/resolver_anomalia/:id',registrarAnomaliaResuelta)