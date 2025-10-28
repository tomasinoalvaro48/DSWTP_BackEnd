import { orm } from './orm.js'
import { Localidad } from '../../localidad/localidad.entity.js'
import { Zona } from '../../localidad/zona.entity.js'
import { Usuario } from '../../usuario/usuario.entity.js'
import bcrypt from 'bcryptjs'
import { Denunciante } from '../../denunciante/denunciante.entity.js'
import { Tipo_Anomalia } from '../../tipo_anomalia/tipo_anomalia.entity.js'

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
  const localidad2 = em.create(Localidad, {
    nombre_localidad: 'Arroyo Seco',
    codigo_localidad: '2128',
  })
  const localidad3 = em.create(Localidad, {
    nombre_localidad: 'Santa Fe',
    codigo_localidad: '3000',
  })

  // Crear Zona
  const zona = em.create(Zona, {
    nombre_zona: 'Centro',
    localidad: localidad,
  })
  em.create(Zona, {
    nombre_zona: 'Norte',
    localidad: localidad,
  })
  em.create(Zona, {
    nombre_zona: 'Sur',
    localidad: localidad,
  })
  em.create(Zona, {
    nombre_zona: 'Arriba',
    localidad: localidad2,
  })
  em.create(Zona, {
    nombre_zona: 'Abajo',
    localidad: localidad2,
  })
  em.create(Zona, {
    nombre_zona: 'Acceso',
    localidad: localidad3,
  })

  // Crear Usuarios
  const hashPsw1 = await bcrypt.hash('123456', 10)
  const hashPsw2 = await bcrypt.hash('123456', 10)
  const hashPsw3 = await bcrypt.hash('123456', 10)
  em.create(Usuario, {
    nombre_usuario: 'operador',
    email_usuario: 'o@o',
    password_usuario: hashPsw1,
    tipo_usuario: 'operador',
    nivel_cazador: 10,
    estado_aprobacion: 'aprobado',
    zona: zona,
  })
  em.create(Usuario, {
    nombre_usuario: 'Peter Venkman',
    email_usuario: 'c@c',
    password_usuario: hashPsw2,
    tipo_usuario: 'cazador',
    nivel_cazador: 10,
    estado_aprobacion: 'aprobado',
    zona: zona,
  })

  // Crear Denunciante
  em.create(Denunciante, {
    nombre_apellido_denunciante: 'Pepe Gonzalez',
    email_denunciante: 'd@d',
    telefono_denunciante: '341-123456',
    password_denunciante: hashPsw3,
  })

  // Crear Tipo_Anomalia
  em.create(Tipo_Anomalia, {
    nombre_tipo_anomalia: 'Gollum',
    dificultad_tipo_anomalia: 1,
  })
  em.create(Tipo_Anomalia, {
    nombre_tipo_anomalia: 'Dementor',
    dificultad_tipo_anomalia: 3,
  })
  em.create(Tipo_Anomalia, {
    nombre_tipo_anomalia: 'Library Ghost',
    dificultad_tipo_anomalia: 2,
  })
  em.create(Tipo_Anomalia, {
    nombre_tipo_anomalia: 'Basilisk',
    dificultad_tipo_anomalia: 3,
  })

  await em.flush()

  console.log('Datos iniciales creados exitosamente')
}
