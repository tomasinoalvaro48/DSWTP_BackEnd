import { zonaRepository } from "./zona.repository.js"
import { Request, Response, NextFunction } from "express"

const repository = new zonaRepository()

function sanitizeZonaImput(req: Request, res: Response, next: NextFunction){
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
}


function findAll(req: Request, res: Response){
    res.json({data: repository.findAll()})
}

function findOne(req: Request, res: Response){
    const zona = repository.findOne({id: parseInt(req.params.id)})    
    if(zona !== undefined){
        res.json({data: zona})
    }
    else{
        res.status(404).send({message: 'Not Resource Found'})
    }
}

function add(req: Request, res: Response){
    const zona = repository.add(req.body.sanitizedZonaInput)
    res.status(201).send({message: 'Create successfully',data: zona})
}

function update(req: Request, res: Response){
    req.body.sanitizedZonaInput.cod_zona = parseInt(req.params.id);
    const zona = repository.update(req.body.sanitizedZonaInput)
    if(zona!== undefined){
        res.status(200).json({data:zona})
    }
    else{
        res.status(404).send({message: 'Not Resourse Found'})
    }
}


function remove(req: Request, res: Response){
    const zona = repository.remove({id: parseInt(req.params.id)})
    if(zona!== undefined){
        res.status(200).json({message:'Remove seccesfully',data:zona})
    }
    else{
        res.status(404).send({message: 'Not Resourse Found'})
    }
}

export {remove, update, add, sanitizeZonaImput, findAll, findOne}