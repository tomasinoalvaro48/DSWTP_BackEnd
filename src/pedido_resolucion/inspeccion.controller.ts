import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Pedido_Resolucion } from './pedido_resolucion.entity.js'
import { Inspeccion } from './inspeccion.entity.js'
import { ObjectId } from 'mongodb'


const em = orm.em

function sanitizeInspeccionInput(
    req: Request, 
    res: Response, 
    next :NextFunction
){

  const idPedidoResolucion = new ObjectId(req.body.pedido_resolucion)
  
    req.body.sanitizeInspeccionInput = {
        comentario_inspeccion: req.body.comentario_inspeccion,
        pedido_resolucion: em.getReference(Pedido_Resolucion, idPedidoResolucion)
        
    }

    Object.keys(req.body.sanitizeInspeccionInput).forEach((key)=>{
        if(req.body.sanitizeInspeccionInput[key]===undefined){
            delete req.body.sanitizeInspeccionInput[key]
        }
    }) 
    next()
}

async function findAll(req: Request, res: Response) {
  try {
    const zonas = await em.find(Inspeccion, {}, { populate: ['pedido_resolucion'] })
    res.status(200).json({ message: 'find all zonas', data: zonas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function addInspeccion (req: Request, res: Response) {
  try {

    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')
    console.log('DDJSJDS')


    console.log('DDJSJDS')

    req.body.sanitizeInspeccionInput.numero_inspeccion = await nroProximaInspeccion(req.body.sanitizeInspeccionInput.pedido_resolucion);

    const newInspeccion = em.create(Inspeccion, req.body.sanitizeInspeccionInput)
    await em.flush()
    res
      .status(200)
      .json({ message: 'Inspección agregada', data: newInspeccion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function nroProximaInspeccion(pedido_resolucion : ObjectId) {
  try{
    const ultima = await em.findOneOrFail(Inspeccion, {pedido_resolucion}, { orderBy: { numero_inspeccion: 'desc' } })
    return ((ultima.numero_inspeccion?.valueOf() ?? 0) + 1)
    }
  catch{
    return 1
  }

  }


async function remove(req: Request, res: Response){
    try{
        const id = new ObjectId(req.params.id)
        const inspeccionToDelete = await em.findOneOrFail(Inspeccion, id, { })
        
        await em.removeAndFlush(inspeccionToDelete)
        res
           .status(200)
           .json({message: 'Remove inspeccion', data: inspeccionToDelete})
    }catch(error: any){
        res
        .status(500).json({message: error.message})
    }
}

export {sanitizeInspeccionInput, addInspeccion, findAll, remove }