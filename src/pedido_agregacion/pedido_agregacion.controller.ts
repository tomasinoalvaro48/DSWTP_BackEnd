import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'
import { Pedido_Agregacion } from './pedido_agregacion.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'
import { JwtPayload } from '../auth/auth.controller.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../auth/auth.controller.js'

const em = orm.em

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const pedido_agregacion_to_remove = em.getReference(Pedido_Agregacion, id)
    await em.removeAndFlush(pedido_agregacion_to_remove)
    res.status(200).json({ message: 'pedido de agregacion deleted', data: pedido_agregacion_to_remove })
  } catch (error: any) {
    console.log(`Error al eliminar pedido de agregacion: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const filter: {
      estado_pedido_agregacion?: string
      dificultad_pedido_agregacion?: number
      cazador?: any
    } = {}

    if (req.query.estado_pedido_agregacion) {
      filter.estado_pedido_agregacion = req.query.estado_pedido_agregacion as string
    }

    if (req.query.dificultad_pedido_agregacion) {
      const dificultad = parseInt(req.query.dificultad_pedido_agregacion as string)

      if (![1, 2, 3].includes(dificultad)) {
        res.status(400).json({ message: 'La dificultad debe ser 1, 2 o 3' })
        return
      }

      filter.dificultad_pedido_agregacion = dificultad
    }

    if (req.body.user.rol === 'cazador') {
      filter.cazador = new ObjectId(req.body.user.id)
    }

    const pedidos_agregacion = await em.find(Pedido_Agregacion, filter, {
      populate: ['evidencias', 'cazador', 'tipo_anomalia'],
    })

    res.status(200).json({ message: 'found all pedidos agregacion', data: pedidos_agregacion })
  } catch (error: any) {
    console.log(`Error al obtener pedidos de agregación: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function generarPedidosAgregacion(req: Request, res: Response) {
  try {
    // obtenemos el usuario autenticado desde el token JWT
    // porque el middleware de multer sobreescribe el body.
    // no verificamos rol ni auth porque el middleware de
    // autenticación ya lo hizo, solo obtenemos el id de usuario.
    const authHeader = req.headers['authorization']
    if (!authHeader) {
      res.status(401).json({ message: 'Authorization header missing' })
      return
    }
    const token = authHeader.split(' ')[1]
    const decodedUser = jwt.verify(token, JWT_SECRET) as JwtPayload

    const idCazador = new ObjectId(decodedUser.id)
    const cazadorRef = await em.getReference(Usuario, idCazador)

    const evidencias: any[] = []

    // Procesar evidencias de URL (viene como string JSON desde FormData)
    if (req.body.evidencias) {
      try {
        const evidenciasUrl = JSON.parse(req.body.evidencias)

        for (const e of evidenciasUrl) {
          if (e.url_evidencia?.trim()) {
            evidencias.push({
              url_evidencia: e.url_evidencia,
              archivo_evidencia: '',
            })
          }
        }
      } catch (parseError) {
        console.error('Error parseando evidencias:', parseError)
        res.status(400).json({ message: 'Evidencias inválidas' })
      }
    }

    // Procesar archivos subidos (campo 'archivos')
    const files = req.files as Express.Multer.File[]
    if (files && files.length > 0) {
      for (const file of files) {
        const relativePath = `/uploads/${file.filename}`
        evidencias.push({
          archivo_evidencia: relativePath,
          url_evidencia: '',
        })
      }
    }

    // finalmente creamos el pedido de agregación
    const pedido_agregacion = em.create(Pedido_Agregacion, {
      descripcion_pedido_agregacion: req.body.descripcion_pedido_agregacion,
      dificultad_pedido_agregacion: parseInt(req.body.dificultad_pedido_agregacion),
      estado_pedido_agregacion: 'pendiente',
      cazador: cazadorRef,
      evidencias,
    })

    await em.flush()
    res.status(201).json({ message: 'pedido de agregación created', data: pedido_agregacion })
  } catch (err: any) {
    console.log('Error creating pedido de agregacion:', err)
    res.status(500).json({ message: err.message })
  }
}

async function tomarPedidosAgregacion(req: Request, res: Response) {
  try {
    const idPedidoAgregacion = new ObjectId(req.params.id)
    const accion = req.body.accion

    const pedido_agregacion = await em.findOneOrFail(Pedido_Agregacion, {
      _id: idPedidoAgregacion,
      estado_pedido_agregacion: 'pendiente',
    })

    if (accion === 'rechazar') {
      pedido_agregacion.estado_pedido_agregacion = 'rechazado'
      await em.flush()
      res.status(200).json({ message: 'Pedido de agregación rechazado', data: pedido_agregacion })
      return
    }

    if (accion === 'aceptar') {
      pedido_agregacion.estado_pedido_agregacion = 'aceptado'

      const nueva_anomalia = em.create(Tipo_Anomalia, {
        nombre_tipo_anomalia: pedido_agregacion.descripcion_pedido_agregacion,
        dificultad_tipo_anomalia: pedido_agregacion.dificultad_pedido_agregacion,
        pedido_agregacion: pedido_agregacion,
      })

      pedido_agregacion.tipo_anomalia = nueva_anomalia

      await em.flush()
      res.status(200).json({
        message: 'Pedido de agregación aceptado y nueva anomalía creada',
        pedido: pedido_agregacion,
        anomalia: nueva_anomalia,
      })
      return
    }
  } catch (error: any) {
    console.log(`Error al tomar pedido de agregación: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

export { remove, findAll, generarPedidosAgregacion, tomarPedidosAgregacion }
