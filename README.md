# Sistema de Resolución de Anomalías

## Contenidos

- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Scripts Disponibles](#scripts)
- [Documentación de la API](#documentación-de-la-api)

## Tecnologías

| Tecnología       | Versión |
| ---------------- | ------- |
| PNPM             | 10.6.5  |
| Node.js          | 22.14.0 |
| TypeScript       | 5.1.3   |
| Express          | 5.0.3   |
| MongoDB          | 6.18.0  |
| MikroORM/mongodb | 6.4.16  |
| Multer           | 2.0.2   |
| Bcrypt           | -       |
| JWT              | -       |

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tomasinoalvaro48/DSWTP_BackEnd.git
cd DSWTP_BackEnd
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea y edita el archivo `.env` reemplazando lo siguiente con tus valores:

```env
NODE_ENV=development
PORT=3000
HOST=localhost

DATABASE_URL=mongodb://localhost:27017
DB_NAME=datecAnomalias

JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRES_IN=1h

UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 4. Iniciar MongoDB

### 5. Ejecutar el proyecto

### Ejemplo completo (.env.example):

```env
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
HOST=localhost

# Base de datos
DATABASE_URL=mongodb://localhost:27017
DB_NAME=datecAnomalias

# JWT
JWT_SECRET=claveSecreta123
JWT_EXPIRES_IN=1h

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760


## Ejecución

### Modo Desarrollo

```bash
pnpm start:dev
```

### Modo Producción

```bash
pnpm build

pnpm start
```

## Scripts

| Script      | Comando          | Descripción                                          |
| ----------- | ---------------- | ---------------------------------------------------- |
| `start:dev` | `pnpm start:dev` | Inicia el servidor en modo desarrollo con hot-reload |
| `test`      | `pnpm test`      | Ejecuta los tests (si están configurados)            |

## Documentación de la API

Ver API_DOCUMENTATION.md

### Autenticación

La API utiliza **JWT (JSON Web Tokens)** para la autenticación. Después de hacer login, incluye el token en el header de las peticiones:

```http
Authorization: Bearer <tu-token-jwt>
```

#### Ejemplo de uso:

```typescript
// Login
const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password })

const token = res.data.token

// Usar el token en peticiones autenticadas
const usuarios = await get('http://localhost:3000/api/usuario', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

### Carga de archivos

Para endpoints que aceptan archivos (`/api/pedido_agregacion`), usa `multipart/form-data`:

```typescript
const formData = new FormData()
const formData = new FormData()
formData.append('descripcion_pedido_agregacion', 'Descripción')
formData.append('dificultad_pedido_agregacion', '3')
formData.append('evidencias', JSON.stringify([{ url_evidencia: 'https://example.com/foto.jpg' }]))
formData.append('archivos', pdfFile)

await post('http://localhost:3000/api/pedido_agregacion', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
})
```
