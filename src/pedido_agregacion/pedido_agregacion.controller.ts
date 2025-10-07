import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { ObjectId } from 'mongodb'
import { Pedido_Agregacion } from './pedido_agregacion.entity.js'
import { Evidencia } from './evidencia.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'
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
    res.status(500).json({ message: error.message })
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
      console.log('Token no proporcionado')
      res.status(401).json({ message: 'Token requerido' })
      return
    } else {
      console.log('Token proporcionado')
      const token = authHeader.split(' ')[1]
      const usuarioByToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string; rol: string }

      var pedidos_agregacion
      // Si es operador, ve todos los pedidos de agregacion
      if (usuarioByToken.rol === 'operador') {
        pedidos_agregacion = await em.find(Pedido_Agregacion, {}, { populate: ['evidencias', 'cazador'] })
      } else {
        // Si es cazador, ve solo sus pedidos de agregacion
        const idCazador = new ObjectId(usuarioByToken.id)

        pedidos_agregacion = await em.find(
          Pedido_Agregacion,
          { cazador: idCazador },
          { populate: ['evidencias', 'cazador'] }
        )
      }
      res.status(200).json({ message: 'found all pedidos agregacion', data: pedidos_agregacion })
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function generarPedidosAgregacion(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
      console.log('Token no proporcionado')
      res.status(401).json({ message: 'Token requerido' })
      return
    } else {
      console.log('Token proporcionado')
      const token = authHeader.split(' ')[1]
      const cazadorByToken = jwt.verify(token, JWT_SECRET) as { id: string; email: string; rol: string }
      const idCazador = new ObjectId(cazadorByToken.id)
      const cazadorRef = await em.getReference(Usuario, idCazador)
      console.log('Cazador logueado')

      const evidencias = [] as Evidencia[]

      const evidenciaInput =
        (req.body.evidencias as { url_evidencia?: string; archivo_evidencia?: string }[]) || []
      for (const e of evidenciaInput) {
        if (e.url_evidencia?.trim() || e.archivo_evidencia?.trim()) {
          req.body.sanitizeEvidenciaInput = {
            url_evidencia: e.url_evidencia,
            archivo_evidencia: e.archivo_evidencia,
          }
          const nuevaEvidencia = em.create(Evidencia, req.body.sanitizeEvidenciaInput)
          evidencias.push(nuevaEvidencia)
        }
      }

      req.body.sanitizePedidoInput = {
        descripcion_pedido_agregacion: req.body.descripcion_pedido_agregacion,
        dificultad_pedido_agregacion: req.body.dificultad_pedido_agregacion,
        estado_pedido_agregacion: 'pendiente',
        cazador: cazadorRef,
        evidencias: evidencias,
      }

      const pedido_agregacion = await em.create(Pedido_Agregacion, req.body.sanitizePedidoInput)

      await em.flush()
      res.status(201).json({ message: 'pedido de agregación created', data: pedido_agregacion })
    }
  } catch (err: any) {
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
