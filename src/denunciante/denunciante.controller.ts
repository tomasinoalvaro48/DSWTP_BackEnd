import { Request, Response } from 'express'
import { Denunciante } from './denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'

const em = orm.em

async function findAll(req: Request, res: Response) {
  try {
    const denunciantes = await em.find(Denunciante, {})
    res.status(200).json({ message: 'found all denunciantes', data: denunciantes })
  } catch (error: any) {
    console.log('Error finding denunciantes:', error)
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const denunciante = await em.findOneOrFail(Denunciante, id)
    res.status(200).json({ message: 'found denunciante', data: denunciante })
  } catch (error: any) {
    console.log('Error finding denunciante:', error)
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne }