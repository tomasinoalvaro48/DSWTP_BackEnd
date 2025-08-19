

import {
  Entity,
  OneToMany,
  Property,
  Cascade,
  Collection,
  ManyToOne,
  Rel,
  ManyToMany,
} from '@mikro-orm/core'

import { Zona } from '../localidad/zona.entity.js'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Denunciante } from '../denunciante/denunciante.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Anomalia } from './anomalia.entity.js'

@Entity()
export class Pedido_Resolucion extends BaseEntity {
  @Property({ nullable: false, onCreate: () => new Date()})
  fecha!: Date

  @Property({ nullable: false })
  direccion!: string

  @Property({ nullable: true })
  descripcion!: string

  @Property({ nullable: false, onCreate: () => 'solicitado'})
  estado!: string

  @Property({ nullable: true})
  comentario!: string

  @Property({nullable: false, onCreate: () => 'inconcluso'})
  resultado!: string

  @Property({nullable: true})  //VERRRRRRRRRRRRRRRRRRRRRRRRRRR
  dificultad!: string          //VERRRRRRRRRRRRRRRRRRRRRRRRRRR

  @ManyToOne(( )=> Zona,{nullable:false })
  zona!: Rel<Zona>

  @ManyToOne(( )=> Denunciante,{nullable:false })
  denunciante!: Rel<Denunciante>

  @ManyToOne(()=> Usuario, {nullable: true})
  cazador!: Rel<Usuario> 

  @OneToMany(() => Anomalia, (anomalia) => anomalia.pedido_resolucion)
  anomalias = new Collection<Anomalia>(this)
}
