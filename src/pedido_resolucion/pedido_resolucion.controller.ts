import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Pedido_Resolucion } from './pedido_resolucion.entity.js'
import { ObjectId } from 'mongodb'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { Anomalia } from './anomalia.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'
import { Zona } from '../localidad/zona.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida. Definila en las variables de entorno.')
}

const em = orm.em

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

async function findPosiblesPedidos(req: Request, res: Response) {
  try {
    const idCazador = new ObjectId(req.body.user.id)
    const cazadorRef = await em.findOneOrFail(Usuario, idCazador)

    let dificultad_maxima = cazadorRef.nivel_cazador
    let dificultad_minima = 0

    let filter: {
      estado_pedido_resolucion?: string
      dificultad_pedido_resolucion?: number[]
      zona?: any
    } = {}

    if (req.query.estado_pedido_resolucion) {
      filter.estado_pedido_resolucion = req.query.estado_pedido_resolucion as string
    }

    if (req.query.dificultad_pedido_resolucion) {
      dificultad_minima = parseInt(req.query.dificultad_pedido_resolucion as string)
    }

    const rango_dificultad_pedido_resolucion: number[] = []

    for (let i = dificultad_minima; i <= dificultad_maxima + 1; i++) {
      rango_dificultad_pedido_resolucion.push(i)
    }

    filter.dificultad_pedido_resolucion = rango_dificultad_pedido_resolucion

    if (req.query.zonas) {
      const zonasQuery = Array.isArray(req.query.zonas) ? req.query.zonas : [req.query.zonas]

      const zonasObjectIds = zonasQuery.map((zonaIdString) => new ObjectId(zonaIdString as string))

      filter.zona = { $in: zonasObjectIds }
    }

    const pedido_resolucion = await em.find(Pedido_Resolucion, filter, {
      populate: ['zona.localidad', 'denunciante', 'anomalias.tipo_anomalia'],
      orderBy: { fecha_pedido_resolucion: 'DESC' },
    })

    res.status(200).json({ message: 'find posibles pedidos', data: pedido_resolucion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findAll(req: Request, res: Response) {
  try {
    let dificultad_maxima = 10
    let dificultad_minima = 0

    let filter: {
      estado_pedido_resolucion?: string
      dificultad_pedido_resolucion?: number[]
      zona?: any
      cazador?: any
      denunciante?: any
    } = {}

    if (req.query.estado_pedido_resolucion) {
      filter.estado_pedido_resolucion = req.query.estado_pedido_resolucion as string
    }

    if (req.body.user.rol == 'cazador') {
      filter.cazador = new ObjectId(req.body.user.id)

      const cazadorRef = await em.findOneOrFail(Usuario, filter.cazador)
      dificultad_maxima = cazadorRef.nivel_cazador
    }
    if (req.body.user.rol == 'denunciante') {
      filter.denunciante = new ObjectId(req.body.user.id)
    }

    if (req.query.dificultad_pedido_resolucion) {
      dificultad_minima = parseInt(req.query.dificultad_pedido_resolucion as string)
    }

    const rango_dificultad_pedido_resolucion: number[] = []

    for (let i = dificultad_minima; i <= dificultad_maxima + 1; i++) {
      rango_dificultad_pedido_resolucion.push(i)
    }

    filter.dificultad_pedido_resolucion = rango_dificultad_pedido_resolucion

    if (req.query.zonas) {
      const zonasQuery = Array.isArray(req.query.zonas) ? req.query.zonas : [req.query.zonas]

      const zonasObjectIds = zonasQuery.map((zonaIdString) => new ObjectId(zonaIdString as string))

      filter.zona = { $in: zonasObjectIds }
    }

    const pedido_resolucion = await em.find(Pedido_Resolucion, filter, {
      populate: ['zona.localidad', 'denunciante', 'anomalias.tipo_anomalia', 'cazador', 'inspecciones'],
      orderBy: { fecha_pedido_resolucion: 'DESC' },
    })

    //Reordena las inspecciones
    pedido_resolucion.forEach((pedido) => {
      const inspeccionesArray = pedido.inspecciones.getItems()
      inspeccionesArray.sort((a, b) => b.numero_inspeccion - a.numero_inspeccion)
      pedido.inspecciones.set(inspeccionesArray)
    })

    res.status(200).json({ message: 'find mis pedidos', data: pedido_resolucion })
  } catch (error: any) {
    console.log(`Error al obtener los pedidos de resolución: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

async function tomarPedidoResolucion(req: Request, res: Response) {
  try {
    const idCazador = new ObjectId(req.body.user.id)

    // Validamos que no tenga ya un pedido aceptado
    const pedidoExistente = await em.findOne(Pedido_Resolucion, {
      cazador: idCazador,
      estado_pedido_resolucion: 'aceptado',
    })

    if (pedidoExistente) {
      res.status(400).json({
        message: 'No podés tomar el pedido porque todavía tenés uno pendiente por resolver.',
      })
      return
    } else {
      const idPedidoResolucion = new ObjectId(req.params.id)
      const pedidoResolucionRef = em.getReference(Pedido_Resolucion, idPedidoResolucion)
      const cazadorRef = em.getReference(Usuario, idCazador)

      const elementosActualizar = {
        estado_pedido_resolucion: 'aceptado',
        cazador: cazadorRef,
      }

      em.assign(pedidoResolucionRef, elementosActualizar)
      await em.flush()

      res.status(200).json({ message: 'Pedido tomado' })
      return
    }
  } catch (error: any) {
    console.log('Error al tomar el pedido')
    res.status(500).json({ message: error.message })
  }
}

async function generarPedidoResolucion(req: Request, res: Response) {
  try {
    // obtener el denunciante que crea el pedido de resolución
    const idDenunciante = new ObjectId(req.body.user.id)
    const denuncianteRef = await em.getReference(Denunciante, idDenunciante)

    let dificultad = 0
    const anomalias = [] as Anomalia[]

    // referenciamos las anomalías y calculamos la dificultad del pedido de resolución
    const anomaliaInput = req.body.anomalias as Anomalia[]
    for (const a of anomaliaInput) {
      const id_tipo_anomalia = new ObjectId(a.tipo_anomalia.id)
      const tipo = await em.getReference(Tipo_Anomalia, id_tipo_anomalia)

      if (tipo) {
        req.body.sanitizeAnomaliaInput = {
          tipo_anomalia: tipo,
        }
        // Calculamos la dificultad del pedido de resolución
        dificultad += a.tipo_anomalia.dificultad_tipo_anomalia
        const nuevaAnomalia = em.create(Anomalia, req.body.sanitizeAnomaliaInput)
        anomalias.push(nuevaAnomalia)
      }
    }

    // validamos que la dificultad no sea > 10
    if (dificultad > 10) {
      dificultad = 10
    }

    // referenciamos la zona
    const id_zona = new ObjectId(req.body.zona.id)
    const zonaRef = await em.getReference(Zona, id_zona)

    const descripcion = req.body.descripcion_pedido_resolucion?.trim() || null

    // Sanitizamos el input
    req.body.sanitizePedidoInput = {
      direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
      descripcion_pedido_resolucion: descripcion,
      dificultad_pedido_resolucion: dificultad,
      zona: zonaRef,
      denunciante: denuncianteRef,
      anomalias: anomalias,
    }

    // Creamos el pedido de resolución
    const pedido_resolucion = await em.create(Pedido_Resolucion, req.body.sanitizePedidoInput)
    await em.flush()
    res.status(200).json({
      message: 'created pedido de resolucion',
      data: pedido_resolucion,
    })
  } catch (error: any) {
    console.log('Error al crear el pedido de resolución')
    res.status(500).json({ message: error.message })
  }
}

async function finalizarPedido(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id)

    const pedido_resolucion = await em.findOneOrFail(Pedido_Resolucion, id, {
      populate: ['cazador', 'anomalias'],
    })

    let valid = true
    pedido_resolucion.anomalias.map((unaAnomalia) => {
      if (unaAnomalia.resultado_anomalia !== 'resuelta') {
        valid = false
      }
    })

    if (!valid) {
      res.status(400).json({
        message: 'Hay anomalias no resueltas. No es posible finalizar pedido hasta que todas sus anomalias esten resueltas',
      })
      return
    } else {
      // si el nivel es 10 dejarlo en 10
      if (pedido_resolucion.cazador.nivel_cazador < 10) {
        // Actualizamos el nivel del cazador
        if (pedido_resolucion.cazador.nivel_cazador >= 1 && pedido_resolucion.cazador.nivel_cazador <= 3) {
          pedido_resolucion.cazador.nivel_cazador = pedido_resolucion.cazador.nivel_cazador + pedido_resolucion.dificultad_pedido_resolucion / 2
        } else {
          pedido_resolucion.cazador.nivel_cazador = pedido_resolucion.cazador.nivel_cazador + pedido_resolucion.dificultad_pedido_resolucion / 10
        }
        if (pedido_resolucion.cazador.nivel_cazador > 10) {
          pedido_resolucion.cazador.nivel_cazador = 10
        }
      }

      // Actualizamos el estado y comentario del pedido de resolución
      pedido_resolucion.estado_pedido_resolucion = 'resuelto'
      pedido_resolucion.comentario_pedido_resolucion = req.body.comentario_pedido_resolucion

      await em.flush()
      res.status(200).json({
        message: 'Pedido finalizado',
        data: pedido_resolucion,
      })
    }
  } catch (error: any) {
    console.log('Error al finalizar el pedido de resolución: ', error.message)
    res.status(500).json({ message: error.message })
  }
}

async function eliminarPedidoResolucionDenunciante(req: Request, res: Response) {
  try {
    const idPedido = new ObjectId(req.params.id)
    const pedido = await em.findOne(Pedido_Resolucion, { _id: idPedido }, { populate: ['denunciante'] })

    if (!pedido) {
      res.status(404).json({ message: 'Pedido no encontrado' })
      return
    }

    if (pedido.estado_pedido_resolucion !== 'solicitado') {
      res.status(400).json({
        message: 'Solo se pueden eliminar pedidos con estado solicitado',
      })
      return
    }

    await em.removeAndFlush(pedido)
    res.status(200).json({ message: 'Pedido eliminado correctamente' })
    return
  } catch (error: any) {
    console.error('Error al eliminar pedido:', error.message)
    res.status(500).json({ message: 'Error al eliminar el pedido', error: error.message })
    return
  }
}

export { findAll, remove, generarPedidoResolucion, tomarPedidoResolucion, finalizarPedido, eliminarPedidoResolucionDenunciante, findPosiblesPedidos }
