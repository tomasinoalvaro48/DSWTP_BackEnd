import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Zona } from './zona.entity.js'
import { ObjectId } from 'mongodb'
import { Localidad } from './localidad.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'

const em = orm.em

function sanitizeZonaImput(req: Request, res: Response, next: NextFunction) {
  let localidadRef = undefined
  if (req.body.localidad) {
    const idLocalidad = new ObjectId(req.body.localidad)
    localidadRef = em.getReference(Localidad, idLocalidad)
  }

  req.body.sanitizeZonaImput = {
    nombre_zona: req.body.nombre_zona,
    localidad: localidadRef,
  }

  if (!req.body.sanitizeZonaImput.nombre_zona || req.body.sanitizeZonaImput.nombre_zona.trim().length === 0) {
    res.status(400).json({ message: 'El nombre no puede estar vacío' })
    return
  }

  if (req.body.sanitizeZonaImput.nombre_zona && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.sanitizeZonaImput.nombre_zona)) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
    return
  }

  Object.keys(req.body.sanitizeZonaImput).forEach((key) => {
    if (req.body.sanitizeZonaImput[key] === undefined) {
      delete req.body.sanitizeZonaImput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const zonas = await em.find(Zona, {}, { populate: ['localidad', 'usuarios'] })
    res.status(200).json({ message: 'find all zonas', data: zonas })
  } catch (error: any) {
    console.log(`Error al obtener las zonas: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const zona = await em.findOneOrFail(Zona, id, { populate: ['localidad', 'usuarios'] })
    res.status(200).json({ message: 'find one zona', data: zona })
  } catch (error: any) {
    console.log(`Error al obtener la zona: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const { nombre_zona, localidad } = req.body.sanitizeZonaImput
    const localidadRef = em.getReference(Localidad, (localidad as any).id ?? localidad)

    // verificar que no exista otra zona con ese nombre en la misma localidad
    const zonaExistente = await em.findOne(Zona, {
      nombre_zona,
      localidad: localidadRef,
    })
    if (zonaExistente) {
      res.status(400).json({ message: 'Ya existe esa zona en esta localidad.' })
      return
    }

    const zona = em.create(Zona, {
      nombre_zona,
      localidad: localidadRef,
    })

    await em.flush()
    res.status(200).json({ message: 'create zona', data: zona })
  } catch (error: any) {
    console.log(`Error al crear la zona: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const { nombre_zona, localidad } = req.body.sanitizeZonaImput
    // Cargar la zona actual
    const zonaToUpdate = await em.findOneOrFail(Zona, id, { populate: ['localidad'] })
    // Si se intenta cambiar el nombre, verificar que no exista otra zona con ese nombre en la misma localidad
    if (nombre_zona && nombre_zona !== zonaToUpdate.nombre_zona) {
      const zonaExistente = await em.findOne(Zona, {
        nombre_zona,
        localidad: zonaToUpdate.localidad,
      })

      if (zonaExistente && zonaExistente.id !== id.toHexString()) {
        res.status(400).json({ message: 'Ya existe esa zona en esta localidad.' })
        return
      }
    }
    // Asignar los cambios
    em.assign(zonaToUpdate, req.body.sanitizeZonaImput)

    await em.flush()
    res.status(200).json({ message: 'Zona updated.' })
  } catch (error: any) {
    console.log(`Error al actualizar la zona: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)

    // validar que no tenga usuarios asociados
    const usuariosCount = await em.count(Usuario, { zona: id })
    if (usuariosCount > 0) {
      res.status(400).json({ message: 'No se puede eliminar la zona porque tiene usuarios asociados.' })
      return
    }

    // validar que no tenga pedidos de resolución asociados
    const pedidosCount = await em.count(Pedido_Resolucion, { zona: id })
    if (pedidosCount > 0) {
      res.status(400).json({ message: 'No se puede eliminar la zona porque tiene pedidos de resolución asociados.' })
      return
    }

    const zonaToDelete = em.getReference(Zona, id)
    await em.removeAndFlush(zonaToDelete)
    res.status(200).json({ message: 'Remove zona', data: zonaToDelete })
  } catch (error: any) {
    console.log(`Error al eliminar zona: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, remove, update, sanitizeZonaImput }
