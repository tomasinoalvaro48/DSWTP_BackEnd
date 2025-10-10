import { NextFunction, Request, Response, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Zona } from '../localidad/zona.entity.js'
import { ObjectId } from 'mongodb'

const em = orm.em

interface JwtPayload {
  id: string | undefined | ObjectId
  email: string
  rol: string
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida. Definila en las variables de entorno.')
}
export const JWT_SECRET = process.env.JWT_SECRET

// Middleware para autorizar según roles
const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.body.user viene de verifyToken
    if (!allowedRoles.includes(req.body.user.rol)) {
      console.log('Access denied: insufficient permissions')
      res.status(403).json({ message: 'Access denied: insufficient permissions' })
      return
    }
    next()
  }
}

// Middleware para verificar el token JWT
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Leer el token del encabezado Authorization
  const authHeader = req.headers['authorization']

  // El token viene en el formato "Bearer <token>", así que hay que dormatearlo para el jwt.verify
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1]

    if (!token) {
      console.log('Token required, authorization denied')
      res.status(401).json({ message: 'Token required, authorization denied' })
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
      console.log('Token error:', err.message)
      res.status(400).json({ message: 'Token error' })
      return
    }
  } else {
    // Si no hay token, enviar error
    console.log('No token provided, authorization denied')
    res.status(401).json({ message: 'No token provided, authorization denied' })
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

    res.status(201).json({ message: 'Registro exitoso', data: nuevoUsuario })
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

    res.status(201).json({ message: 'Registro exitoso', data: nuevoDenunciante })
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
        res.status(400).json({ message: 'Email no registrado' })
        return
      } else {
        // Comparamos passwords
        const validDenunciante = await bcrypt.compare(password, denunciante.password_denunciante)
        if (!validDenunciante) {
          res.status(400).json({ message: 'Contraseña incorrecta' })
          return
        }
        // Es denunciante: creamos token con id, email y rol, y enviamos
        const payload: JwtPayload = {
          id: denunciante.id?.toString(),
          email: email,
          rol: 'denunciante',
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: 'Login exitoso', token, rol: 'denunciante' })
        return
      }
    } else {
      // Si es usuario, comparamos passwords
      const validUsuario = await bcrypt.compare(password, usuario.password_usuario)
      if (!validUsuario) {
        res.status(400).json({ message: 'Contraseña incorrecta' })
        return
      }
      // Es usuario: creamos token con id, email y rol, y enviamos
      const payload: JwtPayload = {
        id: usuario.id,
        email: email,
        rol: usuario.tipo_usuario,
      }
      const token = jwt.sign(payload, JWT_SECRET)
      res.status(200).json({ message: 'Login exitoso', token, rol: usuario.tipo_usuario })
      return
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message })
    return
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
}
