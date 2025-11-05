import 'dotenv/config'
import { MikroORM } from '@mikro-orm/mongodb'
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter'

let ormInstance: MikroORM | null = null

export const orm = async () => {
  if (ormInstance) {
    return ormInstance
  }

  ormInstance = await MikroORM.init({
    entities: [
      'dist/**/localidad.entity.js',
      'dist/**/zona.entity.js',
      'dist/**/denunciante.entity.js',
      'dist/**/tipo_anomalia.entity.js',
      'dist/**/usuario.entity.js',
      'dist/**/pedido_resolucion.entity.js',
      'dist/**/anomalia.entity.js',
      'dist/**/pedido_agregacion.entity.js',
      'dist/**/evidencia.entity.js',
      'dist/**/inspeccion.entity.js',
    ],
    entitiesTs: [
      'src/**/zona.entity.ts',
      'src/**/zona.entity.ts',
      'src/**/denunciante.entity.ts',
      'src/**/tipo_anomalia.entity.ts',
      'src/**/usuario.entity.ts',
      'src/**/pedido_resolucion.entity.ts',
      'src/**/anomalia.entity.ts',
      'src/**/pedido_agregacion.entity.ts',
      'src/**/evidencia.entity.ts',
      'src/**/inspeccion.entity.ts',
    ],
    dbName: process.env.DB_NAME,
    clientUrl: process.env.DATABASE_URL,
    highlighter: new MongoHighlighter(),
    debug: process.env.NODE_ENV !== 'production',
    schemaGenerator: {
      ignoreSchema: [],
    },
  })

  return ormInstance
}

export const syncSchema = async () => {
  const ormInstance = await orm()
  const generator = ormInstance.getSchemaGenerator()
  await generator.updateSchema()

  // Ejecutar seeding después de actualizar el schema
  await seedDatabase()
}

// Importar la función de seeding
import { seedDatabase } from './seeder.js'
