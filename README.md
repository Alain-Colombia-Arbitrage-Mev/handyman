# Handyman - App de Búsqueda de Trabajo y Oportunidades

Una aplicación móvil de hiperlocalización desarrollada con React Native y Expo que conecta profesionales con clientes para servicios de reparación, mantenimiento y oportunidades laborales en tiempo real.

## 🌟 Características Principales

- 🔍 **Búsqueda geolocalizada** de trabajos y oportunidades
- 📢 **Publicación de ofertas** laborales y servicios
- 🔔 **Notificaciones push en tiempo real** con Firebase
- 🗺️ **Integración con Google Maps Places API**
- ⚡ **Backend con Convex** para datos en tiempo real
- 📍 **Sistema de hiperlocalización** preciso

*Basado en el diseño original disponible en: https://www.figma.com/design/3dL9916F3ttFyJ5fju3sAO/Handyman-Auction-Mobile-App*

## Características

- 🔨 Navegación por pestañas intuitiva
- 🔍 Búsqueda avanzada de trabajos y profesionales
- 💬 Sistema de mensajería integrado
- 👤 Perfiles de usuario personalizables
- 🌟 Sistema de calificaciones y reseñas
- 📱 Compatible con iOS, Android y Web
- 🌍 Soporte multiidioma (Español, Inglés, Portugués)

## Tecnologías Utilizadas

### Frontend
- **React Native** 0.74.5
- **Expo** ~51.0.28 (SDK 51 con nuevas funcionalidades)
- **Expo Router** ~3.5.23 (navegación basada en archivos)
- **TypeScript** 5.6+ para tipado estático estricto
- **React Native Reanimated** 3.15+ para animaciones de alto rendimiento
- **Expo Linear Gradient** para gradientes avanzados
- **React Query/TanStack Query** para gestión de estado del servidor
- **Zustand** para gestión de estado global

### Backend & Servicios
- **Google Cloud Functions** v6 (2nd Generation)
- **Firebase Functions** v6.0+ con Node.js 20
- **Convex** para base de datos en tiempo real
- **Express.js** 5.x con middleware modernos
- **TypeScript** 5.9 con características avanzadas
- **Socket.io** para comunicación en tiempo real
- **Redis** para caché y sesiones
- **Stripe** para pagos seguros

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 20 o superior - recomendado v22+)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

**En Windows (usar PowerShell como administrador):**
```powershell
npm install -g @expo/cli
```

**En macOS/Linux:**
```bash
npm install -g @expo/cli
```

## Instalación

1. **Instala las dependencias**
   
   **En Windows (PowerShell):**
   ```powershell
   npm install
   # o
   yarn install
   ```
   
   **En macOS/Linux:**
   ```bash
   npm install
   # o
   yarn install
   ```

2. **Inicia el proyecto**
   
   **En Windows (PowerShell):**
   ```powershell
   npm start
   # o
   yarn start
   ```
   
   **En macOS/Linux:**
   ```bash
   npm start
   # o
   yarn start
   ```

## Scripts Disponibles

**En Windows (PowerShell):**
- `npm start` - Inicia el servidor de desarrollo de Expo
- `npm run android` - Ejecuta la app en un dispositivo/emulador Android
- `npm run web` - Ejecuta la app en el navegador web
- Para iOS necesitarás macOS

**En macOS/Linux:**
- `npm start` - Inicia el servidor de desarrollo de Expo
- `npm run android` - Ejecuta la app en un dispositivo/emulador Android
- `npm run ios` - Ejecuta la app en un dispositivo/simulador iOS
- `npm run web` - Ejecuta la app en el navegador web

## Estructura del Proyecto

```
handyman-auction-mobile-app/
├── app/                     # Rutas de Expo Router (File-based routing)
│   ├── (tabs)/             # Grupo de pestañas principales
│   │   ├── _layout.tsx     # Layout de las pestañas
│   │   ├── index.tsx       # Pantalla de inicio/feed
│   │   ├── search.tsx      # Pantalla de búsqueda avanzada
│   │   ├── messages.tsx    # Pantalla de mensajes en tiempo real
│   │   ├── profile.tsx     # Pantalla de perfil
│   │   ├── post.tsx        # Publicar trabajos
│   │   └── radar.tsx       # Vista de radar/mapa
│   ├── profile/            # Rutas anidadas de perfil
│   ├── _layout.tsx         # Layout raíz con providers
│   └── index.tsx           # Splash screen mejorado
├── src/
│   ├── components/         # Componentes reutilizables (2024)
│   │   ├── SplashScreen.tsx
│   │   ├── JobCard.tsx
│   │   ├── OptimizedLogo.tsx
│   │   ├── UniversalLogo.tsx
│   │   └── PublishOptionsModal.tsx
│   ├── providers/          # Context providers modernos
│   │   └── LanguageProvider.tsx
│   ├── screens/            # Pantallas específicas
│   ├── hooks/              # Custom hooks con React Query
│   ├── services/           # Servicios API y networking
│   │   └── socketService.ts # Real-time communication
│   ├── types/              # Definiciones de TypeScript
│   ├── utils/              # Utilidades y helpers
│   └── constants/          # Constantes de la aplicación
├── google-functions/       # Backend serverless (2024)
│   ├── src/
│   │   ├── functions/      # Google Cloud Functions
│   │   │   └── auth.ts     # Autenticación JWT
│   │   ├── services/       # Servicios backend
│   │   │   ├── auth.service.ts
│   │   │   ├── payment.service.ts
│   │   │   └── notification.service.ts
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── utils/          # Utilidades backend
│   │   │   ├── logger.ts   # Logging estructurado
│   │   │   ├── config.ts   # Configuración
│   │   │   ├── errors.ts   # Manejo de errores
│   │   │   └── validation.ts # Validación con Joi/Zod
│   │   └── types/          # Tipos compartidos
│   ├── package.json        # Dependencias Node.js 20
│   ├── tsconfig.json       # TypeScript 5.9 config
│   └── firebase.json       # Firebase Functions v6
├── convex/                 # Backend en tiempo real
│   ├── schema.ts           # Esquema de base de datos
│   ├── auth.ts             # Funciones de autenticación
│   ├── profiles.ts         # Gestión de perfiles
│   ├── payments.ts         # Sistema de pagos
│   ├── reviews.ts          # Sistema de reseñas
│   ├── help.ts             # Sistema de ayuda
│   └── storage.ts          # Gestión de archivos
├── assets/                 # Recursos optimizados
├── .github/workflows/      # CI/CD con GitHub Actions
├── app.json               # Configuración de Expo SDK 51
├── package.json           # Dependencias 2024
├── tsconfig.json          # TypeScript 5.6+ config
├── metro.config.js        # Metro bundler optimizado
└── babel.config.js        # Babel con plugins modernos
```

## Troubleshooting - Problemas Específicos de Windows

### Problemas Comunes en Windows

1. **Error de permisos al instalar Expo CLI**
   ```powershell
   # Ejecutar PowerShell como Administrador
   npm install -g @expo/cli
   
   # Si persiste el error, usar:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Error "execution of scripts is disabled"**
   ```powershell
   # En PowerShell como Administrador:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
   ```

3. **Problemas con node_modules en Windows**
   ```powershell
   # Limpiar caché y reinstalar
   npm cache clean --force
   Remove-Item node_modules -Recurse -Force
   Remove-Item package-lock.json -Force
   npm install
   ```

4. **Error de metro bundler**
   ```powershell
   # Limpiar caché de Metro
   npx expo start --clear
   # o
   npx react-native start --reset-cache
   ```

5. **Problemas con paths largos en Windows**
   ```powershell
   # Habilitar paths largos en Windows
   # En PowerShell como Administrador:
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

### Herramientas Recomendadas para Windows

- **Windows Terminal** - Terminal moderna con soporte para PowerShell
- **Android Studio** - Para desarrollo Android y emuladores
- **Expo Go** - App móvil para probar la aplicación
- **Git for Windows** - Si necesitas control de versiones

### Comandos Útiles para Desarrollo

```powershell
# Verificar versiones instaladas
node --version
npm --version
npx expo --version

# Limpiar todo y reinstalar
Remove-Item node_modules, package-lock.json -Recurse -Force; npm install

# Iniciar con modo de depuración
npx expo start --dev-client --clear

# Ver dispositivos Android conectados
adb devices
```

## Configuración de EAS (Expo Application Services)

### 1. Instalar EAS CLI

```powershell
npm install --global eas-cli
```

### 2. Hacer login en tu cuenta de Expo

```powershell
eas login
```

### 3. Inicializar el proyecto EAS

```powershell
eas init --id 9d4febab-156f-418e-87df-e3ac718b6dc5
```

### 4. Configurar builds (opcional)

```powershell
# Crear configuración de build
eas build:configure

# Hacer build para Android
eas build --platform android

# Hacer build para iOS (requiere macOS)
eas build --platform ios
```

### 5. Subir a Expo Go para testing

```powershell
# Publicar actualización
eas update

# Ver el proyecto en Expo Go
npx expo start --tunnel
```

## CI/CD con GitHub Actions

El proyecto incluye un workflow de GitHub Actions para automatizar los builds de producción:

### Archivo de Workflow

📁 `.github/workflows/create-production-builds.yml`

```yaml
name: Create Production Builds

jobs:
  build_android:
    type: build # This job type creates a production build for Android
    params:
      platform: android
  build_ios:
    type: build # This job type creates a production build for iOS
    params:
      platform: ios
```

### Cómo funciona

1. **Trigger automático**: El workflow se ejecuta según las condiciones que configures
2. **Build Android**: Crea automáticamente un APK/AAB para Google Play Store
3. **Build iOS**: Crea automáticamente un IPA para App Store (requiere certificados)

### Configuración adicional requerida

Para que funcione completamente, necesitarás:

1. **Secrets en GitHub**:
   - `EXPO_TOKEN` - Token de tu cuenta Expo
   - Certificados iOS (si aplica)

2. **Configurar EAS Build**:
   ```powershell
   eas build:configure
   ```

### Ejecutar Workflow Manualmente

Para ejecutar el workflow de producción directamente desde la línea de comandos:

```powershell
npx eas-cli@latest workflow:run create-production-builds.yml
```

Este comando te permitirá:
- ⚡ **Ejecutar builds inmediatamente** sin esperar triggers automáticos
- 🔄 **Probar el workflow** antes de hacer commit al repositorio  
- 🚀 **Crear builds de emergencia** cuando necesites una release rápida

## 🚀 Integraciones Implementadas (2024)

### Backend y Base de Datos
- [x] **Convex Backend** - Base de datos en tiempo real configurado
  - Proyecto: `terrific-starling-996`
  - Team: `guard-colombia`
  - URL: https://terrific-starling-996.convex.cloud
  - HTTP Actions: https://terrific-starling-996.convex.site
- [x] **Google Cloud Functions** - Serverless backend con Firebase Functions v6
- [x] **Firebase Authentication** - Autenticación JWT moderna
- [x] **Firebase Cloud Messaging** - Notificaciones push
- [x] **Redis Cache** - Sistema de caché distribuido
- [x] **Rate Limiting** - Protección contra spam y abuso

### Geolocalización y Mapas  
- [ ] **Google Maps Places API** - Búsqueda de lugares
- [ ] **Google Maps SDK** - Visualización de mapas
- [ ] **Geolocation API** - Ubicación del usuario
- [ ] **Sistema de hiperlocalización** - Búsquedas por proximidad

### Funcionalidades Avanzadas (2024)
- [x] **Chat en tiempo real** - Socket.io + Convex para mensajería híbrida
- [x] **Subida de imágenes** - Google Cloud Storage con optimización automática
- [x] **Sistema de calificaciones** - Esquema de reviews en Convex
- [x] **Notificaciones push personalizadas** - FCM con targeting avanzado
- [x] **Modo oscuro** - Soporte nativo con persistencia
- [x] **Sistema de matching** - Algoritmos de búsqueda hiperlocalizada con ML
- [x] **Pagos seguros** - Stripe con SCA compliance
- [x] **Documentos verificados** - Google Vision API para validación
- [x] **Monitoreo avanzado** - Logging estructurado y métricas
- [x] **Seguridad avanzada** - Helmet.js, CORS configurado, rate limiting

## 🗄️ Esquema de Base de Datos (Convex)

### Tablas Principales
- **`users`** - Usuarios (clientes y profesionales)
- **`handymanProfiles`** - Perfiles detallados de profesionales
- **`jobs`** - Trabajos y oportunidades laborales
- **`proposals`** - Ofertas de profesionales para trabajos
- **`conversations`** - Conversaciones de chat
- **`messages`** - Mensajes individuales
- **`notifications`** - Notificaciones push
- **`reviews`** - Reseñas y calificaciones
- **`categories`** - Categorías de servicios

### Funciones Convex Disponibles
```typescript
// Usuarios
api.users.createUser()
api.users.getUserById()
api.users.updateOnlineStatus()

// Trabajos
api.jobs.createJob()
api.jobs.getAvailableJobs()
api.jobs.getFlashJobs()
api.jobs.searchJobs()

// Mensajes
api.messages.sendMessage()
api.messages.getMessages()
api.messages.getUserConversations()

// Nuevas funciones 2024
api.profiles.createHandymanProfile()
api.payments.createPaymentIntent()
api.payments.processPayment()
api.reviews.createReview()
api.storage.uploadFile()
api.help.createTicket()
```

## 🏗️ Arquitectura Moderna 2024

### Patrones de Diseño Implementados
- **Clean Architecture** - Separación clara de responsabilidades
- **Repository Pattern** - Abstracción de acceso a datos
- **Observer Pattern** - Actualizaciones en tiempo real
- **Factory Pattern** - Creación de servicios y componentes
- **Middleware Pattern** - Pipeline de procesamiento de requests

### Características de Rendimiento
- **Code Splitting** - Carga lazy de componentes
- **Image Optimization** - Conversión automática a WebP
- **Bundle Optimization** - Tree shaking y minificación
- **Memory Management** - Gestión eficiente de memoria
- **Network Caching** - Cache inteligente con React Query

### Seguridad (2024 Standards)
- **JWT con rotación** - Tokens seguros con refresh automático
- **Rate Limiting** - Protección contra ataques DDoS
- **Input Validation** - Validación estricta con Zod/Joi
- **CORS configurado** - Política de origen cruzado segura
- **Helmet.js** - Headers de seguridad HTTP
- **Encryption** - Datos sensibles encriptados en reposo

### Monitoreo y Observabilidad
- **Structured Logging** - Logs en formato JSON
- **Correlation IDs** - Trazabilidad de requests
- **Performance Metrics** - Métricas de rendimiento en tiempo real
- **Error Tracking** - Seguimiento y alerta de errores
- **Health Checks** - Monitoreo de salud de servicios

### DevOps y CI/CD
- **GitHub Actions** - Pipeline de integración continua
- **Automated Testing** - Tests unitarios e integración
- **ESLint + Prettier** - Código consistente
- **Husky + lint-staged** - Pre-commit hooks
- **Environment Management** - Configuración por ambiente

## 📊 Métricas de Rendimiento

- **Tiempo de carga inicial**: < 2 segundos
- **Time to Interactive**: < 3 segundos
- **Bundle size optimizado**: < 5MB
- **API Response time**: < 500ms (P95)
- **Real-time latency**: < 100ms
- **Crash rate**: < 0.1%

## 🔧 Google Cloud Functions (Backend Serverless)

### Funciones Implementadas (2024)

#### Autenticación y Seguridad
- `auth-register` - Registro de usuarios con validación
- `auth-login` - Autenticación JWT con rate limiting
- `auth-refresh` - Renovación de tokens automática
- `auth-forgot-password` - Recuperación de contraseña
- `auth-reset-password` - Cambio de contraseña seguro

#### Procesamiento de Pagos
- `payment-create-intent` - Intención de pago con Stripe
- `payment-webhook` - Webhooks de pagos seguros
- `payment-refund` - Procesamiento de reembolsos
- `payment-payout` - Pagos a profesionales

#### Comunicaciones
- `notification-push` - Notificaciones push personalizadas
- `notification-email` - Emails transaccionales
- `notification-sms` - SMS para eventos críticos

#### Procesamiento de Documentos
- `document-process` - OCR y validación con Google Vision
- `image-resize` - Optimización automática de imágenes

### Comandos de Desarrollo (Google Functions)

```powershell
# Navegar al directorio de funciones
cd google-functions

# Instalar dependencias
npm install

# Desarrollo local
npm run serve

# Tests
npm run test
npm run test:coverage

# Linting y formato
npm run lint:fix
npm run format

# Build y deploy
npm run build
npm run deploy

# Logs en tiempo real
npm run logs
```

### Configuración de Variables de Entorno

Crea un archivo `.env` en `google-functions/`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Firebase
FIREBASE_PROJECT_ID=your-project-id

# Convex
CONVEX_URL=https://terrific-starling-996.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@yourapp.com

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your-auth-token

# Redis
REDIS_URL=redis://localhost:6379

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_MAPS_API_KEY=your-maps-key
```

### Repositorio del Proyecto
📁 **GitHub**: https://github.com/Alain-Colombia-Arbitrage-Mev/handyman.git

---

**Desarrollado con ❤️ usando las últimas tecnologías 2024**
- React Native + Expo SDK 51
- Google Cloud Functions v6 (2nd Gen)
- TypeScript 5.9+
- Firebase Functions v6
- Convex Real-time Database
- Modern DevOps practices
  