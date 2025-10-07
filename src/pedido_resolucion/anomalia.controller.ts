import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Anomalia } from './anomalia.entity.js'
import { ObjectId } from 'mongodb'
import { Pedido_Resolucion } from './pedido_resolucion.entity.js'

const em = orm.em

async function registrarAnomaliaResuelta(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const anomaliaToUpdate = em.getReference(Anomalia, id)
    const anomaliaResuelta = { resultado_anomalia: 'resuelta' }
    em.assign(anomaliaToUpdate, anomaliaResuelta)
    await em.flush()
    res.status(200).json({ message: 'Anomalia resuelta' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// VER SI SE USA ------------
async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const anomalia_to_remove = em.getReference(Anomalia, id)
    await em.removeAndFlush(anomalia_to_remove)
    res.status(200).json({ message: 'Remove anomalia', data: anomalia_to_remove })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// VER SI SE USA ------------
async function findAll(req: Request, res: Response) {
  try {
    const anomalia = await em.find(Anomalia, {}, { populate: ['pedido_resolucion', 'tipo_anomalia'] })
    res.status(200).json({ message: 'find all anomalias', data: anomalia })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, remove, registrarAnomaliaResuelta }
