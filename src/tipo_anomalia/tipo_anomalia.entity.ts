import { Entity, Property, Collection, OneToMany, OneToOne } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Pedido_Agregacion } from '../pedido_agregacion/pedido_agregacion.entity.js'
import { Anomalia } from '../pedido_resolucion/anomalia.entity.js'

@Entity()
export class Tipo_Anomalia extends BaseEntity {
  @Property({ nullable: false })
  nombre_tipo_anomalia!: string

  @Property({ nullable: false })
  dificultad_tipo_anomalia!: number

  @OneToMany(() => Anomalia, (anomalia) => anomalia.tipo_anomalia, { nullable: true })
  anomalias = new Collection<Anomalia>(this)

  @OneToOne(() => Pedido_Agregacion, (pedido) => pedido.tipo_anomalia, { nullable: true })
  pedido_agregacion?: Pedido_Agregacion | null
}