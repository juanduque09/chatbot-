# 🤖 Sistema de Recordatorios de Citas - WhatsApp Business (Meta API)

Sistema automatizado profesional para enviar recordatorios de citas médicas por WhatsApp usando **Meta WhatsApp Business API**. El sistema envía mensajes automáticos un día antes de cada cita programada con tracking completo y webhooks.

## ✨ Características Principales

- ✅ **Meta WhatsApp Business API** - Integración oficial con verificación de negocio
- 📅 **Cron job configurable** - Ejecución diaria programada (por defecto 6 PM)
- 🏥 **Soporte multi-sede** - Maneja múltiples médicos y consultorios
- 📊 **Base de datos SQLite** - Tracking completo de mensajes enviados
- 🔔 **Webhooks** - Recepción de estados (entregado, leído, fallido)
- 📈 **Sistema de estadísticas** - Dashboard de métricas en tiempo real
- 🔒 **TypeScript** - Desarrollo type-safe con validaciones Zod
- 🎯 **Filtrado inteligente** - Solo envía a citas del día siguiente con estado activo
- 🚫 **Anti-duplicados** - No re-envía mensajes ya enviados
- 🔄 **Sistema de reintentos** - Manejo robusto de fallos

## 🆚 Ventajas sobre Twilio

| Característica       | Meta WhatsApp                        | Twilio                |
| -------------------- | ------------------------------------ | --------------------- |
| Costo mensual base   | **GRATIS** hasta 1000 conversaciones | $15-20 USD + mensajes |
| Verificación oficial | Badge verde ✅                       | No                    |
| Rate limiting        | 80 msg/seg                           | ~1 msg/seg (inicial)  |
| Plantillas aprobadas | ✅                                   | ❌                    |
| Número virtual       | ✅ Gratis                            | ❌ Requiere SIM       |
| Deliverability       | 99%+                                 | 95%                   |
| Webhooks nativos     | ✅                                   | ❌ (limitados)        |

## 💰 Costos (Meta)

```
0 - 1,000 conversaciones/mes:    GRATIS ✨
1,001 - 10,000:                  $0.028 USD c/u
10,001 - 100,000:                $0.022 USD c/u
100,001+:                        $0.015 USD c/u
```

**Para una clínica con 500 pacientes/mes**: **$0 USD** 🎉

## 📋 Requisitos Previos

- **Node.js v18+** instalado ([Descargar](https://nodejs.org/))
- **Facebook Business Manager** configurado
- **WhatsApp Business API** habilitada
- **API REST** que provea datos de citas en formato JSON

## 🚀 Configuración Rápida

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd chatbot-
npm install
```

### 2. Configurar Meta WhatsApp Business

**Sigue la guía detallada**: [`docs/SETUP-META-WHATSAPP.md`](docs/SETUP-META-WHATSAPP.md)

Resumen de pasos:

1. Crear Facebook Business Manager
2. Crear WhatsApp Business Account
3. Obtener número virtual de Meta (gratis)
4. Crear plantilla de mensaje
5. Obtener credenciales (Token, Phone Number ID, WABA ID)

### 3. Configurar variables de entorno

Crea archivo `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# API de citas
API_URL=https://tu-api.com/citas
API_KEY=tu_api_key_aqui

# Meta WhatsApp Business
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789012345
META_WABA_ID=123456789012345
META_APP_ID=123456789012345
META_APP_SECRET=xxxxxxxxxxxxxxxxxxxxx
META_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_2024
META_TEMPLATE_NAME=recordatorio_cita_v1

# Cron (6 PM diario)
CRON_SCHEDULE=0 18 * * *
TZ=America/Bogota

# Server
PORT=3000
WEBHOOK_PATH=/webhooks/whatsapp

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

### 4. Inicializar base de datos

```bash
npm run db:migrate
```

### 5. Compilar y ejecutar

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints API

### Health Check

```bash
GET http://localhost:3000/health
```

**Respuesta**:

```json
{
  "status": "ok",
  "service": "chatbot-recordatorios-meta",
  "version": "2.0.0",
  "timestamp": "2025-12-05T18:00:00.000Z",
  "metaConfigured": true,
  "database": "connected",
  "stats_today": {
    "total_enviados": 150,
    "total_entregados": 148,
    "total_leidos": 120,
    "total_fallidos": 2,
    "tasa_entrega": 98.7,
    "tasa_lectura": 80.0
  }
}
```

### Estado de Meta

```bash
GET http://localhost:3000/api/meta/estado
```

### Ejecutar recordatorios manualmente

```bash
POST http://localhost:3000/api/ejecutar-recordatorios
```

### Prueba de envío

```bash
POST http://localhost:3000/api/prueba-whatsapp
Content-Type: application/json

{
  "telefono": "573001234567",
  "nombre": "Juan Pérez",
  "medico": "DRA. PATRICIA LOPEZ",
  "sede": "PEREIRA",
  "consultorio": "CONSULTORIO 301",
  "hora": 1000,
  "ampm": "AM",
  "requerida": "2025-12-06",
  "tipo": "CONSULTA",
  "entidad": "EPS SURA"
}
```

### Estadísticas

```bash
GET http://localhost:3000/api/estadisticas
```

### Webhook (para Meta)

```bash
# Verificación (GET)
GET http://tu-dominio.com/webhooks/whatsapp

# Recepción de eventos (POST)
POST http://tu-dominio.com/webhooks/whatsapp
```

## 🗄️ Base de Datos

El sistema usa **SQLite** (archivo local, sin servidor adicional):

### Tablas principales:

- **`mensajes`**: Registro de todos los mensajes enviados con estados
- **`ejecuciones`**: Log de cada ejecución del cron job
- **`webhooks`**: Eventos recibidos de Meta
- **`configuracion`**: Configuración del sistema

### Ubicación:

```
data/recordatorios.db
```

## 📝 Plantilla de Mensaje

La plantilla debe estar **aprobada por Meta** antes de usar.

**Nombre**: `recordatorio_cita_v1`

**Contenido**:

```
🏥 *Recordatorio de Cita - Clínica Láser*

Hola {{1}},

Le recordamos su cita médica para mañana:

📅 *Fecha:* {{2}}
⏰ *Hora:* {{3}}
👨‍⚕️ *Médico:* {{4}}
🏢 *Sede:* {{5}}
🚪 *Consultorio:* {{6}}

📋 *Tipo:* {{7}}
💳 *Entidad:* {{8}}

⚠️ *Por favor llegar 20 minutos antes*
📄 Traer documento de identidad y orden médica

Si necesita cancelar, contáctenos con anticipación.

¡Gracias por confiar en nosotros! 🙏
```

**Variables**:

1. Nombre del paciente
2. Fecha (ej: "Viernes, 6 de diciembre")
3. Hora (ej: "10:00 AM")
4. Nombre del médico
5. Sede
6. Consultorio
7. Tipo de cita
8. Entidad (EPS)

## 🔔 Webhooks

Los webhooks permiten recibir actualizaciones en tiempo real:

### Eventos soportados:

- ✅ `sent` - Mensaje enviado
- ✅ `delivered` - Mensaje entregado
- ✅ `read` - Mensaje leído
- ❌ `failed` - Mensaje falló

### Configuración en Meta:

1. Ir a tu app en Facebook Developers
2. Productos → WhatsApp → Configuración
3. Webhook URL: `https://tu-dominio.com/webhooks/whatsapp`
4. Verify Token: `mi_token_secreto_2024` (o el que configures)
5. Suscribirse a: `messages`, `message_status`

### Testing local con ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar túnel
ngrok http 3000

# Usar la URL generada en Meta:
# https://xxxx-xx-xx-xx-xx.ngrok.io/webhooks/whatsapp
```

## 📊 Sistema de Logs

Los logs se guardan en `logs/` con rotación diaria:

```
logs/
  ├── error-2025-12-05.log      # Solo errores
  ├── combined-2025-12-05.log   # Todos los logs
  └── ...
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar con hot-reload

# Producción
npm run build            # Compilar TypeScript
npm start                # Iniciar servidor

# Base de datos
npm run db:migrate       # Crear tablas

# Testing
npm test                 # Ejecutar tests
npm run ejemplo          # Ejemplo de uso
```

## 📁 Estructura del Proyecto

```
chatbot-/
├── src/
│   ├── index.ts                          # Entrada principal
│   ├── config/
│   │   └── env.ts                        # Configuración
│   ├── controllers/
│   │   └── webhook.controller.ts         # Controlador webhooks
│   ├── database/
│   │   ├── db.ts                         # Conexión y queries
│   │   └── migrate.ts                    # Migraciones
│   ├── jobs/
│   │   └── reminder.job.ts               # Cron job principal
│   ├── services/
│   │   ├── api.service.ts                # Consumir API de citas
│   │   ├── filter.service.ts             # Filtrado de citas
│   │   ├── meta-whatsapp.service.ts      # Cliente Meta API
│   │   └── meta-template.service.ts      # Plantillas
│   ├── types/
│   │   └── cita.types.ts                 # Tipos TypeScript
│   └── utils/
│       ├── date.utils.ts                 # Utilidades de fechas
│       ├── logger.ts                     # Logger Winston
│       └── phone.utils.ts                # Formateo de teléfonos
├── docs/
│   └── SETUP-META-WHATSAPP.md           # Guía configuración Meta
├── data/                                 # Base de datos SQLite
├── logs/                                 # Archivos de log
├── .env                                  # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🔒 Formato de Teléfonos

El sistema acepta múltiples formatos y los convierte automáticamente:

```
Entrada          →  Salida WhatsApp
─────────────────────────────────────
3001234567       →  whatsapp:+573001234567
573001234567     →  whatsapp:+573001234567
+573001234567    →  whatsapp:+573001234567
```

## 🚨 Troubleshooting

### ❌ Error: "Plantilla no aprobada"

**Solución**: Espera aprobación de Meta (24-48 hrs primera vez)

### ❌ Error: "Invalid access token"

**Solución**: Verifica que el token en `.env` sea correcto y no haya expirado

### ❌ Error: "Phone number not registered"

**Solución**: Verifica que el `META_PHONE_NUMBER_ID` sea correcto

### ❌ Webhook no recibe eventos

**Soluciones**:

1. Verifica que la URL sea accesible públicamente
2. Verifica que el token de verificación coincida
3. Revisa los logs de Meta en Facebook Developers

### ❌ Mensajes no se envían

**Diagnóstico**:

```bash
# Ver logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Verificar estado de Meta
curl http://localhost:3000/api/meta/estado

# Ver estadísticas
curl http://localhost:3000/api/estadisticas
```

## 📈 Monitoreo en Producción

### Métricas recomendadas:

- ✅ Tasa de entrega (> 98%)
- ✅ Tasa de lectura (> 70%)
- ✅ Tiempo de respuesta API (< 2s)
- ✅ Mensajes fallidos (< 2%)

### Alertas sugeridas:

- 🚨 Si tasa de entrega < 95%
- 🚨 Si > 10 mensajes fallidos consecutivos
- 🚨 Si API de citas no responde

## 🤝 Soporte

- 📖 **Documentación Meta**: https://developers.facebook.com/docs/whatsapp/cloud-api
- 📖 **Guía configuración**: [`docs/SETUP-META-WHATSAPP.md`](docs/SETUP-META-WHATSAPP.md)
- 🐛 **Issues**: [GitHub Issues](#)

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado para **Clínica Láser Oftalmológica**

---

**Versión**: 2.0.0  
**Última actualización**: Diciembre 2025  
**Stack**: TypeScript, Node.js, Express, SQLite, Meta WhatsApp Business API
