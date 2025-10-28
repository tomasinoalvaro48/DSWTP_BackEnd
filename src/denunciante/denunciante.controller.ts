import { Request, Response, NextFunction, RequestHandler } from 'express'
import { Denunciante } from './denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'
import { Usuario } from '../usuario/usuario.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'

const em = orm.em

//eliminar sanitizeUsuarioImput (porque sacamos add, update y remove)
function sanitizeDenuncianteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeDenuncianteInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante,
  }

  if (
    !req.body.sanitizeDenuncianteInput.nombre_apellido_denunciante ||
    req.body.sanitizeDenuncianteInput.nombre_apellido_denunciante.trim().length === 0
  ) {
    res.status(400).json({ message: 'El nombre no puede estar vacío' })
    return
  }

  if (
    req.body.sanitizeDenuncianteInput.nombre_apellido_denunciante &&
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.sanitizeDenuncianteInput.nombre_apellido_denunciante)
  ) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
    return
  }

  if (
    !req.body.sanitizeDenuncianteInput.telefono_denunciante ||
    req.body.sanitizeDenuncianteInput.telefono_denunciante.trim().length === 0
  ) {
    res.status(400).json({ message: 'El teléfono no puede estar vacío' })
    return
  }

  if (
    req.body.sanitizeDenuncianteInput.telefono_denunciante &&
    !/^[0-9]+$/.test(req.body.sanitizeDenuncianteInput.telefono_denunciante)
  ) {
    res.status(400).json({ message: 'El teléfono no puede tener letras ni espacios' })
    return
  }

  if (req.body.sanitizeDenuncianteInput.email_denunciante && !/.*@.*/.test(req.body.sanitizeDenuncianteInput.email_denunciante)) {
    res.status(400).json({ message: 'El email tiene que tener @' })
    return
  }

  if (
    !req.body.sanitizeDenuncianteInput.password_denunciante ||
    req.body.sanitizeDenuncianteInput.password_denunciante.length < 6
  ) {
    res.status(400).json({ message: 'La contraseña tiene que tener mínimo 6 caracteres' })
    return
  }

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
    const id = new ObjectId(req.params.id)
    const denunciante = await em.findOneOrFail(Denunciante, id)
    res.status(200).json({ message: 'found denunciante', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/*async function add(req: Request, res: Response) {
  try {
    const denunciante = em.create(Denunciante, req.body.sanitizeDenuncianteInput)
    await em.flush()
    res.status(201).json({ message: 'denunciante created', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}*/

async function update(req: Request, res: Response) {
  try {
    //Valida que no exista como usuario
    const email_usuario = req.body.sanitizeDenuncianteInput.email_denunciante
    const existeUsuario = await em.findOne(Usuario, { email_usuario })
    if (existeUsuario) {
      res.status(400).json({ message: 'El email ya está registrado como usuario' })
      return
    }

    //Valida que no exista como denunciante
    const email_denunciante = req.body.sanitizeDenuncianteAuthInput.email_denunciante
    const existeDenunciante = await em.findOne(Denunciante, { email_denunciante })
    if (existeDenunciante) {
      res.status(400).json({ message: 'El email ya está registrado como denunciante' })
      return
    }

    const id = new ObjectId(req.params.id)
    const denuncianteToUpdate = await em.findOneOrFail(Denunciante, id)
    em.assign(denuncianteToUpdate, req.body.sanitizeDenuncianteInput)
    await em.flush()
    res.status(200).json({ message: 'denunciante updated', data: denuncianteToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    // Validamos que no tenga denuncias asociadas
    const id = new ObjectId(req.params.id)
    const denunciasAsociadas = await em.count(Pedido_Resolucion, { denunciante: id })
    if (denunciasAsociadas > 0) {
      res.status(400).json({ message: 'No se puede eliminar el denunciante porque tiene denuncias asociadas' })
      return
    }

    const denunciante = em.getReference(Denunciante, id)
    await em.removeAndFlush(denunciante)
    res.status(200).json({ message: 'denunciante deleted', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeDenuncianteInput, findAll, findOne, update, remove }