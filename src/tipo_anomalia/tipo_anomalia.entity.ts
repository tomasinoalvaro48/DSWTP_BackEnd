import { Entity, ManyToMany, Property,Collection, OneToMany } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'
import { Anomalia } from '../pedido_resolucion/anomalia.entity.js'

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

  @OneToMany(() => Anomalia, (anomalia) => anomalia.tipo_anomalia)
  anomalias = new Collection<Anomalia>(this)

}
