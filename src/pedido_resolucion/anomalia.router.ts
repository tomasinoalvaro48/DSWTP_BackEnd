import { Router } from 'express'
import { findAll, remove, registrarAnomaliaResuelta } from './anomalia.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const anomaliaRouter = Router()

anomaliaRouter.get('/', verifyToken, findAll)
anomaliaRouter.delete('/:id', verifyToken, remove)
anomaliaRouter.patch('/resolver_anomalia/:id', verifyToken, authorizeRoles('cazador', 'operador'), registrarAnomaliaResuelta)
