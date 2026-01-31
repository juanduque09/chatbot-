# 🚀 Sistema de Recordatorios Automáticos - CONFIGURADO

## ✅ Estado Actual

### Conexión con API UOLaser

- **URL Base:** http://plesk.catavento.co:8082
- **Autenticación:** JWT (usuario: UOLASER)
- **Estado:** ✅ CONECTADO Y FUNCIONANDO

### Plantilla WhatsApp

- **Nombre:** `recordatorio_cita_completo_v2`
- **ID Meta:** 864586559790067
- **Estado:** ✅ APROBADA
- **Parámetros:** 9 (nombre, fecha, hora, médico, sede, dirección, tipo, entidad, observaciones)

### Configuración de Envío Automático

- **Horario:** 8:00 AM todos los días
- **Frecuencia:** Diaria
- **Cron:** `0 8 * * *`
- **Zona horaria:** America/Bogota

## 📋 Cómo Funciona

### Flujo Automático (Diario a las 8 AM):

1. **Autentica** con API UOLaser usando JWT
2. **Obtiene** citas de mañana de PEREIRA y DOSQUEBRADAS
3. **Filtra** solo citas con teléfono válido
4. **Evita duplicados** - no envía si ya se envió antes
5. **Envía** mensajes con plantilla profesional de WhatsApp
6. **Guarda** registro en base de datos SQLite

### Lógica de Direcciones

- **PEREIRA** → "Av Circunvalar Carrera 13 #9-42"
- **DOSQUEBRADAS** → "Carrera 16 #16-40 barrio valher"

### Formato del Mensaje

```
Hola [NOMBRE],

Le recordamos su cita médica programada en *Unidad oftalmológica láser*

📅 *Fecha:* miércoles, 22 de octubre de 2025
⏰ *Hora:* 7:55 AM
👨‍⚕️ *Médico:* VICTOR CONRADO VELEZ
🏢 *Sede:* PEREIRA
📍 *Dirección:* Av Circunvalar Carrera 13 #9-42
📋 *Tipo:* CONSULTA
💳 *Entidad:* PARTICULAR

⚠️ OBSERVACIONES:
[Observaciones del sistema]

Si no puede asistir, le agradecemos cancelar su cita con mínimo 1 día de anticipación, comunicándose al WhatsApp 320 680 3362.

¡Gracias por confiar en Unidad Oftalmológica Láser!
Estamos para cuidar de su salud visual 💙

Este es un mensaje automático de recordatorio. Esta línea no recibe respuestas.
Para cancelar o reprogramar su cita, por favor comuníquese al número indicado.
```

## 🛠️ Comandos Disponibles

### Prueba de Conexión (SIN enviar mensajes)

```bash
npx tsx src/test-api-real.ts
```

✅ Ya probado y funciona

### Envío Manual con Datos Reales

```bash
npx tsx src/envio-manual-api-real.ts
```

⚠️ Este comando enviará mensajes REALES a los pacientes

### Verificar Estado de Plantilla

```bash
curl -X GET "https://graph.facebook.com/v18.0/25747135574898164/message_templates?fields=name,status&access_token=$(grep META_ACCESS_TOKEN .env | cut -d'=' -f2)" | python3 -m json.tool | grep -A2 "recordatorio_cita_completo_v2"
```

### Iniciar Servidor con Cron Automático

```bash
npm run dev
```

El cron se ejecutará automáticamente a las 8 AM

## 📊 Límites y Restricciones

### Meta WhatsApp Business

- **Tier actual:** TIER_1K (1,000 conversaciones únicas/24h)
- **Mensajes por segundo:** 80 (configurado: 500ms delay = 2/seg)
- **Política:** 1 mensaje por número cada 24 horas

### Política de Duplicados

El sistema NO enviará mensajes duplicados:

- Verifica en base de datos si ya se envió para esa cita
- Guarda citaId + fechaCita como registro único

## 🔒 Seguridad

### Variables de Entorno (.env)

```
API_UOLASER_URL=http://plesk.catavento.co:8082
API_UOLASER_USUARIO=UOLASER
API_UOLASER_CONTRASENIA=UOlaser*2025*
META_ACCESS_TOKEN=[token]
META_PHONE_NUMBER_ID=955198551007760
META_WABA_ID=25747135574898164
CRON_SCHEDULE=0 8 * * *
TZ=America/Bogota
```

⚠️ **NUNCA** commitear el archivo .env al repositorio

## 📁 Archivos Importantes

### Servicios

- `src/services/api-uolaser.service.ts` - Conexión con API real
- `src/services/meta-whatsapp.service.ts` - Envío de mensajes

### Jobs

- `src/jobs/reminder-api-real.job.ts` - Job automático diario

### Scripts de Prueba

- `src/test-api-real.ts` - Prueba conexión SIN enviar
- `src/test-envio-desde-json.ts` - Prueba con datos de ejemplo

### Base de Datos

- `data/chatbot.db` - SQLite con historial de mensajes

## ✅ Checklist de Producción

- [x] API UOLaser conectada
- [x] Autenticación JWT funcionando
- [x] Plantilla Meta aprobada
- [x] Lógica de direcciones implementada
- [x] Sistema de duplicados configurado
- [x] Cron job programado (8 AM)
- [x] Base de datos inicializada
- [ ] **PENDIENTE:** Ejecutar envío manual de prueba con datos reales
- [ ] **PENDIENTE:** Activar servidor en producción para cron automático

## 🚦 Próximos Pasos

1. **Prueba manual con 1-2 números reales** (crear script de prueba)
2. **Verificar que los mensajes lleguen correctamente**
3. **Revisar observaciones y direcciones en mensajes reales**
4. **Activar servidor en producción** con `npm run dev` o PM2
5. **Monitorear primer envío automático** a las 8 AM

## 📞 Soporte

Si algo falla:

1. Revisar logs en consola
2. Verificar conectividad con API: `npx tsx src/test-api-real.ts`
3. Verificar estado de plantilla en Meta
4. Revisar base de datos: `data/chatbot.db`
