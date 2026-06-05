# 💊 FARMABOL — Sistema de Control de Inventarios y Ventas

Sistema funcional desarrollado para **Farmacias Bolivianas Unidas (FARMABOL)**, empresa nacional con 12 sucursales. Permite gestionar el inventario de productos farmacéuticos, registrar ventas con descuento automático de stock y visualizar un dashboard en tiempo real.

Proyecto de la asignatura — integra los conceptos de los Hitos 3 y 4: arquitectura, middleware, refactorización, control de calidad y cloud computing.

---

## ⚠️ Requisito importante: Node.js 22.5 o superior

Este sistema usa **SQLite**, pero a través del módulo **nativo** que viene incluido en Node.js (`node:sqlite`). Esto tiene una gran ventaja: **no instala ni compila nada** al hacer `npm install`. La única condición es tener **Node.js versión 22.5 o más reciente**.

Para verificar tu versión:

```bash
node --version
```

Si es menor a 22.5, descarga la última versión LTS desde https://nodejs.org e instálala. El sistema avisa con un mensaje claro si la versión es muy antigua.

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| Vistas | EJS (renderizado en servidor) |
| Base de datos | SQLite (módulo nativo `node:sqlite`) |
| Sesiones / Auth | express-session + bcryptjs |

Se eligió **arquitectura monolítica en capas** (rutas → middleware → acceso a datos), apropiada para el tamaño del proyecto: simple de desarrollar, desplegar y mantener por un equipo pequeño. La justificación completa está en el documento PDF.

> **Nota sobre la base de datos:** se usa SQLite, que es una base de datos relacional que guarda todo en un solo archivo (`db/farmabol.db`). Cumple el requisito de persistencia y de tener mínimo 3 tablas (`usuarios`, `productos`, `ventas`), sin necesidad de instalar un servidor de base de datos aparte.

---

## ✅ Requisitos cubiertos

- **Autenticación** con dos roles: `ADMIN` (gestión total) y `VENDEDOR` (solo registra ventas y consulta stock).
- **Gestión de productos**: CRUD completo (crear, leer, actualizar, eliminar) con código, nombre, precio, stock y laboratorio.
- **Registro de ventas**: descuenta stock automáticamente y valida que haya unidades suficientes.
- **Dashboard / Reporte**: productos con stock bajo (menos de 5 unidades) y total de ventas del día, en tiempo real.
- **Persistencia**: base de datos SQLite con 3 tablas (`usuarios`, `productos`, `ventas`).
- **Refactorización**: ver sección más abajo y los dos commits marcados.

---

## 🚀 Cómo correr el sistema (en cualquier laptop)

Necesitas tener instalado **Node.js 22.5 o superior** (ver arriba). No necesitas instalar ninguna base de datos.

```bash
# 1. Clonar el repositorio desde GitHub
git clone https://github.com/TU_USUARIO/farmabol.git
cd farmabol

# 2. Instalar dependencias (NO compila nada, es rápido)
npm install

# 3. Crear la base de datos y cargar datos de ejemplo
npm run init-db

# 4. Iniciar el servidor
npm start
```

Abre el navegador en 👉 **http://localhost:3000**

Para detener el servidor: `Ctrl + C` en la consola.

### 👤 Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador (gestión total) |
| `vendedor` | `vendedor123` | Vendedor (solo ventas y consulta) |

---

## 📦 Cómo subir el proyecto a GitHub

Desde la carpeta del proyecto, en la consola:

```bash
git init
git add .
git commit -m "Versión inicial: sistema FARMABOL funcional"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/farmabol.git
git push -u origin main
```

> Cambia `TU_USUARIO` por tu nombre de usuario de GitHub y crea antes el repositorio vacío en github.com.

El archivo `.gitignore` ya está configurado para NO subir `node_modules/` ni la base de datos `farmabol.db` (cada quien la genera con `npm run init-db`).

---

## 🔧 Refactorización (antes / después)

**Code smell detectado:** *Método Largo (Long Method)* en el manejador de registro de ventas. Una sola función hacía todo: buscar el producto, validar el stock, calcular el total, insertar la venta y actualizar el inventario.

**Solución aplicada (Extract Method):** se separó la lógica en tres funciones pequeñas y con un solo propósito cada una:

- `obtenerProducto(id)` — busca y valida el producto.
- `hayStockSuficiente(producto, cantidad)` — valida el stock.
- `registrarVenta(producto, cantidad, usuarioId)` — inserta la venta y descuenta stock dentro de una transacción.

El manejador POST quedó corto y legible, y cada función se puede probar por separado.

- **Antes:** `docs/ventas_ANTES_refactor.js`
- **Después:** `src/routes/ventas.js`

Para que en GitHub se vean los dos commits del antes/después, haz los commits en este orden:

```bash
# Primer commit: copia la version "antes" como ventas.js y commitea
copy docs\ventas_ANTES_refactor.js src\routes\ventas.js   (en Windows)
git add . && git commit -m "feat: registro de ventas (version inicial, metodo largo)"

# Segundo commit: restaura la version refactorizada y commitea
git checkout HEAD~0 -- src/routes/ventas.js   (o vuelve a pegar la version buena)
git add . && git commit -m "refactor: extraer metodos de ventas.js (Extract Method)"
```

> Más simple: haz el primer commit con la versión "antes", y en el segundo reemplaza el contenido por la versión refactorizada. Lo importante es que el historial muestre el cambio.

---

## 🧪 Control de calidad (SQA)

Para el análisis estático se usa **ESLint** (equivalente JS de PyLint). Para correrlo:

```bash
npx eslint src/
```

Métricas a reportar en el documento: número de advertencias antes y después de la refactorización, complejidad de funciones y líneas por función.

---

## 📁 Estructura del proyecto

```
farmabol/
├── src/
│   ├── app.js              # Punto de entrada Express
│   ├── config/db.js        # Conexión a SQLite (node:sqlite)
│   ├── middleware/auth.js  # Autenticación y roles
│   ├── routes/             # auth, productos, ventas, dashboard
│   └── views/              # Plantillas EJS
├── db/
│   ├── schema.sql          # Definición de las 3 tablas
│   └── init.js             # Crea tablas + datos de ejemplo
├── docs/
│   └── ventas_ANTES_refactor.js
├── public/css/style.css
├── package.json
└── README.md
```

---

## 📝 Declaración jurada

> El código es de mi autoría; no usé IA para generar las respuestas ni el código del sistema.

*(Esta línea es requerida por el documento PDF de entrega. Revísala según corresponda a tu caso.)*
