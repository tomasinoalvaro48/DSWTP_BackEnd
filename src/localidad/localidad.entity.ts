import { Entity, OneToMany, Property, Cascade, Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Zona } from './zona.entity.js'

@Entity()
export class Localidad extends BaseEntity {
  @Property({ nullable: false, unique: true })
  codigo_localidad!: string

  @Property({ nullable: false })
  nombre_localidad!: string

  @OneToMany(() => Zona, (zona) => zona.localidad, {
    nullable: true,
    orphanRemoval: true,
    cascade: [Cascade.ALL],
  })
  zonas = new Collection<Zona>(this)
}
