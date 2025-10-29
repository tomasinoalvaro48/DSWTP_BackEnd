import { NextFunction, Request, Response } from 'express'
import { Tipo_Anomalia } from './tipo_anomalia.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'

const em = orm.em

function sanitizeTipoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeTipoInput = {
    nombre_tipo_anomalia: req.body.nombre_tipo_anomalia,
    dificultad_tipo_anomalia: req.body.dificultad_tipo_anomalia,
  }

  if (!req.body.sanitizeTipoInput.nombre_tipo_anomalia || req.body.sanitizeTipoInput.nombre_tipo_anomalia.trim().length === 0) {
    res.status(400).json({ message: 'El nombre no puede estar vacío' })
    return
  }

  if (req.body.sanitizeTipoInput.nombre_tipo_anomalia && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.sanitizeTipoInput.nombre_tipo_anomalia)) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
    return
  }

  if (req.body.sanitizeTipoInput.dificultad_tipo_anomalia && !/^[1-3]$/.test(req.body.sanitizeTipoInput.dificultad_tipo_anomalia)) {
    res.status(400).json({ message: 'La dificultad tiene que ser 1, 2 o 3' })
    return
  }

  Object.keys(req.body.sanitizeTipoInput).forEach((key) => {
    if (req.body.sanitizeTipoInput[key] === undefined) delete req.body.sanitizeTipoInput[key]
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const tipos = await em.find(Tipo_Anomalia, {})
    res.status(200).json({ message: 'found all tipos de anomalia', data: tipos })
  } catch (error: any) {
    console.log(`Error al obtener los tipos de anomalia: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const tipo = await em.findOneOrFail(Tipo_Anomalia, id)
    res.status(200).json({ message: 'found tipo de anomalia', data: tipo })
  } catch (error: any) {
    console.log(`Error al obtener el tipo de anomalia: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const nombre_tipo = req.body.sanitizeTipoInput.nombre_tipo_anomalia
    if (await validateName(nombre_tipo)) {
      res.status(409).json({ message: 'nombre de tipo duplicado', data: nombre_tipo })
    } else {
      const tipo = em.create(Tipo_Anomalia, req.body.sanitizeTipoInput)
      await em.flush()
      res.status(201).json({ message: 'tipo de anomalia created', data: tipo })
    }
  } catch (error: any) {
    console.log(`Error al crear el tipo de anomalia: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const tipoToUpdate = await em.findOneOrFail(Tipo_Anomalia, id)
    const nombre_tipo = req.body.sanitizeTipoInput.nombre_tipo_anomalia
    if (nombre_tipo && (await validateName(nombre_tipo))) {
      res.status(409).json({ message: 'nombre de tipo duplicado', data: tipoToUpdate })
    } else {
      em.assign(tipoToUpdate, req.body.sanitizeTipoInput)
      await em.flush()
      res.status(200).json({ message: 'tipo de anomalia updated', data: tipoToUpdate })
    }
  } catch (error: any) {
    console.log(`Error al actualizar el tipo de anomalia: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const tipo = em.getReference(Tipo_Anomalia, id)
    await em.removeAndFlush(tipo)
    res.status(200).json({ message: 'tipo de anomalia deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
    console.log(`Error al eliminar el tipo de anomalia: ${error.message}`)
  }
}

async function validateName(nombre_tipo: string) {
  const tipo_nombre = await em.find(Tipo_Anomalia, { nombre_tipo_anomalia: nombre_tipo })
  if (tipo_nombre.length > 0) return true
  return false
}

export { sanitizeTipoInput, findAll, findOne, add, update, remove }
