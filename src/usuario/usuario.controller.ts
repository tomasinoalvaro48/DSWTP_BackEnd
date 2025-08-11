import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Usuario } from "./usuario.entity.js";

const em = orm.em

async function findAll(req: Request, res: Response) {
    try{
        const usuarios = await em.find(Usuario,{})
        res
           .status(200)
           .json({message: 'find all usuarios', data: usuarios})
    }
    catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}

async function findOne(req: Request, res: Response){
    const id = req.body.id
    const usuario = await em.findOneOrFail(Usuario,{id})
    try{
        res
            .status(200)
            .json({message: 'find one usuario', data: usuario})
    }
    catch(error:any){
        res.status(500).json({message: error.message})
    }
}

async function add(req: Request, res: Response){
    try{
        const usuario = em.create(Usuario, req.body)
        await em.flush()
        res
           .status(200)
           .json({message: 'create usuario', data: usuario})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}

async function update(req:Request, res:Response){
    try{
        const id = req.body.id
        const usuario = em.getReference(Usuario, id)
        em.assign(Usuario, id)
        await em.flush()
        res
            .status(200)
            .json({message: 'usuario update'})
    }
    catch(error: any){
        res
            .status(500).json({message: error.message})
    }
}

async function remove(req: Request, res: Response){
    try{
        const id = req.body.id
        const usuario = em.getReference(Usuario, id)
        await em.removeAndFlush(usuario)
        res
           .status(200)
           .json({message: 'Remove usuario', data: usuario})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}



export{findAll, findOne, add, remove, update}