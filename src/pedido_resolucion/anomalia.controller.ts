
import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Anomalia } from "./anomalia.entity.js";
import { ObjectId } from "mongodb";
import { Pedido_Resolucion } from "./pedido_resolucion.entity.js";

const em = orm.em

async function agregarAnomalia(req: Request, res: Response){
    
    try{
        const id_tipo_anomalia = new ObjectId(req.body.tipo_anomalia)
        const tipo_anomalia = em.getReference(Anomalia, id_tipo_anomalia)

        const id_pedido_resolucion = new ObjectId(req.body.pedido_resolucion)
        const pedido_resolucion = em.getReference(Pedido_Resolucion, id_pedido_resolucion)

        req.body.sanitizeAnomaliaInput = {
            tipo_anomalia: tipo_anomalia,
            pedido_resolucion: pedido_resolucion
        }
        const anomalia = em.create(Anomalia, req.body.sanitizeAnomaliaInput )
        await em.flush()

        res
           .status(200)
           .json({message: 'create pedido resolucion', data: anomalia})

        
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}


async function remove(req: Request, res: Response){
    try{
        const id = new ObjectId(req.params.id)
        const anomalia_to_remove = em.getReference(Anomalia, id)
        await em.removeAndFlush(anomalia_to_remove)
        res
           .status(200)
           .json({message: 'Remove anomalia', data: anomalia_to_remove})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}




async function findAll(req: Request, res: Response){
    try{
        const anomalia = await em.find(Anomalia, {},{populate:['pedido_resolucion','tipo_anomalia']})
        res
            .status(200)
            .json({message: 'find all anomalias', data: anomalia})
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}
/*

function agregarAnomaliaArray(req: Request, res: Response){
    
    try{
        const id_tipo_anomalia = new ObjectId(req.body.tipo_anomalia)
        const tipo_anomalia = em.getReference(Anomalia, id_tipo_anomalia)

        const id_pedido_resolucion = new ObjectId(req.body.pedido_resolucion)
        const pedido_resolucion = em.getReference(Pedido_Resolucion, id_pedido_resolucion)

        req.body.sanitizeAnomaliaInput = {
            tipo_anomalia: tipo_anomalia,
            pedido_resolucion: pedido_resolucion
        }
        const anomalia = em.create(Anomalia, req.body.sanitizeAnomaliaInput )

        return anomalia

    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}*/


export{agregarAnomalia,findAll, remove}