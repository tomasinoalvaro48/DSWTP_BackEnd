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

const supertest = require('supertest');

jest.mock('../shared/db/orm', () => ({
  orm: {
    em: {
      find: jest.fn().mockResolvedValue(intialLocalidades),
      findOne: jest.fn(),
      persistAndFlush: jest.fn(),
    },
  },
}));

const { app, server } = require('../app');
const Localidad = require('../localidad/localidad.entity');

const api = supertest(app);

describe('CRUD localidades', () => {
  test('localidades getAll', async () => {
    const response = await api
      .get('/api/localidad/')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual(intialLocalidades);
  });

  test('localidades getAll', async () => {
    const response = await api
      .get('/api/localidad/')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual(intialLocalidades);
  });
});

afterAll(() => {
  server.close();
});
