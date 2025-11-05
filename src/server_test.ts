import express from 'express'
import cors from 'cors'
import { MikroORM } from '@mikro-orm/mongodb'
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter'
import { tipoRouter } from './tipo_anomalia/tipo_anomalia.routes.js'
import { authRouter } from './auth/auth.routes.js'

async function createServer() {
  const app = express()

  app.use(cors())

  app.use(express.json())

  const orm = await MikroORM.init({
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

  // Configurar el ORM en el contexto de la aplicación
  app.locals.orm = orm

  // Rutas
  app.use('/api/auth', authRouter)
  app.use('/api/tipo_anomalia', tipoRouter)

  // Rutas no encontradas
  app.use((_, res) => {
    res.status(404).send({ mesagge: 'Resourse not found' })
  })
  return app
}
export { createServer }
