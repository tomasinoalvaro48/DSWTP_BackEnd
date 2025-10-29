import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Usuario } from './usuario.entity.js'
import { ObjectId } from 'mongodb'

const em = orm.em

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(Usuario, {}, { populate: ['zona', 'zona.localidad'] })
    res.status(200).json({ message: 'find all usuarios', data: usuarios })
  } catch (error: any) {
    console.log(`Error al obtener los usuarios: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, id, { populate: ['zona', 'zona.localidad'] })
    res.status(200).json({ message: 'find one usuario', data: usuario })
  } catch (error: any) {
    console.log(`Error al obtener el usuario: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function approveCazador(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const usuarioToUpdate = await em.findOneOrFail(Usuario, id)
    usuarioToUpdate.estado_aprobacion = 'aprobado'
    await em.flush()
    res.status(200).json({ message: 'Cazador aprobado', data: usuarioToUpdate })
  } catch (error: any) {
    console.log('Error al buscar el usuario: ', error.message)
    res.status(500).json({ message: error.message })
  }
}

async function rejectCazador(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const usuarioToUpdate = await em.findOneOrFail(Usuario, id)
    if (usuarioToUpdate.tipo_usuario !== 'cazador') {
      res.status(400).json({ message: 'El usuario no es un cazador.' })
      return
    }
    if (usuarioToUpdate.estado_aprobacion === 'aprobado') {
      res.status(400).json({ message: 'El cazador ya está aprobado.' })
      return
    }
    usuarioToUpdate.estado_aprobacion = 'rechazado'
    await em.flush()
    res.status(200).json({ message: 'Cazador rechazado.' })
  } catch (error: any) {
    console.log('Error al buscar el usuario: ', error.message)
    res.status(500).json({ message: error.message })
  }
}

async function findPendingCazador(req: Request, res: Response) {
  try {
    const cazadoresPendientes = await em.find(
      Usuario,
      { tipo_usuario: 'cazador', estado_aprobacion: 'pendiente' },
      { populate: ['zona', 'zona.localidad'] }
    )
    console.log('encontrados cazadores pendientes: ', cazadoresPendientes.length)
    res.status(200).json({ message: 'Cazadores pendientes de aprobación', data: cazadoresPendientes })
  } catch (error: any) {
    console.log('error al buscar cazadores pendientes: ', error)
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, approveCazador, rejectCazador, findPendingCazador }
