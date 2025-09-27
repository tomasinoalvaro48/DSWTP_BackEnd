

import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Zona } from './zona.entity.js'
import { ObjectId } from "mongodb";
import { Localidad } from "./localidad.entity.js";
import { findLocalidadByName } from "./localidad.controller.js";

const em = orm.em

function sanitizeZonaImput(req: Request, res: Response, next: NextFunction){
    
    if (req.body.localidad !== undefined){
    const idLocalidad = new ObjectId(req.body.localidad)
    const localidadRef = em.getReference(Localidad, idLocalidad)
    req.body.sanitizeZonaImput = {
        localidad: localidadRef    
        }    
    }
    else
    {
        req.body.sanitizeZonaImput = {
            localidad: req.body.localidad    
        }
    }
    req.body.sanitizeZonaImput = {
        nombre_zona: req.body.nombre_zona,
        localidad: req.body.localidad//Ver si sacar!!!!!!!!!!!!!!!!!!!!!
        
    }
    Object.keys(req.body.sanitizeZonaImput).forEach((key)=>{
    if(req.body.sanitizeZonaImput[key]===undefined){
        delete req.body.sanitizeZonaImput[key]
        }
    }) 
    next()
}


async function findAll(req: Request, res: Response){
    try{
        const zonas = await em.find(Zona, {},{populate:['localidad','usuarios']})
        res
            .status(200)
            .json({message: 'find all zonas', data: zonas})
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}

async function findOne(req: Request, res: Response){
    try{
        const id = new ObjectId(req.params.id)
        const zona = await em.findOneOrFail(Zona, id,{populate:['localidad','usuarios']})
        res
            .status(200)
            .json({message: 'find one zona', data: zona})
    }
    catch(error: any){
        res.status(500).json({message: error.message})
    }
}

async function add(req: Request, res: Response) {
    try {
        const { nombre_zona, localidad } = req.body.sanitizeZonaImput
        const localidadRef = em.getReference(Localidad, (localidad as any).id ?? localidad)

        const zonaExistente = await em.findOne(Zona, {
            nombre_zona,
            localidad: localidadRef
        })

        if (zonaExistente) {
            res.status(400).json({ message: 'Ya existe esa zona en esta localidad.' })
            return
        }

        const zona = em.create(Zona, {
            nombre_zona,
            localidad: localidadRef
        })

        await em.flush()
        res
           .status(200)
           .json({message: 'create zona', data: zona})
    } catch(error: any) {
        res 
        .status(500).json({message: error.message})
    }
}

async function update(req:Request, res:Response){
    try {
        const id = new ObjectId(req.params.id)
        const { nombre_zona, localidad } = req.body.sanitizeZonaImput
        const localidadRef = em.getReference(Localidad, (localidad as any).id ?? localidad)

        const zonaExistente = await em.findOne(Zona, {
            nombre_zona,
            localidad: localidadRef
        })

        if (zonaExistente && zonaExistente.id !== id.toHexString()) {
            res.status(400).json({ message: 'Ya existe esa zona en esta localidad.' })
            return
        }

        const zonaToUpdate = em.getReference(Zona, id)
        em.assign(zonaToUpdate, {
            nombre_zona,
            localidad: localidadRef
        })

        await em.flush()
        res
            .status(200)
            .json({message: 'zona update'})
    }
    catch(error: any) {
        res
            .status(500)
            .json({message: error.message})
    }
}

async function remove(req: Request, res: Response){
    try{
        const id = new ObjectId(req.params.id)
        const zonaToDelete = em.getReference(Zona, id)
        await em.removeAndFlush(zonaToDelete)
        res
           .status(200)
           .json({message: 'Remove zona', data: zonaToDelete})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}
/*
async function findZonaByNameAndLocalidad(nombre_zona: string,nombre_localidad: string) {
    try{
        const localidadFound = await findLocalidadByName(nombre_localidad)
        if(localidadFound)
        {
            const zonaFound = await em.findOneOrFail(Zona,{ nombre_zona: nombre_zona, localidad: localidadFound })
            return zonaFound
        }
    }
    catch(error: any)
    {
        console.log(`Error al buscar zona: ${error.message}`)
    }
}*/




export{findAll, findOne, add, remove, update, sanitizeZonaImput}