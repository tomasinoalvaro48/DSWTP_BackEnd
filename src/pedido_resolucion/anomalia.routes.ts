import { Router } from 'express'
import { findAll, remove, registrarAnomaliaResuelta } from './anomalia.controller.js'
import { verifyToken, authorizeRoles } from '../auth/auth.controller.js'

export const anomaliaRouter = Router()

anomaliaRouter.get('/', verifyToken, authorizeRoles(['cazador', 'operador', 'denunciante']), findAll)
anomaliaRouter.delete('/:id', verifyToken, authorizeRoles(['cazador', 'operador', 'denunciante']), remove)
anomaliaRouter.patch('/resolver_anomalia/:id', verifyToken, authorizeRoles(['cazador', 'operador']), registrarAnomaliaResuelta)
