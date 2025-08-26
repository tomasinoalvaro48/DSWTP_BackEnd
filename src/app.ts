import express from 'express'
import { localidadRouter } from './localidad/localidad.routes.js'
import { zonaRouter } from './localidad/zona.routes.js'
import { denuncianteRouter } from './denunciante/denunciante.routes.js'
import { tipoRouter } from './tipo_anomalia/tipo_anomalia.routes.js'
import 'reflect-metadata'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'
import { usuarioRouter } from './usuario/usuario.routes.js'
import { pedidos_resolucion } from './pedido_resolucion/pedido_resolucion.routes.js'
import cors from 'cors'

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

app.use('/api/localidad', localidadRouter)
app.use('/api/tipo_anomalia', tipoRouter)
app.use('/api/zona', zonaRouter)
app.use('/api/denunciantes', denuncianteRouter)
app.use('/api/usuario', usuarioRouter)
app.use('/api/pedido_resolucion', pedidos_resolucion)

app.use((_, res) => {
  res.status(404).send({ mesagge: 'Resourse not found' })
})

await syncSchema()

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
