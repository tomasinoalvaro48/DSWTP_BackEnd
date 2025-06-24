import { Tipo_Anomalia } from './tipo_anomalia.entity.js'
import { Repository } from '../shared/repository.js'

const tipos_anomalia: Tipo_Anomalia[] = [
  new Tipo_Anomalia(1, 'Casper', 5),
  new Tipo_Anomalia(2, 'Vuelan Objetos', 2),
]

export class Tipo_AnomaliaRepository implements Repository<Tipo_Anomalia> {
  findAll(): Tipo_Anomalia[] | undefined {
    return tipos_anomalia
  }

  findOne(item: { id: number }): Tipo_Anomalia | undefined {
    return tipos_anomalia.find((tipos_anomalia) => tipos_anomalia.cod_anom === item.id)
  }

  add(item: Tipo_Anomalia): Tipo_Anomalia | undefined {
    tipos_anomalia.push(item)
    return item
  }

  update(item: Tipo_Anomalia): Tipo_Anomalia | undefined {
    const tipoIndx = tipos_anomalia.findIndex((tipo) => tipo.cod_anom === item.cod_anom)
    if (tipoIndx !== -1) tipos_anomalia[tipoIndx] = { ...tipos_anomalia[tipoIndx], ...item }
    return tipos_anomalia[tipoIndx]
  }

  remove(item: { id: number }): Tipo_Anomalia | undefined {
    const tipoIndx = tipos_anomalia.findIndex((tipo) => tipo.cod_anom === item.id)
    if (tipoIndx !== -1) {
      const deletedTipo = tipos_anomalia[tipoIndx]
      tipos_anomalia.splice(tipoIndx, 1)
      return deletedTipo
    }
  }
}
