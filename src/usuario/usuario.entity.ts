import { Entity, Property, Rel, ManyToOne } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Zona } from '../localidad/zona.entity.js'

@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false })
  nombre_usuario!: string

  @Property({ nullable: false, unique: true })
  email_usuario!: string

  @Property({ nullable: false })
  password_usuario!: string

  @Property({ nullable: false, onCreate: () => 'cazador' })
  tipo_usuario!: string // 'operador' | 'cazador'

  @Property({ nullable: true, onCreate: () => 1 })
  nivel_cazador!: number

  @Property({ nullable: true, onCreate: () => 'pendiente' })
  estado_aprobacion!: string // 'pendiente' | 'aprobado' | 'rechazado'

  @ManyToOne(() => Zona, { nullable: false })
  zona!: Rel<Zona>
}
