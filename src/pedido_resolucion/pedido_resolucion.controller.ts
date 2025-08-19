
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
       // await em.flush()//Cambiarrrrrrrrr
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
        const id_pedido_resolucion = new ObjectId(req.params.id)
        const pedidos_resolucion = em.getReference(Pedido_Resolucion, id_pedido_resolucion)
        const dificultad_pedido = 0
        pedidos_resolucion.anomalias.forEach(anomalia => {//????????????????
            const dificultad_anomalia = anomalia.tipo_anomalia.dificultad_tipo_anomalia
            if (dificultad_anomalia>dificultad_pedido){
                dificultad_pedido =  dificultad_anomalia
            }
        });


        const id_pedido_resolucion = new ObjectId(req.params.id);
        const pedido = await em.findOneOrFail(Pedido_Resolucion, id_pedido_resolucion, {
        populate: ['anomalias', 'anomalias.tipoAnomalia'], // importante
        });

        let dificultad_pedido = 0;

        for (const anomalia of pedido.anomalias) {
        const dificultad_anomalia = anomalia.tipoAnomalia.dificultad_tipo_anomalia;
        if (dificultad_anomalia > dificultad_pedido) {
            dificultad_pedido = dificultad_anomalia;
        }
        }
        
        
        




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

export{generarPedidosResolucion,findAll}


