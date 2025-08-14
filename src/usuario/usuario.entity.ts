import {
  Entity,
  OneToMany,
  Property,
  Cascade,
  Collection,
  Rel,
  ManyToOne
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Zona } from '../localidad/zona.entity.js'

@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false, unique: true })
  codigo!: Number

  @Property({ nullable: false})
  nombre!: string

  @Property({ nullable: false})
  mail!: string

  @Property({ nullable: false})
  password!: string

  @Property({ nullable: false})
  tipo!: string
  
  @ManyToOne(() => Zona, { nullable: false })
  zona!: Rel<Zona>
}