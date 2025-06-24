import { Request, Response, NextFunction } from 'express'
import { DenuncianteRepository } from './denunciante.repository.js'
import { Denunciante } from './denunciante.entity.js'

const repository = new DenuncianteRepository()

function sanitizeDenuncianteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    cod_den: req.body.cod_den,
    nombre_den: req.body.nombre_den,
    telefono: req.body.telefono,
    direccion_den: req.body.direccion_den,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  //const denunciante = repository.findOne({ id: parseInt(req.params.cod_den) })
  const id = parseInt(req.params.cod_den)
  const denunciante = repository.findOne({ id })
  if (!denunciante) {
    res.status(404).send({ message: 'Denunciante not found' })
  } else {
    res.json({ data: denunciante })
  }
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput
  const denuncianteInput = new Denunciante(
    input.cod_den,
    input.nombre_den,
    input.telefono,
    input.direccion_den
  )

  const denunciante = repository.add(denuncianteInput)
  if (denunciante) {
    res.status(201).send({ message: 'Denunciante created', data: denunciante })
  } else {
    res.status(500).send({ message: 'Denunciante could not be created' })
  }
}

function update(req: Request, res: Response) {
  //const denunciante = repository.update({ id: parseInt(req.params.cod_den) })
  const input = req.body.sanitizedInput
  input.cod_den = parseInt(req.params.cod_den)
  const denunciante = repository.update(input)

  if (!denunciante) {
    res.status(404).send({ message: 'Denunciante not found' })
  } else {
    res.status(200).send({ message: 'Denunciante updated successfully', data: denunciante })
  }
}

function remove(req: Request, res: Response) {
  //const denunciante = repository.delete({ id: parseInt(req.params.cod_den) })
  const id = parseInt(req.params.cod_den)
  const denunciante = repository.remove({ id })

  if (!denunciante) {
    res.status(404).send({ message: 'Denunciante not found' })
  } else {
    res.status(200).send({ message: 'Denunciante deleted successfully' })
  }
}

export { sanitizeDenuncianteInput, findAll, findOne, add, update, remove }