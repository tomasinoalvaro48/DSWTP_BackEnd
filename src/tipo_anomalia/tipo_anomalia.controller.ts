import express, { NextFunction, Request, Response } from 'express'
import { Tipo_Anomalia } from './tipo_anomalia.entity.js'
import { Tipo_AnomaliaRepository } from './tipo_anomalia.repository.js'

const repository = new Tipo_AnomaliaRepository()

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

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const tipo = repository.findOne({ id })
  if (!tipo) {
    res.status(404).send({ message: 'Error 404 Tipo de Anomalia not found' })
    return
  }
  res.json({ data: tipo })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput
  const tipoInput = new Tipo_Anomalia(input.cod_anom, input.nombre_anom, input.dif_anom)
  const tipo = repository.add(tipoInput)
  res.status(201).send({ message: 'New JSON Tipo de Anomalia created', data: tipo })
  return
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.cod_anom = parseInt(req.params.id)
  const input = req.body.sanitizedInput
  const tipo = repository.update(input)
  if (!tipo) {
    res.status(404).send({ message: 'Tipo de Anomalia not found' })
    return
  }
  res.status(200).send({
    message: 'Tipo de Anomalia updated',
    data: tipo,
  })
}

function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const tipo = repository.remove({ id })
  if (!tipo) {
    res.status(404).send({ message: 'Tipo de Anomalia not found' })
    return
  }
  res.status(200).send({ message: 'Tipo de Anomalia deleted' })
}

export { sanitizeTipoInput, findAll, findOne, add, update, remove }
