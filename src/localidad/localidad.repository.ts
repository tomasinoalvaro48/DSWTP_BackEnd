import { Repository } from "../shared/repository.js";
import { Localidad } from "./localidad.entity.js";

const localidades: Localidad[] = [
    new Localidad('2000', 'Rosario'),
    new Localidad('3000','Santa Fe')
]

export class localidadRepository implements Repository<Localidad>{
    public findAll(): Localidad[] | undefined {
        return localidades        
    }

    public findOne(item: { id: string; }): Localidad | undefined {
        return localidades.find((localidad)=> localidad.codigoPostal === item.id)
    }

    public add(item: Localidad): Localidad | undefined {
        localidades.push(item)
        return item
    }

    public update(item: Localidad): Localidad | undefined {
        const localidadInx = localidades.findIndex((localidad)=> localidad.codigoPostal === item.codigoPostal)
        if(localidadInx!==-1){
            localidades[localidadInx] = {...localidades[localidadInx], ...item}
            return localidades[localidadInx]
        }        
    }

    public remove(item:  {id: string}): Localidad | undefined {
        const localidadInx = localidades.findIndex((localidad)=> localidad.codigoPostal === item.id)
        if(localidadInx!==-1){
            const localidadEliminada = localidades[localidadInx]
            localidades.splice(localidadInx, 1)
            return localidadEliminada
        }
    }
}