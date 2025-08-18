import { Request, Response, NextFunction } from 'express'
import { Denunciante } from './denunciante.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeDenuncianteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    cod_den: req.body.cod_den,
    nombre_den: req.body.nombre_den,
    telefono: req.body.telefono,
    //direccion_den: req.body.direccion_den,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const denunciantes = await em.find(Denunciante, {})
    res.status(200).json({ message: 'found all denunciantes', data: denunciantes })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
    try {
    const id = req.params.id
    const denunciante = await em.findOneOrFail(Denunciante, { id })
    res.status(200).json({ message: 'found denunciante', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const denunciante = em.create(Denunciante, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'denunciante created', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {  
  try {
    const id = req.params.id
    const denuncianteToUpdate = await em.findOneOrFail(Denunciante, { id })
    em.assign(denuncianteToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'denunciante updated', data: denuncianteToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const denunciante = em.getReference(Denunciante, id)
    await em.removeAndFlush(denunciante)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function buscarOCrearDenunciante(req: Request, res: Response) {
  try{  
    try{
        const denunciante = await em.findOneOrFail(Denunciante,{ email: req.body.mailDenunciante })
        return denunciante
    }
    catch{
        req.body.sanitizedInput = {
          cod_den: req.body.codigoDenunciante,
          nombre_den: req.body.nombreDenunciante,
          telefono: req.body.telefonoDenunciante,
          email: req.body.mailDenunciante
        }
          
        const denunciante = await add(req, res)  
        return denunciante
    }
  }
  catch(error: any)
  {
      console.log(`Error al buscar denunciante: ${error.message}`)
  }
}




export { sanitizeDenuncianteInput, findAll, findOne, add, update, remove, buscarOCrearDenunciante }