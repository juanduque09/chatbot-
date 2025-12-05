# 🤖 Chatbot de Recordatorios de Citas - WhatsApp (Twilio)

Sistema automatizado para enviar recordatorios de citas médicas por WhatsApp usando **Twilio**. El sistema envía mensajes automáticos un día antes de cada cita programada.

## 🚀 Características Principales

- ✅ **Envío automático** de recordatorios por WhatsApp vía Twilio
- 📅 **Cron job configurable** - ejecución diaria programada (por defecto 6 PM)
- 🏥 **Soporte multi-sede** - maneja múltiples médicos y consultorios
- 📱 **Integración Twilio WhatsApp** - mensajería confiable y profesional
- 📊 **Sistema de logs** - Winston para trazabilidad completa
- 🔒 **TypeScript** - desarrollo type-safe con validaciones Zod
- 🎯 **Filtrado inteligente** - solo envía a citas del día siguiente con estado activo

## 📋 Requisitos Previos

- **Node.js v18+** instalado ([Descargar](https://nodejs.org/))
- **Cuenta Twilio** con WhatsApp Sandbox habilitado ([Crear cuenta gratis](https://www.twilio.com/try-twilio))
- **API REST** que provea datos de citas en formato JSON

## � Configuración Rápida de Twilio

### Paso 1: Crear Cuenta Twilio (Gratis)

1. Ve a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Regístrate con tu email (recibes **$15 USD gratis**)
3. Verifica tu cuenta por email y teléfono

### Paso 2: Configurar WhatsApp Sandbox

1. En el Dashboard de Twilio, ve a **Messaging → Try it out → Send a WhatsApp message**
2. Verás algo como: `join <codigo-unico>`
3. Desde tu WhatsApp, envía ese mensaje al número de Twilio (ej: `+1 415 523 8886`)
4. Recibirás confirmación: "You are now connected!"

### Paso 3: Obtener Credenciales

En el Dashboard de Twilio, copia:
- **Account SID** - Ejemplo: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token** - Click en "Show" para verlo
- **WhatsApp Number** - Ejemplo: `whatsapp:+14155238886`

## 🛠️ Instalación del Proyecto

### 1. Instalar dependencias

```bash
cd chatbot
npm install
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_de_twilio
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Cron Schedule (Diario a las 6 PM - Zona horaria Colombia)
CRON_SCHEDULE=0 18 * * *
TZ=America/Bogota

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### 2. Configurar variables de entorno

**Importante:** Crea un archivo `.env` con tus credenciales de Twilio:

```bash
# Copia el ejemplo
cp .env.example .env
```

Edita `.env` con tus valores reales:
- `API_URL` - URL de tu API de citas
- `API_KEY` - Key de autenticación (si aplica)
- `TWILIO_ACCOUNT_SID` - Obtenido en Paso 3
- `TWILIO_AUTH_TOKEN` - Obtenido en Paso 3
- `TWILIO_WHATSAPP_FROM` - Número de Twilio (incluye prefijo `whatsapp:`)

### 3. Compilar el proyecto

```bash
npm run build
```

## 🎮 Uso del Sistema

### Desarrollo (con hot-reload)

```bash
npm run dev
```

El servidor inicia en `http://localhost:3000` y verás:
```
🚀 Servidor iniciado en http://localhost:3000
✅ Twilio WhatsApp configurado correctamente
⏰ Cron job programado: 0 18 * * * (diario 6 PM)
```

### Producción

```bash
npm start
```

## 📡 Endpoints API Disponibles

### 1. Health Check
```bash
GET http://localhost:3000/health
```
Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2024-03-20T18:00:00.000Z"
}
```

### 2. Estado de Twilio
```bash
GET http://localhost:3000/api/twilio/estado
```
Verifica que Twilio esté configurado correctamente.

### 3. Ejecutar Recordatorios Manualmente
```bash
POST http://localhost:3000/api/ejecutar-recordatorios
```
Ejecuta el proceso de recordatorios inmediatamente (útil para pruebas).

### 4. Enviar Mensaje de Prueba
```bash
POST http://localhost:3000/api/prueba-whatsapp
Content-Type: application/json

{
  "telefono": "3012345678",
  "citaData": {
    "hora": "10:00",
    "ampm": "AM",
    "consultorio": "301",
    "nombre": "Juan Pérez",
    "medico": "Dr. García",
    "sede": "Sede Norte"
  }
}
```

**Nota:** Si omites `citaData`, enviará un mensaje genérico de prueba.

## 📁 Estructura del Proyecto

```
chatbot/
├── src/
│   ├── config/
│   │   └── env.ts              # Variables de entorno validadas con Zod
│   ├── types/
│   │   └── cita.types.ts       # Tipos TypeScript para citas
│   ├── services/
│   │   ├── api.service.ts      # Consumo API de citas
│   │   ├── filter.service.ts   # Filtrado de citas del día siguiente
│   │   ├── template.service.ts # Generación mensajes WhatsApp
│   │   └── whatsapp.service.ts # 🔥 Integración Twilio WhatsApp
│   ├── jobs/
│   │   └── reminder.job.ts     # ⏰ Cron job automático
│   ├── utils/
│   │   ├── date.utils.ts       # Manejo de fechas con dayjs
│   │   ├── phone.utils.ts      # Formateo números Colombia
│   │   └── logger.ts           # Sistema de logs Winston
│   └── index.ts                # 🚀 Servidor Express
├── dist/                        # Código compilado (generado)
├── logs/                        # Archivos de log (generado)
├── .env                         # 🔐 Credenciales (NO SUBIR A GIT)
├── .env.example                 # Plantilla de credenciales
├── ejemplo-citas.json           # 📄 Ejemplo de datos de citas
├── package.json
├── tsconfig.json
└── README.md                    # Este archivo
```

## ⏰ Configuración del Cron Job

El sistema ejecuta automáticamente los recordatorios según el `CRON_SCHEDULE` configurado.

### Formato Cron
```
┌─────────── minuto (0 - 59)
│ ┌───────── hora (0 - 23)
│ │ ┌─────── día del mes (1 - 31)
│ │ │ ┌───── mes (1 - 12)
│ │ │ │ ┌─── día de la semana (0 - 6, 0 = Domingo)
│ │ │ │ │
* * * * *
```

### Ejemplos comunes:

```bash
# Diario a las 6 PM (Colombia)
CRON_SCHEDULE=0 18 * * *

# Diario a las 9 AM y 6 PM
CRON_SCHEDULE=0 9,18 * * *

# Cada 2 horas
CRON_SCHEDULE=0 */2 * * *

# Solo lunes a viernes a las 6 PM
CRON_SCHEDULE=0 18 * * 1-5

# Cada 30 minutos (solo para pruebas)
CRON_SCHEDULE=*/30 * * * *
```

**Importante:** Configura `TZ=America/Bogota` en `.env` para zona horaria de Colombia.

## 📊 Sistema de Logs

Los logs se guardan automáticamente en la carpeta `logs/`:

- **`error.log`** - Solo errores críticos
- **`combined.log`** - Registro completo de actividades

### Niveles de log:
```typescript
logger.error('Error crítico')   // Errores
logger.warn('Advertencia')      // Warnings
logger.info('Información')      // Info general
logger.debug('Debug detallado') // Solo en desarrollo
```

Los logs incluyen:
- Timestamp
- Nivel de severidad
- Mensajes detallados
- Stack traces de errores

## 🧪 Cómo Probar el Sistema

### Prueba 1: Verificar Configuración
```bash
# Inicia el servidor
npm run dev

# Deberías ver:
✅ Twilio WhatsApp configurado correctamente
```

### Prueba 2: Enviar Mensaje de Prueba (Usando Datos del Ejemplo)
```bash
# Enviar mensaje usando datos de ejemplo-citas.json
curl -X POST http://localhost:3000/api/prueba-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "3012984337",
    "citaData": {
      "hora": 759,
      "ampm": "AM",
      "consultorio": "CONSULTORIO1",
      "nombre": "JOSE SIERRA",
      "medico": "OSCAR VELEZ",
      "sede": "PEREIRA"
    }
  }'
```

**Ejemplo con otro paciente:**
```bash
curl -X POST http://localhost:3000/api/prueba-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "3206233559",
    "citaData": {
      "hora": 1000,
      "ampm": "AM",
      "consultorio": "CONSULTORIO 301",
      "nombre": "MARIA GOMEZ",
      "medico": "DRA. PATRICIA LOPEZ",
      "sede": "PEREIRA"
    }
  }'
```

### Prueba 3: Ejecutar Recordatorios Manualmente
```bash
# Ejecuta el proceso completo sin esperar el cron
curl -X POST http://localhost:3000/api/ejecutar-recordatorios
```

**Respuesta esperada:**
```json
{
  "success": true,
  "citasFiltradas": 3,
  "mensajesEnviados": 3,
  "errores": 0
}
```

## 📝 Formato de la API de Citas

Tu API debe devolver un array JSON con este formato. Incluimos un archivo de ejemplo: **`ejemplo-citas.json`**

```json
[
  {
    "hora": 759,
    "ampm": "AM",
    "consultorio": "CONSULTORIO1",
    "nombre": "JOSE SIERRA",
    "telefono": "3012984337",
    "td": "TI",
    "documento": "1110973203",
    "estado": "AGENDADO",
    "motivoCancela": "",
    "fechaSolicita": "2025-11-20",
    "entidad": "PLAN CLINICA LASER",
    "tipo": "ECOGRAFIA",
    "concepto": "TRATAMIENTO",
    "observacion": "OD $150.000...",
    "orden": 0,
    "medico": "OSCAR VELEZ",
    "requerida": "2025-11-20",
    "creadaPor": "MARIA",
    "modificadaPor": "RENATA",
    "actualizada": "11/11/2025 9:52:42 a. m.",
    "id": 648444,
    "impresa": null,
    "sede": "PEREIRA"
  }
]
```

> 📄 **Ver archivo completo:** `ejemplo-citas.json` - Incluye 5 citas de ejemplo con datos reales de tu clínica

### Contenido del archivo `ejemplo-citas.json`:

| Paciente | Teléfono | Hora | Estado | Sede | Médico |
|----------|----------|------|--------|------|--------|
| JOSE SIERRA | 3012984337 | 7:59 AM | ATENDIDO | PEREIRA | OSCAR VELEZ |
| MARIA GOMEZ | 3206233559 | 10:00 AM | AGENDADO ✅ | PEREIRA | DRA. PATRICIA LOPEZ |
| CARLOS RODRIGUEZ | 3157894561 | 2:00 PM | AGENDADO ✅ | DOSQUEBRADAS | DR. JUAN MARTINEZ |
| ANA SOFIA PEREZ | 3109876543 | 8:30 AM | CANCELADO ❌ | PEREIRA | DR. CARLOS ANDRADE |
| LUIS FERNANDO CASTRO | 3208765432 | 3:30 PM | AGENDADO ✅ | DOSQUEBRADAS | FT. ANDREA GOMEZ |

**Nota:** El sistema filtrará automáticamente y solo enviará recordatorios a las 3 citas con estado **AGENDADO** (MARIA, CARLOS y LUIS).

### Campos requeridos:
- `telefono` - 10 dígitos formato colombiano (sin +57)
- `nombre` - Nombre del paciente
- `fechaSolicita` - Fecha de la cita (formato YYYY-MM-DD)
- `hora` - Hora en formato numérico (ej: 1000 = 10:00)
- `ampm` - "AM" o "PM"

### Campos opcionales:
- `consultorio` - Número o nombre del consultorio
- `medico` - Nombre del médico
- `sede` - Sede de la cita
- `estado` - Estado de la cita (se filtran las CANCELADAS)

## 📱 Formato del Mensaje WhatsApp

El sistema envía mensajes personalizados así:

```
🏥 RECORDATORIO DE CITA

Estimado/a Juan Pérez,

Le recordamos su cita programada para mañana:

📅 Fecha: Lunes 15 de Noviembre
🕐 Hora: 10:00 AM
🏢 Sede: Sede Norte
👨‍⚕️ Médico: Dr. García
📍 Consultorio: 301

Por favor, llegue 15 minutos antes de su cita.

¡Gracias por confiar en nosotros!
```

## 🚨 Consideraciones Importantes

### Límites de Twilio
- **Sandbox (Gratis):** Necesitas que cada número se una con `join <codigo>`
- **Límite de mensajes:** Incluye $15 USD gratis (~3000 mensajes)
- **Costo después:** $0.005 USD por mensaje enviado
- **Rate limiting:** El sistema espera 1 segundo entre mensajes

### Filtrado automático
- ✅ Solo citas del **día siguiente**
- ✅ Solo citas con estado **≠ CANCELADO**
- ✅ Teléfonos válidos (10 dígitos Colombia)
- ✅ Agrega automáticamente prefijo **+57**

### Zona horaria
El sistema usa `America/Bogota` por defecto. Configura `TZ` en `.env` si necesitas otra zona.

## 🔐 Seguridad

⚠️ **IMPORTANTE - NO HACER:**
- ❌ Subir `.env` a GitHub/repositorios públicos
- ❌ Compartir ACCOUNT_SID o AUTH_TOKEN públicamente
- ❌ Hardcodear credenciales en el código

✅ **BUENAS PRÁCTICAS:**
- ✅ Usar variables de entorno
- ✅ Agregar `.env` a `.gitignore`
- ✅ Rotar credenciales periódicamente
- ✅ Usar diferentes credenciales para dev/prod

## 💰 Costos Estimados (Twilio)

| Uso Mensual | Mensajes/día | Costo Mensual |
|-------------|--------------|---------------|
| Bajo        | 10           | $1.50 USD     |
| Medio       | 50           | $7.50 USD     |
| Alto        | 100          | $15.00 USD    |

**Nota:** Con el crédito gratis de $15 USD puedes enviar ~3000 mensajes.

## 🐛 Troubleshooting

### Error: "No se pudo configurar Twilio WhatsApp"
- Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` estén correctos
- Revisa que no haya espacios extras en las credenciales

### Error: "Cannot send messages to this number"
- El número debe unirse al Sandbox: envía `join <codigo>` desde WhatsApp
- Verifica que el formato sea correcto (10 dígitos sin +57)

### No llegan mensajes
- Revisa los logs en `logs/error.log`
- Verifica saldo en Dashboard de Twilio
- Confirma que el número esté activo en Sandbox

### Cron no ejecuta
- Verifica el formato de `CRON_SCHEDULE`
- Revisa la zona horaria `TZ` en `.env`
- Chequea logs para ver si hay errores

## 📚 Documentación Adicional

- [GUIA_INSTALACION_TWILIO.md](./GUIA_INSTALACION_TWILIO.md) - Guía detallada de configuración
- [INICIO_RAPIDO_TWILIO.md](./INICIO_RAPIDO_TWILIO.md) - Quick start guide
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp) - Documentación oficial

## 🤝 Contribuir

Este proyecto está desarrollado con TypeScript y sigue las mejores prácticas de Node.js.

---

**Desarrollado con ❤️ usando TypeScript + Node.js + Twilio WhatsApp API**

## 📄 Licencia

ISC
