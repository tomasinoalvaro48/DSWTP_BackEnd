import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'


@Entity()
export class Denunciante extends BaseEntity {
  @Property({ nullable: false, unique: true })
  cod_den!: number

  @Property({ nullable: false })
  nombre_den!: string

  @Property({ nullable: false })
  telefono!: string

  @Property({ nullable: false })
  direccion_den!: string
}