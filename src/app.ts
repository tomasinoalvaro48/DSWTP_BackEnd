import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'
import { localidadRouter } from './localidad/localidad.routes.js'
import { zonaRouter } from './localidad/zona.routes.js'
import { denuncianteRouter } from './denunciante/denunciante.routes.js'
import { tipoRouter } from './tipo_anomalia/tipo_anomalia.routes.js'
import { usuarioRouter } from './usuario/usuario.routes.js'
import { pedidos_resolucion_router } from './pedido_resolucion/pedido_resolucion.routes.js'
import { anomaliaRouter } from './pedido_resolucion/anomalia.routes.js'
// import cookieParser from 'cookie-parser'
import { authRouter } from './auth/auth.routes.js'
import { pedidos_agregacion_router } from './pedido_agregacion/pedido_agregacion.routes.js'
import { inspeccionRouter } from './pedido_resolucion/inspeccion.routes.js'
import { seedDatabase } from './shared/db/seeder.js'
import path from 'path'

// Crear la aplicación de Express
const app = express()

// Middlewares:
// Habilitar CORS (intercambio de recursos de origen cruzado)
app.use(cors())
// app.use(cookieParser())
// Parsear el cuerpo de las solicitudes como JSON
app.use(express.json())
// Manejar el contexto de la solicitud para MikroORM
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// Rutas
app.use('/api/auth', authRouter)
app.use('/api/localidad', localidadRouter)
app.use('/api/tipo_anomalia', tipoRouter)
app.use('/api/zona', zonaRouter)
app.use('/api/denunciantes', denuncianteRouter)
app.use('/api/usuario', usuarioRouter)
app.use('/api/pedido_resolucion', pedidos_resolucion_router)
app.use('/api/anomalia', anomaliaRouter)
app.use('/api/pedido_agregacion', pedidos_agregacion_router)
app.use('/api/inspeccion', inspeccionRouter)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Rutas no encontradas
app.use((_, res) => {
  res.status(404).send({ mesagge: 'Resourse not found' })
})

// Esquema de la base de datos
await syncSchema()

// Ejecutar seeding solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  await seedDatabase()
}

// Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}`)
})
