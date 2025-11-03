const intialLocalidades = [
  {
    codigo_localidad: 666,
    nombre_localidad: 'Mordor',
  },
  {
    codigo_localidad: 10000,
    nombre_localidad: 'Rohan',
  },
];
// 🧩 1. Mock del ORM — tiene que ir ANTES de cualquier import que use el ORM
jest.mock('../shared/db/orm', () => ({
  orm: {
    em: {
      find: jest.fn().mockResolvedValue([
        { codigo_localidad: 666, nombre_localidad: 'Mordor' },
        { codigo_localidad: 10000, nombre_localidad: 'Rohan' },
      ]),
      findOne: jest.fn(),
      persistAndFlush: jest.fn(),
    },
    syncSchema: jest.fn(), // 👈 agregá esto para evitar errores si se llama a syncSchema
  },
}));

// 🧩 2. Importar dependencias DESPUÉS del mock
const supertest = require('supertest');
const { app, server } = require('../app');

// Crear la instancia del cliente Supertest
const api = supertest(app);

// 🧪 3. Tests
describe.skip('CRUD localidades', () => {
  test('localidades getAll', async () => {
    const response = await api
      .get('/localidad')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual([
      { codigo_localidad: 666, nombre_localidad: 'Mordor' },
      { codigo_localidad: 10000, nombre_localidad: 'Rohan' },
    ]);
  });
});

// 🧹 4. Cerrar el servidor al finalizar todos los tests
afterAll(() => {
  server.close();
});
