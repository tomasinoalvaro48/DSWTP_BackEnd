import {
  Entity,
  OneToMany,
  Property,
  Cascade,
  Collection,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Zona } from './zona.entity.js'

@Entity()
export class Localidad extends BaseEntity {
  @Property({ nullable: false, unique: true })
  codigo!: number

  @Property({ nullable: false})
  nombre!: string
    
  @OneToMany(() => Zona, (zona) => zona.localidad, {
    cascade: [Cascade.ALL], nullable :true
  })
  zonas = new Collection<Zona>(this)
}