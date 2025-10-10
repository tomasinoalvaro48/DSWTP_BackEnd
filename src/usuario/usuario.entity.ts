import {
  Entity,
  OneToMany,
  Property,
  Cascade,
  Collection,
  Rel,
  ManyToOne,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Zona } from '../localidad/zona.entity.js';

@Entity()
export class Usuario extends BaseEntity {
  /*
  @Property({ nullable: false, unique: true })
  codigo!: Number
*/
  @Property({ nullable: false })
  nombre_usuario!: string;

  @Property({ nullable: false, unique: true })
  email_usuario!: string;

  @Property({ nullable: false })
  password_usuario!: string;

  @Property({ nullable: false, onCreate: () => 'cazador' })
  tipo_usuario!: string;

  @Property({ nullable: true, onCreate: () => 0 })
  nivel_cazador!: number;

  @ManyToOne(() => Zona, { nullable: false })
  zona!: Rel<Zona>;
}
