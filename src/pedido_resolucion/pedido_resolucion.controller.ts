import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Pedido_Resolucion } from './pedido_resolucion.entity.js'
import { ObjectId } from 'mongodb'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { Anomalia } from './anomalia.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'
import { Zona } from '../localidad/zona.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../auth/auth.controller.js'
import { OnInit } from '@mikro-orm/core'

const em = orm.em

/*
function sanitizePedidoInput(
    req: Request, 
    res: Response, 
    next :NextFunction
){

  
    req.body.sanitizePedidoInput = {
        direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
        descripcion_pedido_resolucion: req.body.descripcion_pedido_resolucion,
        comentario_pedido_resolucion: req.body.comentario_pedido_resolucion,
        zona: req.body.zona,
        denunciante: req.body.denunciante
                 
    }

    Object.keys(req.body.sanitizePedidoInput).forEach((key)=>{
        if(req.body.sanitizePedidoInput[key]===undefined){
            delete req.body.sanitizePedidoInput[key]
        }
    }) 
    next()
}
*/

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const pedido_resolucion_to_remove = em.getReference(Pedido_Resolucion, id)
    await em.removeAndFlush(pedido_resolucion_to_remove)
    res.status(200).json({ message: 'Remove pedido', data: pedido_resolucion_to_remove })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findAll(req: Request, res: Response) {
  try {
    let filter: {
      estado_pedido_resolucion?: string
      dificultad_pedido_resolucion?: number
      zona?: any
    } = {}

    if (req.query.estado_pedido_resolucion) {
      filter.estado_pedido_resolucion = req.query.estado_pedido_resolucion as string
    }
    if (req.query.dificultad_pedido_resolucion) {
      // dificultad especifica
      filter.dificultad_pedido_resolucion = parseInt(req.query.dificultad_pedido_resolucion as string)
    }

    if (req.query.zonas) {
      const zonasQuery = Array.isArray(req.query.zonas) ? req.query.zonas : [req.query.zonas]

      const zonasObjectIds = zonasQuery.map((zonaIdString) => new ObjectId(zonaIdString as string))

      filter.zona = { $in: zonasObjectIds }
    }

    const pedido_resolucion = await em.find(Pedido_Resolucion, filter, {
      populate: ['zona.localidad', 'denunciante', 'anomalias.tipo_anomalia', 'cazador'],
    })
    res.status(200).json({ message: 'find all pedidos', data: pedido_resolucion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function showMisPedidos(req: Request, res: Response) { //Posiblemente a incluir en el finD ALL
  try {



    let filter: {
        estado_pedido_resolucion?: string,
        cazador?: any

    } = {}

    if (req.query.estado_pedido_resolucion) {
      filter.estado_pedido_resolucion = req.query.estado_pedido_resolucion as string
    }
    


    const authHeader = req.headers['authorization']
    if (!authHeader) {
      res.status(401).json({ message: 'Token requerido' })
      return
    } else {
      // extraer solo el token (si viene con "Bearer ...")
      const token = authHeader.split(' ')[1]

      const cazadorByToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
      filter.cazador = new ObjectId(cazadorByToken.id)
    }

    

    const pedido_resolucion = await em.find(Pedido_Resolucion, filter, {
      populate: ['zona.localidad', 'denunciante', 'anomalias.tipo_anomalia', 'cazador','inspecciones'],
      orderBy: { fecha_pedido_resolucion: 'DESC' },

    })
    res.status(200).json({ message: 'find mis pedidos', data: pedido_resolucion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function CUU_2_paso_2_tomarPedidoResolucion(req: Request, res: Response) {
  try {
    const idPedidoResolucion = new ObjectId(req.params.id)
    const pedidoResolucionRef = em.getReference(Pedido_Resolucion, idPedidoResolucion)

    const authHeader = req.headers['authorization']
    if (!authHeader) {
      res.status(401).json({ message: 'Token requerido' })
      return
    } else {
      // extraer solo el token (si viene con "Bearer ...")
      const token = authHeader.split(' ')[1]

      const cazadorByToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
      const idCazador = new ObjectId(cazadorByToken.id)
      const cazadorRef = em.getReference(Usuario, idCazador)

      const elementosActualizar = {
        estado_pedido_resolucion: 'aceptado',
        cazador: cazadorRef,
      }

      em.assign(pedidoResolucionRef, elementosActualizar)
      await em.flush()
    }
    res.status(200).json({ message: 'Pedido tomado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function generarPedidoResolucion(req: Request, res: Response) {
  try {
    console.clear()
    // Verificar token
    const authHeader = req.headers['authorization']
    if (!authHeader) {
      console.log('Token no proporcionado')
      res.status(401).json({ message: 'Token requerido' })
      return
    } else {
      console.log('Token proporcionado')
      const token = authHeader.split(' ')[1] // Extraer solo el token (si viene con "Bearer ...")
      // Verificar y decodificar el token
      const denuncianteByToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
      const idDenunciante = new ObjectId(denuncianteByToken.id)
      const denuncianteRef = await em.getReference(Denunciante, idDenunciante)
      console.log('Denucniante logueado')

      //---------------- Lógica de creación del pedido de resolución
      let dificultad = 0
      const anomalias = [] as Anomalia[]

      // referenciamos las anomalías y calculamos la dificultad del pedido de resolución
      const anomaliaInput = req.body.anomalias as Anomalia[]
      anomaliaInput.map(async (a) => {
        const id_tipo_anomalia = new ObjectId(a.tipo_anomalia.id)
        const tipo = await em.getReference(Tipo_Anomalia, id_tipo_anomalia)

        if (tipo) {
          req.body.sanitizeAnomaliaInput = {
            tipo_anomalia: tipo,
          }
          dificultad += a.tipo_anomalia.dificultad_tipo_anomalia // Calculamos la dificultad del pedido de resolución
          const nuevaAnomalia = em.create(Anomalia, req.body.sanitizeAnomaliaInput)
          anomalias.push(nuevaAnomalia)
        }
      })

      // referenciamos la zona
      const id_zona = new ObjectId(req.body.zona.id)
      const zonaRef = await em.getReference(Zona, id_zona)

      console.log('Dificultad del pedido de resolución: ' + dificultad)

      // Sanitizamos el input
      req.body.sanitizePedidoInput = {
        direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
        descripcion_pedido_resolucion: req.body.descripcion_pedido_resolucion,
        dificultad_pedido_resolucion: dificultad,
        zona: zonaRef,
        denunciante: denuncianteRef,
        anomalias: anomalias,
      }

      // Creamos el pedido de resolución
      const pedido_resolucion = await em.create(Pedido_Resolucion, req.body.sanitizePedidoInput)
      console.log('Pedido de resolución creado')

      // Guardamos en la base de datos
      await em.flush()
      res.status(200).json({ message: 'created pedido de resolucion', data: pedido_resolucion })
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, remove, generarPedidoResolucion, showMisPedidos, CUU_2_paso_2_tomarPedidoResolucion }
