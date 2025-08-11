import express from 'express'
import { localidadRouter } from './localidad/localidad.routes.js'
import { zonaRouter } from './localidad/zona.routes.js'
import { denuncianteRouter } from './denunciante/denunciante.routes.js'
import 'reflect-metadata'
import { orm,syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'

const app = express()
app.use(express.json())

app.use((req, res, next)=> {
  RequestContext.create(orm.em,next)
} )  

app.use('/api/localidad', localidadRouter)
//app.use('/api/tipo_anomalia', tipoRouter)
app.use('/api/zona', zonaRouter)
app.use('/api/denunciantes', denuncianteRouter)

app.use((_, res) => {
  res.status(404).send({ mesagge: 'Resourse not found' })
})

await syncSchema()

app.listen(3000, () => {
  console.log('Server is running on https://localhost:3000')
})