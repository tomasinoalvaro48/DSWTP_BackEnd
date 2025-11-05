import 'dotenv/config'
import { MikroORM } from '@mikro-orm/mongodb'
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter'

export const orm = await MikroORM.init({
  //entities: ['dist/**/*.entity.js'],
  //entitiesTs: ['src/**/*.entity.ts'],
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
  allowGlobalContext: true,
  schemaGenerator: {
    ignoreSchema: [],
  },
})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  await generator.updateSchema()

  // Ejecutar seeding después de actualizar el schema
  await seedDatabase()
}

// Importar la función de seeding
import { seedDatabase } from './seeder.js'
