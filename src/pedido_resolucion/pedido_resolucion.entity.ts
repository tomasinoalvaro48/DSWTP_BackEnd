import { Entity, OneToMany, Property, Cascade, Collection, ManyToOne, Rel, ManyToMany } from '@mikro-orm/core'

import { Zona } from '../localidad/zona.entity.js'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Anomalia } from './anomalia.entity.js'

@Entity()
export class Pedido_Resolucion extends BaseEntity {
  @Property({ nullable: false, onCreate: () => new Date() })
  fecha_pedido_resolucion!: Date

  @Property({ nullable: false })
  direccion_pedido_resolucion!: string

  @Property({ nullable: true })
  descripcion_pedido_resolucion!: string

  @Property({ nullable: false, onCreate: () => 'libre' })
  estado_pedido_resolucion!: string

  @Property({ nullable: true })
  comentario_pedido_resolucion!: string

  @Property({ nullable: true })
  dificultad_pedido_resolucion!: number

  @ManyToOne(() => Zona, { nullable: false })
  zona!: Rel<Zona>

  @ManyToOne(() => Denunciante, { nullable: false })
  denunciante!: Rel<Denunciante>

  @ManyToOne(() => Usuario, { nullable: true })
  cazador!: Rel<Usuario>

  @OneToMany(() => Anomalia, (anomalia) => anomalia.pedido_resolucion, {
    eager: true,
    nullable: true,
    orphanRemoval: true,
    cascade: [Cascade.ALL],
  })
  anomalias = new Collection<Anomalia>(this)
}
