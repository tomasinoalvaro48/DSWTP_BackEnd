import { Entity, ManyToMany, Property,Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'

@Entity()
export class Tipo_Anomalia extends BaseEntity {
  /*
  @Property({ nullable: false, unique: true })
  cod_anom!: number
  */

  @Property({ nullable: false })
  nombre_tipo_anomalia!: string

  @Property({ nullable: false })
  dificultad_tipo_anomalia!: number

  @ManyToMany(() => Pedido_Resolucion, (pedido_resolucion) => pedido_resolucion.tipo_anomalia)
  pedido_resolucion = new Collection<Pedido_Resolucion>(this)
}
