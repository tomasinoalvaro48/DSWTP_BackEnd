import { Request, Response, NextFunction, RequestHandler } from 'express'
import { Denunciante } from './denunciante.entity.js'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const em = orm.em

const JWT_SECRET = process.env.JWT_SECRET || "claveSecreta123"
//lo ideal sería tener la clave en un .env y usar el código comentado abajo

/*if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no está definida. Definila en las variables de entorno.")
}
const JWT_SECRET = process.env.JWT_SECRET*/

function sanitizeDenuncianteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeDenuncianteInput = {
    //cod_den: req.body.cod_den,
    nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
    telefono_denunciante: req.body.telefono_denunciante,
    email_denunciante: req.body.email_denunciante,
    password_denunciante: req.body.password_denunciante
  }

  if (req.body.sanitizeDenuncianteInput.nombre_apellido_denunciante && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(req.body.sanitizeDenuncianteInput.nombre_apellido_denunciante)) {
    res.status(400).json({ message: "El nombre no puede tener números" })
  }

  if (req.body.sanitizeDenuncianteInput.telefono_denunciante && !/^[0-9]+$/.test(req.body.sanitizeDenuncianteInput.telefono_denunciante)) {
    res.status(400).json({ message: "El teléfono no puede tener letras ni espacios" })
  }

  if (req.body.sanitizeDenuncianteInput.email_denunciante && !/.*@.*/.test(req.body.sanitizeDenuncianteInput.email_denunciante)) {
    res.status(400).json({ message: "El email tiene que tener @" })
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
    res.status(200).json({ message: 'denunciante deleted', data: denunciante })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

const register: RequestHandler = async (req, res, next) => {
  try {
    const { nombre_apellido_denunciante, telefono_denunciante, email_denunciante, password_denunciante } = req.body
    const existe = await em.findOne(Denunciante, { email_denunciante })
    if (existe){
      res.status(400).json({ message: "El email ya está registrado" })
      return
    }
    const hashedPass = await bcrypt.hash(password_denunciante, 10)
    const nuevo = em.create(Denunciante, {
      nombre_apellido_denunciante,
      telefono_denunciante,
      email_denunciante,
      password_denunciante: hashedPass
    })
    await em.persistAndFlush(nuevo)
    res.status(201).json({ message: "Registro exitoso", data: nuevo })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const denunciante = await em.findOne(Denunciante, { email_denunciante: email })
    if (!denunciante){
      res.status(400).json({ message: "Email no registrado" })
      return
    }
    const valid = await bcrypt.compare(password, denunciante.password_denunciante)
    if (!valid){
      res.status(400).json({ message: "Contraseña incorrecta" })
      return
    }
    const token = jwt.sign({ id: denunciante.id, email }, JWT_SECRET, { expiresIn: "1h" })
    res.status(200).json({ message: "Login exitoso", token })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
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
          //cod_den: req.body.cod_den,
          nombre_apellido_denunciante: req.body.nombre_apellido_denunciante,
          telefono_denunciante: req.body.telefono_denunciante,
          email_denunciante: req.body.email_denunciante,
          password_denunciante: req.body.password_denunciante
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


export { sanitizeDenuncianteInput, findAll, findOne, add, update, remove, register, login, buscarOCrearDenunciante }