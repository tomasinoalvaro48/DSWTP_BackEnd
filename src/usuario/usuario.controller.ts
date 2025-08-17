import { Request, Response, NextFunction } from "express";
import { orm } from '../shared/db/orm.js'
import { Usuario } from "./usuario.entity.js";
import { ObjectId } from "mongodb";
import { Zona } from "../localidad/zona.entity.js";

const em = orm.em

function sanitizeUsuarioImput(req: Request, res: Response, next: NextFunction)
{
    if (req.body.zona !== undefined){
    const idZona = new ObjectId(req.body.zona)
    const zonaRef = em.getReference(Zona, idZona)
    req.body.sanitizeUsuarioImput = {
        zona: zonaRef    
        }    
    }
    else
    {
        req.body.sanitizeUsuarioImput = {
            zona: req.body.zona    
        }
    }
    req.body.sanitizeUsuarioImput = {
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        mail: req.body.mail,
        password: req.body.password,
        tipo: req.body.tipo,
        zona: req.body.zona //Ver si sacar!!!!!!!!!!!!!!!!!!!!!
        
    }
    Object.keys(req.body.sanitizeUsuarioImput).forEach((key)=>{
    if(req.body.sanitizeUsuarioImput[key]===undefined){
        delete req.body.sanitizeUsuarioImput[key]
        }
    }) 
    next()

    
}

async function findAll(req: Request, res: Response) {
    try{
        const usuarios = await em.find(Usuario,{},{populate:['zona']})
        res
           .status(200)
           .json({message: 'find all usuarios', data: usuarios})
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
        const usuario = await em.findOneOrFail(Usuario, id,{populate:['zona']})
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
        const usuario = em.create(Usuario, req.body.sanitizeUsuarioImput)
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
        const id = new ObjectId(req.params.id)
        const usuarioToUpdate = em.getReference(Usuario, id)
        em.assign(usuarioToUpdate, req.body.sanitizeUsuarioImput)
        await em.flush()
        res
            .status(200)
            .json({message: 'usuario update'})
    }
    catch(error: any){
        res
            .status(500)
            .json({message: error.message})
    }
}

async function remove(req: Request, res: Response){
    try{
        const id = new ObjectId(req.params.id)
        const usuarioToUsuario = em.getReference(Usuario, id)
        await em.removeAndFlush(usuarioToUsuario)
        res
           .status(200)
           .json({message: 'Remove usuario', data: usuarioToUsuario})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}



export{findAll, findOne, add, remove, update, sanitizeUsuarioImput}