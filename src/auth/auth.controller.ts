import { NextFunction, Request, Response, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Zona } from '../localidad/zona.entity.js'
import { ObjectId } from 'mongodb'

const em = orm.em

// Error 401: no autorizado (no autenticado) -> cuando no está definido el token o es inválido (expiró)
// Error 403: prohibido (no autorizado) -> cuando el usuario no tiene permisos

interface JwtPayload {
  id: string | undefined | ObjectId
  email: string
  rol: string
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida. Definila en las variables de entorno.')
}
export const JWT_SECRET = process.env.JWT_SECRET

// req.body.user viene de verifyToken

// Middleware para autorizar según roles
const authorizeRoles = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Verificamos que el rol del usuario es permitidos
    if (!allowedRoles.includes(req.body.user.rol)) {
      console.log('Acceso denegado. Permisos insuficientes.')
      res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' })
      return
    }
    if (req.body.user.rol === 'cazador') {
      // Si es cazador verificamos que está aprobado
      const usuario = await em.findOneOrFail(Usuario, { _id: new ObjectId(req.body.user.id) })
      if (usuario.estado_aprobacion === 'rechazado') {
        console.log('Acceso denegado. Cazador rechazado.')
        res.status(403).json({ message: 'Acceso denegado. Cazador rechazado.' })
        return
      }
      if (usuario.estado_aprobacion === 'pendiente') {
        console.log('Acceso denegado. Cazador pendiente de aprobación.')
        res.status(403).json({ message: 'Acceso denegado. Cazador pendiente de aprobación.' })
        return
      }
    }
    next()
  }
}

// Middleware para verificar el token JWT
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  // Leer el token del encabezado Authorization
  const authHeader = req.headers['authorization']

  // El token viene en el formato "Bearer <token>", así que hay que dormatearlo para el jwt.verify
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1]

    if (!token) {
      console.log('Token requerido.')
      res.status(401).json({ message: 'Token requerido.' })
      return
    }

    // Verificar el token
    try {
      const decodedUser = jwt.verify(token, JWT_SECRET) as JwtPayload
      if (!req.body) {
        req.body = {}
      }
      req.body.user = decodedUser
      next()
    } catch (err: any) {
      // Si el token no es válido, enviar error
      console.log('Token error:', err.message)
      res.status(401).json({ message: err.message })
      return
    }
  } else {
    // Si no hay token, enviar error
    console.log('Token requerido.')
    res.status(401).json({ message: 'Token requerido.' })
    return
  }
}

function sanitizeUsuarioAuthInput(req: Request, res: Response, next: NextFunction) {
  /* Modelo del body:

  req.body.sanitizeUsuarioAuthInput = {
    nombre_usuario
    email_usuario
    password_usuario
    confirm_password
    zona
  }
  */

  if (req.body.nombre_usuario && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.nombre_usuario)) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
  }

  if (req.body.email_usuario && !/.*@.*/.test(req.body.email_usuario)) {
    res.status(400).json({ message: 'El email debe tener @' })
  }

  if (req.body.confirm_password !== req.body.password_usuario) {
    console.log('algo')
    res.status(400).json({ message: 'Las contraseñas ingresadas no coinciden' })
    return
  }
  if (req.body.password_usuario.length < 6) {
    res.status(400).json({ message: 'La contraseña no puede tener menos de 6 caracteres' })
    return
  }

  req.body.sanitizeUsuarioAuthInput = {
    nombre_usuario: req.body.nombre_usuario,
    email_usuario: req.body.email_usuario,
    password_usuario: req.body.password_usuario,
    zona: req.body.zona,
  }
  Object.keys(req.body.sanitizeUsuarioAuthInput).forEach((key) => {
    if (req.body.sanitizeUsuarioAuthInput[key] === undefined) {
      delete req.body.sanitizeUsuarioAuthInput[key]
    }
  })
  next()
}

const sanitizeDenuncianteAuthInput: RequestHandler = (req, res, next) => {
  if (req.body.nombre_apellido_denunciante && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.nombre_apellido_denunciante)) {
    res.status(400).json({ message: 'El nombre no puede tener números' })
    return
  }

  if (req.body.telefono_denunciante && !/^[0-9]+$/.test(req.body.telefono_denunciante)) {
    res.status(400).json({ message: 'El teléfono no puede tener letras ni espacios' })
    return
  }

  if (req.body.email_denunciante && !/.*@.*/.test(req.body.email_denunciante)) {
    res.status(400).json({ message: 'El email debe tener @' })
    return
  }

  if (req.body.confir_password !== req.body.password_denunciante) {
    res.status(400).json({ message: 'Las contraseñas ingresadas no coinciden' })
    return
  }

  if (req.body.password_denunciante && req.body.password_denunciante.length < 6) {
    res.status(400).json({ message: 'La contraseña no puede tener menos de 6 caracteres' })
    return
  }

  req.body.sanitizeDenuncianteAuthInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante,
  }

  next()
}

/*
function sanitizeDenuncianteAuthInput2(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeDenuncianteAuthInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante,
    confir_password: req.body.confir_password,
  }

  if (
    req.body.nombre_apellido_denunciante &&
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.nombre_apellido_denunciante)
  ) {
    return res.status(400).json({ message: 'El nombre no puede tener números' })
  }

  if (req.body.telefono_denunciante && !/^[0-9]+$/.test(req.body.telefono_denunciante)) {
    return res.status(400).json({ message: 'El teléfono no puede tener letras ni espacios' })
  }

  if (req.body.email_denunciante && !/.*@.*/
/*.test(req.body.email_denunciante)) {
    res.status(400).json({ message: 'El email tiene que tener @' })
    return
  }

  if (req.body.confir_password !== req.body.password_usuario) {
    res.status(400).json({ message: 'Las contraseñas ingresadas no coinciden' })
    return
  }
  if (req.body.password_usuario.length < 6) {
    res.status(400).json({ message: 'La contraseña no puede tener menos de 6 caracteres' })
    return
  }

  req.body.sanitizeDenuncianteAuthInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante,
  }

  Object.keys(req.body.sanitizeDenuncianteAuthInput).forEach((key) => {
    if (req.body.sanitizeDenuncianteAuthInput[key] === undefined) {
      delete req.body.sanitizeDenuncianteAuthInput[key]
    }
  })
  next()
}
*/

const registerUsuario: RequestHandler = async (req, res, next) => {
  try {
    //Valida que no exista como usuario
    const email_usuario = req.body.sanitizeUsuarioAuthInput.email_usuario
    const existeUsuario = await em.findOne(Usuario, { email_usuario })
    if (existeUsuario) {
      res.status(400).json({ message: 'El email ya está registrado como usuario' })
      return
    }

    //Valida que no exista como denunciante
    const email_denunciante = req.body.sanitizeUsuarioAuthInput.email_usuario
    const existeDenunciante = await em.findOne(Denunciante, { email_denunciante })

    if (existeDenunciante) {
      res.status(400).json({ message: 'El email ya está registrado como denunciante' })
      return
    }

    const hashedPass = await bcrypt.hash(req.body.sanitizeUsuarioAuthInput.password_usuario, 10)
    req.body.sanitizeUsuarioAuthInput.password_usuario = hashedPass

    const idZona = new ObjectId(req.body.sanitizeUsuarioAuthInput.zona)
    const zonaRef = em.getReference(Zona, idZona)
    req.body.sanitizeUsuarioAuthInput.zona = zonaRef

    const nuevoUsuario = em.create(Usuario, req.body.sanitizeUsuarioAuthInput)

    await em.flush()

    res.status(201).json({ message: 'Registro exitoso.', data: nuevoUsuario })
    return
  } catch (err: any) {
    res.status(500).json({ message: err.message })
    return
  }
}

const registerDenunciante: RequestHandler = async (req, res, next) => {
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

    const hashedPass = await bcrypt.hash(req.body.sanitizeDenuncianteAuthInput.password_denunciante, 10)
    req.body.sanitizeDenuncianteAuthInput.password_denunciante = hashedPass

    const nuevoDenunciante = em.create(Denunciante, req.body.sanitizeDenuncianteAuthInput)
    await em.flush()

    res.status(201).json({ message: 'Registro exitoso.', data: nuevoDenunciante })
    return
  } catch (err: any) {
    res.status(500).json({ message: err.message })
    return
  }
}

const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const usuario = await em.findOne(Usuario, { email_usuario: email })
    if (!usuario) {
      // Si no es usuario, busca si es denunciante
      const denunciante = await em.findOne(Denunciante, { email_denunciante: email })
      if (!denunciante) {
        // Significa que no existe el mail
        console.log('Email no registrado: ' + email)
        res.status(400).json({ message: 'Email no registrado.' })
        return
      } else {
        // Comparamos passwords
        const validDenunciante = await bcrypt.compare(password, denunciante.password_denunciante)
        if (!validDenunciante) {
          res.status(400).json({ message: 'Contraseña incorrecta.' })
          return
        }
        // Es denunciante: creamos token con id, email y rol, y enviamos
        const payload: JwtPayload = {
          id: denunciante.id?.toString(),
          email: email,
          rol: 'denunciante',
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 15 })
        console.log('Denunciante logueado: ' + email)
        res.status(200).json({ message: 'Login exitoso', token, rol: 'denunciante' })
        return
      }
    } else {
      // Si es usuario, comparamos passwords
      const validUsuario = await bcrypt.compare(password, usuario.password_usuario)
      if (!validUsuario) {
        console.log('Contraseña incorrecta para email: ' + email)
        res.status(400).json({ message: 'Contraseña incorrecta.' })
        return
      }
      // Si es cazador, verificamos que esté aprobado
      if (usuario.tipo_usuario === 'cazador' && usuario.estado_aprobacion === 'rechazado') {
        console.log('Acceso denegado. Cazador rechazado.')
        res.status(403).json({ message: 'Acceso denegado. Cazador rechazado.' })
        return
      }
      if (usuario.tipo_usuario === 'cazador' && usuario.estado_aprobacion === 'pendiente') {
        console.log('Acceso denegado. Cazador pendiente de aprobación.')
        res.status(403).json({ message: 'Acceso denegado. Cazador pendiente de aprobación.' })
        return
      }
      // Creamos token con id, email y rol, y enviamos
      const payload: JwtPayload = {
        id: usuario.id,
        email: email,
        rol: usuario.tipo_usuario,
      }
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '48h' })
      res.status(200).json({ message: 'Login exitoso', token, rol: usuario.tipo_usuario })
      return
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message })
    return
  }
}

const changePassword: RequestHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body
    const { id, rol } = req.body.user

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json({ message: 'Debe completar todos los campos' })
      return
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ message: 'Las contraseñas nuevas no coinciden' })
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'La contraseña nueva debe tener mínimo 6 caracteres' })
      return
    }

    if (rol === 'denunciante') {
      const denunciante = await em.findOne(Denunciante, { _id: new ObjectId(id) })
      if (!denunciante) {
        res.status(404).json({ message: 'Denunciante no encontrado' })
        return
      }

      const valid = await bcrypt.compare(currentPassword, denunciante.password_denunciante)
      if (!valid) {
        res.status(400).json({ message: 'La contraseña actual es incorrecta' })
        return
      }

      denunciante.password_denunciante = await bcrypt.hash(newPassword, 10)
      await em.flush()
      res.status(200).json({ message: 'Contraseña cambiada correctamente' })
      return
    }

    if (rol === 'cazador' || rol === 'operador') {
      const user = await em.findOne(Usuario, { _id: new ObjectId(id) })
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' })
        return
      }

      const valid = await bcrypt.compare(currentPassword, user.password_usuario)
      if (!valid) {
        res.status(400).json({ message: 'La contraseña actual es incorrecta' })
        return
      }

      user.password_usuario = await bcrypt.hash(newPassword, 10)
      await em.flush()
      res.status(200).json({ message: 'Contraseña cambiada correctamente' })
      return
    }

    res.status(400).json({ message: 'Rol no reconocido para cambio de contraseña' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

const updatePerfil: RequestHandler = async (req, res) => {
  try {
    const { id, rol } = req.body.user

    if (rol === 'denunciante') {
      const denunciante = await em.findOne(Denunciante, { _id: new ObjectId(id) })

      if (!denunciante) {
        res.status(404).json({ message: 'Denunciante no encontrado' })
        return
      }

      const { nombre_apellido_denunciante, telefono_denunciante } = req.body

      if (nombre_apellido_denunciante && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre_apellido_denunciante)) {
        res.status(400).json({ message: 'El nombre no puede tener números' })
        return
      }
      if (telefono_denunciante && !/^[0-9]+$/.test(telefono_denunciante)) {
        res.status(400).json({ message: 'El teléfono debe tener sólo números' })
        return
      }

      denunciante.nombre_apellido_denunciante = nombre_apellido_denunciante ?? denunciante.nombre_apellido_denunciante
      denunciante.telefono_denunciante = telefono_denunciante ?? denunciante.telefono_denunciante
      await em.flush()
      res.status(200).json({ message: 'Perfil de denunciante actualizado correctamente', data: denunciante })
      return
    }

    if (rol === 'cazador' || rol === 'operador') {
      const usuario = await em.findOne(Usuario, { _id: new ObjectId(id) })

      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' })
        return
      }

      const { nombre_usuario, apellido_usuario, zona } = req.body

      if (nombre_usuario && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre_usuario)) {
        res.status(400).json({ message: 'El nombre no puede tener números' })
        return
      }
      if (apellido_usuario && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido_usuario)) {
        res.status(400).json({ message: 'El apellido no puede tener números' })
        return
      }

      usuario.nombre_usuario = nombre_usuario ?? usuario.nombre_usuario

      if (zona) {
        const zonaRef = em.getReference(Zona, new ObjectId(zona))
        usuario.zona = zonaRef
      }

      await em.flush()
      res.status(200).json({ message: 'Perfil de usuario actualizado correctamente', data: usuario })
      return
    }

    res.status(400).json({ message: 'Rol no reconocido para actualización de perfil' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

const getPerfil: RequestHandler = async (req, res) => {
  try {
    const { id, rol } = req.body.user

    if (rol === 'denunciante') {
      const denunciante = await em.findOne(Denunciante, { _id: new ObjectId(id) })
      if (!denunciante) {
        res.status(404).json({ message: 'Denunciante no encontrado' })
        return
      }
      res.status(200).json({ data: denunciante })
      return
    }

    if (rol === 'cazador' || rol === 'operador') {
      const usuario = await em.findOne(Usuario, { _id: new ObjectId(id) }, { populate: ['zona'] })
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' })
        return
      }
      res.status(200).json({ data: usuario })
      return
    }

    res.status(400).json({ message: 'Rol no reconocido' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

const deleteAccount: RequestHandler = async (req, res) => {
  try {
    const { id, rol } = req.body.user

    if (!id || !rol) {
      res.status(400).json({ message: 'Faltan datos de autenticación' })
      return
    }

    if (rol === 'denunciante') {
      const denunciante = await em.findOne(Denunciante, { _id: new ObjectId(id) })
      if (!denunciante) {
        res.status(404).json({ message: 'Denunciante no encontrado' })
        return
      }

      const denuncias = await em.count('Pedido_Resolucion', { denunciante: new ObjectId(id) })
      if (denuncias > 0) {
        res.status(400).json({ message: 'No se puede eliminar la cuenta porque tiene denuncias asociadas que no están finalizadas.' })
        return
      }

      await em.removeAndFlush(denunciante)
      res.status(200).json({ message: 'Cuenta de denunciante eliminada correctamente' })
      return
    }

    if (rol === 'cazador') {
      const usuario = await em.findOne(Usuario, { _id: new ObjectId(id) })
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' })
        return
      }

      // Verificar si tiene pedidos de resolución NO finalizados
      const pedidosResolPendientes = await em.count('Pedido_Resolucion', {
        cazador: new ObjectId(id),
        estado_pedido_resolucion: { $ne: 'resuelto' },
      })

      const pedidosAgregPendientes = await em.count('Pedido_Agregacion', {
        cazador: new ObjectId(id),
        estado_pedido_agregacion: { $in: ['pendiente'] },
      })

      if (pedidosResolPendientes > 0) {
        res.status(400).json({ message: 'No se puede eliminar la cuenta porque tiene pedidos en curso que no están finalizados.' })
        return
      }

      if (pedidosAgregPendientes > 0) {
        res.status(400).json({ message: 'No se puede eliminar la cuenta porque tiene pedidos de agregación de anomalías pendientes.' })
        return
      }

      await em.removeAndFlush(usuario)
      res.status(200).json({ message: 'Cuenta de cazador eliminada correctamente' })
      return
    }

    res.status(400).json({ message: 'Rol no reconocido o sin permiso para eliminar su cuenta' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export {
  registerDenunciante,
  registerUsuario,
  login,
  sanitizeUsuarioAuthInput,
  sanitizeDenuncianteAuthInput,
  verifyToken,
  authorizeRoles,
  changePassword,
  updatePerfil,
  getPerfil,
  deleteAccount,
}
