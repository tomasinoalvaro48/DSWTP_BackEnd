import { Zona } from "./zona.entity.js";
import { Repository } from "../shared/repository.js";

const zonas: Zona[] =[
    new Zona(1, 'centro', '2000'),
    new Zona(2, 'norte', '2000'),
    new Zona(3, 'sur', '2000')
]

export class localidadRepository implements Repository<Zona>{
    findAll(): Zona[] | undefined {
        return zonas
    }

    findOne(item: { id: string; }): Zona | undefined {
        return zonas.find((zona)=> zona.cod_zona === item.id)
    }
    

}