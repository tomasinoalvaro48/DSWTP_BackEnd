import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'
import { Pedido_Resolucion } from './pedido_resolucion.entity.js'

@Entity()
export class Anomalia extends BaseEntity {
  @Property({ nullable: false, onCreate: () => 'inconcluso' })
  resultado_anomalia!: string

  @ManyToOne(() => Tipo_Anomalia, { nullable: false })
  tipo_anomalia!: Rel<Tipo_Anomalia>

  @ManyToOne(() => Pedido_Resolucion, { nullable: false })
  pedido_resolucion!: Rel<Pedido_Resolucion>
}
