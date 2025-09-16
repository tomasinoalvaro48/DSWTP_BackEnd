import { Cascade, OneToMany, Collection } from '@mikro-orm/core'

import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'

@Entity()
export class Denunciante extends BaseEntity {
  /*
  @Property({ nullable: false, unique: true })
  cod_den!: number*/

  @Property({ nullable: false })
  nombre_apellido_denunciante!: string

  @Property({ nullable: false })
  telefono_denunciante!: string

  @Property({ nullable: false, unique: true })
  email_denunciante!: string

  @Property({ nullable: false })
  password_denunciante!: string

  @OneToMany(() => Pedido_Resolucion, (pedido_resolucion) => pedido_resolucion.denunciante, {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  pedidos_resolucion = new Collection<Pedido_Resolucion>(this)
}
