# EFT — Proyecto CI/CD (Frontend + Backend + BD)

Stack: **React (Vite) + Node/Express + PostgreSQL**, contenedorizado con Docker y
automatizado con GitHub Actions.

## Estructura

```
.
├── frontend/           # React + Vite, servido en producción con nginx
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/             # Node/Express + PostgreSQL
│   ├── src/
│   │   ├── server.js
│   │   └── tests/
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml   # Levanta todo el stack en local
├── .env.example
└── .github/workflows/ci-cd.yml   # Pipeline CI/CD
```

## 1. Probar en local

```bash
cp .env.example .env
# edita .env con tus credenciales locales de BD
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health

## 2. Subir a GitHub

```bash
git init
git add .
git commit -m "Proyecto base EFT: frontend, backend, docker, CI/CD"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

El pipeline (`.github/workflows/ci-cd.yml`) se ejecuta automáticamente en cada
push a `main`. El job `build-and-test` funciona de inmediato, sin necesitar AWS.
Los jobs `build-and-push` y `deploy` quedarán en rojo hasta que completes la
parte de AWS (paso 3).

## 3. Lo que falta de tu lado (AWS)

Cuando tengas tu cuenta y recursos AWS creados, debes:

1. **Crear los repositorios ECR**: `eft-backend` y `eft-frontend` (o cambia
   los nombres en `env:` dentro de `ci-cd.yml`).
2. **Crear un usuario/rol IAM** con permisos mínimos para:
   - Push/pull en ECR (`AmazonEC2ContainerRegistryFullAccess` o una política
     más restringida).
   - `ecs:UpdateService`, `ecs:DescribeServices` sobre tu clúster.
3. **Agregar los secretos en GitHub**:
   `Settings → Secrets and variables → Actions → New repository secret`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
4. **Crear el clúster ECS (Fargate recomendado)**, las Task Definitions
   (una para frontend, una para backend) y los Services correspondientes.
   Usa RDS (PostgreSQL) para la base de datos en producción en vez de un
   contenedor.
5. **Editar las variables al inicio de `ci-cd.yml`** (`AWS_REGION`,
   `ECS_CLUSTER`, `ECS_SERVICE_BACKEND`, `ECS_SERVICE_FRONTEND`) para que
   coincidan con lo que creaste en AWS.
6. Configurar el **Security Group** de la base de datos para aceptar
   conexiones solo desde el Security Group del backend, y el del backend
   para aceptar solo desde el Load Balancer del frontend.

## 4. Evidencia a recolectar para la defensa

- Captura de una ejecución exitosa del workflow completo (pestaña Actions).
- Captura de las imágenes publicadas en ECR con sus tags.
- Captura de los servicios corriendo en ECS y del Load Balancer activo.
- URL pública del frontend funcionando y consumiendo el backend.
- Logs de CloudWatch del backend.
