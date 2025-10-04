import { Entity, OneToMany, Property, Cascade, Collection, ManyToOne, Rel, OneToOne } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Evidencia } from './evidencia.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js'

@Entity()
export class Pedido_Agregacion extends BaseEntity {
  @Property({ nullable: false })
  descripcion_pedido_agregacion!: string

  @Property({ nullable: false })
  dificultad_pedido_agregacion!: number

  @Property({ nullable: false, onCreate: () => 'pendiente'})
  estado_pedido_agregacion!: string

  @ManyToOne(()=> Usuario, {nullable: true})
  cazador?: Rel<Usuario>

  @OneToMany(() => Evidencia, (evidencia) => evidencia.pedido_agregacion, {
    eager: true,
    nullable: true,
    orphanRemoval: true,
    cascade: [Cascade.ALL]
  })
  evidencias = new Collection<Evidencia>(this)

  @OneToOne(()=> Tipo_Anomalia, {nullable: true})
  tipo_anomalia?: Rel<Tipo_Anomalia>
}