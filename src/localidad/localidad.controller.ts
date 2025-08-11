import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Localidad } from './localidad.entity.js'


/*
function sanatizeLocalidadInput(req: Request, res: Response, next :NextFunction){
    req.body.sanatizeLocalidadInput = {
        codigoPostal: req.body.codigoPostal,
        nombre: req.body.nombre
    }

    Object.keys(req.body.sanatizeLocalidadInput).forEach((key)=>{
        if(req.body.sanatizeLocalidadInput[key]===undefined){
            delete req.body.sanatizeLocalidadInput[key]
        }
    }) 
    next()
}
*/

const em = orm.em

async function findAll(req: Request, res: Response){
    try{
        const localidades = await em.find(Localidad, {})
        res
           .status(200)
           .json({message: 'find all localidades', data: localidades})
    }
    catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}


async function findOne(req: Request, res: Response){
    const id = req.body.id
    const localidad = await em.findOneOrFail(Localidad, {id})
    try{
        res
            .status(200)
            .json({message: 'find one localidad', data: localidad})
    }
    catch(error:any){
        res.status(500).json({message: error.message})
    }
}

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

async function update(req:Request, res:Response){
    try{
        const id = req.body.id
        const localidad = em.getReference(Localidad, id)
        em.assign(Localidad, id)
        await em.flush()
        res
            .status(200)
            .json({message: 'localidad update'})
    }
    catch(error: any){
        res
            .status(500).json({message: error.message})
    }

}

async function remove(req: Request, res: Response){
    try{
        const id = req.body.id
        const localidad = em.getReference(Localidad, id)
        await em.removeAndFlush(localidad)
        res
           .status(200)
           .json({message: 'Remove localidad', data: localidad})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}

export{findAll, findOne, add, remove, update}