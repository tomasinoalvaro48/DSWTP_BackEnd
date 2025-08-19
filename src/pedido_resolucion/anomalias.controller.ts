
import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Anomalia } from "./anomalia.entity.js";
import { ObjectId } from "mongodb";
import { Pedido_Resolucion } from "./pedido_resolucion.entity.js";

const em = orm.em

async function agregarAnomalias(req: Request, res: Response){
    
    try{
        const id_tipo_anomalia = new ObjectId(req.body.tipo_anomalia)
        const tipo_anomalia = em.getReference(Anomalia, id_tipo_anomalia)

        const id_pedido_resolucion = new ObjectId(req.body.tipo_anomalia)
        const pedido_resolucion = em.getReference(Pedido_Resolucion, id_pedido_resolucion)

        req.body.sanitizeAnomaliaInput = {
            tipo_anomalia: tipo_anomalia,
            pedido_resolucion: pedido_resolucion
        }
        const anomalia = em.create(Anomalia, req.body.sanitizeAnomaliaInput )
        await em.flush()
        return anomalia
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }


}

export{agregarAnomalias}