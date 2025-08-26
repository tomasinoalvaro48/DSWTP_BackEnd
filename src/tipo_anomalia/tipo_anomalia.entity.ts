import { Entity, ManyToMany, Property, Collection, OneToMany } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Tipo_Anomalia extends BaseEntity {
  @Property({ nullable: false })
  nombre_tipo_anomalia!: string

  @Property({ nullable: false })
  dificultad_tipo_anomalia!: number
}
