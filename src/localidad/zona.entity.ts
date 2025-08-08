
import {
  Entity,
  OneToMany,
  Property,
  Cascade,
  Collection,
  ManyToOne,
  Rel,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Localidad } from './localidad.entity.js'

@Entity()
export class Zona extends BaseEntity {
  @Property({ nullable: false, unique: true })
  codigo!: Number

  @Property({ nullable: false})
  nombre!: string
    
    @ManyToOne(() => Localidad, { nullable: false })
  Localidad!: Rel<Localidad>

 // zonas = new Collection<Zona>(this)
}