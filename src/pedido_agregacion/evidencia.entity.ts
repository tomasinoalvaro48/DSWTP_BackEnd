import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Pedido_Agregacion } from './pedido_agregacion.entity.js'

@Entity()
export class Evidencia extends BaseEntity {
  @Property({ nullable: true })
  url_evidencia!: string

  @Property({ nullable: true })
  archivo_evidencia!: string

  @ManyToOne(( )=> Pedido_Agregacion, { nullable: false })
  pedido_agregacion!: Rel<Pedido_Agregacion>
}