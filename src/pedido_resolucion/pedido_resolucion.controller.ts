
import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Pedido_Resolucion } from "./pedido_resolucion.entity.js";
import {  buscarOCrearDenunciante } from "../denunciante/denunciante.controller.js";
import { ObjectId } from "mongodb";
import { Zona } from "../localidad/zona.entity.js";
import { Denunciante } from "../denunciante/denunciante.entity.js";
import { Anomalia } from "./anomalia.entity.js";
import { get } from "http";
import { Usuario } from "../usuario/usuario.entity.js";
import { findOne } from "../localidad/localidad.controller.js";
const em = orm.em



function sanitizePedidoInput(
    req: Request, 
    res: Response, 
    next :NextFunction
){

  
    req.body.sanitizePedidoInput = {
        direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
        descripcion_pedido_resolucion: req.body.descripcion_pedido_resolucion,
        comentario_pedido_resolucion: req.body.comentario_pedido_resolucion,
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

async function remove(req: Request, res: Response){
    try{
        const id = new ObjectId(req.params.id)
        const pedido_resolucion_to_remove= em.getReference(Pedido_Resolucion, id)
        await em.removeAndFlush(pedido_resolucion_to_remove)
        res
           .status(200)
           .json({message: 'Remove pedido', data: pedido_resolucion_to_remove})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}




async function findAll(req: Request, res: Response){
    try{
        const pedido_resolucion = await em.find(Pedido_Resolucion, {},{populate:['zona','denunciante','anomalias.tipo_anomalia','cazador']})
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



async function generarPedidosResolucion(req: Request, res: Response) {
    try{
        //Cuando ande mover a zona
        const idZona = new ObjectId(req.body.zona)
        const zonaReferenciada = em.getReference(Zona, idZona)
        //-----------------------
        const idDenunciante = new ObjectId(req.body.denunciante)
        const denuncianteRef = em.getReference(Denunciante, idDenunciante)
        //----------------  
        
        //----------------
        

        req.body.sanitizePedidoInput = {
            direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
            descripcion_pedido_resolucion: req.body.descripcion_pedido_resolucion,
            zona: zonaReferenciada,
            denunciante: denuncianteRef
        }

        const pedido_resolucion = em.create(Pedido_Resolucion, req.body.sanitizePedidoInput )
        await em.flush()

        res
           .status(200)
           .json({message: 'create pedido resolucion', data:pedido_resolucion})
                 
    }
     
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}
/*


async function calcularDificultad(req: Request, res: Response) {
    try{
        const id_pedido_resolucion = new ObjectId(req.params.id)
        const pedido_ref = await em.findOneOrFail(Pedido_Resolucion, id_pedido_resolucion,{ populate: ['anomalias.tipo_anomalia']})
        if (pedido_ref){
            var difucultad = 0;
            pedido_ref.anomalias.forEach(anomalia => {
                difucultad += anomalia.tipo_anomalia.dificultad_tipo_anomalia;                
            });
            
            var sanitizePedido = {
                difucultad_pedido : difucultad,
                estado_pedido : 'solcitado'


            }
            em.assign(pedido_ref, sanitizePedido)
            em.flush()
            

        } 


    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
    
}
*/

async function calcularDificultad(req: Request, res: Response) {
  try {
    const id_pedido_resolucion = new ObjectId(req.params.id)
    const pedido_ref = await em.findOneOrFail(
      Pedido_Resolucion,
      id_pedido_resolucion,
      { populate: ['anomalias.tipo_anomalia'] }
    )

    let dificultad = 0
    const anomalias = pedido_ref.anomalias.getItems()
    anomalias.forEach((anomalia) => {
      dificultad += anomalia.tipo_anomalia.dificultad_tipo_anomalia
    })

    em.assign(pedido_ref, {
      dificultad_pedido_resolucion: dificultad,
      estado_pedido_resolucion: 'solicitado'
    })

    await em.flush()

    res
      .status(200)
      .json({ message: 'Dificultad calculada', data: pedido_ref })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}



// CUU 1 - REGISTRAS PEDIDO RESOLUCION




/*

//PASO 1 CUU1
async function generarPedidosResolucion(req: Request, res: Response){
    try{
        
        const denunciante = await buscarOCrearDenunciante(req, res)   //Cambiar por secion, hacer get refence por ha

        const zona = await findZonaByNameAndLocalidad(req.body.nombreZona, req.body.nombreLocalidad) // ver como funciona en FRONT
        
        //Como poner sanitize inpput
        req.body.sanitizePedidoInput = {
            direccion_pedido_resolucion: req.body.direccion_pedido_resolucion,
            descripcion_pedido_resolucion: req.body.descripcion_pedido_resolucion,
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



async function agregarTiposAnomalias(req: Request, res: Response) {
    try{      
        const id_pedidos_resolucion = new ObjectId(req.params.id)
        const pedido_resolucion = await em.findOneOrFail(
            Pedido_Resolucion, 
            id_pedidos_resolucion,
            {populate:['anomalias']})
        const anomalia = agregarAnomalias(req, res) 
        console.log(anomalia)
        if(anomalia){
           pedido_resolucion.anomalias.add(anomalia);
           em.flush()
        }
        res
            .status(200)
            .json({message: 'create agregar anomalia', data: pedido_resolucion})
    }   
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}


async function registrarPedido(req: Request, res: Response) {
  try {
    const id_pedido_resolucion = new ObjectId(req.params.id)

    const pedido_resolucion = await em.findOneOrFail(
      Pedido_Resolucion,
      id_pedido_resolucion,
      { populate: ['anomalias.tipo_anomalia'] }
    )

    let dificultad_pedido = 0
    for(const anomalia of pedido_resolucion.anomalias){
        
        const dificultad_anomalia = anomalia.tipo_anomalia.dificultad_tipo_anomalia
        if (dificultad_anomalia>dificultad_pedido){
            dificultad_pedido =  dificultad_anomalia
        }
    };
    em.assign(pedido_resolucion, { dificultad_pedido_resolucion: dificultad_pedido })
    await em.flush()

    res.status(200).json({ message: 'pedido actualizado', data: pedido_resolucion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}




export{generarPedidosResolucion,findAll,registrarPedido, agregarTiposAnomalias,remove}
*/

export{generarPedidosResolucion,findAll,remove, calcularDificultad}
