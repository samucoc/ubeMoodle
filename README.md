# 🎓 ubeMoodle - Learning Management System

<div align="center">

![MoodleNext](https://img.shields.io/badge/MoodleNext-LMS-2563eb?style=for-the-badge&logo=graduation-cap)
![NestJS](https://img.shields.io/badge/NestJS-10.x-e0234e?style=for-the-badge&logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-14.x-000000?style=for-the-badge&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**Sistema de Gestión de Aprendizaje moderno, escalable y preparado para alto tráfico.**

Migración completa de Moodle PHP a una arquitectura Node.js con NestJS + Fastify (Backend) y Next.js + React (Frontend), diseñado para una futura migración a React Native.

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
  - [Con Docker (Recomendado)](#con-docker-recomendado)
  - [Instalación Manual](#instalación-manual)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)
- [Soporte de Alto Tráfico](#-soporte-de-alto-tráfico)
- [Extensiones y Paquetes](#-extensiones-y-paquetes-instalados)
- [Scripts Disponibles](#-scripts-disponibles)
- [Migración a React Native](#-migración-a-react-native)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- **JWT con Refresh Tokens** - Autenticación stateless con rotación automática de tokens
- **Roles y Permisos** - Sistema de roles granular (Admin, Manager, Teacher, Student, etc.)
- **Rate Limiting dual** - Protección burst (20 req/10s) + sostenida (100 req/60s) por IP
- **Brute Force Protection** - Login throttling con bloqueo temporal tras intentos fallidos
- **SQL Injection Prevention** - Query sanitizer que valida campos de ordenamiento contra whitelist
- **File Upload Validation** - Verificación de MIME type real (magic bytes), extensión y tamaño
- **WebSocket JWT Auth** - Autenticación JWT obligatoria en conexiones WebSocket
- **Helmet Security** - Headers de seguridad HTTP (CSP completo en producción)
- **CORS** configurado para orígenes específicos
- **Validación de datos** con class-validator DTOs en todos los endpoints
- **Encriptación bcrypt** para contraseñas (factor 12)
- **Soft delete** - Los datos nunca se eliminan permanentemente
- **Env Validation** - Validación de variables de entorno con Joi al arranque
- **Forgot/Reset Password** - Flujo seguro con tokens hasheados y expiración de 1 hora
- **Change Password** - Endpoint autenticado que verifica contraseña actual
- **Email Verification** - Verificación de email con token + reenvío
- **Structured Logging** - JSON logs en producción, texto legible en desarrollo

### 📚 Gestión de Cursos
- Creación y gestión completa de cursos
- Categorías jerárquicas (árbol de categorías)
- Múltiples formatos de curso (Topics, Weeks, Single, Social)
- Sistema de matriculación (auto-inscripción, clave de matriculación)
- Control de visibilidad y fechas de inicio/fin
- Seguimiento de progreso por alumno

### 📝 Actividades y Contenido
- **18+ tipos de actividad**: Tareas, Cuestionarios, Foros, Recursos, URLs, Páginas, Vídeos, SCORM, Lecciones, Wikis, Glosarios, H5P...
- Organización por secciones con ordenamiento drag & drop
- Fechas límite y disponibilidad configurable
- Intentos múltiples con límite de tiempo
- Entrega tardía configurable

### 📊 Sistema de Calificaciones
- Calificación por actividad y por curso
- Cálculo automático de porcentajes y letras (A-F)
- Feedback por actividad
- Historial de intentos
- Vista del libro de calificaciones para profesores
- Estadísticas y promedios

### 📅 Calendario
- Eventos de curso, sitio y personales
- Vista mensual y semanal
- Eventos recurrentes (diario, semanal, mensual, anual)
- Código de colores por tipo de evento
- Integración con fechas de actividades

### 💬 Mensajería
- Mensajes directos entre usuarios
- Sistema de conversaciones
- Notificaciones de mensajes nuevos
- Adjuntos en mensajes
- Marcado como leído/no leído
- Eliminación independiente (remitente/destinatario)

### 🔔 Notificaciones en Tiempo Real
- WebSocket con Socket.IO + JWT auth
- Notificaciones push por usuario con persistencia en PostgreSQL
- 7 tipos de notificación: Grade, Message, Enrollment, Course Update, Assignment, Reminder, System
- API REST completa: listar, contar no leídas, marcar como leída, marcar todas, eliminar
- Notificaciones de curso (broadcast a todos los inscritos)
- Broadcast global para anuncios del sistema
- **NotificationCenter** integrado en el Header del frontend con dropdown en tiempo real
- Tracking de usuarios online por sala

### 📁 Gestión de Archivos
- Upload de múltiples tipos de archivo
- Organización por fecha en disco
- Metadata almacenada en base de datos
- Hash SHA-256 para deduplicación
- Límite de tamaño configurable (default: 50MB)

### 📊 Dashboard
- Estadísticas personales: cursos matriculados, promedio de calificaciones, actividades pendientes, mensajes no leídos
- Cursos recientes (ordenados por último acceso)
- Próximos eventos del calendario
- Panel de administración con estadísticas globales (total de usuarios, cursos, matriculaciones, categorías)

### 🎨 Frontend Moderno
- **Dark/Light Mode** con next-themes
- **Responsive Design** - Mobile-first
- **SweetAlert2** - Notificaciones toast y diálogos elegantes
- **React Query** - Caché inteligente y sincronización de datos
- **Zustand** - Estado global ligero
- **Framer Motion** - Animaciones fluidas
- **Charts** - Gráficos con Chart.js
- **Página de Perfil** - Editar información personal + cambiar contraseña
- **Página de Notificaciones** - Lista completa con filtros (todas / sin leer)
- **Páginas de error** - Error boundary global (`error.tsx`) y 404 (`not-found.tsx`)
- **WebSocket Hook** - `useSocket` con reconexión automática y awareness de autenticación

### 🚀 Optimizado para Alto Tráfico
- Fastify como servidor HTTP (2-3x más rápido que Express)
- Redis para caché y colas de trabajo
- PostgreSQL con connection pooling (5 min, 50 max conexiones)
- Compresión gzip/deflate/brotli
- Rate limiting dual por IP (burst + sustained)
- Nginx como reverse proxy con load balancing + proxy cache
- Bull queues para tareas en background
- Timeout interceptor configurable por request
- Índices de base de datos en campos de búsqueda frecuente

### 🧪 Testing
- Tests unitarios con Jest + ts-jest
- Spec files para módulos críticos (Auth, Courses, Dashboard)
- Mocks de repositorios y servicios
- Configurado en `package.json` (jest config)
- Scripts: `npm test`, `npm run test:cov`, `npm run test:e2e`

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         NGINX                                │
│              (Reverse Proxy + Load Balancer)                  │
│         Rate Limiting · Gzip · SSL · Static Cache            │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
    ┌─────────▼──────────┐     ┌──────────▼──────────┐
    │   Frontend (3000)   │     │   Backend (4000)     │
    │                     │     │                      │
    │   Next.js 14        │     │   NestJS + Fastify   │
    │   React 18          │     │   TypeORM            │
    │   TailwindCSS       │     │   JWT Auth           │
    │   Zustand           │     │   WebSocket          │
    │   React Query       │     │   Bull Queues        │
    │   SweetAlert2       │     │   Swagger API Docs   │
    └─────────────────────┘     └───────┬──────┬───────┘
                                        │      │
                              ┌─────────▼──┐ ┌─▼──────────┐
                              │ PostgreSQL  │ │   Redis     │
                              │   (5432)    │ │   (6379)    │
                              │             │ │             │
                              │ 16-alpine   │ │ Cache       │
                              │ UUID, TRGM  │ │ Sessions    │
                              │ Pool: 50    │ │ Job Queue   │
                              └─────────────┘ └─────────────┘
```

### 🔄 Ciclo de Vida de una Request

```
  Cliente (Browser/App)
         │
         │  HTTPS Request
         ▼
┌─────────────────────┐
│       NGINX          │
│  ┌───────────────┐   │
│  │ Rate Limiter   │──── ✖ 429 Too Many Requests
│  └───────┬───────┘   │
│  ┌───────▼───────┐   │
│  │  Gzip Check    │   │
│  └───────┬───────┘   │
│  ┌───────▼───────┐   │
│  │ Route Match    │   │
│  └──┬─────────┬──┘   │
└─────┼─────────┼──────┘
      │         │
 /api/*    / (static)
      │         │
      ▼         ▼
┌───────────┐ ┌───────────┐
│  Backend  │ │ Frontend  │
│  :4000    │ │  :3000    │
└─────┬─────┘ └───────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│           NestJS + Fastify Pipeline       │
│                                          │
│  Request ──► Middleware ──► Guards ──►    │
│  Interceptors ──► Pipes ──► Controller   │
│  ──► Service ──► Repository ──► DB       │
│                                          │
│  Response ◄── Interceptors ◄── Filter    │
│  ◄── ExceptionFilter (errores)           │
└──────────────────────────────────────────┘
```

### 🔐 Flujo de Autenticación (JWT)

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                     REGISTRO DE USUARIO                          │
 └──────────────────────────────────────────────────────────────────┘

  Cliente                    Backend                     PostgreSQL
    │                          │                            │
    │  POST /auth/register     │                            │
    │  {username,email,pass}   │                            │
    │─────────────────────────►│                            │
    │                          │  Validar DTO (class-validator)
    │                          │  ¿Email duplicado?         │
    │                          │───────────────────────────►│
    │                          │◄───────────────────────────│
    │                          │  bcrypt.hash(password, 12) │
    │                          │  Crear usuario             │
    │                          │───────────────────────────►│
    │                          │◄─── User creado ───────────│
    │                          │  Generar JWT Access (15m)  │
    │                          │  Generar JWT Refresh (7d)  │
    │  { accessToken,          │                            │
    │    refreshToken, user }  │                            │
    │◄─────────────────────────│                            │
    │  Guardar tokens          │                            │
    │  (Cookie + Zustand)      │                            │


 ┌──────────────────────────────────────────────────────────────────┐
 │                        LOGIN                                     │
 └──────────────────────────────────────────────────────────────────┘

  Cliente                    Backend                      Redis
    │                          │                            │
    │  POST /auth/login        │                            │
    │  {email, password}       │                            │
    │─────────────────────────►│                            │
    │                          │  Buscar user por email     │
    │                          │  bcrypt.compare(pass,hash) │
    │                          │                            │
    │                          │  ¿Válido?                  │
    │                          │──── NO ──► 401 Unauthorized│
    │                          │                            │
    │                          │  SI: Generar tokens        │
    │                          │  Guardar refresh en Redis  │
    │                          │───────────────────────────►│
    │  { accessToken,          │                            │
    │    refreshToken, user }  │                            │
    │◄─────────────────────────│                            │


 ┌──────────────────────────────────────────────────────────────────┐
 │                   REFRESH TOKEN                                  │
 └──────────────────────────────────────────────────────────────────┘

  Cliente                    Backend                      Redis
    │                          │                            │
    │  Access token expirado   │                            │
    │  (15 min)                │                            │
    │                          │                            │
    │  POST /auth/refresh      │                            │
    │  {refreshToken}          │                            │
    │─────────────────────────►│                            │
    │                          │  Verificar firma JWT       │
    │                          │  Buscar en Redis           │
    │                          │───────────────────────────►│
    │                          │◄──── ¿Existe? ────────────│
    │                          │                            │
    │                          │  NO: 401 Token revocado    │
    │                          │  SI: Nuevo access token    │
    │  { accessToken }         │      Rotar refresh token   │
    │◄─────────────────────────│                            │


 ┌──────────────────────────────────────────────────────────────────┐
 │                 ACCESO A RUTA PROTEGIDA                          │
 └──────────────────────────────────────────────────────────────────┘

  Cliente                    Backend
    │                          │
    │  GET /api/v1/courses     │
    │  Header: Bearer <token>  │
    │─────────────────────────►│
    │                          │
    │                   ┌──────▼──────┐
    │                   │ JwtAuthGuard │
    │                   │  (Global)    │
    │                   └──────┬──────┘
    │                          │
    │                   ┌──────▼──────┐
    │                   │ ¿@Public?   │── SI ──► Permitir acceso
    │                   └──────┬──────┘
    │                          │ NO
    │                   ┌──────▼──────┐
    │                   │ Verificar   │
    │                   │ JWT Token   │── INVÁLIDO ──► 401
    │                   └──────┬──────┘
    │                          │ VÁLIDO
    │                   ┌──────▼──────┐
    │                   │ RolesGuard  │
    │                   │ ¿@Roles?    │── NO AUTORIZADO ──► 403
    │                   └──────┬──────┘
    │                          │ OK
    │                   ┌──────▼──────┐
    │                   │ Controller  │
    │                   │ + Service   │
    │                   └──────┬──────┘
    │                          │
    │  { data, meta }          │
    │◄─────────────────────────│
```

### 📚 Flujo de Matriculación en Curso

```
  Estudiante                 Backend                  PostgreSQL
    │                          │                          │
    │  POST /enrollments       │                          │
    │  {courseId, userId}       │                          │
    │─────────────────────────►│                          │
    │                          │  ¿Curso existe y activo? │
    │                          │─────────────────────────►│
    │                          │◄─────────────────────────│
    │                          │                          │
    │                          │  ¿Ya matriculado?        │
    │                          │─────────────────────────►│
    │                          │◄──── SI: 409 Conflict ───│
    │                          │                          │
    │                          │  ¿Cupo disponible?       │
    │                          │  (maxStudents check)     │
    │                          │                          │
    │                          │  Crear enrollment        │
    │                          │  status: 'active'        │
    │                          │  progress: 0%            │
    │                          │─────────────────────────►│
    │                          │◄─── Enrollment creado ───│
    │                          │                          │
    │                          │  WebSocket: notificar    │
    │                          │  al profesor del curso   │
    │  { enrollment }          │                          │
    │◄─────────────────────────│                          │
    │                          │                          │
    │  SweetAlert2 Toast ✅    │                          │
    │  "Matriculado con éxito" │                          │


 ┌──────────────────────────────────────────────────────────────────┐
 │              PROGRESO DEL ESTUDIANTE                             │
 └──────────────────────────────────────────────────────────────────┘

  Estudiante completa actividades ──► Se recalcula % progreso
                                      │
     ┌────────────────────────────────┘
     │
     ▼
  ┌───────────────────────────────────────────────────┐
  │  totalActivities = curso.activities.count()        │
  │  completedActivities = grades con status 'graded'  │
  │  progress = (completed / total) * 100              │
  │                                                    │
  │  if (progress === 100) {                           │
  │    enrollment.completedAt = new Date()              │
  │    enrollment.status = 'completed'                 │
  │    ──► Emitir evento: COURSE_COMPLETED             │
  │    ──► Generar certificado (Bull Queue)            │
  │  }                                                 │
  └───────────────────────────────────────────────────┘
```

### 📝 Flujo de Entrega y Calificación de Actividades

```
  Estudiante               Backend                  Profesor
    │                        │                        │
    │  Accede a actividad    │                        │
    │  GET /activities/:id   │                        │
    │───────────────────────►│                        │
    │◄── {activity, rubric}──│                        │
    │                        │                        │
    │  Sube entrega          │                        │
    │  POST /files/upload    │                        │
    │  (multipart/form-data) │                        │
    │───────────────────────►│                        │
    │                        │  Validar tipo/tamaño   │
    │                        │  SHA-256 deduplicación  │
    │                        │  Guardar en disco       │
    │◄── {fileId, url} ─────│                        │
    │                        │                        │
    │  Crear calificación    │                        │
    │  POST /grades          │                        │
    │  {activityId, fileId,  │                        │
    │   attempts: 1}         │                        │
    │───────────────────────►│                        │
    │                        │  Crear grade            │
    │                        │  status: 'submitted'    │
    │                        │                        │
    │                        │  ──► WebSocket ────────►│
    │                        │  "Nueva entrega         │
    │                        │   pendiente de revisar" │
    │                        │                        │
    │                        │                        │
    │                        │  Profesor califica      │
    │                        │◄───────────────────────│
    │                        │  PUT /grades/:id       │
    │                        │  {grade: 85,           │
    │                        │   feedback: "Buen      │
    │                        │   trabajo",            │
    │                        │   status: 'graded'}    │
    │                        │                        │
    │                        │  Actualizar progreso   │
    │                        │  del enrollment        │
    │  ◄── WebSocket ───────│                        │
    │  "Has recibido una     │                        │
    │   calificación: 85/100"│                        │
    │                        │                        │
    │  SweetAlert2 Toast 🎉  │                        │
```

### 💬 Flujo de Mensajería en Tiempo Real

```
  Usuario A                  Backend                  Usuario B
    │                          │                        │
    │  WebSocket Connect       │   WebSocket Connect    │
    │  ════════════════════════╪════════════════════════│
    │  socket.io handshake     │   socket.io handshake  │
    │  + JWT token             │   + JWT token          │
    │─────────────────────────►│◄───────────────────────│
    │                          │                        │
    │  POST /messages          │                        │
    │  {recipientId: B,        │                        │
    │   content: "Hola!"}      │                        │
    │─────────────────────────►│                        │
    │                          │  Guardar en PostgreSQL │
    │                          │  status: 'sent'        │
    │                          │                        │
    │                          │  WebSocket emit ──────►│
    │                          │  event: 'new_message'  │
    │                          │  {from: A, content}    │
    │                          │                        │
    │                          │                        │ Notificación
    │                          │                        │ en pantalla
    │                          │                        │
    │                          │  PUT /messages/:id/read│
    │                          │◄───────────────────────│
    │                          │  status: 'read'        │
    │  WebSocket emit ◄────────│                        │
    │  event: 'message_read'   │                        │
    │                          │                        │


 ┌──────────────────────────────────────────────────────────────────┐
 │              GATEWAY WebSocket (Socket.IO)                       │
 └──────────────────────────────────────────────────────────────────┘

                    ┌───────────────────┐
     Conexión ─────►│  handleConnection  │
     con JWT        │  - Verificar token │
                    │  - Unir a rooms:   │
                    │    user_{id}       │
                    │    course_{ids}    │
                    └───────────────────┘

     Eventos emitidos:
     ┌─────────────────────────────────────────────┐
     │  'new_message'        → Nuevo mensaje       │
     │  'message_read'       → Mensaje leído       │
     │  'new_notification'   → Notificación        │
     │  'grade_updated'      → Calificación nueva  │
     │  'course_update'      → Cambio en curso     │
     │  'enrollment_update'  → Cambio matrícula    │
     └─────────────────────────────────────────────┘
```

### 📁 Flujo de Subida de Archivos

```
  Cliente                    Backend                    Disco
    │                          │                          │
    │  POST /files/upload      │                          │
    │  Content-Type:           │                          │
    │  multipart/form-data     │                          │
    │  ┌──────────────────┐    │                          │
    │  │ archivo.pdf (5MB) │    │                          │
    │  └──────────────────┘    │                          │
    │─────────────────────────►│                          │
    │                          │                          │
    │                   ┌──────▼──────────────────┐       │
    │                   │ @fastify/multipart       │       │
    │                   │                          │       │
    │                   │ 1. Verificar tamaño      │       │
    │                   │    ≤ 50MB (configurable)  │       │
    │                   │                          │       │
    │                   │ 2. Verificar MIME type    │       │
    │                   │    whitelist             │       │
    │                   │                          │       │
    │                   │ 3. Generar hash SHA-256   │       │
    │                   │    ¿Ya existe? → reuse   │       │
    │                   │                          │       │
    │                   │ 4. Ruta:                 │       │
    │                   │    uploads/              │       │
    │                   │      2024/               │       │
    │                   │        01/               │       │
    │                   │          {uuid}.ext      │──────►│
    │                   │                          │       │
    │                   │ 5. Guardar metadata      │       │
    │                   │    en PostgreSQL          │       │
    │                   └──────────────────────────┘       │
    │                          │                          │
    │  { id, filename, url,    │                          │
    │    size, mimeType }      │                          │
    │◄─────────────────────────│                          │
```

### ⚡ Flujo de Alto Tráfico y Caché

```
 ┌──────────────────────────────────────────────────────────────────┐
 │              MANEJO DE ALTO TRÁFICO                              │
 └──────────────────────────────────────────────────────────────────┘

  1000+ requests/seg
        │
        ▼
 ┌─────────────────┐     ┌─────────────────┐
 │     NGINX        │     │    NGINX         │    (múltiples workers)
 │  Worker 1        │     │  Worker N        │
 │                  │     │                  │
 │  Rate Limit:     │     │  Rate Limit:     │
 │  ├─ API: 30r/s   │     │  ├─ API: 30r/s   │
 │  ├─ Auth: 5r/s   │     │  ├─ Auth: 5r/s   │
 │  └─ General:50r/s│     │  └─ General:50r/s│
 └────────┬────────┘     └────────┬────────┘
          │        least_conn      │
          └───────────┬────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   NestJS + Fastify     │
          │   ThrottlerGuard       │
          │   100 req / 60s / IP   │
          └───────────┬───────────┘
                      │
              ┌───────▼───────┐
              │  ¿En caché?    │
              │  (Redis)       │
              └──┬─────────┬──┘
                 │         │
               SI │       NO │
                 │         │
                 ▼         ▼
          ┌──────────┐  ┌──────────────┐
          │ Respuesta │  │  PostgreSQL   │
          │ inmediata │  │  Pool: 50     │
          │ (~1ms)    │  │  conexiones   │
          └──────────┘  └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Guardar en   │
                        │ Redis Cache  │
                        │ TTL: 1h      │
                        └──────────────┘


 ┌──────────────────────────────────────────────────────────────────┐
 │              BULL QUEUES - TAREAS EN BACKGROUND                  │
 └──────────────────────────────────────────────────────────────────┘

  Request pesada                    Bull Queue (Redis)
  (ej: enviar email)                     │
        │                                │
        ▼                                │
  ┌─────────────┐   addJob()    ┌────────▼────────┐
  │  Controller  │─────────────►│   Cola Redis     │
  │             │               │                  │
  │  Responde   │               │  ┌─── Job 1 ───┐│
  │  inmediato  │               │  ├─── Job 2 ───┤│
  │  202 Accepted│              │  ├─── Job 3 ───┤│
  └─────────────┘               │  └─── Job N ───┘│
                                └────────┬────────┘
                                         │
                                  ┌──────▼──────┐
                                  │  Worker      │
                                  │  Process     │
                                  │              │
                                  │  - Emails    │
                                  │  - Archivos  │
                                  │  - Reports   │
                                  │  - Backups   │
                                  └──────────────┘
```

### 🖥 Flujo del Frontend (Next.js App Router)

```
  Usuario navega a /dashboard/courses
        │
        ▼
  ┌─────────────────────────────┐
  │   Next.js Middleware         │
  │   (middleware.ts)            │
  │                              │
  │   ¿Token en cookies?         │
  │   ├── NO ──► Redirect /login │
  │   └── SI ──► Continuar       │
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │   Layout (dashboard)         │
  │   ┌──────────┬─────────────┐│
  │   │ Sidebar  │   Header    ││
  │   │          │             ││
  │   │ ─ Home   │  🔍 Search  ││
  │   │ ─ Cursos │  🔔 Notif   ││
  │   │ ─ Notas  │  🌙 Theme   ││
  │   │ ─ Calend │  👤 User    ││
  │   │ ─ Msgs   │             ││
  │   │          ├─────────────┤│
  │   │          │             ││
  │   │          │   Page      ││
  │   │          │  Component  ││
  │   │          │             ││
  │   └──────────┴─────────────┘│
  └─────────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │   React Query (useCourses)   │
  │                              │
  │   ¿Datos en caché?           │
  │   ├── SI ──► Mostrar datos   │
  │   │         + refetch en bg  │
  │   └── NO ──► Loading spinner │
  │              │               │
  │              ▼               │
  │   Axios GET /api/v1/courses  │
  │   ├── 200 ──► Mostrar cursos │
  │   ├── 401 ──► Refresh token  │
  │   │           └► Reintentar  │
  │   └── Error ─► SweetAlert2   │
  │                Toast error 🔴│
  └─────────────────────────────┘
```

### 🔄 Flujo Completo: Estudiante Usa la Plataforma

```
  ┌─────────────────────────────────────────────────────────┐
  │                  JOURNEY DEL ESTUDIANTE                   │
  └─────────────────────────────────────────────────────────┘

  1. REGISTRO           2. LOGIN             3. EXPLORAR
  ┌───────────┐        ┌───────────┐        ┌───────────────┐
  │ /register  │──OK──►│  /login    │──OK──►│  /dashboard    │
  │            │       │           │        │               │
  │ username   │       │ email     │        │ Mis cursos    │
  │ email      │       │ password  │        │ Progreso      │
  │ password   │       │           │        │ Próx. eventos │
  └───────────┘        └───────────┘        └───────┬───────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │               │               │
                                    ▼               ▼               ▼
                             4. MATRICULARSE  5. ESTUDIAR    6. COMUNICAR
                             ┌─────────────┐ ┌───────────┐ ┌───────────┐
                             │ /courses     │ │ /courses/ │ │ /messages  │
                             │              │ │   [id]    │ │           │
                             │ Catálogo     │ │           │ │ Chat con  │
                             │ Buscar       │ │ Temario   │ │ profesores│
                             │ Filtrar      │ │ Material  │ │ y alumnos │
                             │ Matricularse │ │ Tareas    │ │           │
                             └──────┬──────┘ └─────┬─────┘ └───────────┘
                                    │              │
                                    ▼              ▼
                             7. ENTREGAR     8. CALIFICACIÓN
                             ┌─────────────┐ ┌───────────────┐
                             │ Upload       │ │  /grades       │
                             │ archivo      │ │               │
                             │              │ │ Ver notas     │
                             │ Toast ✅     │ │ Promedio       │
                             │ "Enviado"    │ │ Feedback       │
                             └─────────────┘ │               │
                                             │ Toast 🎉      │
                                             │ "¡Aprobaste!" │
                                             └───────────────┘
```

---

## 🛠 Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Node.js** | 20 LTS | Runtime |
| **NestJS** | 10.x | Framework backend |
| **Fastify** | 4.x | Servidor HTTP de alto rendimiento |
| **TypeORM** | 0.3.x | ORM para PostgreSQL |
| **PostgreSQL** | 16 | Base de datos relacional |
| **Redis** | 7 | Caché, sesiones, colas |
| **Passport.js** | 0.7 | Estrategias de autenticación |
| **JWT** | - | Tokens de autenticación |
| **Bull** | 4.x | Colas de trabajo background |
| **Socket.IO** | 4.x | WebSockets tiempo real |
| **Swagger** | 7.x | Documentación API automática |
| **class-validator** | 0.14 | Validación de DTOs |
| **class-transformer** | 0.5 | Transformación de objetos |
| **bcrypt** | 5.x | Hash de contraseñas |
| **Sharp** | 0.33 | Procesamiento de imágenes |

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Next.js** | 14.x | Framework React SSR/SSG |
| **React** | 18.x | Librería UI |
| **TypeScript** | 5.x | Tipado estático |
| **TailwindCSS** | 3.4 | Estilos utility-first |
| **SweetAlert2** | 11.x | Notificaciones toast y diálogos |
| **Zustand** | 4.x | Estado global |
| **React Query** | 5.x | Data fetching y caché |
| **React Hook Form** | 7.x | Formularios performantes |
| **Zod** | 3.x | Validación de esquemas |
| **Framer Motion** | 11.x | Animaciones |
| **Lucide React** | 0.3 | Iconos SVG |
| **Chart.js** | 4.x | Gráficos y visualizaciones |
| **Socket.IO Client** | 4.x | WebSockets client |
| **next-themes** | 0.2 | Dark/Light mode |
| **Axios** | 1.6 | Cliente HTTP |
| **date-fns** | 3.x | Utilidades de fecha |

### DevOps / Infraestructura
| Tecnología | Propósito |
|-----------|-----------|
| **Docker** | Containerización |
| **Docker Compose** | Orquestación multi-container |
| **Nginx** | Reverse proxy, rate limiting, SSL |
| **GitHub Actions** | CI/CD (configurable) |

---

## 📦 Requisitos Previos

- **Node.js** ≥ 20.x LTS
- **npm** ≥ 10.x o **yarn** ≥ 1.22
- **PostgreSQL** ≥ 15 (o usar Docker)
- **Redis** ≥ 7 (o usar Docker)
- **Docker** y **Docker Compose** (recomendado para desarrollo)
- **Git**

---

## 🚀 Instalación

### Con Docker (Recomendado)

La forma más rápida de poner todo en marcha:

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/moodle-next.git
cd moodle-next

# 2. Copiar archivos de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Configurar secrets en .env
# Editar backend/.env y cambiar JWT_SECRET y JWT_REFRESH_SECRET

# 4. Levantar todos los servicios
docker-compose up -d

# 5. Verificar que todo está corriendo
docker-compose ps

# 6. Ver logs
docker-compose logs -f
```

**Servicios disponibles:**
| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api/docs |
| Health Check | http://localhost:4000/api/v1/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Nginx | http://localhost:80 |

### Instalación Manual

#### 1. Base de datos PostgreSQL

```bash
# Crear la base de datos
psql -U postgres -c "CREATE USER moodlenext WITH PASSWORD 'moodlenext_secret_2024';"
psql -U postgres -c "CREATE DATABASE moodlenext OWNER moodlenext;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE moodlenext TO moodlenext;"

# Extensiones (ejecutar dentro de la BD moodlenext)
psql -U postgres -d moodlenext -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -U postgres -d moodlenext -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
```

#### 2. Redis

```bash
# Instalar Redis (Windows con chocolatey)
choco install redis

# O usar Docker solo para Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### 3. Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Copiar configuración de entorno
cp .env.example .env

# Editar .env con tus credenciales
# IMPORTANTE: Cambiar JWT_SECRET y JWT_REFRESH_SECRET

# Ejecutar migraciones (primera vez)
npm run migration:run

# Iniciar en modo desarrollo
npm run start:dev
```

#### 4. Frontend

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Copiar configuración de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

---

## ⚙️ Configuración

### Variables de Entorno del Backend (`.env`)

```env
# Aplicación
APP_NAME=MoodleNext
APP_PORT=4000
APP_ENV=development                    # development | production
APP_FRONTEND_URL=http://localhost:3000
APP_CORS_ORIGINS=http://localhost:3000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=moodlenext
DB_PASSWORD=moodlenext_secret_2024
DB_DATABASE=moodlenext
DB_SYNCHRONIZE=false                   # NUNCA true en producción
DB_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600                         # TTL de caché en segundos

# JWT (¡CAMBIAR en producción!)
JWT_SECRET=tu-clave-secreta-minimo-32-caracteres
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=tu-clave-refresh-secreta-minimo-32-caracteres
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
THROTTLE_TTL=60                        # Ventana en segundos
THROTTLE_LIMIT=100                     # Máximo de requests por ventana

# Upload
UPLOAD_MAX_SIZE=52428800               # 50MB en bytes
```

### Variables de Entorno del Frontend (`.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=MoodleNext
```

---

## 📂 Estructura del Proyecto

```
moodle-next/
├── 📁 backend/                        # API NestJS + Fastify
│   ├── 📁 src/
│   │   ├── 📁 common/                # Utilidades compartidas
│   │   │   ├── 📁 decorators/        # @Public, @Roles, @CurrentUser
│   │   │   ├── 📁 dto/               # PaginationDto
│   │   │   ├── 📁 entities/          # BaseEntity (UUID, timestamps, soft delete)
│   │   │   ├── 📁 filters/           # AllExceptionsFilter
│   │   │   ├── 📁 guards/            # RolesGuard
│   │   │   ├── 📁 interceptors/      # TransformInterceptor, TimeoutInterceptor
│   │   │   └── 📁 logger/            # StructuredLogger (JSON prod / text dev)
│   │   ├── 📁 config/                # DataSource TypeORM
│   │   ├── 📁 database/
│   │   │   ├── 📁 migrations/         # TypeORM migrations
│   │   │   └── 📁 seeds/             # run-seed.ts (roles, admin, categories)
│   │   ├── 📁 modules/
│   │   │   ├── 📁 auth/              # JWT Login, Register, Refresh, Logout
│   │   │   │   ├── 📁 dto/           # LoginDto, RefreshTokenDto, ForgotPasswordDto,
│   │   │   │   │                      # ResetPasswordDto, ChangePasswordDto, VerifyEmailDto
│   │   │   │   ├── 📁 guards/        # JwtAuthGuard (global)
│   │   │   │   ├── 📁 services/      # LoginThrottleService
│   │   │   │   └── 📁 strategies/    # JwtStrategy, JwtRefreshStrategy
│   │   │   ├── 📁 users/             # CRUD usuarios, asignación de roles
│   │   │   ├── 📁 roles/             # Roles del sistema (7 tipos) + auto-seed
│   │   │   ├── 📁 courses/           # CRUD cursos, estadísticas
│   │   │   │   └── 📁 dto/           # CreateCourseDto, UpdateCourseDto
│   │   │   ├── 📁 categories/        # Categorías jerárquicas (árbol)
│   │   │   │   └── 📁 dto/           # CreateCategoryDto, UpdateCategoryDto
│   │   │   ├── 📁 enrollments/       # Matriculación, progreso
│   │   │   │   └── 📁 dto/           # CreateEnrollmentDto, UpdateEnrollmentDto
│   │   │   ├── 📁 activities/        # 18+ tipos de actividad
│   │   │   │   └── 📁 dto/           # CreateActivityDto, UpdateActivityDto
│   │   │   ├── 📁 grades/            # Calificaciones, promedios
│   │   │   │   └── 📁 dto/           # CreateGradeDto, UpdateGradeDto, GradeSubmissionDto
│   │   │   ├── 📁 calendar/          # Eventos, recurrencia
│   │   │   │   └── 📁 dto/           # CreateCalendarEventDto, UpdateCalendarEventDto
│   │   │   ├── 📁 messages/          # Mensajería directa
│   │   │   │   └── 📁 dto/           # CreateMessageDto
│   │   │   ├── 📁 files/             # Upload/download archivos
│   │   │   ├── 📁 dashboard/         # Stats, recent courses, upcoming events, admin stats
│   │   │   ├── 📁 notifications/     # WebSocket Gateway + REST API + Entity
│   │   │   └── 📁 health/            # Health checks (DB, disk, memory)
│   │   ├── app.module.ts             # Módulo raíz (Joi env validation)
│   │   └── main.ts                   # Bootstrap con Fastify + StructuredLogger
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 frontend/                       # Next.js 14 App Router
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 (auth)/            # Login, Register
│   │   │   ├── 📁 (dashboard)/       # Dashboard, Courses, Calendar, etc.
│   │   │   │   ├── 📁 admin/         # Panel de administración
│   │   │   │   ├── 📁 calendar/      # Calendario
│   │   │   │   ├── 📁 courses/       # Lista y detalle de cursos
│   │   │   │   ├── 📁 dashboard/     # Dashboard principal
│   │   │   │   ├── 📁 grades/        # Calificaciones
│   │   │   │   ├── 📁 messages/      # Mensajería
│   │   │   │   ├── 📁 notifications/ # Lista de notificaciones con filtros
│   │   │   │   └── 📁 profile/       # Perfil de usuario + cambio de contraseña
│   │   │   ├── error.tsx             # Error boundary global
│   │   │   ├── not-found.tsx         # Página 404
│   │   │   ├── layout.tsx            # Layout raíz
│   │   │   ├── page.tsx              # Landing page
│   │   │   └── providers.tsx         # React Query + Theme providers
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/            # Sidebar, Header, NotificationCenter
│   │   │   ├── 📁 courses/           # CourseCard
│   │   │   └── 📁 ui/               # Button, Input, Card, Modal, Badge,
│   │   │                              # Avatar, Pagination, DataTable,
│   │   │                              # ProgressBar, LoadingSpinner, EmptyState
│   │   ├── 📁 hooks/                 # useAuth, useCourses, useDebounce, useSocket
│   │   ├── 📁 lib/                   # api.ts, swal.ts, utils.ts
│   │   ├── 📁 store/                 # Zustand stores (auth)
│   │   ├── 📁 styles/                # globals.css (Tailwind)
│   │   ├── 📁 types/                 # TypeScript interfaces
│   │   └── middleware.ts             # Auth middleware
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 docker/
│   ├── 📁 nginx/                     # Configuración Nginx
│   │   └── nginx.conf
│   └── 📁 postgres/                  # Script de inicialización
│       └── init.sql
│
├── docker-compose.yml                 # Orquestación de servicios
├── Dockerfile                         # Multi-stage build
├── .gitignore
└── README.md                          # Este archivo
```

---

## 📖 API Documentation

La documentación interactiva de la API está disponible automáticamente gracias a **Swagger**:

- **Local:** http://localhost:4000/api/docs
- **Producción:** https://tu-dominio.com/api/docs

### Principales Endpoints

#### 🔐 Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Registro de usuario |
| `POST` | `/api/v1/auth/login` | Iniciar sesión |
| `POST` | `/api/v1/auth/refresh` | Refrescar access token |
| `POST` | `/api/v1/auth/logout` | Cerrar sesión |
| `GET` | `/api/v1/auth/me` | Usuario actual |
| `POST` | `/api/v1/auth/forgot-password` | Solicitar reset de contraseña |
| `POST` | `/api/v1/auth/reset-password` | Resetear contraseña con token |
| `POST` | `/api/v1/auth/change-password` | Cambiar contraseña (autenticado) |
| `POST` | `/api/v1/auth/verify-email` | Verificar email con token |
| `POST` | `/api/v1/auth/resend-verification` | Reenviar verificación de email |

#### 👥 Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/users` | Listar usuarios (paginado) |
| `GET` | `/api/v1/users/me` | Perfil actual |
| `GET` | `/api/v1/users/:id` | Detalle de usuario |
| `PUT` | `/api/v1/users/:id` | Actualizar usuario |
| `DELETE` | `/api/v1/users/:id` | Eliminar usuario |
| `POST` | `/api/v1/users/:id/roles/:role` | Asignar rol |

#### 📚 Cursos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/courses` | Listar cursos |
| `POST` | `/api/v1/courses` | Crear curso |
| `GET` | `/api/v1/courses/:id` | Detalle de curso |
| `PUT` | `/api/v1/courses/:id` | Actualizar curso |
| `DELETE` | `/api/v1/courses/:id` | Eliminar curso |
| `GET` | `/api/v1/courses/:id/activities` | Actividades del curso |
| `GET` | `/api/v1/courses/:id/students` | Estudiantes del curso |

#### � Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/stats` | Estadísticas del usuario actual |
| `GET` | `/api/v1/dashboard/recent-courses` | Cursos recientes del usuario |
| `GET` | `/api/v1/dashboard/upcoming-events` | Próximos eventos |
| `GET` | `/api/v1/dashboard/admin/stats` | Estadísticas globales (Admin/Manager) |

#### 🔔 Notificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/notifications` | Listar notificaciones del usuario |
| `GET` | `/api/v1/notifications/unread-count` | Contar notificaciones no leídas |
| `PUT` | `/api/v1/notifications/:id/read` | Marcar notificación como leída |
| `PUT` | `/api/v1/notifications/read-all` | Marcar todas como leídas |
| `DELETE` | `/api/v1/notifications/:id` | Eliminar notificación |

#### �📝 Actividades, 📊 Calificaciones, 📅 Calendario, 💬 Mensajes
*Ver Swagger para la documentación completa de todos los endpoints.*

---

## ⚡ Soporte de Alto Tráfico

MoodleNext está diseñado para manejar alto tráfico con las siguientes optimizaciones:

### Servidor HTTP
- **Fastify** en lugar de Express (2-3x más rápido en benchmarks)
- Compresión gzip/deflate automática
- Trust proxy habilitado para infraestructura de producción

### Base de Datos
- **Connection Pooling**: 5 mín, 50 máx conexiones simultáneas
- Idle timeout de 30 segundos
- Connection timeout de 5 segundos
- Índices en campos de búsqueda frecuente (username, email, courseId, etc.)
- Extensión `pg_trgm` para búsqueda fuzzy eficiente
- PostgreSQL optimizado para alto rendimiento (shared_buffers, work_mem, etc.)

### Caché
- **Redis** como capa de caché (TTL configurable)
- Caché de hasta 1000 entradas en memoria
- Invalidación inteligente de caché con React Query (frontend)

### Rate Limiting
- **Global**: 100 requests / 60 segundos por IP
- **Auth endpoints**: 5 requests / 60 segundos (protección contra brute force)
- **Nginx**: rate limiting adicional por zona
- Connection limiting por IP (100 conexiones simultáneas)

### Background Jobs
- **Bull queues** con Redis para tareas pesadas
- Envío de emails en background
- Procesamiento de archivos asíncrono
- Tareas programadas con @nestjs/schedule

### Nginx
- Reverse proxy con `least_conn` load balancing
- Caché de assets estáticos (30 días)
- Keepalive connections (32 por upstream)
- Worker processes auto-escalados
- 65535 worker connections

### Escalabilidad
- Arquitectura stateless (escala horizontal con load balancer)
- Redis compartido entre instancias
- PostgreSQL con réplicas de lectura (configurable)

---

## 📦 Extensiones y Paquetes Instalados

### Backend - Dependencias Principales (38 paquetes)

| Paquete | Propósito |
|---------|-----------|
| `@nestjs/core` + `common` + `config` | Framework NestJS core |
| `@nestjs/platform-fastify` | Adaptador Fastify |
| `@nestjs/typeorm` + `typeorm` + `pg` | ORM + Driver PostgreSQL |
| `@nestjs/jwt` + `@nestjs/passport` | Autenticación JWT |
| `passport` + `passport-jwt` + `passport-local` | Estrategias de auth |
| `@nestjs/swagger` | Documentación API automática |
| `@nestjs/throttler` | Rate limiting |
| `@nestjs/cache-manager` + `cache-manager-redis-yet` | Caché Redis |
| `@nestjs/bull` + `bull` + `ioredis` | Colas de trabajo |
| `@nestjs/schedule` | Tareas programadas (cron) |
| `@nestjs/terminus` | Health checks |
| `@nestjs/websockets` + `@nestjs/platform-socket.io` | WebSockets |
| `@fastify/compress` | Compresión gzip/deflate |
| `@fastify/helmet` | Headers de seguridad |
| `@fastify/cors` | Cross-Origin Resource Sharing |
| `@fastify/cookie` | Cookies |
| `@fastify/multipart` | Upload de archivos |
| `@fastify/rate-limit` | Rate limiting nativo Fastify |
| `@fastify/static` | Servir archivos estáticos |
| `bcrypt` | Hash de contraseñas |
| `class-validator` + `class-transformer` | Validación y transformación |
| `joi` | Validación de variables de entorno |
| `sharp` | Procesamiento de imágenes |
| `uuid` | Generación de UUIDs |
| `nestjs-cls` | Context-local storage |

### Backend - DevDependencies (17 paquetes)

| Paquete | Propósito |
|---------|-----------|
| `@nestjs/cli` | CLI de NestJS |
| `@nestjs/testing` | Testing utilities |
| `jest` + `ts-jest` | Framework de testing |
| `supertest` | Testing de endpoints HTTP |
| `eslint` + `prettier` | Linting y formateo |
| `typescript` | Compilador TypeScript |
| `ts-node` | Ejecución directa de TS |

### Frontend - Dependencias Principales (26 paquetes)

| Paquete | Propósito |
|---------|-----------|
| `next` | Framework React SSR/SSG |
| `react` + `react-dom` | Librería UI |
| `axios` | Cliente HTTP con interceptores |
| `sweetalert2` + `sweetalert2-react-content` | Toasts y diálogos |
| `@tanstack/react-query` | Data fetching y caché |
| `zustand` | Estado global |
| `react-hook-form` + `@hookform/resolvers` | Formularios |
| `zod` | Validación de esquemas |
| `framer-motion` | Animaciones |
| `lucide-react` | Iconos |
| `tailwind-merge` + `clsx` | Utilidades CSS |
| `next-themes` | Dark/Light mode |
| `chart.js` + `react-chartjs-2` | Gráficos |
| `socket.io-client` | WebSockets client |
| `js-cookie` + `jwt-decode` | Gestión de tokens |
| `date-fns` | Utilidades de fecha |
| `react-calendar` | Componente calendario |
| `react-dropzone` | Drag & drop upload |
| `react-markdown` | Renderizado Markdown |
| `@headlessui/react` | Componentes accesibles |
| `@heroicons/react` | Iconos adicionales |

### Frontend - DevDependencies (9 paquetes)

| Paquete | Propósito |
|---------|-----------|
| `typescript` | Compilador TypeScript |
| `tailwindcss` + `autoprefixer` + `postcss` | Estilos |
| `eslint` + `eslint-config-next` | Linting |
| `@types/*` | Type definitions |

---

## 📜 Scripts Disponibles

### Backend (`cd backend`)

```bash
npm run start:dev       # Desarrollo con hot-reload
npm run start:prod      # Producción
npm run build           # Compilar TypeScript
npm run lint            # Linting
npm run format          # Formatear código
npm run test            # Tests unitarios
npm run test:e2e        # Tests end-to-end
npm run test:cov        # Coverage
npm run migration:generate  # Generar migración
npm run migration:run       # Ejecutar migraciones
npm run migration:revert    # Revertir última migración
npm run seed            # Seed de datos iniciales
```

### Frontend (`cd frontend`)

```bash
npm run dev             # Desarrollo (localhost:3000)
npm run build           # Build de producción
npm run start           # Servidor de producción
npm run lint            # Linting
npm run type-check      # Verificación de tipos
```

### Docker

```bash
docker-compose up -d              # Levantar todos los servicios
docker-compose down               # Detener servicios
docker-compose logs -f backend    # Ver logs del backend
docker-compose logs -f frontend   # Ver logs del frontend
docker-compose restart backend    # Reiniciar backend
docker-compose exec postgres psql -U moodlenext  # Acceder a PostgreSQL
docker-compose exec redis redis-cli               # Acceder a Redis
```

---

## � Seguridad Avanzada

MoodleNext implementa múltiples capas de seguridad:

### Protección contra Ataques
| Amenaza | Mitigación |
|---------|------------|
| **SQL Injection** | Query sanitizer con whitelist de campos permitidos para ordenamiento |
| **Brute Force** | Login throttle con bloqueo temporal (5 intentos, lockout 5 min) |
| **XSS** | Helmet CSP en producción, `forbidNonWhitelisted` en ValidationPipe |
| **DDoS** | Rate limiting dual (Nginx + NestJS Throttler) + connection limiting |
| **File Upload Attacks** | Validación de magic bytes, extensión, tamaño y MIME type |
| **Token Theft** | Access token corto (15m), refresh rotado, hash bcrypt de tokens almacenados |
| **Email Enumeration** | `forgot-password` siempre retorna el mismo mensaje |
| **Unauthorized WebSocket** | JWT verificado en `handleConnection`, desconexión inmediata si inválido |

### Validación de Entorno

Al arrancar, el backend valida todas las variables de entorno con **Joi**:
- `JWT_SECRET` y `JWT_REFRESH_SECRET` requieren mínimo 32 caracteres
- `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` son requeridos
- `APP_ENV` solo acepta `development`, `production` o `test`
- Valores por defecto seguros para configuraciones opcionales
- Falla al arrancar si la validación no pasa (`abortEarly: false` para reportar todos los errores)

### Logger Estructurado

- **Producción**: JSON a stdout (compatible con ELK, CloudWatch, Datadog)
- **Desarrollo**: Texto legible con colores (NestJS default)
- Niveles configurados por entorno: `error`, `warn`, `log` en prod; todos en dev

---

## 🧪 Testing

El proyecto incluye tests unitarios para los módulos críticos:

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests e2e
npm run test:e2e
```

### Tests incluidos

| Módulo | Archivo | Cobertura |
|--------|---------|----------|
| **Auth** | `auth.service.spec.ts` | login (credenciales válidas/inválidas, lockout), changePassword, verifyEmail |
| **Courses** | `courses.service.spec.ts` | findById, create, findAll (paginación), remove (soft delete) |
| **Dashboard** | `dashboard.service.spec.ts` | getStats, getRecentCourses, getUpcomingEvents |

---

## 🌱 Database Seeding

El proyecto incluye un seed script que inicializa datos necesarios:

```bash
# Ejecutar seed (desde backend/)
npm run seed
```

El seed crea:
- **7 roles** del sistema: Admin, Manager, Course Creator, Teacher, Teaching Assistant, Student, Guest
- **Usuario administrador**: `admin` / `Admin@1234`
- **5 categorías** por defecto: Computer Science, Mathematics, Languages, Sciences, Humanities

Adicionalmente, los roles se re-seedean automáticamente en cada arranque de la aplicación via `OnApplicationBootstrap` en el `RolesModule`.

---

## �📱 Migración a React Native

Este proyecto está **diseñado desde el inicio** para facilitar la migración a React Native:

### ¿Qué se reutiliza directamente?

| Elemento | Reutilizable | Notas |
|----------|:---:|-------|
| Backend completo | ✅ 100% | La API REST es la misma |
| Types/Interfaces | ✅ 100% | `src/types/index.ts` |
| Store (Zustand) | ✅ 100% | Funciona en React Native |
| API Client | ✅ 95% | Cambiar cookie por AsyncStorage |
| Hooks | ✅ 90% | React Query funciona en RN |
| Business Logic | ✅ 100% | Misma lógica |
| Components UI | ❌ 0% | Reescribir con React Native components |
| Routing | ❌ 0% | Usar React Navigation |

### Pasos para migrar al Frontend React Native:

1. **Crear proyecto RN** con Expo o React Native CLI
2. **Copiar**: `types/`, `store/`, `hooks/`, `lib/api.ts`
3. **Adaptar** `api.ts`: reemplazar `js-cookie` por `AsyncStorage`
4. **Reescribir UI** con componentes nativos (`View`, `Text`, `ScrollView`)
5. **Reemplazar SweetAlert2** con `react-native-toast-message`
6. **Reemplazar routing** con `@react-navigation/native`
7. **Adaptar Calendar** con `react-native-calendars`

El backend **no necesita ningún cambio** - la misma API sirve tanto al frontend web como a la app móvil.

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commits convencionales: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir un Pull Request

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no funcionales)
refactor: refactorización de código
test: agregar o modificar tests
chore: cambios en build/herramientas
perf: mejora de rendimiento
```

---

## 📄 Licencia

Este proyecto está bajo la licencia **GPL-3.0** - ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ usando NestJS, Next.js y TypeScript**

⭐ Si te resulta útil, dale una estrella al repositorio ⭐

</div>
