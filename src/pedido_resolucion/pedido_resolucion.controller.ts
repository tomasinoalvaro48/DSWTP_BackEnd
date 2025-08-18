
import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Pedido_Resolucion } from "./pedido_resolucion.entity.js";
import { findZonaByNameAndLocalidad } from "../localidad/zona.controler.js";
import {  buscarOCrearDenunciante } from "../denunciante/denunciante.controller.js";

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

/*
Denunciante:
-nombre
-mail
-telefono

Pedido:
-descripcion [0..1]
-direccion

Zona:
-nombre

Localdidad:
-nombre
*/


/*
fecha       ++
direccion
descripcion 
estado      ++ 
comentario  
resultado   ++
dificultad  ???????????????////

*/





async function generarPedidosResolucion(req: Request, res: Response){
    try{
        
        const denunciante = await buscarOCrearDenunciante(req, res)   //POSIBLEMENTE MAL
        const zona = await findZonaByNameAndLocalidad(req.body.nombreZona, req.body.nombreLocalidad) // ver como funciona en FRONT
        
        
        req.body.sanitizePedidoInput = {
            direccion: req.body.direccionPedido,
            descripcion: req.body.descripicionPedido,
            zona: zona,
            denunciante: denunciante      
        }

        const pedido_resolucion = em.create(Pedido_Resolucion, req.body.sanitizePedidoInput )
        await em.flush()
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
        const pedido_resolucion = await em.find(Pedido_Resolucion, {},{populate:['zona','denunciante']})
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



async function agregarTiposAnomalias(req: Request, res: Response) {
    try{
        
        
        const pedido_resolucion = 

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


export{generarPedidosResolucion,findAll}


