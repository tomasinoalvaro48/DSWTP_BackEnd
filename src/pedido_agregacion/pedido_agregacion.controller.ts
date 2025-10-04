import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { ObjectId } from "mongodb";
import { Pedido_Agregacion } from "./pedido_agregacion.entity.js";
import { Evidencia } from "./evidencia.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Tipo_Anomalia } from "../tipo_anomalia/tipo_anomalia.entity.js";

const em = orm.em

async function remove(req: Request, res: Response) {
    try {
        const id = new ObjectId(req.params.id)
        const pedido_agregacion_to_remove= em.getReference(Pedido_Agregacion, id)
        await em.removeAndFlush(pedido_agregacion_to_remove)
        res.status(200).json({message: 'pedido de agregacion deleted', data: pedido_agregacion_to_remove})
    } catch(error: any) {
        res.status(500).json({message: error.message})
    }
}


async function findAll(req: Request, res: Response) {
    try {
      const pedidos_agregacion = await em.find(Pedido_Agregacion, {}, {populate: ['evidencias','cazador']})
      res.status(200).json({message: 'found all pedidos agregacion', data: pedidos_agregacion})
    } catch(error: any) {
      res.status(500).json({message: error.message})
    }
}


async function generarPedidosAgregacion(req: Request, res: Response) {
  try {
    const evidencias = [] as Evidencia[]

    const evidenciaInput = req.body.evidencias as { url_evidencia?: string; archivo_evidencia?: string }[] || []
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
      estado_pedido_agregacion: "pendiente",
      evidencias: evidencias,
    }

    const pedido_agregacion = await em.create(Pedido_Agregacion, req.body.sanitizePedidoInput)
    
    await em.flush()
    res.status(201).json({ message: "pedido de agregación created", data: pedido_agregacion })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export { remove, findAll, generarPedidosAgregacion }