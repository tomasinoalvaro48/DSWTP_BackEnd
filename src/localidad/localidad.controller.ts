import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Localidad } from './localidad.entity.js'
import { ObjectId } from 'mongodb'
import { Usuario } from '../usuario/usuario.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'

const em = orm.em

function sanitizeLocalidadInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeLocalidadInput = {
    codigo_localidad: req.body.codigo_localidad,
    nombre_localidad: req.body.nombre_localidad,
  }

  if (!req.body.sanitizeLocalidadInput.codigo_localidad || req.body.sanitizeLocalidadInput.codigo_localidad.trim().length === 0) {
    res.status(400).json({ message: 'El código no puede estar vacío' })
    return
  }

  if (req.body.sanitizeLocalidadInput.codigo_localidad && !/^[0-9]+$/.test(req.body.sanitizeLocalidadInput.codigo_localidad)) {
    res.status(400).json({ message: 'El código no puede tener letras' })
    return
  }

  if (!req.body.sanitizeLocalidadInput.nombre_localidad || req.body.sanitizeLocalidadInput.nombre_localidad.trim().length === 0) {
    res.status(400).json({ message: 'El nombre no puede estar vacío' })
    return
  }

  if (req.body.sanitizeLocalidadInput.nombre_localidad && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.sanitizeLocalidadInput.nombre_localidad)) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
    return
  }

  Object.keys(req.body.sanitizeLocalidadInput).forEach((key) => {
    if (req.body.sanitizeLocalidadInput[key] === undefined) {
      delete req.body.sanitizeLocalidadInput[key]
    }
  })

  next()
}

async function findAll(req: Request, res: Response) {
  try {
    let filter: { nombre_localidad?: string } = {}

    if (req.query.nombre) {
      filter.nombre_localidad = req.query.nombre as string
    }
    const localidades = await em.find(Localidad, filter, { populate: ['zonas'] })
    res.status(200).json({ message: 'find all localidades', data: localidades })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const localidad = await em.findOneOrFail(Localidad, id, { populate: ['zonas'] })
    res.status(200).json({ message: 'find one localidad', data: localidad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const localidad = em.create(Localidad, req.body.sanitizeLocalidadInput)
    await em.flush()
    res.status(200).json({ message: 'create localidad', data: localidad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const localidadToUpdate = await em.findOneOrFail(Localidad, id)
    // Si se cambia el codigo_localidad
    if (req.body.sanitizeLocalidadInput.codigo_localidad && req.body.sanitizeLocalidadInput.codigo_localidad !== localidadToUpdate.codigo_localidad) {
      // Verificar que no exista otra localidad con ese código
      const existeOtraLocalidad = await em.findOne(Localidad, {
        codigo_localidad: req.body.sanitizeLocalidadInput.codigo_localidad,
      })
      if (existeOtraLocalidad) {
        res.status(400).json({ message: 'Ya existe una localidad con ese código' })
        return
      }
    }
    // Si no se cambia el código lo eliminamos del input
    if (!req.body.sanitizeLocalidadInput.codigo_localidad) {
      delete req.body.sanitizeLocalidadInput.codigo_localidad
    }

    em.assign(localidadToUpdate, req.body.sanitizeLocalidadInput)
    await em.flush()
    res.status(200).json({ message: 'localidad updated.' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idLoc = new ObjectId(req.params.id)
    const localidadToDelete = await em.findOneOrFail(Localidad, idLoc, { populate: ['zonas'] })

    // validar que las zonas no tengan usuarios o pedidos de resolución asociados
    for (const zona of localidadToDelete.zonas) {
      // validar que no tenga usuarios asociados a sus zonas
      const zonaId = new ObjectId(zona.id)
      const usuariosCount = await em.count(Usuario, { zona: zonaId })
      if (usuariosCount > 0) {
        res.status(400).json({ message: 'No se puede eliminar la zona porque tiene usuarios asociados a sus zonas.' })
        return
      }

      // validar que no tenga pedidos de resolución asociados a sus zonas
      const pedidosCount = await em.count(Pedido_Resolucion, { zona: zonaId })
      if (pedidosCount > 0) {
        res.status(400).json({ message: 'No se puede eliminar la zona porque tiene pedidos de resolución asociados a sus zonas.' })
        return
      }
    }

    // eliminar las zonas asociadas a la localidad
    for (const zona of localidadToDelete.zonas) {
      em.remove(zona)
    }
    em.remove(localidadToDelete)
    await em.flush()
    res.status(200).json({ message: 'Remove localidad', data: localidadToDelete })
  } catch (error: any) {
    console.log('Error removing localidad:', error)
    res.status(500).json({ message: error.message })
  }
}

async function findLocalidadByName(nombre_localidad: string) {
  try {
    const localidadFound = await em.findOneOrFail(Localidad, { nombre_localidad: nombre_localidad })
    return localidadFound
  } catch (error: any) {
    console.log(`Error al buscar localidad por nombre: ${error.message}`)
  }
}

export { findAll, findOne, add, remove, update, sanitizeLocalidadInput, findLocalidadByName }
