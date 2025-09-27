import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { ObjectId } from "mongodb";
import { Pedido_Agregacion } from "./pedido_agregacion.entity.js";
import { Evidencia } from "./evidencia.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Tipo_Anomalia } from "../tipo_anomalia/tipo_anomalia.entity.js";

const em = orm.em

function sanitizePedidoInput(req: Request, res: Response, next :NextFunction) {
  req.body.sanitizePedidoInput = {
      descripcion_pedido_agregacion: req.body.descripcion_pedido_agregacion,
      dificultad_pedido_agregacion: req.body.dificultad_pedido_agregacion,
      estado_pedido_agregacion: req.body.estado_pedido_agregacion,
      tipo_anomalia: req.body.tipo_anomalia,
      cazador: req.body.cazador,
      evidencias: req.body.evidencias
  }
  Object.keys(req.body.sanitizePedidoInput).forEach((key)=> {
      if(req.body.sanitizePedidoInput[key] === undefined) {
          delete req.body.sanitizePedidoInput[key]
      }
  }) 
  next()
}


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
    const { descripcion_pedido_agregacion, dificultad_pedido_agregacion, cazador, tipo_anomalia, evidencias } = req.body
    const cazadorRef = cazador ? em.getReference(Usuario, new ObjectId(cazador)) : null
    const tipoAnomaliaRef = tipo_anomalia ? em.getReference(Tipo_Anomalia, new ObjectId(tipo_anomalia)) : null

    const pedido = em.create(Pedido_Agregacion, {
      descripcion_pedido_agregacion,
      dificultad_pedido_agregacion,
      estado_pedido_agregacion: "pendiente",
      cazador: cazadorRef,
      tipo_anomalia: tipoAnomaliaRef
    })

    evidencias.forEach((ev: any) => {
      if (ev.url_evidencia?.trim() || ev.archivo_evidencia?.trim()) {
        const nuevaEv = em.create(Evidencia, {
          url_evidencia: ev.url_evidencia,
          archivo_evidencia: ev.archivo_evidencia,
          pedido_agregacion: pedido
        })
        pedido.evidencias.add(nuevaEv)
      }
    })
    
    await em.persistAndFlush(pedido)
    res.status(201).json({ message: "pedido de agregación created", data: pedido })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export { sanitizePedidoInput, remove, findAll, generarPedidosAgregacion }