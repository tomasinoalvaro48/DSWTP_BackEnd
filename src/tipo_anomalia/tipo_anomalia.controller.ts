import { NextFunction, Request, Response } from 'express'
import { Tipo_Anomalia } from './tipo_anomalia.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeTipoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    cod_anom: req.body.cod_anom,
    nombre_anom: req.body.nombre_anom,
    dif_anom: req.body.dif_anom,
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) delete req.body.sanitizedInput[key]
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const tipos = await em.find(Tipo_Anomalia, {})
    res.status(200).json({ message: 'found all tipos de anomalia', data: tipos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const tipo = await em.findOneOrFail(Tipo_Anomalia, { id })
    res.status(200).json({ message: 'found tipo de anomalia', data: tipo })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const tipo = em.create(Tipo_Anomalia, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'tipo de anomalia created', data: tipo })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const tipoToUpdate = await em.findOneOrFail(Tipo_Anomalia, { id })
    em.assign(tipoToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'tipo de anomalia updated', data: tipoToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const tipo = em.getReference(Tipo_Anomalia, id)
    await em.removeAndFlush(tipo)
    res.status(200).json({ message: 'tipo de anomalia deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeTipoInput, findAll, findOne, add, update, remove }
