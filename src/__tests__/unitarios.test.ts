jest.mock('../shared/db/orm', () => ({
  orm: {
    em: {
      find: jest.fn(),
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

import { validateName } from '../tipo_anomalia/tipo_anomalia.controller.js';
import { orm } from '../shared/db/orm';

describe('validateName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devuelve true si el nombre ya existe', async () => {
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

//Test unitario sanitize input de Usuario

import { sanitizeUsuarioAuthInput } from '../auth/auth.controller.js';
import { Request, Response, NextFunction } from 'express';

const usuarioBody = [
  {
    nombre_usuario: 'Juan123',
    email_usuario: 'juan@test.com',
    password_usuario: 'abcdef',
    confirm_password: 'abcdef',
  },
  {
    nombre_usuario: 'Juan',
    email_usuario: 'juantest.com',
    password_usuario: 'abcdef',
    confirm_password: 'abcdef',
  },
  {
    nombre_usuario: 'Juan',
    email_usuario: 'juan@test.com',
    password_usuario: 'abcdef',
    confirm_password: '123456',
  },
  {
    nombre_usuario: 'Juan',
    email_usuario: 'juan@test.com',
    password_usuario: 'abc',
    confirm_password: 'abc',
  },
  {
    nombre_usuario: 'Juan Pérez',
    email_usuario: 'juan@test.com',
    password_usuario: 'abcdef',
    confirm_password: 'abcdef',
  },
];

describe('sanitizeUsuarioAuthInput middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('rechaza nombre con números', () => {
    req.body = usuarioBody[0];

    sanitizeUsuarioAuthInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El nombre no puede tener números',
    });
  });

  test('rechaza email sin @', () => {
    req.body = usuarioBody[1];

    sanitizeUsuarioAuthInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'El email debe tener @' });
  });

  test('rechaza si las contraseñas no coinciden', () => {
    req.body = usuarioBody[2];

    sanitizeUsuarioAuthInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Las contraseñas ingresadas no coinciden',
    });
  });

  test('rechaza si la contraseña es demasiado corta', () => {
    req.body = usuarioBody[3];

    sanitizeUsuarioAuthInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'La contraseña no puede tener menos de 6 caracteres',
    });
  });

  test('llama a next() si todos los datos son válidos y sanitiza el body', () => {
    req.body = usuarioBody[4];

    sanitizeUsuarioAuthInput(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.sanitizeUsuarioAuthInput).toEqual({
      nombre_usuario: 'Juan Pérez',
      email_usuario: 'juan@test.com',
      password_usuario: 'abcdef',
    });
  });
});

// Test unitario de sanitize input localidad
import { sanitizeLocalidadInput } from '../localidad/localidad.controller.js';

const localidadBody = [
  { codigo_localidad: '', nombre_localidad: 'Rosario' },
  { codigo_localidad: '12A4', nombre_localidad: 'Rosario' },
  { codigo_localidad: '123', nombre_localidad: '' },
  { codigo_localidad: '123', nombre_localidad: 'Rosario2' },
  { codigo_localidad: '123', nombre_localidad: 'Rosario' },
];

describe('sanitizeLocalidadInput middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('rechaza si el código está vacío', () => {
    req.body = localidadBody[0];

    sanitizeLocalidadInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El código no puede estar vacío',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza si el código tiene letras', () => {
    req.body = localidadBody[1];

    sanitizeLocalidadInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El código no puede tener letras',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza si el nombre está vacío', () => {
    req.body = localidadBody[2];

    sanitizeLocalidadInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El nombre no puede estar vacío',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza si el nombre tiene números', () => {
    req.body = localidadBody[3];

    sanitizeLocalidadInput(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'El nombre no puede tener números',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama a next() si los datos son válidos y sanitiza el body', () => {
    req.body = localidadBody[4];

    sanitizeLocalidadInput(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.sanitizeLocalidadInput).toEqual({
      codigo_localidad: '123',
      nombre_localidad: 'Rosario',
    });
    expect(res.status).not.toHaveBeenCalled();
  });
});
