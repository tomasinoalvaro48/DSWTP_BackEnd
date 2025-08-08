/*function sanitizeZonaImput(req: Request, res: Response, next: NextFunction){
    req.body.sanitizedZonaInput = {
        cod_zona: req.body.cod_zona,
        nombre_zona: req.body.nombre_zona,
        cod_postal_localidad: req.body.cod_postal_localidad
    };
    Object.keys(req.body.sanitizedZonaInput).forEach((key)=>{
    if(req.body.sanitizedZonaInput[key]===undefined){
        delete req.body.sanitizedZonaInput[key]
    }
    }) 

    next();
}*/


import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Zona } from './zona.entity.js'

const em = orm.em

async function findAll(req: Request, res: Response){
    try{
        const zonas = await em.find(Zona, {})
        res
            .status(200)
            .json({message: 'find all zonas', data: zonas})
    }
    catch(error: any){
        res.status(500).json({message: error.message})
    }
}

async function findOne(req: Request, res: Response){
    try{
        const id = req.body.id
        const zona = await em.findOneOrFail(Zona, {id})
        res
            .status(200)
            .json({message: 'find one zoan'})
    }
    catch(error: any){
        res.status(500).json({message: error.message})
    }
}
async function add(req: Request, res: Response){
    try{
        const localidad = em.create(Zona, req.body)
        await em.flush()
        res
           .status(200)
           .json({message: 'create zona', data: localidad})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}

async function update(req:Request, res:Response){
    try{
        const id = req.body.id
        const zona = em.getReference(Zona, id)
        em.assign(zona, id)
        await em.flush()
        res
            .status(200)
            .json({message: 'zona update'})
    }
    catch(error: any){
        res
            .status(500).json({message: error.message})
    }

}

async function remove(req: Request, res: Response){
    try{
        const id = req.body.id
        const zona = em.getReference(Zona, id)
        await em.removeAndFlush(zona)
        res
           .status(200)
           .json({message: 'Remove zona', data: zona})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}


export{findAll, findOne, add, remove, update}