
import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Pedido_Resolucion } from "./pedido_resolucion.entity.js";
import { findZonaByNameAndLocalidad } from "../localidad/zona.controler.js";
import {  buscarOCrearDenunciante } from "../denunciante/denunciante.controller.js";
import { agregarAnomalias } from "./anomalias.controller.js";
import { Anomalia } from "./anomalia.entity.js";
import { ObjectId } from "mongodb";
import { pedidos_resolucion } from "./pedido_resolucion.routes.js";

const em = orm.em



function sanitizePedidoInput(
    req: Request, 
    res: Response, 
    next :NextFunction
){

  
    req.body.sanitizePedidoInput = {
        direccion: req.body.direccion,
        descripcion: req.body.descripcion,
        comentario: req.body.comentario,
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


//PASO 1 CUU1
async function generarPedidosResolucion(req: Request, res: Response){
    try{
        
        const denunciante = await buscarOCrearDenunciante(req, res)   //Cambiar por secion, hacer get refence por ha

        const zona = await findZonaByNameAndLocalidad(req.body.nombreZona, req.body.nombreLocalidad) // ver como funciona en FRONT
        
        //Como poner sanitize inpput
        req.body.sanitizePedidoInput = {
            direccion: req.body.direccionPedido,
            descripcion: req.body.descripicionPedido,
            zona: zona,
            denunciante: denunciante      
        }

        const pedido_resolucion = em.create(Pedido_Resolucion, req.body.sanitizePedidoInput )
        await em.flush()//Cambiarrrrrrrrr
        res
            .status(200)
            .json({message: 'create pedido resolucion', data: pedido_resolucion})
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}




async function findAll(req: Request, res: Response){
    try{
        const pedido_resolucion = await em.find(Pedido_Resolucion, {},{populate:['zona','denunciante','anomalias']})
        res
            .status(200)
            .json({message: 'find all pedidos', data: pedido_resolucion})
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}


async function registrarPedido(req: Request, res: Response) {
    try
    {

        // const pedidos_resolucion = em.findOneOrFail(Pedido_Resolucion, id_pedido_resolucion,{populate:['anomalias']})
        const id_pedido_resolucion = new ObjectId(req.params.id)
        const pedidos_resolucion = em.getReference(Pedido_Resolucion, id_pedido_resolucion)
       
        let dificultad_pedido = 0
        for(const anomalia of pedidos_resolucion.anomalias){
            const dificultad_anomalia = anomalia.tipo_anomalia.dificultad_tipo_anomalia
            if (dificultad_anomalia>dificultad_pedido){
                dificultad_pedido =  dificultad_anomalia
            }
        };

        req.body.sanitizePedidoInput= {
            dificultad_pedido : dificultad_pedido,

        }

        em.assign(pedidos_resolucion, req.body.sanitizePedidoInput)
        await em.flush()
        res
            .status(200)
            .json({message: 'pedido update'})

    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}


/*
async function agregarTiposAnomalias(req: Request, res: Response) {
    try{


        

        const anomalia = agregarAnomalias(req, res) // En caso de 

        // OTRA POSIBLE OPCION
        const id = new ObjectId(req.params.id)
        const zonaToUpdate = em.getReference(Zona, id)
        em.assign(zonaToUpdate, req.body.sanitizeZonaImput)
        await em.flush()
        

        req.body.sanitizePedidoInput ={
        
        }
        const pedido_resolucion = 1
        
        res
            .status(200)
            .json({message: 'create pedido resolucion', data: pedido_resolucion})
    }   
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}
*/

export{generarPedidosResolucion,findAll,registrarPedido}


