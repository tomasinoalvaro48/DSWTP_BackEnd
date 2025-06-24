import { Request, Response, NextFunction } from "express";
import { localidadRepository } from "./localidad.repository.js";

const repository = new localidadRepository()

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




function findAll(req: Request, res: Response){
    res.json({data: repository.findAll()})
}

function findOne(req: Request, res: Response){
    const localidad = repository.findOne({id: req.params.codigoPostal})
    if(localidad){
        res.json({data: localidad})    
    }
    else{
        res.status(404).send({mesagge: 'Resourse Not Found'})
    }
    
}

function add(req: Request, res: Response){
    const localidad = repository.add(req.body.sanatizeLocalidadInput)
    res.status(201).send({message: 'Localidad create succesfully', data: localidad})
}

function update(req:Request, res:Response){
    req.body.sanatizeLocalidadInput.codigoPostal = req.params.codigoPostal
    const localidad = repository.update(req.body.sanatizeLocalidadInput)
    if(!localidad){
        res.status(404).send({message: 'Resourse Not Found'})
    }
    else{
        
        res.status(201).send({message: 'Localidad update succesfully', data: localidad})
    }
}

function remove(req: Request, res: Response){
    const localidad = repository.remove({id:req.params.codigoPostal})
    if(!localidad){
        res.status(404).send({message: 'Resourse Not Found'})
    }
    else{
        res.status(200).send({message: 'Localidad remove succesfully', data: localidad})
    }
}

export{findAll, sanatizeLocalidadInput, findOne, add, remove, update}