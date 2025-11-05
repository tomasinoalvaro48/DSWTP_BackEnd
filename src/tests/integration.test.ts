import supertest from 'supertest'
import { createServer } from '../server_test.js'

describe('API Integration Tests', () => {
  let app: any
  let request: any

  beforeAll(async () => {
    app = await createServer()
    request = supertest(app)
  })

  describe('Tipo Anomalia Endpoint', () => {
    test('GET /api/tipo_anomalia - debería devolver 200 y la lista de tipos de anomalías', async () => {
      const response = await request.get('/api/tipo_anomalia').expect(200)

      expect(response.body.status).toBe(200)
      expect(response.body).toBeDefined()
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    test('GET /api/tipo_anomalia/:id - should return 404 for non-existent id', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'
      await request.get(`/api/tipo_anomalia/${nonExistentId}`).expect(404)
    })

    test('GET /api/tipo_anomalia/:id - should return 400 for invalid id format', async () => {
      const invalidId = 'invalid-id-123'
      await request.get(`/api/tipo_anomalia/${invalidId}`).expect(400)
    })
  })

  describe('POST /api/tipo_anomalia', () => {
    test('should create a new tipo_anomalia with valid data', async () => {
      const newTipo = {
        nombre_tipo_anomalia: 'Fuga de Agua',
        dificultad_tipo_anomalia: 3,
      }

      const response = await request.post('/api/tipo_anomalia').send(newTipo).expect(201)

      expect(response.body.data).toBeDefined()
      expect(response.body.data.nombre_tipo_anomalia).toBe(newTipo.nombre_tipo_anomalia)
      expect(response.body.data.dificultad_tipo_anomalia).toBe(newTipo.dificultad_tipo_anomalia)
    })

    test('should return 400 when nombre is missing', async () => {
      const invalidTipo = {
        dificultad_tipo_anomalia: 3,
      }

      await request.post('/api/tipo_anomalia').send(invalidTipo).expect(400)
    })

    test('should return 400 when dificultad is missing', async () => {
      const invalidTipo = {
        nombre_tipo_anomalia: 'Test Anomalia',
      }

      await request.post('/api/tipo_anomalia').send(invalidTipo).expect(400)
    })
  })
})
