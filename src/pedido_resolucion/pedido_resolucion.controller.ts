
//import { Request, Response, NextFunction } from "express";
//import { orm } from '../shared/db/orm.js'
//import { Pedido_Resolucion } from "./pedido_resolucion.entity.js";

//const em = orm.em
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


async function generarPedidosResolucion(req: Request, res: Response){
    try{
        const zona = await buscarZona(req.body.zona, req.body.localidad) // ver como funciona en FRONT
        const denunciante = await buscarCrearDenunciante(req.body.denunciante) // ver como funciona en FRONT
        
        async function add(req: Request, res: Response){
            try{
                const localidad = em.create(Localidad, req.body)
                await em.flush()
                res
                   .status(200)
                   .json({message: 'create localidad', data: localidad})
            }catch(error: any){
                res
                .status(500).json({message: error.message})
            }
        }
        
        
    }


}


*/