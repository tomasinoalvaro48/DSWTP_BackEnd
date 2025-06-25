import express from 'express'
import { localidadRouter } from './localidad/localidad.routes.js'
import { tipoRouter } from './tipo_anomalia/tipo_anomalia.routes.js'
import { denuncianteRouter } from './denunciante/denunciante.routes.js'

const app = express()

app.use(express.json())

app.use('/api/localidad', localidadRouter)
app.use('/api/tipo_anomalia', tipoRouter)
app.use('/api/denunciantes', denuncianteRouter)

app.use((_, res) => {
  res.status(404).send({ mesagge: 'Resource not found' })
})

app.listen(3000, () => {
  console.log('Server is running on https://localhost:3000')
})
