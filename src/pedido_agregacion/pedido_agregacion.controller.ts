import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'
import { Pedido_Agregacion } from './pedido_agregacion.entity.js'
import { Evidencia } from './evidencia.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'
import { JwtPayload } from '../auth/auth.controller.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../auth/auth.controller.js'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const em = orm.em

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)
    const pedido_agregacion_to_remove = em.getReference(Pedido_Agregacion, id)
    await em.removeAndFlush(pedido_agregacion_to_remove)
    res.status(200).json({ message: 'pedido de agregacion deleted', data: pedido_agregacion_to_remove })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findAll(req: Request, res: Response) {
  try {
    var pedidos_agregacion

    // Si es operador, ve todos los pedidos de agregacion
    if (req.body.user.rol === 'operador') {
      pedidos_agregacion = await em.find(Pedido_Agregacion, {}, { populate: ['evidencias', 'cazador'] })
    } else {
      // Si es cazador, ve solo sus pedidos de agregacion
      const idCazador = new ObjectId(req.body.user.id)
      pedidos_agregacion = await em.find(Pedido_Agregacion, { cazador: idCazador }, { populate: ['evidencias', 'cazador'] })
    }
    res.status(200).json({ message: 'found all pedidos agregacion', data: pedidos_agregacion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function generarPedidosAgregacion(req: Request, res: Response) {
  try {
    console.log('=== GENERANDO PEDIDO DE AGREGACIÓN ===')
    console.log('Body:', req.body)
    console.log('Files recibidos:', req.files ? (req.files as Express.Multer.File[]).length : 0)

    const authHeader = req.headers['authorization']
    if (!authHeader) {
      res.status(401).json({ message: 'Authorization header missing' })
      return
    }
    const token = authHeader.split(' ')[1]
    const decodedUser = jwt.verify(token, JWT_SECRET) as JwtPayload

    console.log('Usuario autenticado con ID:', decodedUser.id)

    const idCazador = new ObjectId(decodedUser.id)
    const cazadorRef = await em.getReference(Usuario, idCazador)
    console.log('Cazador id:', idCazador)

    const evidencias: any[] = []

    // Procesar evidencias de URL (viene como string JSON desde FormData)
    if (req.body.evidencias) {
      try {
        const evidenciasUrl = JSON.parse(req.body.evidencias)
        console.log('Evidencias con URL parseadas:', evidenciasUrl)

        for (const e of evidenciasUrl) {
          if (e.url_evidencia?.trim()) {
            console.log(`✅ Agregando evidencia con URL: ${e.url_evidencia}`)
            evidencias.push({
              url_evidencia: e.url_evidencia,
              archivo_evidencia: '',
            })
          }
        }
      } catch (parseError) {
        console.error('Error parseando evidencias:', parseError)
      }
    }

    // Procesar archivos subidos (campo 'archivos' desde FormData)
    const files = req.files as Express.Multer.File[]
    if (files && files.length > 0) {
      console.log(`Procesando ${files.length} archivos`)
      for (const file of files) {
        const relativePath = `/uploads/${file.filename}`
        console.log(`✅ Agregando evidencia con archivo: ${relativePath}`)
        evidencias.push({
          archivo_evidencia: relativePath,
          url_evidencia: '',
        })
      }
    }

    console.log(`Total de evidencias: ${evidencias.length}`)

    const pedido_agregacion = em.create(Pedido_Agregacion, {
      descripcion_pedido_agregacion: req.body.descripcion_pedido_agregacion,
      dificultad_pedido_agregacion: parseInt(req.body.dificultad_pedido_agregacion),
      estado_pedido_agregacion: 'pendiente',
      cazador: cazadorRef,
      evidencias,
    })

    await em.flush()
    console.log('✅ Pedido de agregación creado con ID:', pedido_agregacion.id)
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
      })

      await em.flush()
      res.status(200).json({
        message: 'Pedido de agregación aceptado y nueva anomalía creada',
        pedido: pedido_agregacion,
        anomalia: nueva_anomalia,
      })
      return
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { remove, findAll, generarPedidosAgregacion, tomarPedidosAgregacion }
