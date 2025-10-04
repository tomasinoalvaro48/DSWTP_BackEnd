import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Pedido_Resolucion } from './pedido_resolucion.entity.js'

@Entity()
export class Inspeccion extends BaseEntity {
  @Property({nullable: false})
  numero_inspeccion!: number    //Numero de inspeccion dentro del pedido

  @Property({ nullable: true })
  comentario_inspeccion!: string

  @Property({ nullable: false, onCreate: () => new Date() })
  fecha_inspeccion!: Date

  @ManyToOne(() => Pedido_Resolucion, { nullable: false })
  pedido_resolucion!: Rel<Pedido_Resolucion>
}
