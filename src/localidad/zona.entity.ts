
import {
  Entity,
  OneToMany,
  Property,
  Cascade,
  Collection,
  ManyToOne,
  Rel,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Localidad } from './localidad.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Pedido_Resolucion } from '../pedido_resolucion/pedido_resolucion.entity.js'

@Entity()
export class Zona extends BaseEntity {
  /*
  @Property({ nullable: false, unique: true })
  codigo!: Number
  */

  @Property({ nullable: false})
  nombre_zona!: string
    
  @ManyToOne(() => Localidad, { nullable: false })
  localidad!: Rel<Localidad>

  
  @OneToMany(() => Usuario, (usuario) => usuario.zona,{
    cascade: [Cascade.ALL], 
    nullable:true
  })
  usuarios = new Collection<Usuario>(this)
 
  
  @OneToMany(() => Pedido_Resolucion, (pedido_resolucion)=>pedido_resolucion.zona,{
    cascade: [Cascade.ALL]
  })
  pedidos_resolucion = new Collection<Pedido_Resolucion>(this)
  
}