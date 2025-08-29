import { Request, Response, NextFunction } from 'express'
import { Denunciante } from './denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'

const em = orm.em

function sanitizeDenuncianteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeDenuncianteInput = {
    //cod_den: req.body.cod_den,
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante
  }
  //more checks here

  Object.keys(req.body.sanitizeDenuncianteInput).forEach((key) => {
    if (req.body.sanitizeDenuncianteInput[key] === undefined) {
      delete req.body.sanitizeDenuncianteInput[key]
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
    const id = new ObjectId(req.params.id) //Arreglado
    const denunciante = await em.findOneOrFail(Denunciante, id )
    res.status(200).json({ message: 'found denunciante', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const denunciante = em.create(Denunciante, req.body.sanitizeDenuncianteInput)
    await em.flush()
    res.status(201).json({ message: 'denunciante created', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {  
  try {
    const id = new ObjectId(req.params.id) //Arreglado
    const denuncianteToUpdate = await em.findOneOrFail(Denunciante, id )
    em.assign(denuncianteToUpdate, req.body.sanitizeDenuncianteInput)
    await em.flush()
    res.status(200).json({ message: 'denunciante updated', data: denuncianteToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id) //Arreglado
    const denunciante = em.getReference(Denunciante, id)
    await em.removeAndFlush(denunciante)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function buscarOCrearDenunciante(req: Request, res: Response) {
  try{  
    try{
        const denunciante = await em.findOneOrFail(Denunciante,{email_denunciante: req.body.mailDenunciante })
        return denunciante
    }
    catch{
        //sanitizeDenuncianteInput(req, res, next) VER COMO IMPLEMENTAR ESTO COMO GENERAL

        req.body.sanitizeDenuncianteInput = {
          //cod_den: req.body.codigoDenunciante,
          nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
          telefono_denunciante: req.body. telefono_denunciante,
          email_denunciante: req.body. telefono_denunciante
        };
          
        //const denunciante = await add(req, res)  
        const denunciante =em.create(Denunciante, req.body.sanitizeDenuncianteInput)
        return denunciante 
    }
  }
  catch(error: any)
  {
      console.log(`Error al buscar denunciante: ${error.message}`)
  }
}


export { sanitizeDenuncianteInput, findAll, findOne, add, update, remove, buscarOCrearDenunciante }