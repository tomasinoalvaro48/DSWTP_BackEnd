# Documentación de la API

**URL Base:** `http://localhost:3000/api`

## Índice

1. [Autenticación](#1-autenticación)
2. [Usuarios](#2-usuarios)
3. [Denunciantes](#3-denunciantes)
4. [Localidades](#4-localidades)
5. [Zonas](#5-zonas)
6. [Tipos de Anomalía](#6-tipos-de-anomalía)
7. [Pedidos de Resolución](#7-pedidos-de-resolución)
8. [Anomalías](#8-anomalías)
9. [Pedidos de Agregación](#9-pedidos-de-agregación)
10. [Inspecciones](#10-inspecciones)
11. [Archivos Estáticos](#11-archivos-estáticos)
12. [Códigos de Respuesta](#12-códigos-de-respuesta)
13. [Manejo de Errores](#13-manejo-de-errores)

## Autenticación

Todos los endpoints marcados como **Requiere autenticación** necesitan un token JWT. Incluye el token en el header:

```http
Authorization: Bearer <tu-token-jwt>
```

### Roles disponibles

| Rol           | Descripción                                          |
| ------------- | ---------------------------------------------------- |
| `operador`    | Acceso total al sistema                              |
| `cazador`     | Puede tomar y resolver pedidos (requiere aprobación) |
| `denunciante` | Puede crear pedidos de resolución                    |

## 1. Autenticación

### 1.1. Registrar Denunciante

Registra un nuevo denunciante en el sistema.

**Endpoint:** `POST /api/auth/register-denunciante`  
**Autenticación:** No requerida

#### Request Body:

```json
{
  "nombre_apellido_denunciante": "Juan Pérez",
  "email_denunciante": "juan.perez@example.com",
  "telefono_denunciante": "3413456789",
  "password_denunciante": "password123"
}
```

#### Response (201 Created):

```json
{
  "message": "Denunciante registrado exitosamente",
  "denunciante": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre_apellido_denunciante": "Juan Pérez",
    "email_denunciante": "juan.perez@example.com",
    "telefono_denunciante": "3413456789"
  }
}
```

### 1.2. Registrar Usuario (Operador/Cazador)

Registra un nuevo usuario operador o cazador.

**Endpoint:** `POST /api/auth/register-usuario`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "nombre_usuario": "María González",
  "email_usuario": "maria.gonzalez@example.com",
  "password_usuario": "password456",
  "tipo_usuario": "cazador",
  "zona_id": "507f1f77bcf86cd799439020"
}
```

**Campos:**

- `tipo_usuario`: `"operador"` o `"cazador"` (por defecto: `"cazador"`)
- `zona_id`: ID de la zona (requerido)
- `nivel_cazador`: Se inicia en 0 automáticamente
- `estado_aprobacion`: Se inicia en `"pendiente"` automáticamente (cazadores requieren aprobación)

#### Response (201 Created):

```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre_usuario": "María González",
    "email_usuario": "maria.gonzalez@example.com",
    "tipo_usuario": "cazador",
    "nivel_cazador": 0,
    "estado_aprobacion": "pendiente",
    "zona": {
      "_id": "507f1f77bcf86cd799439020",
      "nombre_zona": "Centro"
    }
  }
}
```

### 1.3. Iniciar Sesión

Autentica un usuario y devuelve un token JWT.

**Endpoint:** `POST /api/auth/login`  
**Autenticación:** No requerida

#### Request Body:

```json
{
  "email": "maria.gonzalez@example.com",
  "password": "password456"
}
```

#### Response (200 OK):

```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "maria.gonzalez@example.com",
    "rol": "cazador"
  }
}
```

**Nota:** El token expira según `JWT_EXPIRES_IN` (por defecto 1 hora).

### 1.4. Obtener Perfil

Obtiene el perfil del usuario autenticado.

**Endpoint:** `GET /api/auth/get-profile`  
**Autenticación:** Usuario autenticado

#### Response (200 OK):

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre_usuario": "María González",
    "email_usuario": "maria.gonzalez@example.com",
    "tipo_usuario": "cazador",
    "nivel_cazador": 5,
    "estado_aprobacion": "aprobado",
    "zona": {
      "_id": "507f1f77bcf86cd799439020",
      "nombre_zona": "Centro"
    }
  }
}
```

### 1.5. Actualizar Perfil

Actualiza los datos del usuario autenticado.

**Endpoint:** `PUT /api/auth/update-profile`  
**Autenticación:** Usuario autenticado

#### Request Body:

```json
{
  "nombre_usuario": "María Alejandra González"
}
```

**Campos actualizables:**

- `nombre_usuario`
- No se puede actualizar: `email_usuario`, `password_usuario`, `tipo_usuario`, `zona`, `nivel_cazador`, `estado_aprobacion`

#### Response (200 OK):

```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre_usuario": "María Alejandra González",
    "email_usuario": "maria.gonzalez@example.com",
    "tipo_usuario": "cazador"
  }
}
```

### 1.6. Cambiar Contraseña

Cambia la contraseña del usuario autenticado.

**Endpoint:** `POST /api/auth/change-password`  
**Autenticación:** Usuario autenticado

#### Request Body:

```json
{
  "currentPassword": "password456",
  "newPassword": "newSecurePassword789"
}
```

#### Response (200 OK):

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### 1.7. Eliminar Cuenta

Elimina la cuenta del usuario autenticado.

**Endpoint:** `DELETE /api/auth/delete-account`  
**Autenticación:** Usuario autenticado

#### Request Body:

```json
{
  "password": "password456"
}
```

#### Response (200 OK):

```json
{
  "message": "Cuenta eliminada exitosamente"
}
```

## 2. Usuarios

Gestión de usuarios (operadores y cazadores).

### 2.1. Listar Todos los Usuarios

**Endpoint:** `GET /api/usuario`  
**Autenticación:** Operador

#### Query Parameters:

- `tipo_usuario` (opcional): Filtrar por tipo (`operador`, `cazador`)
- `estado_aprobacion` (opcional): Filtrar por estado (`pendiente`, `aprobado`, `rechazado`)

#### Ejemplo:

```http
GET /api/usuario?tipo_usuario=cazador&estado_aprobacion=pendiente
```

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "nombre_usuario": "María González",
      "email_usuario": "maria.gonzalez@example.com",
      "tipo_usuario": "cazador",
      "nivel_cazador": 0,
      "estado_aprobacion": "pendiente",
      "zona": {
        "_id": "507f1f77bcf86cd799439020",
        "nombre_zona": "Centro"
      }
    }
  ]
}
```

### 2.2. Listar Cazadores Pendientes

**Endpoint:** `GET /api/usuario/pending-cazadores`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "nombre_usuario": "María González",
      "email_usuario": "maria.gonzalez@example.com",
      "tipo_usuario": "cazador",
      "nivel_cazador": 0,
      "estado_aprobacion": "pendiente",
      "zona": {
        "_id": "507f1f77bcf86cd799439020",
        "nombre_zona": "Centro"
      }
    }
  ]
}
```

### 2.3. Obtener Usuario por ID

**Endpoint:** `GET /api/usuario/:id`  
**Autenticación:** Operador o el propio usuario

#### Response (200 OK):

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre_usuario": "María González",
    "email_usuario": "maria.gonzalez@example.com",
    "tipo_usuario": "cazador",
    "nivel_cazador": 5,
    "estado_aprobacion": "aprobado",
    "zona": {
      "_id": "507f1f77bcf86cd799439020",
      "nombre_zona": "Centro"
    }
  }
}
```

### 2.4. Aprobar Cazador

Aprueba un cazador pendiente.

**Endpoint:** `PATCH /api/usuario/approve/:id`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "message": "Cazador aprobado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre_usuario": "María González",
    "email_usuario": "maria.gonzalez@example.com",
    "estado_aprobacion": "aprobado"
  }
}
```

### 2.5. Rechazar Cazador

Rechaza un cazador pendiente.

**Endpoint:** `PATCH /api/usuario/reject/:id`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "message": "Cazador rechazado",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "estado_aprobacion": "rechazado"
  }
}
```

#### Response (200 OK):

```json
{
  "message": "Cazador rechazado",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "estado_aprobacion": "rechazado"
  }
}
```

## 3. Denunciantes

Gestión de denunciantes.

### 3.1. Listar Denunciantes

**Endpoint:** `GET /api/denunciantes`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre_apellido_denunciante": "Juan Pérez",
      "email_denunciante": "juan.perez@example.com",
      "telefono_denunciante": "3413456789"
    }
  ]
}
```

### 3.2. Obtener Denunciante por ID

**Endpoint:** `GET /api/denunciantes/:id`  
**Autenticación:** Operador o el propio denunciante

#### Response (200 OK):

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre_apellido_denunciante": "Juan Pérez",
    "email_denunciante": "juan.perez@example.com",
    "telefono_denunciante": "3413456789"
  }
}
```

## 4. Localidades

Gestión de localidades.

### 4.1. Listar Localidades

**Endpoint:** `GET /api/localidad`  
**Autenticación:** No requerida

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "codigo_localidad": "2000",
      "nombre_localidad": "Rosario",
      "zonas": [
        {
          "_id": "507f1f77bcf86cd799439020",
          "nombre_zona": "Centro"
        },
        {
          "_id": "507f1f77bcf86cd799439021",
          "nombre_zona": "Norte"
        }
      ]
    }
  ]
}
```

### 4.2. Crear Localidad

**Endpoint:** `POST /api/localidad`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "codigo_localidad": "2000",
  "nombre_localidad": "Rosario"
}
```

#### Response (201 Created):

```json
{
  "message": "Localidad creada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "codigo_localidad": "2000",
    "nombre_localidad": "Rosario"
  }
}
```

### 4.3. Actualizar Localidad

**Endpoint:** `PUT /api/localidad/:id`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "nombre_localidad": "Rosario Ciudad"
}
```

#### Response (200 OK):

```json
{
  "message": "Localidad actualizada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "codigo_localidad": "2000",
    "nombre_localidad": "Rosario Ciudad"
  }
}
```

### 4.4. Eliminar Localidad

Elimina una localidad y todas sus zonas asociadas (si no tienen usuarios o pedidos).

**Endpoint:** `DELETE /api/localidad/:id`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "message": "Localidad eliminada exitosamente"
}
```

**Error (400):**

```json
{
  "message": "No se puede eliminar la localidad porque tiene zonas con usuarios o pedidos asignados"
}
```

## 5. Zonas

Gestión de zonas dentro de localidades.

### 5.1. Listar Zonas

**Endpoint:** `GET /api/zona`  
**Autenticación:** No requerida

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "nombre_zona": "Centro",
      "localidad": {
        "_id": "507f1f77bcf86cd799439030",
        "codigo_localidad": "2000",
        "nombre_localidad": "Rosario"
      }
    }
  ]
}
```

### 5.2. Crear Zona

**Endpoint:** `POST /api/zona`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "nombre_zona": "Centro",
  "codigo_localidad": "2000"
}
```

#### Response (201 Created):

```json
{
  "message": "Zona creada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "nombre_zona": "Centro",
    "localidad": {
      "_id": "507f1f77bcf86cd799439030",
      "codigo_localidad": "2000",
      "nombre_localidad": "Rosario"
    }
  }
}
```

### 5.3. Actualizar Zona

**Endpoint:** `PUT /api/zona/:id`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "nombre_zona": "Centro Histórico"
}
```

#### Response (200 OK):

```json
{
  "message": "Zona actualizada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "nombre_zona": "Centro Histórico"
  }
}
```

### 5.4. Eliminar Zona

**Endpoint:** `DELETE /api/zona/:id`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "message": "Zona eliminada exitosamente"
}
```

**Error (400):**

```json
{
  "message": "No se puede eliminar la zona porque tiene usuarios o pedidos asignados"
}
```

## 6. Tipos de Anomalía

Gestión de tipos de anomalías.

### 6.1. Listar Tipos de Anomalía

**Endpoint:** `GET /api/tipo_anomalia`  
**Autenticación:** No requerida

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "nombre_tipo_anomalia": "Aparición Espectral",
      "dificultad_tipo_anomalia": 2
    },
    {
      "_id": "507f1f77bcf86cd799439041",
      "nombre_tipo_anomalia": "Poltergeist",
      "dificultad_tipo_anomalia": 3
    },
    {
      "_id": "507f1f77bcf86cd799439042",
      "nombre_tipo_anomalia": "Fenómeno Electromagnético",
      "dificultad_tipo_anomalia": 1
    }
  ]
}
```

### 6.2. Crear Tipo de Anomalía

**Endpoint:** `POST /api/tipo_anomalia`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "nombre_tipo_anomalia": "Poltergeist",
  "dificultad_tipo_anomalia": 3
}
```

**Campos:**

- `nombre_tipo_anomalia`: Nombre del tipo de evento paranormal (requerido)
- `dificultad_tipo_anomalia`: Nivel de dificultad (1: Bajo, 2: Medio, 3: Alto)

**Ejemplos de tipos de anomalías:**

- Nivel 1: Fenómeno Electromagnético, Ruidos Inexplicables, Ráfagas de Frío
- Nivel 2: Aparición Espectral, Objetos en Movimiento, Voces Fantasmales
- Nivel 3: Poltergeist, Posesión, Manifestación Demoníaca

#### Response (201 Created):

```json
{
  "message": "Tipo de anomalía creado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "nombre_tipo_anomalia": "Poltergeist",
    "dificultad_tipo_anomalia": 3
  }
}
```

## 7. Pedidos de Resolución

Gestión de pedidos de resolución de eventos paranormales.

### 7.1. Listar Pedidos de Resolución

**Endpoint:** `GET /api/pedido_resolucion`  
**Autenticación:** Usuario autenticado

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "fecha_pedido_resolucion": "2025-06-15T10:30:00.000Z",
      "direccion_pedido_resolucion": "Av. Pellegrini 1234",
      "descripcion_pedido_resolucion": "Múltiples manifestaciones paranormales durante la noche",
      "estado_pedido_resolucion": "solicitado",
      "comentario_pedido_resolucion": null,
      "dificultad_pedido_resolucion": 5,
      "zona": {
        "_id": "507f1f77bcf86cd799439020",
        "nombre_zona": "Centro"
      },
      "denunciante": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre_apellido_denunciante": "Juan Pérez"
      },
      "cazador": null,
      "anomalias": [
        {
          "_id": "507f1f77bcf86cd799439060",
          "resultado_anomalia": "inconcluso",
          "tipo_anomalia": {
            "_id": "507f1f77bcf86cd799439040",
            "nombre_tipo_anomalia": "Aparición Espectral",
            "dificultad_tipo_anomalia": 2
          }
        }
      ],
      "inspecciones": []
    }
  ]
}
```

### 7.2. Crear Pedido de Resolución

Genera un pedido de resolución para atender múltiples eventos paranormales.

**Endpoint:** `POST /api/pedido_resolucion`  
**Autenticación:** Denunciante

#### Request Body:

```json
{
  "direccion_pedido_resolucion": "Av. Pellegrini 1234, Rosario",
  "descripcion_pedido_resolucion": "Múltiples manifestaciones paranormales en el edificio",
  "comentario_pedido_resolucion": "Actividad intensa durante la noche, requiere atención urgente",
  "zona_id": "507f1f77bcf86cd799439020",
  "tipo_anomalia_ids": ["507f1f77bcf86cd799439040", "507f1f77bcf86cd799439041"]
}
```

**Campos:**

- `direccion_pedido_resolucion`: Dirección donde ocurre el fenómeno (requerido)
- `descripcion_pedido_resolucion`: Descripción de los eventos paranormales (opcional)
- `comentario_pedido_resolucion`: Comentarios adicionales sobre las manifestaciones (opcional)
- `zona_id`: ID de la zona donde se encuentra (requerido)
- `tipo_anomalia_ids`: Array de IDs de tipos de eventos paranormales detectados (requerido, mínimo 1)

#### Response (201 Created):

```json
{
  "message": "Pedido de resolución generado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "fecha_pedido_resolucion": "2025-06-15T10:30:00.000Z",
    "direccion_pedido_resolucion": "Av. Pellegrini 1234, Rosario",
    "descripcion_pedido_resolucion": "Múltiples manifestaciones paranormales en el edificio",
    "estado_pedido_resolucion": "solicitado",
    "comentario_pedido_resolucion": "Actividad intensa durante la noche, requiere atención urgente",
    "dificultad_pedido_resolucion": 5,
    "zona": "507f1f77bcf86cd799439020",
    "denunciante": "507f1f77bcf86cd799439011",
    "cazador": null,
    "anomalias": [
      {
        "_id": "507f1f77bcf86cd799439060",
        "resultado_anomalia": "inconcluso",
        "tipo_anomalia": "507f1f77bcf86cd799439040"
      },
      {
        "_id": "507f1f77bcf86cd799439061",
        "resultado_anomalia": "inconcluso",
        "tipo_anomalia": "507f1f77bcf86cd799439041"
      }
    ]
  }
}
```

**Nota:**

- La `dificultad_pedido_resolucion` se calcula automáticamente sumando las dificultades de los tipos de eventos paranormales
- El `estado_pedido_resolucion` se inicia automáticamente en `"solicitado"`
- Cada anomalía (evento paranormal) se crea con `resultado_anomalia` en `"inconcluso"`

### 7.3. Obtener Pedidos Disponibles (para Cazador)

Lista pedidos de eventos paranormales pendientes en la zona del cazador.

**Endpoint:** `GET /api/pedido_resolucion/posibles-pedidos`  
**Autenticación:** Cazador (aprobado)

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "fecha_pedido_resolucion": "2025-06-15T10:30:00.000Z",
      "direccion_pedido_resolucion": "Av. Pellegrini 1234",
      "estado_pedido_resolucion": "solicitado",
      "dificultad_pedido_resolucion": 5,
      "zona": {
        "_id": "507f1f77bcf86cd799439020",
        "nombre_zona": "Centro"
      },
      "anomalias": [
        {
          "_id": "507f1f77bcf86cd799439060",
          "resultado_anomalia": "inconcluso",
          "tipo_anomalia": {
            "_id": "507f1f77bcf86cd799439040",
            "nombre_tipo_anomalia": "Aparición Espectral",
            "dificultad_tipo_anomalia": 2
          }
        }
      ]
    }
  ]
}
```

### 7.4. Tomar Pedido

Permite a un cazador tomar un pedido pendiente.

**Endpoint:** `PATCH /api/pedido_resolucion/tomar-pedido/:id`  
**Autenticación:** Cazador (aprobado)

#### Response (200 OK):

```json
{
  "message": "Pedido tomado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "estado_pedido_resolucion": "en_proceso",
    "cazador": {
      "_id": "507f1f77bcf86cd799439012",
      "nombre_usuario": "María González",
      "email_usuario": "maria.gonzalez@example.com"
    }
  }
}
```

### 7.5. Finalizar Pedido

Marca un pedido como finalizado por el cazador.

**Endpoint:** `PATCH /api/pedido_resolucion/finalizar/:id`  
**Autenticación:** Cazador (asignado al pedido)

#### Request Body (opcional):

```json
{
  "comentario_pedido_resolucion": "Trabajo completado sin inconvenientes"
}
```

#### Response (200 OK):

```json
{
  "message": "Pedido finalizado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "estado_pedido_resolucion": "finalizado",
    "comentario_pedido_resolucion": "Trabajo completado sin inconvenientes"
  }
}
```

## 8. Anomalías (Eventos Paranormales)

Gestión de eventos paranormales individuales asociados a pedidos de resolución.

### 8.1. Listar Anomalías

**Endpoint:** `GET /api/anomalia`  
**Autenticación:** Usuario autenticado

#### Query Parameters:

- `zona` (opcional): Filtrar por código de zona
- `tipo` (opcional): Filtrar por tipo de anomalía

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "resultado_anomalia": "inconcluso",
      "tipo_anomalia": {
        "_id": "507f1f77bcf86cd799439040",
        "nombre_tipo_anomalia": "Aparición Espectral",
        "dificultad_tipo_anomalia": 2
      },
      "pedido_resolucion": {
        "_id": "507f1f77bcf86cd799439050",
        "direccion_pedido_resolucion": "Av. Pellegrini 1234"
      }
    }
  ]
}
```

## 9. Pedidos de Agregación

Gestión de pedidos de agregación de nuevos tipos de eventos paranormales con evidencias multimedia.

### 9.1. Crear Pedido de Agregación

Crea un pedido para agregar un nuevo tipo de evento paranormal con evidencias multimedia.

**Endpoint:** `POST /api/pedido_agregacion`  
**Autenticación:** Cazador

**Content-Type:** `multipart/form-data`

#### Request (Form Data):

```
descripcion_pedido_agregacion: "Nueva manifestación: Sombras en movimiento con patrones geométricos"
dificultad_pedido_agregacion: 2
evidencias: [{"url_evidencia": "https://example.com/evidencia-termica.jpg"}]
archivos: <File> (PDF, imágenes, videos, lecturas EMF)
```

**Archivos aceptados:**

- Imágenes: `.jpg`, `.jpeg`, `.png`, `.gif` (fotografías, capturas térmicas)
- PDFs: `.pdf` (reportes, análisis)
- Videos: `.mp4`, `.avi`, `.mov` (grabaciones de fenómenos)
- Documentos: `.doc`, `.docx` (registros, investigaciones)

**Tamaño máximo:** 10MB por archivo

#### Response (201 Created):

```json
{
  "message": "Pedido de agregación creado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "descripcion_pedido_agregacion": "Nueva manifestación: Sombras en movimiento con patrones geométricos",
    "dificultad_pedido_agregacion": 2,
    "estado_pedido_agregacion": "pendiente",
    "cazador": null,
    "tipo_anomalia": {
      "_id": "507f1f77bcf86cd799439040",
      "nombre_tipo_anomalia": "Aparición Espectral"
    },
    "evidencias": [
      {
        "_id": "507f1f77bcf86cd799439080",
        "url_evidencia": "https://example.com/evidencia-termica.jpg",
        "archivo_evidencia": "/uploads/1623845400123-termica.jpg"
      }
    ]
  }
}
```

### 9.2. Listar Pedidos de Agregación

**Endpoint:** `GET /api/pedido_agregacion`  
**Autenticación:** Cazador / Operador

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439070",
      "descripcion_pedido_agregacion": "Nueva manifestación: Sombras en movimiento con patrones geométricos",
      "dificultad_pedido_agregacion": 2,
      "estado_pedido_agregacion": "pendiente",
      "cazador": null,
      "tipo_anomalia": {
        "_id": "507f1f77bcf86cd799439040",
        "nombre_tipo_anomalia": "Aparición Espectral"
      },
      "evidencias": [
        {
          "_id": "507f1f77bcf86cd799439080",
          "url_evidencia": "https://example.com/evidencia-termica.jpg",
          "archivo_evidencia": "/uploads/1623845400123-termica.jpg"
        }
      ]
    }
  ]
}
```

### 9.3. Aceptar/Rechazar Pedido de Agregación

**Endpoint:** `PATCH /api/pedido_agregacion/tomar-pedidos-agregacion/:id`  
**Autenticación:** Cazador / Operador

#### Request Body:

```json
{
  "accion": "aceptar"
}
```

**Valores de `accion`:** `"aceptar"` o `"rechazar"`

#### Response (200 OK):

```json
{
  "message": "Pedido aceptado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "estado_pedido_agregacion": "aceptado"
  }
}
```

## 10. Inspecciones

Gestión de inspecciones realizadas por operadores.

### 10.1. Listar Inspecciones

**Endpoint:** `GET /api/inspeccion`  
**Autenticación:** Operador

#### Response (200 OK):

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439090",
      "numero_inspeccion": 1,
      "comentario_inspeccion": "Trabajo realizado correctamente",
      "fecha_inspeccion": "2025-06-17T09:00:00.000Z",
      "pedido_resolucion": {
        "_id": "507f1f77bcf86cd799439050",
        "estado_pedido_resolucion": "finalizado",
        "direccion_pedido_resolucion": "Av. Pellegrini 1234"
      }
    }
  ]
}
```

### 10.2. Crear Inspección

**Endpoint:** `POST /api/inspeccion`  
**Autenticación:** Operador

#### Request Body:

```json
{
  "pedido_resolucion_id": "507f1f77bcf86cd799439050",
  "comentario_inspeccion": "Trabajo realizado correctamente según lo esperado"
}
```

**Campos:**

- `pedido_resolucion_id`: ID del pedido de resolución a inspeccionar (requerido)
- `comentario_inspeccion`: Comentarios sobre la inspección (opcional)
- `numero_inspeccion`: Se calcula automáticamente según las inspecciones previas del pedido

#### Response (201 Created):

```json
{
  "message": "Inspección creada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439090",
    "numero_inspeccion": 1,
    "comentario_inspeccion": "Trabajo realizado correctamente según lo esperado",
    "fecha_inspeccion": "2025-06-17T09:00:00.000Z",
    "pedido_resolucion": "507f1f77bcf86cd799439050"
  }
}
```

## 11. Archivos Estáticos

Acceso a archivos multimedia subidos.

### 11.1. Obtener Archivo

**Endpoint:** `GET /uploads/:filename`  
**Autenticación:** No requerida

#### Ejemplo:

```http
GET http://localhost:3000/uploads/1623845400123-foto.jpg
```

#### Response:

Devuelve el archivo solicitado con el Content-Type apropiado.

## 12. Códigos de Respuesta

| Código | Significado           | Descripción                          |
| ------ | --------------------- | ------------------------------------ |
| 200    | OK                    | Solicitud exitosa                    |
| 201    | Created               | Recurso creado exitosamente          |
| 400    | Bad Request           | Error en los datos enviados          |
| 401    | Unauthorized          | Token faltante o inválido            |
| 403    | Forbidden             | Sin permisos para acceder al recurso |
| 404    | Not Found             | Recurso no encontrado                |
| 409    | Conflict              | Conflicto (ej: email duplicado)      |
| 500    | Internal Server Error | Error del servidor                   |

## 13. Manejo de Errores

### Formato de Respuesta de Error:

```json
{
  "message": "Descripción del error",
  "errors": [
    {
      "message": "El email ya está registrado"
    }
  ]
}
```

### Errores Comunes:

#### 401 Unauthorized

```json
{
  "message": "Token no proporcionado o inválido"
}
```

#### 403 Forbidden (Cazador no aprobado)

```json
{
  "message": "Tu cuenta de cazador está pendiente de aprobación"
}
```

#### 403 Forbidden (Rol insuficiente)

```json
{
  "message": "No tienes permisos para acceder a este recurso"
}
```

#### 409 Conflict

```json
{
  "message": "El email ya está registrado"
}
```
