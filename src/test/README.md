# FE-frameworkbase-Playwright 🎭

Framework de automatización de pruebas para SauceDemo utilizando **Playwright + Cucumber BDD** con arquitectura **Page Object Model** creado por Yrvin Pachas.

[![Playwright](https://img.shields.io/badge/Playwright-1.57.0-45ba4b?logo=playwright)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-BDD-23d96c?logo=cucumber)](https://cucumber.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)](https://github.com/features/actions)

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura de Directorios](#-estructura-de-directorios)
- [Ambientes de Ejecución](#-ambientes-de-ejecución)
- [Ejecución de Pruebas](#-ejecución-de-pruebas)
- [Estrategia de Tags](#-estrategia-de-tags)
- [Plataforma Web](#-plataforma-web-github-pages)
- [CI/CD y Notificaciones](#-cicd-y-notificaciones)
- [Mejores Prácticas](#-mejores-prácticas)

---

## 🚀 Características Principales

- ✅ **Page Object Model (POM)**: Arquitectura de 3 capas (Locators → Pages → Steps)
- ✅ **BDD con Cucumber**: Escenarios en lenguaje natural (Gherkin)
- ✅ **Múltiples Ambientes**: Certificación e Integración con cambio dinámico
- ✅ **CI/CD Automatizado**: GitHub Actions con ejecuciones programadas
- ✅ **Reportes HTML**: Playwright y Cucumber con videos/screenshots
- ✅ **Notificaciones Email**: Alertas automáticas con resultados detallados
- ✅ **Test Launcher Web**: Plataforma visual para ejecutar y monitorear tests
- ✅ **ZeusBot 🐰**: Asistente interactivo con guías para QA, DEV y Business
- ✅ **Historial de Ejecuciones**: Tracking automático de todas las pruebas
- ✅ **Tags Profesionales**: Estrategia completa de clasificación de tests

---

## 🏗️ Arquitectura del Proyecto

### Patrón Page Object Model (POM)

```
┌─────────────────────────────────────────┐
│         Features (.feature)              │  ← Escenarios BDD en Gherkin
│  "Given", "When", "Then"                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Steps (*.step.ts)                │  ← Definiciones de pasos
│  Implementa lógica de escenarios        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Pages (*.page.ts)                │  ← Métodos de negocio
│  Lógica de interacción con UI           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Locators (*.locator.ts)            │  ← Selectores UI
│  Getters para elementos de página       │
└──────────────────────────────────────────┘
```

---

## 💾 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ LTS
- npm 9+
- Git

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd FE-frameworkbase-Playwright

# 2. Instalar dependencias
npm install

# 3. Instalar navegadores de Playwright
npx playwright install chromium

# 4. Configurar variables de entorno
# Copiar playwright.env.example a playwright.env
# Completar las credenciales y URLs

# 5. Generar archivos BDD
npm run bddgen

# 6. Ejecutar primer test
npm run test:headed -- --grep "@smoke"
```

### Variables de Entorno (playwright.env)

```env
# Ambientes
URL_CERTIFICACION=https://siasis-cert.vercel.app
URL_INTEGRACION=https://siasis-dev.vercel.app

# Credenciales SauceDemo
STANDARD_USER=standard_user
STANDARD_PASSWORD=secret_sauce
LOCKED_USER=locked_out_user
PROBLEM_USER=problem_user
```

---

## 📁 Estructura de Directorios

```
FE-frameworkbase-Playwright/
├── .github/
│   └── workflows/
│       └── test-integracion.yml        # Pipeline CI/CD
├── src/
│   ├── resources/
│   │   ├── data/img/                   # Recursos visuales
│   │   └── features/                   # Archivos .feature (Gherkin)
│   │       ├── login/
│   │       │   └── login.feature       # 6 escenarios de autenticación
│   │       ├── shoppingCart/
│   │       │   └── shoppingCart.feature # 2 escenarios de carrito
│   │       └── makePurchase/
│   │           └── makePurchase.feature # 2 escenarios de compra
│   └── test/
│       ├── locators/                   # Selectores UI (*.locator.ts)
│       │   ├── login.locator.ts
│       │   └── shoppingCart.locator.ts
│       ├── pages/                      # Page Objects (*.page.ts)
│       │   ├── login.page.ts
│       │   └── shoppingCart.page.ts
│       ├── steps/                      # Step Definitions (*.step.ts)
│       │   ├── login.step.ts
│       │   ├── shoppingCart.step.ts
│       │   └── makePurchase.step.ts
│       └── utiles/                     # Configuración
│           ├── hooks.ts                # Hooks Before/After
│           ├── pageFixture.ts          # Fixtures base
│           └── test-fixtures.ts        # Fixtures personalizados
├── target/                             # Resultados y reportes
│   ├── playwright-report/              # Reporte HTML Playwright
│   ├── cucumber-report/                # Reporte Cucumber
│   └── test-results/                   # JSON y artefactos
├── playwright.config.ts                # Configuración Playwright
├── playwright.env                      # Variables de entorno
├── test-launcher.html                  # Plataforma web
├── AMBIENTES.md                        # Documentación de ambientes
└── README.md                           # Este archivo
```

---

## 🌍 Ambientes de Ejecución

El framework soporta dos ambientes:

| Ambiente | URL | Descripción |
|----------|-----|-------------|
| **Certificación** | `siasis-cert.vercel.app` | Ambiente de pruebas estable (default) |
| **Integración** | `siasis-dev.vercel.app` | Ambiente de desarrollo |

### Cambio de Ambiente

#### Opción 1: Variable de Entorno (PowerShell)
```powershell
# Certificación (default)
npm run test:headed

# Integración
$env:TEST_ENVIRONMENT="integracion"; npm run test:headed
```

#### Opción 2: Plataforma Web
1. Abrir `test-launcher.html`
2. Seleccionar ambiente en dropdown
3. Click en "Ejecutar Pruebas"

#### Opción 3: GitHub Actions
1. Ir a Actions → Test Automation
2. Click "Run workflow"
3. Seleccionar ambiente (certificacion/integracion)

📖 Ver [AMBIENTES.md](AMBIENTES.md) para más detalles.

---

## 🧪 Ejecución de Pruebas

### Comandos Principales

```bash
# Ejecutar todos los tests (headless)
npm run test

# Modo visible (headed)
npm run test:headed

# Modo UI interactivo
npm run test:ui

# Modo debug
npm run test:debug

# Abrir último reporte
npm run report

# Regenerar archivos BDD
npm run bddgen
```

### Ejecución por Tags

```bash
# Tests de smoke (críticos)
npm run test:headed -- --grep "@smoke"

# Tests de regresión completa
npm run test -- --grep "@regression"

# Casos negativos (errores)
npm run test -- --grep "@negative"

# Feature completo de login
npm run test -- --grep "@login"

# Escenario específico
npm run test -- --grep "@CP-001"

# Daily tests (ejecución diaria)
npm run test -- --grep "@DailyTest"
```

### Ejecución con Ambiente Específico

```powershell
# Integración + Smoke tests
$env:TEST_ENVIRONMENT="integracion"; npm run test:headed -- --grep "@smoke"

# Certificación + Regresión
$env:TEST_ENVIRONMENT="certificacion"; npm run test -- --grep "@regression"

# Integración + Feature específico
$env:TEST_ENVIRONMENT="integracion"; npm run test -- --grep "@purchase"
```

---

## 🏷️ Estrategia de Tags

### Tags de Feature (nivel archivo)
```gherkin
@test @login @authentication @HU-001 @DailyTest
```

### Tags de Scenario

| Tag | Descripción | Uso |
|-----|-------------|-----|
| `@smoke` | Tests críticos del flujo principal | Despliegues y validación rápida |
| `@critical` | Funcionalidades esenciales | Regresión de alta prioridad |
| `@regression` | Suite de regresión completa | Pre-release testing |
| `@negative` | Casos de error y validación | Testing de límites |
| `@validation` | Validaciones de formularios | Testing de campos |
| `@security` | Pruebas de seguridad | Cuentas bloqueadas, permisos |
| `@happy-path` | Flujos exitosos | Casos positivos |
| `@unhappy-path` | Flujos con errores | Casos negativos |
| `@e2e` | End-to-end completo | Flujos de negocio |
| `@DailyTest` | Ejecución diaria automatizada | CI/CD schedules |

### Ejemplo de Uso

```gherkin
@test @purchase @checkout @HU-003 @DailyTest
Feature: Realizar una compra exitosa

    @CP-009 @smoke @critical @happy-path @e2e @checkout-flow
    Scenario: CP-09 Validar compra exitosa
        # ... steps

    @CP-010 @regression @negative @validation @error-handling
    Scenario Outline: CP-10 Validar información faltante
        # ... steps con Examples
```

---

## 🌐 Plataforma Web (GitHub Pages)

Accede a la plataforma completa en: **https://[tu-usuario].github.io/[tu-repo]/**

### Características de la Plataforma

#### 🚀 Ejecutor de Pruebas
- Selección de ambiente (Certificación/Integración)
- Lanzamiento directo desde el navegador
- Seguimiento en tiempo real vía GitHub Actions

#### 🐰 ZeusBot - Asistente Inteligente
4 guías interactivas:
- **Guía QA**: Comandos, tags, debugging
- **Guía DEV**: Arquitectura, patrones, contribución
- **Guía Business**: Resumen ejecutivo, métricas
- **Guía Técnica**: Configuración CI/CD, ambientes

#### 📊 Historial de Ejecuciones
- Últimas 50 ejecuciones con detalles
- Filtros por estado (todas/exitosas/fallidas)
- Estadísticas acumuladas
- Links a reportes y GitHub Actions

#### 📈 Reportes Visuales
- **Página Principal**: Dashboard y ejecución
- **Reporte Playwright**: `/report` - HTML detallado con videos/screenshots
- **Reporte Cucumber**: Dentro de target/cucumber-report/

### Configuración Inicial

1. Abrir `test-launcher.html` líneas 409-410
2. Cambiar `GITHUB_OWNER` y `GITHUB_REPO`
3. Generar [GitHub Token](https://github.com/settings/tokens/new?scopes=repo,workflow)
4. Commit y push
5. GitHub Pages se activa automáticamente

---

## 🔄 CI/CD y Notificaciones

### GitHub Actions - Ejecuciones Programadas

```yaml
# .github/workflows/test-integracion.yml
schedule:
  - cron: '0 13 * * 1-5'  # Lunes-Viernes 8:00 AM (Perú)
  - cron: '0 6 * * 0,6'   # Sábados-Domingos 1:00 AM (Perú)
```

### Ejecución Manual
1. GitHub → Actions → "Test Automation"
2. "Run workflow" → Seleccionar ambiente → Run

### Notificaciones por Email

Se envían emails automáticos a:
- 2101010261@undc.edu.pe
- 2002010055@undc.edu.pe

**Contenido del email:**
- ✨ Diseño profesional con gradientes
- 📊 Tabla de resultados (passed/failed/skipped)
- 🌍 Ambiente ejecutado (Certificación/Integración)
- ⏱️ Duración de ejecución
- 🔗 Links directos a:
  - Reporte Playwright
  - GitHub Actions
  - Artefactos (videos/screenshots)

### Historial Automático

Cada ejecución se registra en `history.json`:
```json
{
  "tag": "@DailyTest",
  "ambiente": "certificacion",
  "passed": 8,
  "failed": 0,
  "skipped": 0,
  "duration": "45s",
  "timestamp": "2026-01-08T13:00:00Z",
  "buildNumber": "123",
  "triggeredBy": "schedule",
  "reportUrl": "https://...",
  "actionsUrl": "https://..."
}
```

---

## ✅ Mejores Prácticas

### Creación de Nuevos Tests

1. **Feature File** (`.feature`)
```gherkin
@test @moduloNuevo @HU-004 @DailyTest
Feature: Descripción del módulo
    # Escenarios con tags apropiados
```

2. **Locator** (`*.locator.ts`)
```typescript
export class ModuloLocator {
    readonly page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }
    
    get btnAccion() {
        return this.page.getByRole('button', { name: 'Acción' });
    }
}
```

3. **Page Object** (`*.page.ts`)
```typescript
export class ModuloPage {
    readonly page: Page;
    readonly moduloLocator: ModuloLocator;
    
    constructor(page: Page) {
        this.page = page;
        this.moduloLocator = new ModuloLocator(page);
    }
    
    async ejecutarAccion() {
        await this.moduloLocator.btnAccion.click();
    }
}
```

4. **Step Definition** (`*.step.ts`)
```typescript
import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd(test);

When('ejecuto la acción', async ({ moduloPage }) => {
    await moduloPage.ejecutarAccion();
});
```

5. **Registrar en test-fixtures.ts**
```typescript
export const test = base.extend<Fixtures>({
  moduloPage: async ({ page }, use) => {
    await use(new ModuloPage(page));
  },
});
```

6. **Regenerar BDD**
```bash
npm run bddgen
```

### Selectores Recomendados (orden de preferencia)

1. `page.getByRole('button', { name: 'Texto' })` - Accesibilidad ⭐
2. `page.getByText('Texto exacto')` - Texto visible
3. `page.locator('[data-testid="id"]')` - Data attributes
4. `page.locator('//xpath')` - XPath (último recurso)

### Convenciones de Código

- **Archivos**: `{modulo}.locator.ts`, `{modulo}.page.ts`, `{modulo}.step.ts`
- **Clases**: PascalCase (`LoginPage`, `ShoppingCartLocator`)
- **Métodos**: camelCase (`fillCredentials`, `validateErrorMessage`)
- **Variables**: camelCase en inglés técnico
- **Mensajes usuario**: Español con `console.log` para trazabilidad

### DO ✅
- Usar `await` en operaciones asíncronas
- Validar visibilidad antes de interactuar
- Usar `expect` de Playwright
- Organizar features por módulos
- Reutilizar steps en Background
- Nombrar escenarios: `CP-XXX Descripción`

### DON'T ❌
- No mezclar selectores en Pages
- No hardcodear credenciales
- No usar selectores frágiles
- No olvidar `npm run bddgen`
- No usar `page.waitForTimeout()`

---

## 📊 Reportes Generados

| Reporte | Ubicación | Contenido |
|---------|-----------|-----------|
| **Playwright HTML** | `target/playwright-report/index.html` | Reporte detallado con traces |
| **Cucumber HTML** | `target/cucumber-report/report.html` | Reporte BDD por features |
| **JSON** | `target/test-results/results.json` | Resultados en formato JSON |
| **Videos** | `target/videos/` | Videos de tests fallidos |
| **Screenshots** | Dentro de reportes | Capturas automáticas en fallos |

Abrir reporte: `npm run report`

---

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Seguir patrones POM establecidos
4. Ejecutar `npm run bddgen` antes de commit
5. Verificar que pasen los tests: `npm run test -- --grep "@smoke"`
6. Commit: `git commit -m "feat: descripción"`
7. Push: `git push origin feature/nueva-funcionalidad`
8. Crear Pull Request

---

## 📞 Soporte

- **GitHub Issues**: [Reportar problema](../../issues)
- **Documentación**: Ver archivos `.md` en el proyecto
- **ZeusBot**: Asistente integrado en `test-launcher.html`

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**QA Automation Senior - Yrvin Pachas Saravia**  
Framework desarrollado para automatización de pruebas con Playwright + Cucumber BDD  
SIASIS Platform 🤖

---

## 🔧 Tecnologías Utilizadas

- **Playwright** v1.57.0 - Framework de testing
- **playwright-bdd** v8.4.2 - Integración Cucumber
- **TypeScript** 5.x - Lenguaje de programación
- **Cucumber** - BDD con Gherkin
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting de reportes
- **Node.js** 18+ LTS - Runtime

---

**Última actualización**: Enero 2026 🚀
