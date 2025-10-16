import { Request, Response } from 'express';
import { orm } from '../shared/db/orm.js';
import { Pedido_Resolucion } from './pedido_resolucion.entity.js';
import { ObjectId } from 'mongodb';
import { Denunciante } from '../denunciante/denunciante.entity.js';
import { Anomalia } from './anomalia.entity.js';
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js';
import { Zona } from '../localidad/zona.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET no está definida. Definila en las variables de entorno.'
  );
}

const em = orm.em;

async function remove(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id);
    const pedido_resolucion_to_remove = em.getReference(Pedido_Resolucion, id);
    await em.removeAndFlush(pedido_resolucion_to_remove);
    res
      .status(200)
      .json({ message: 'Remove pedido', data: pedido_resolucion_to_remove });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findAll(req: Request, res: Response) {
  try {
    let filter: {
      estado_pedido_resolucion?: string;
      dificultad_pedido_resolucion?: number;
      zona?: any;
    } = {};

    if (req.query.estado_pedido_resolucion) {
      filter.estado_pedido_resolucion = req.query
        .estado_pedido_resolucion as string;
    }
    if (req.query.dificultad_pedido_resolucion) {
      filter.dificultad_pedido_resolucion = parseInt(
        req.query.dificultad_pedido_resolucion as string
      );
    }

    if (req.query.zonas) {
      const zonasQuery = Array.isArray(req.query.zonas)
        ? req.query.zonas
        : [req.query.zonas];

      const zonasObjectIds = zonasQuery.map(
        (zonaIdString) => new ObjectId(zonaIdString as string)
      );

      filter.zona = { $in: zonasObjectIds };
    }

    const pedido_resolucion = await em.find(Pedido_Resolucion, filter, {
      populate: [
        'zona.localidad',
        'denunciante',
        'anomalias.tipo_anomalia',
        'cazador',
      ],
    });
    res
      .status(200)
      .json({ message: 'find all pedidos', data: pedido_resolucion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function showMisPedidos(req: Request, res: Response) {
  //Posiblemente a incluir en el findAll
  try {
    let filter: {
      estado_pedido_resolucion?: string;
      dificultad_pedido_resolucion?: number;
      zona?: any;
      cazador?: any;
      denunciante?: any;
    } = {};

    if (req.query.estado_pedido_resolucion) {
      filter.estado_pedido_resolucion = req.query
        .estado_pedido_resolucion as string;
    }

    if (req.body.user.rol == 'cazador') {
      filter.cazador = new ObjectId(req.body.user.id);
    }
    if (req.body.user.rol == 'denunciante') {
      filter.denunciante = new ObjectId(req.body.user.id);
    }

    if (req.query.dificultad_pedido_resolucion) {
      filter.dificultad_pedido_resolucion = parseInt(
        req.query.dificultad_pedido_resolucion as string
      );
    }

    if (req.query.zonas) {
      const zonasQuery = Array.isArray(req.query.zonas)
        ? req.query.zonas
        : [req.query.zonas];

      const zonasObjectIds = zonasQuery.map(
        (zonaIdString) => new ObjectId(zonaIdString as string)
      );

      filter.zona = { $in: zonasObjectIds };
    }

    const pedido_resolucion = await em.find(Pedido_Resolucion, filter, {
      populate: [
        'zona.localidad',
        'denunciante',
        'anomalias.tipo_anomalia',
        'cazador',
        'inspecciones',
      ],
      orderBy: { fecha_pedido_resolucion: 'DESC' },
    });

    //Reordena las inspecciones
    pedido_resolucion.forEach((pedido) => {
      const inspeccionesArray = pedido.inspecciones.getItems();
      inspeccionesArray.sort(
        (a, b) => b.numero_inspeccion - a.numero_inspeccion
      );
      pedido.inspecciones.set(inspeccionesArray);
    });

    res
      .status(200)
      .json({ message: 'find mis pedidos', data: pedido_resolucion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function tomarPedidoResolucion(req: Request, res: Response) {
  try {
    const idCazador = new ObjectId(req.body.user.id);
    console.log('Cazador intenta tomar el pedido: ' + idCazador);

    // Validamos que no tenga ya un pedido aceptado
    const pedidoExistente = await em.findOne(Pedido_Resolucion, {
      cazador: idCazador,
      estado_pedido_resolucion: 'aceptado',
    });

    if (pedidoExistente) {
      console.log('El cazador ya tiene un pedido aceptado');
      res.status(400).json({
        message:
          'No podés tomar el pedido porque todavía tenés uno pendiente por resolver.',
      });
      return;
    } else {
      const idPedidoResolucion = new ObjectId(req.params.id);
      const pedidoResolucionRef = em.getReference(
        Pedido_Resolucion,
        idPedidoResolucion
      );
      const cazadorRef = em.getReference(Usuario, idCazador);

      const elementosActualizar = {
        estado_pedido_resolucion: 'aceptado',
        cazador: cazadorRef,
      };

      em.assign(pedidoResolucionRef, elementosActualizar);
      await em.flush();

      console.log('Pedido tomado');
      res.status(200).json({ message: 'Pedido tomado' });
      return;
    }
  } catch (error: any) {
    console.log('Error al tomar el pedido');
    res.status(500).json({ message: error.message });
  }
}

async function generarPedidoResolucion(req: Request, res: Response) {
  try {
    const idDenunciante = new ObjectId(req.body.user.id);
    const denuncianteRef = await em.getReference(Denunciante, idDenunciante);
    console.log('Denucniante logueado');

    //---------------- Lógica de creación del pedido de resolución
    let dificultad = 0;
    const anomalias = [] as Anomalia[];

    // referenciamos las anomalías y calculamos la dificultad del pedido de resolución
    const anomaliaInput = req.body.anomalias as Anomalia[];
    anomaliaInput.map(async (a) => {
      const id_tipo_anomalia = new ObjectId(a.tipo_anomalia.id);
      const tipo = await em.getReference(Tipo_Anomalia, id_tipo_anomalia);

      if (tipo) {
        req.body.sanitizeAnomaliaInput = {
          tipo_anomalia: tipo,
        };
        dificultad += a.tipo_anomalia.dificultad_tipo_anomalia; // Calculamos la dificultad del pedido de resolución
        const nuevaAnomalia = em.create(
          Anomalia,
          req.body.sanitizeAnomaliaInput
        );
        anomalias.push(nuevaAnomalia);
      }
    });

    // referenciamos la zona
    const id_zona = new ObjectId(req.body.zona.id);
    const zonaRef = await em.getReference(Zona, id_zona);

    console.log('Dificultad del pedido de resolución: ' + dificultad);

    // Sanitizamos el input
    req.body.sanitizePedidoInput = {
      direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
      descripcion_pedido_resolucion: req.body.descripcion_pedido_resolucion,
      dificultad_pedido_resolucion: dificultad,
      zona: zonaRef,
      denunciante: denuncianteRef,
      anomalias: anomalias,
    };

    // Creamos el pedido de resolución
    const pedido_resolucion = await em.create(
      Pedido_Resolucion,
      req.body.sanitizePedidoInput
    );
    console.log('Pedido de resolución creado');

    // Guardamos en la base de datos
    await em.flush();
    res.status(200).json({
      message: 'created pedido de resolucion',
      data: pedido_resolucion,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function finalizarPedido(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id);

    const pedido_resolucion = await em.findOneOrFail(Pedido_Resolucion, id, {
      populate: ['cazador', 'anomalias'],
    });

    let valid = true;
    pedido_resolucion.anomalias.map((unaAnomalia) => {
      if (unaAnomalia.resultado_anomalia !== 'resuelta') {
        valid = false;
      }
    });

    if (!valid) {
      res.status(400).json({
        message:
          'Hay anomalias no resueltas. No es posible finalizar pedido hasta que todas sus anomalias esten resueltas',
      });
      return;
    } else {
      pedido_resolucion.cazador.nivel_cazador =
        pedido_resolucion.cazador.nivel_cazador +
        pedido_resolucion.dificultad_pedido_resolucion;

      pedido_resolucion.estado_pedido_resolucion = 'resuelto';
      pedido_resolucion.comentario_pedido_resolucion =
        req.body.comentario_pedido_resolucion;

      await em.flush();
      res.status(200).json({
        message: 'Pedido finalizado',
        data: pedido_resolucion,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  findAll,
  remove,
  generarPedidoResolucion,
  showMisPedidos,
  tomarPedidoResolucion,
  finalizarPedido,
};
