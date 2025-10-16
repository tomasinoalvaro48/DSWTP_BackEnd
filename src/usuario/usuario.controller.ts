import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Usuario } from './usuario.entity.js'
import { ObjectId } from 'mongodb'
import { Zona } from '../localidad/zona.entity.js'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'
import { Pedido_Agregacion } from '../pedido_agregacion/pedido_agregacion.entity.js'

const em = orm.em

function sanitizeUsuarioImput(req: Request, res: Response, next: NextFunction) {
  if (req.body.zona !== undefined) {
    const idZona = new ObjectId(req.body.zona.id)
    const zonaRef = em.getReference(Zona, idZona)
    req.body.sanitizeUsuarioImput = {
      zona: zonaRef,
    }
  } else {
    req.body.sanitizeUsuarioImput = {
      zona: req.body.zona,
    }
  }
  req.body.sanitizeUsuarioImput = {
    // codigo: req.body.codigo,
    nombre_usuario: req.body.nombre_usuario,
    email_usuario: req.body.email_usuario,
    password_usuario: req.body.password_usuario,
    tipo_usuario: req.body.tipo_usuario,
    zona: req.body.zona, //Ver si sacar!!!!!!!!!!!!!!!!!!!!!
  }

  if (!req.body.sanitizeUsuarioImput.nombre_usuario || req.body.sanitizeUsuarioImput.nombre_usuario.trim().length === 0) {
    res.status(400).json({ message: 'El nombre no puede estar vacío' })
    return
  }

  if (
    req.body.sanitizeUsuarioImput.nombre_usuario &&
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.sanitizeUsuarioImput.nombre_usuario)
  ) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
    return
  }

  if (req.body.sanitizeUsuarioImput.email_usuario && !/.*@.*/.test(req.body.sanitizeUsuarioImput.email_usuario)) {
    res.status(400).json({ message: 'El email tiene que tener @' })
    return
  }

  if (!req.body.sanitizeUsuarioImput.password_usuario || req.body.sanitizeUsuarioImput.password_usuario.length < 6) {
    res.status(400).json({ message: 'La contraseña tiene que tener mínimo 6 caracteres' })
    return
  }

  if (
    req.body.sanitizeUsuarioImput.tipo_usuario &&
    !['operador', 'cazador'].includes(req.body.sanitizeUsuarioImput.tipo_usuario)
  ) {
    res.status(400).json({ message: 'El tipo de usuario tiene que ser operador o cazador' })
    return
  }

  Object.keys(req.body.sanitizeUsuarioImput).forEach((key) => {
    if (req.body.sanitizeUsuarioImput[key] === undefined) {
      delete req.body.sanitizeUsuarioImput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(Usuario, {}, { populate: ['zona', 'zona.localidad'] })
    res.status(200).json({ message: 'find all usuarios', data: usuarios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, id, { populate: ['zona', 'zona.localidad'] })
    res.status(200).json({ message: 'find one usuario', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/*
async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body.sanitizeUsuarioImput)
    await em.flush()
    res.status(200).json({ message: 'create usuario', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/

async function update(req: Request, res: Response) {
  try {
    //Valida que no exista como usuario
    const email_usuario = req.body.sanitizeDenuncianteAuthInput.email_denunciante
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
    const usuarioToUpdate = em.getReference(Usuario, id)
    em.assign(usuarioToUpdate, req.body.sanitizeUsuarioImput)
    await em.flush()
    res.status(200).json({ message: 'usuario update' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    // Validamos que no tenga denuncias asociadas
    const id = new ObjectId(req.params.id)
    const pedidosResolucionAsociados = await em.count(Pedido_Resolucion, { cazador: id })
    if (pedidosResolucionAsociados > 0) {
      res.status(400).json({ message: 'No se puede eliminar el usuario porque tiene denuncias asociadas' })
      return
    }
    // Validamos que no tenga pedidos de agregacion asociados
    const pedidosAgregacionAsociados = await em.count(Pedido_Agregacion, { cazador: id })
    if (pedidosAgregacionAsociados > 0) {
      res.status(400).json({ message: 'No se puede eliminar el usuario porque tiene pedidos de agregación asociados' })
      return
    }

    const usuarioToUsuario = em.getReference(Usuario, id)
    await em.removeAndFlush(usuarioToUsuario)
    res.status(200).json({ message: 'Remove usuario', data: usuarioToUsuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, remove, update, sanitizeUsuarioImput }
