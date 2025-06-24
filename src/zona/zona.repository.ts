import { Zona } from "./zona.entity.js";
import { Repository } from "../shared/repository.js";

const zonas: Zona[] =[
    new Zona(1, 'centro', '2000'),
    new Zona(2, 'norte', '2000'),
    new Zona(3, 'sur', '2000')
]

export class zonaRepository implements Repository<Zona>{
    findAll(): Zona[] | undefined {
        return zonas
    }

    findOne(item: { id: number; }): Zona | undefined {
        return zonas.find((zona)=> zona.cod_zona === item.id)
    }

    add(item: Zona): Zona | undefined {
        zonas.push(item)        
        return item
    }

    update(item: Zona): Zona | undefined {
        const zonaInx = zonas.findIndex((zona)=> zona.cod_zona === item.cod_zona)
        if(zonaInx !== -1){
            zonas[zonaInx] = {...zonas[zonaInx], ...item}
            return zonas[zonaInx]
        }
    }

    remove(item: { id: number; }): Zona | undefined {
        const zonaInx = zonas.findIndex((zona)=> zona.cod_zona === item.id)
        if(zonaInx !== -1){
            const zonaEliminar =  zonas[zonaInx]
            zonas.splice(zonaInx,1)
            return zonaEliminar
        }
    }
}