import supertest from 'supertest'
import { app } from '../app.js'

describe('API Integration Tests', () => {
  let request: any
  let token: string
  let anomId: string

  beforeAll(async () => {
    request = supertest(app)
  })

  describe('Login endpoint (POST)', () => {
    test('POST /api/auth/login - debería devolver 200 y el token para el resto de tests', async () => {
      const response = await request.post('/api/auth/login').send({ email: 'o@o', password: '123456' })

      expect(response.status).toBe(200)
      expect(response.body.token).toBeDefined()
      token = response.body.token
    })
  })

  describe('Tipo Anomalia Endpoints (CRUD)', () => {
    test('GET /api/tipo_anomalia - debería devolver 200 y la lista de tipos de anomalías', async () => {
      const response = await request.get('/api/tipo_anomalia').set('authorization', `Bearer ${token}`).expect(200)

      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
      expect(response.body.data).toBeDefined()
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    test('GET /api/tipo_anomalia/:id - debería devolver 500 porque no existe id', async () => {
      const nonExistentId = 'pepepepepepepepepepepepepe'
      const response = await request.get(`/api/tipo_anomalia/${nonExistentId}`).set('authorization', `Bearer ${token}`)
      expect(response.status).toBe(500) // En nuestro sistema devuelve 500 si no lo encuentra, no 404
    })

    test('GET /api/tipo_anomalia - debería devolver 400 por formato de nombre inválido', async () => {
      const tipoInvalido = { nombre_tipo_anomalia: 'nomb re_invalido-123', dificultad_tipo_anomalia: 1 }
      const response = await request.post('/api/tipo_anomalia').set('authorization', `Bearer ${token}`).send(tipoInvalido)
      expect(response.status).toBe(400)
    })

    test('GET /api/tipo_anomalia - debería devolver 400 por formato de dificultad inválido', async () => {
      const tipoInvalido = { nombre_tipo_anomalia: 'nombre valido', dificultad_tipo_anomalia: 5 }
      const response = await request.post('/api/tipo_anomalia').set('authorization', `Bearer ${token}`).send(tipoInvalido)
      expect(response.status).toBe(400)
    })

    test('POST /api/tipo_anomalia - debería crear y devolver un nuevo tipo_anomalia, si no está duplicado el nombre', async () => {
      const newTipo = {
        nombre_tipo_anomalia: 'Michelín Gigante',
        dificultad_tipo_anomalia: 3,
      }

      const response = await request.post('/api/tipo_anomalia').set('authorization', `Bearer ${token}`).send(newTipo).expect(201)

      expect(response.body.data).toBeDefined()
      expect(response.body.data.nombre_tipo_anomalia).toBe(newTipo.nombre_tipo_anomalia)
      expect(response.body.data.dificultad_tipo_anomalia).toBe(newTipo.dificultad_tipo_anomalia)
      anomId = response.body.data.id
    })

    test('POST /api/tipo_anomalia - debería devolver 400 cuando falta el nombre', async () => {
      const invalidTipo = {
        dificultad_tipo_anomalia: 3,
      }

      await request.post('/api/tipo_anomalia').set('authorization', `Bearer ${token}`).send(invalidTipo).expect(400)
    })

    test('POST /api/tipo_anomalia - debería devolver 500 cuando falta la dificultad', async () => {
      const invalidTipo = {
        nombre_tipo_anomalia: 'Test Anomalia',
      }

      await request.post('/api/tipo_anomalia').set('authorization', `Bearer ${token}`).send(invalidTipo).expect(500)
    })

    test('PUT /api/tipo_anomalia/:id - debería actualizar y devolver el tipo de anomalia existente', async () => {
      const updatedTipo = {
        nombre_tipo_anomalia: 'Michelín Actualizado',
        dificultad_tipo_anomalia: 2,
      }
      const response = await request.put(`/api/tipo_anomalia/${anomId}`).set('authorization', `Bearer ${token}`).send(updatedTipo)

      expect(response.body.data).toBeDefined()
      expect(response.body.data.nombre_tipo_anomalia).toBe(updatedTipo.nombre_tipo_anomalia)
      expect(response.body.data.dificultad_tipo_anomalia).toBe(updatedTipo.dificultad_tipo_anomalia)
      expect(response.status).toBe(200)
    })

    test('DELETE /api/tipo_anomalia/:id - debería devolver 200 al eliminar un tipo de anomalia existente que no esté en un pedido', async () => {
      const response = await request.delete(`/api/tipo_anomalia/${anomId}`).set('authorization', `Bearer ${token}`)
      expect(response.status).toBe(200)
    })
  })
})
