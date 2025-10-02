import { NextFunction, Request, Response, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Zona } from '../localidad/zona.entity.js'
import { ObjectId } from 'mongodb'

const em = orm.em


export const JWT_SECRET = process.env.JWT_SECRET || "claveSecreta123"
//lo ideal sería tener la clave en un .env y usar el código comentado abajo

/*if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no está definida. Definila en las variables de entorno.")
}
const JWT_SECRET = process.env.JWT_SECRET*/

function sanitizeUsuarioAuthInput(req: Request, res: Response, next: NextFunction) {
  /*
  req.body.sanitizeUsuarioAuthInput = {
    nombre_usuario: req.body.nombre_usuario,
    email_usuario: req.body.email_usuario,
    password_usuario: req.body.password_usuario,
    confir_password : req.body.confir_password, 
    zona: req.body.zona
  }*/

  if (req.body.nombre_usuario && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.nombre_usuario)) {
    res.status(400).json({ message: "El nombre no puede tener números" })
  }

  if (req.body.email_usuario && !/.*@.*/.test(req.body.email_usuario)) {
    res.status(400).json({ message: "El email debe tener @" })
  }

  if (req.body.confir_password !== req.body.password_usuario){
    console.log("algo")
    res
      .status(400)
      .json({message: "Las contraseñas ingresadas no coinciden"})
      return
  }
  if (req.body.password_usuario.length < 6 ){
    res
      .status(400)
      .json({message: "La contraseña no puede tener menos de 6 caracteres"})
      return
  }

  req.body.sanitizeUsuarioAuthInput = {
    nombre_usuario: req.body.nombre_usuario,
    email_usuario: req.body.email_usuario,
    password_usuario: req.body.password_usuario,
    zona: req.body.zona
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
    res.status(400).json({ message: "El nombre no puede tener números" })
    return
  }

  if (req.body.telefono_denunciante && !/^[0-9]+$/.test(req.body.telefono_denunciante)) {
    res.status(400).json({ message: "El teléfono no puede tener letras ni espacios" })
    return
  }

  if (req.body.email_denunciante && !/.*@.*/.test(req.body.email_denunciante)) {
    res.status(400).json({ message: "El email debe tener @" })
    return
  }

  if (req.body.confir_password !== req.body.password_denunciante) {
    res.status(400).json({ message: "Las contraseñas ingresadas no coinciden" })
    return
  }

  if (req.body.password_denunciante && req.body.password_denunciante.length < 6) {
    res.status(400).json({ message: "La contraseña no puede tener menos de 6 caracteres" })
    return
  }

  req.body.sanitizeDenuncianteAuthInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante
  }

  next()
}

function sanitizeDenuncianteAuthInput2(req: Request, res: Response, next: NextFunction) {
  
  req.body.sanitizeDenuncianteAuthInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante,
    confir_password : req.body.confir_password
  }

  if (req.body.nombre_apellido_denunciante && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.nombre_apellido_denunciante)) {
    return res.status(400).json({ message: "El nombre no puede tener números" })
    
  }

  if (req.body.telefono_denunciante && !/^[0-9]+$/.test(req.body.telefono_denunciante)) {
    return res.status(400).json({ message: "El teléfono no puede tener letras ni espacios" })
    
  }

  if (req.body.email_denunciante && !/.*@.*/.test(req.body.email_denunciante)) {
    res.status(400).json({ message: "El email tiene que tener @" })
    return
  }

  if (req.body.confir_password !== req.body.password_usuario){
    res
      .status(400)
      .json({message: "Las contraseñas ingresadas no coinciden"})
      return
  }
  if (req.body.password_usuario.length < 6 ){
    res
      .status(400)
      .json({message: "La contraseña no puede tener menos de 6 caracteres"})
      return
  }


  req.body.sanitizeDenuncianteAuthInput = {
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante
  }

  Object.keys(req.body.sanitizeDenuncianteAuthInput).forEach((key) => {
    if (req.body.sanitizeDenuncianteAuthInput[key] === undefined) {
      delete req.body.sanitizeDenuncianteAuthInput[key]
    }
  })
  next()
}





const registerUsuario: RequestHandler = async (req, res, next) => {
  try {

    //Valida que no exista como usuario
    const email_usuario = req.body.sanitizeUsuarioAuthInput.email_usuario
    const existeUsuario = await em.findOne(Usuario, {email_usuario} )
    if (existeUsuario){
      res.status(400).json({ message: "El email ya está registrado como usuario" })
      return
      
    }
    
    //Valida que no exista como denunciante
    const email_denunciante = req.body.sanitizeUsuarioAuthInput.email_usuario 
    const existeDenunciante = await em.findOne(Denunciante, {email_denunciante} )
  
    if (existeDenunciante){
      res.status(400).json({ message: "El email ya está registrado como denunciante" })
      return
    }


    const hashedPass = await bcrypt.hash(req.body.sanitizeUsuarioAuthInput.password_usuario, 10)
    req.body.sanitizeUsuarioAuthInput.password_usuario = hashedPass

    const idZona = new ObjectId(req.body.sanitizeUsuarioAuthInput.zona)
    const zonaRef = em.getReference(Zona, idZona)
    req.body.sanitizeUsuarioAuthInput.zona = zonaRef

    const nuevoUsuario = em.create(Usuario, req.body.sanitizeUsuarioAuthInput)

    await em.flush()

      res.status(201).json({ message: "Registro exitoso", data: nuevoUsuario })
  } catch (err: any) {
      res.status(500).json({ message: err.message })
  }
}

const registerDenunciante: RequestHandler = async (req, res, next) => {
  try {

    
    //Valida que no exista como usuario
    const email_usuario = req.body.sanitizeDenuncianteAuthInput.email_denunciante
    const existeUsuario = await em.findOne(Usuario, {email_usuario} )
    if (existeUsuario){
      res.status(400).json({ message: "El email ya está registrado como usuario" })
      return
      
    }
    
    //Valida que no exista como denunciante
    const email_denunciante = req.body.sanitizeDenuncianteAuthInput.email_denunciante 
    const existeDenunciante = await em.findOne(Denunciante, {email_denunciante} )
  
    if (existeDenunciante){
      res.status(400).json({ message: "El email ya está registrado como denunciante" })
      return
    }
  
    const hashedPass = await bcrypt.hash(req.body.sanitizeDenuncianteAuthInput.password_denunciante, 10)
    req.body.sanitizeDenuncianteAuthInput.password_denunciante = hashedPass

    const nuevoDenunciante = em.create(Denunciante, req.body.sanitizeDenuncianteAuthInput)
    await em.flush()

      res.status(201).json({ message: "Registro exitoso", data: nuevoDenunciante })
  } catch (err: any) {
      res.status(500).json({ message: err.message })
  }
}




const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const usuario = await em.findOne(Usuario, { email_usuario: email })
    if (!usuario){
      const denunciante = await em.findOne(Denunciante,{email_denunciante: email})
      if(!denunciante)
      {
        res.status(400).json({ message: "Email no registrado" })
        return
      }
      else
      {
        const validDenunciante = await bcrypt.compare(password, denunciante.password_denunciante)
        if (!validDenunciante){
          res.status(400).json({ message: "Contraseña incorrecta" })
          return
        }

        const token = jwt.sign({ id: denunciante.id, email }, JWT_SECRET, { expiresIn: "1h" })
        res
          .status(200)
          .json({ message: "Login exitoso", token }) // No creo que le login se pase por aca
          .cookie('access_token',token)
      }
    }
    else{
      const validUsuario = await bcrypt.compare(password, usuario.password_usuario)
      if (!validUsuario){
        res.status(400).json({ message: "Contraseña incorrecta" })
        return
      }

      const token = jwt.sign({ id: usuario.id, email }, JWT_SECRET, { expiresIn: "1h" })
      res
        .status(200)
        .json({ message: "Login exitoso", token }) // No creo que le login se pase por aca
        .cookie('access_token',token,{
          // httpOnly: true,
          // secure: true,
          // sameSite: 'strict',
          // maxAge: 1000 * 60 * 60
        }) //AGRAGAR CONFIGURACIONES DE SEGURIDAD des este video en 1h:24min https://youtu.be/UqnnhAZxRac?si=g1LXnShg0ZO0xh64

    }

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}


export {registerDenunciante, registerUsuario, login, sanitizeUsuarioAuthInput, sanitizeDenuncianteAuthInput}