import express from 'express'
import { localidadRouter } from './localidad/localidad.routes.js';

const app = express();

app.use(express.json())

app.use('/api/localidad',localidadRouter)


app.use((_, res)=>{
    res.status(404).send({mesagge: 'Resourse not found'})
})

app.listen(4000,() => {
    console.log('Server is running on https://localhost:4000')
})