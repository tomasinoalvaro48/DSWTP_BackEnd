import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Tipo_Anomalia extends BaseEntity {
  @Property({ nullable: false, unique: true, autoincrement: true })
  cod_anom!: number

  @Property({ nullable: false })
  nombre_anom!: string

  @Property({ nullable: false })
  dif_anom!: number
}
