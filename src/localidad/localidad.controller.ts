import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Localidad } from './localidad.entity.js'
import { ObjectId } from "mongodb";



function sanitizeLocalidadInput(
    req: Request, 
    res: Response, 
    next :NextFunction
){
    req.body.sanitizeLocalidadInput = {
        codigo_localidad: req.body.codigo,
        nombre_localidad: req.body.nombre,
        zonas: req.body.zonas
    }

    Object.keys(req.body.sanitizeLocalidadInput).forEach((key)=>{
        if(req.body.sanitizeLocalidadInput[key]===undefined){
            delete req.body.sanitizeLocalidadInput[key]
        }
    }) 
    next()
}


const em = orm.em

async function findAll(req: Request, res: Response){
    try{
        const localidades = await em.find(Localidad, 
            {}, 
            {populate:['zonas']}
        )
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
    try{
        const id = new ObjectId(req.params.id)
        const localidad = await em.findOneOrFail(Localidad, 
            id,
        {populate: ['zonas']} )
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
        const localidad = em.create(Localidad, req.body.sanitizeLocalidadInput)
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
        const id = new ObjectId(req.params.id)
        const localidadToUpdate = em.getReference(Localidad, id)
        em.assign(localidadToUpdate, req.body.sanitizeLocalidadInput)
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
        const id = new ObjectId(req.params.id)
        const localidadToDelete = em.getReference(Localidad, id)
        await em.removeAndFlush(localidadToDelete)
        res
           .status(200)
           .json({message: 'Remove localidad', data: localidadToDelete})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}


async function findLocalidadByName(nombre_localidad:string) {
    try{
        const localidadFound = await em.findOneOrFail(Localidad,{nombre_localidad: nombre_localidad})
        return localidadFound
    }
    catch(error: any)
    {
        console.log(`Error al buscar localidad: ${error.message}`)
    }
}
export{findAll, findOne, add, remove, update, sanitizeLocalidadInput, findLocalidadByName}