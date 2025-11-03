// 🧩 1. Mock del ORM antes de importar nada
jest.mock('../shared/db/orm', () => ({
  orm: {
    em: {
      find: jest.fn(), // 👈 la vamos a controlar en cada test
    },
  },
}));

//Creo que habria que sacar momia y esqueleto
const initialTipoAnomalia = [
  {
    id: 1,
    dificultad_tipo_anomalia: 2,
    nombre_tipo_anomalia: 'Momia',
  },
  {
    id: 2,
    dificultad_tipo_anomalia: 1,
    nombre_tipo_anomalia: 'Zombie',
  },
  {
    id: 3,
    dificultad_tipo_anomalia: 3,
    nombre_tipo_anomalia: 'Esqueleto',
  },
];

// 🧩 2. Importar la función a testear
import { validateName } from '../tipo_anomalia/tipo_anomalia.controller.js';
import { orm } from '../shared/db/orm';
import { Tipo_Anomalia } from '../tipo_anomalia/tipo_anomalia.entity.js';
// 🧪 3. Tests
describe('validateName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devuelve true si el nombre ya existe', async () => {
    // Mockeamos el resultado del ORM
    (orm.em.find as jest.Mock).mockResolvedValue(initialTipoAnomalia);

    const result = await validateName('Zombie');

    expect(result).toBe(true);
  });

  test('devuelve false si el nombre no existe', async () => {
    (orm.em.find as jest.Mock).mockResolvedValue([]);

    const result = await validateName('Tipo inexistente');

    expect(result).toBe(false);
  });
});
