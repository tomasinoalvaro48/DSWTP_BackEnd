import { Repository } from '../shared/repository.js'
import { Denunciante } from './denunciante.entity.js'

const denunciantes = [
  new Denunciante(
    123456789,
    'Pepito',
    3415123456,
    'Zeballos 1200'
  ),
]

export class DenuncianteRepository implements Repository<Denunciante> {
  public findAll(): Denunciante[] | undefined {
    return denunciantes
  }

  public findOne(item: { id: number }): Denunciante | undefined {
    return denunciantes.find((denunciante) => denunciante.cod_den === item.id)
  }

  public add(item: Denunciante): Denunciante | undefined {
    denunciantes.push(item)
    return item
  }

  public update(item: Denunciante): Denunciante | undefined {
    const denuncianteIdx = denunciantes.findIndex((denunciante) => denunciante.cod_den === item.cod_den)

    if (denuncianteIdx !== -1) {
      denunciantes[denuncianteIdx] = { ...denunciantes[denuncianteIdx], ...item }
    }
    return denunciantes[denuncianteIdx]
  }

  public remove(item: { id: number }): Denunciante | undefined {
    const denuncianteIdx = denunciantes.findIndex((denunciante) => denunciante.cod_den === item.id)

    if (denuncianteIdx !== -1) {
      const deletedDenunciantes = denunciantes[denuncianteIdx]
      denunciantes.splice(denuncianteIdx, 1)
      return deletedDenunciantes
    }
  }
}