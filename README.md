# Handyman Auction Mobile App

Una aplicación móvil desarrollada con React Native y Expo para conectar profesionales con clientes que necesitan servicios de reparación y mantenimiento.

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

- **React Native** 0.74.5
- **Expo** ~51.0.28
- **Expo Router** ~3.5.23 (navegación basada en archivos)
- **TypeScript** para tipado estático
- **React Native Reanimated** para animaciones
- **Expo Linear Gradient** para gradientes
- **React Navigation** para navegación entre pantallas

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
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
├── app/                     # Rutas de Expo Router
│   ├── (tabs)/             # Grupo de pestañas
│   │   ├── _layout.tsx     # Layout de las pestañas
│   │   ├── index.tsx       # Pantalla de inicio
│   │   ├── search.tsx      # Pantalla de búsqueda
│   │   ├── messages.tsx    # Pantalla de mensajes
│   │   └── profile.tsx     # Pantalla de perfil
│   ├── _layout.tsx         # Layout raíz
│   └── index.tsx           # Pantalla de splash/entrada
├── src/
│   ├── components/         # Componentes reutilizables
│   │   └── SplashScreen.tsx
│   └── providers/          # Providers/contextos
│       └── LanguageProvider.tsx
├── assets/                 # Recursos (imágenes, iconos, etc.)
├── app.json               # Configuración de Expo
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración de TypeScript
├── metro.config.js        # Configuración del bundler Metro
└── babel.config.js        # Configuración de Babel
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

---

Desarrollado con ❤️ usando React Native y Expo
  