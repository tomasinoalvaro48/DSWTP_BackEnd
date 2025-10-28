import { orm } from './orm.js'
import { Localidad } from '../../localidad/localidad.entity.js'
import { Zona } from '../../localidad/zona.entity.js'
import { Usuario } from '../../usuario/usuario.entity.js'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  const em = orm.em.fork()

  // Verificar si ya existen datos
  const localidadCount = await em.count(Localidad)

  if (localidadCount > 0) {
    console.log('La base de datos ya contiene datos iniciales')
    return
  }

  // Crear Localidad
  const localidad = em.create(Localidad, {
    nombre_localidad: 'Rosario',
    codigo_localidad: '2000',
  })

  // Crear Zona
  const zona = em.create(Zona, {
    nombre_zona: 'Zona Centro',
    localidad: localidad,
  })

  const hashPsw = await bcrypt.hash('operador', 10)

  const usuario = em.create(Usuario, {
    nombre_usuario: 'operador',
    email_usuario: 'operador@operador',
    password_usuario: hashPsw,
    tipo_usuario: 'operador',
    nivel_cazador: 10,
    estado_aprobacion: 'aprobado',
    zona: zona,
  })

  await em.flush()

  console.log('Datos iniciales creados exitosamente')
}
