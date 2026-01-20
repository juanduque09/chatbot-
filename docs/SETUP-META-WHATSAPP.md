# 🚀 Guía de Configuración: Meta WhatsApp Business API

## 📱 Configuración Completa - Clínica Oftalmológica

### ✅ REQUISITOS PREVIOS

- Cuenta de Facebook (administrador)
- Número de teléfono (NO necesita estar en uso, solo para verificación de negocio)
- Información legal de la clínica (NIT, razón social, dirección)
- Tarjeta de crédito (solo para verificación, no se cobra hasta >1000 mensajes)

---

## 🔧 PASO 1: Crear Facebook Business Manager (15 min)

### 1.1 Crear Business Manager

1. Ve a: https://business.facebook.com
2. Click en **"Crear cuenta"**
3. Completa:
   - **Nombre del negocio**: "Clínica Láser Oftalmológica" (nombre real)
   - **Tu nombre**: [Tu nombre completo]
   - **Email empresarial**: [email de la clínica]
4. Click **"Siguiente"** → **"Enviar"**

### 1.2 Verificar Negocio (Importante para producción)

1. En Business Manager, ve a **"Configuración del negocio"** (⚙️ arriba derecha)
2. Click en **"Información del negocio"** (menú izquierda)
3. Click **"Empezar verificación"**
4. Selecciona método:
   - **Opción A**: Subir documento oficial (RUT, Cámara de Comercio) ⚡ MÁS RÁPIDO
   - **Opción B**: Verificación por teléfono
   - **Opción C**: Verificación por correo postal
5. Sube documentos y espera aprobación (24-48 hrs usualmente)

> ⚠️ **Nota**: Puedes empezar a configurar sin verificación, pero necesitas estar verificado para producción

---

## 📲 PASO 2: Configurar WhatsApp Business API (20 min)

### 2.1 Crear WhatsApp Business Account

1. En Business Settings, ve a **"Cuentas"** → **"WhatsApp Business"**
2. Click **"Agregar"** → **"Crear una cuenta de WhatsApp Business"**
3. Nombre: `Clinica Laser Recordatorios` (identificador interno)
4. Click **"Siguiente"** → **"Crear cuenta"**

### 2.2 Configurar Número de WhatsApp

1. En la cuenta creada, click **"Agregar número de teléfono"**
2. Selecciona:

   - **Opción A**: **"Usar el número de teléfono de Meta"** ⭐ RECOMENDADO

     - Es GRATIS
     - No necesitas SIM física
     - Te asignan un número virtual de WhatsApp

   - **Opción B**: Usar tu número propio
     - Si ya tienes WhatsApp Business en ese número, debes migrarlo
     - El número quedará vinculado a la API (no podrás usar la app)

3. Si elegiste Meta (recomendado):

   - Click **"Siguiente"**
   - Meta te asignará un número (ej: +1 555 XXX XXXX)
   - Este será tu número de envío

4. Selecciona país: **Colombia** (para mejor deliverability local)

### 2.3 Crear Perfil de Negocio

1. Completa el perfil de WhatsApp:

   - **Nombre visible**: "Clínica Láser" (lo verán los pacientes)
   - **Categoría**: "Salud/Medicina"
   - **Descripción**: "Recordatorios automáticos de citas médicas"
   - **Dirección**: [Dirección de la clínica]
   - **Email**: [email de contacto]
   - **Sitio web**: [si tienen]

2. **Foto de perfil**: Logo de la clínica (cuadrada, min 640x640px)

3. Click **"Guardar"**

---

## 🔑 PASO 3: Obtener Credenciales de API (10 min)

### 3.1 Generar Token de Acceso Permanente

1. En **WhatsApp Business → Configuración de API**
2. Ve a **"Tokens de acceso"**
3. Click **"Crear token de acceso del sistema"**
   - **Nombre**: `token-recordatorios-prod`
   - **Aplicación**: Selecciona tu app (o crea una nueva)
   - **Permisos necesarios**:
     - ✅ `whatsapp_business_messaging`
     - ✅ `whatsapp_business_management`
4. Click **"Generar token"**
5. **COPIA Y GUARDA** este token (no se volverá a mostrar)

### 3.2 Obtener Credenciales Necesarias

Anota estos valores (los necesitarás para `.env`):

```env
# 1. Token de acceso (del paso anterior)
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx

# 2. Phone Number ID (en la sección de números)
META_PHONE_NUMBER_ID=123456789012345

# 3. WhatsApp Business Account ID (en la configuración general)
META_WABA_ID=123456789012345

# 4. App ID y App Secret (en tu app de Facebook)
META_APP_ID=123456789012345
META_APP_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

### Cómo encontrar cada ID:

**Phone Number ID:**

- Business Settings → WhatsApp Business → Click en tu número → Copia el ID

**WABA ID:**

- Business Settings → WhatsApp Business → Click en tu cuenta → Está arriba

**App ID y Secret:**

- Ve a https://developers.facebook.com/apps
- Selecciona tu app → Configuración básica

---

## 📝 PASO 4: Crear Plantillas de Mensajes (30 min)

### ¿Por qué plantillas?

Meta requiere que los mensajes iniciados por el negocio usen plantillas pre-aprobadas. Esto:

- ✅ Reduce spam
- ✅ Aumenta deliverability (99%+)
- ✅ Cumple con políticas de WhatsApp

### 4.1 Crear Plantilla de Recordatorio

1. En WhatsApp Manager → **"Plantillas de mensajes"**
2. Click **"Crear plantilla"**
3. Configura:

**Nombre de plantilla**: `recordatorio_cita_v1`

**Categoría**: `UTILITY` (para recordatorios transaccionales)

**Idioma**: `Español`

**Contenido del mensaje**:

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

**Variables a completar:**

1. `{{1}}` = Nombre del paciente
2. `{{2}}` = Fecha (ej: "Viernes, 6 de diciembre")
3. `{{3}}` = Hora (ej: "10:00 AM")
4. `{{4}}` = Nombre del médico
5. `{{5}}` = Sede
6. `{{6}}` = Consultorio
7. `{{7}}` = Tipo de cita
8. `{{8}}` = Entidad

9. **Agregar botones** (opcional pero recomendado):

   - Botón 1: "✅ Confirmar" → URL callback
   - Botón 2: "📞 Contactar" → Número de teléfono clínica

10. Click **"Enviar"**

### 4.2 Tiempo de Aprobación

- ⏱️ Primera plantilla: 24-48 horas
- ⏱️ Plantillas siguientes: 1-4 horas
- 📧 Recibirás email cuando sea aprobada

### 4.3 Crear Plantilla de Confirmación (opcional)

**Nombre**: `confirmacion_recibida`

**Contenido**:

```
✅ *Confirmación Recibida*

Gracias por confirmar su asistencia.

Lo esperamos el {{1}} a las {{2}}.

Recuerde llegar 20 minutos antes.
```

---

## 🔗 PASO 5: Configurar Webhooks (15 min)

Los webhooks te permiten saber si el mensaje fue entregado, leído, o si hubo error.

### 5.1 Configurar URL de Webhook

1. En tu app de Facebook → **Productos** → **WhatsApp** → **Configuración**
2. En **"Webhooks"**, click **"Configurar"**
3. Necesitarás:

   - **URL de callback**: `https://tu-dominio.com/webhooks/whatsapp` (lo configuramos después)
   - **Token de verificación**: Crea uno aleatorio (ej: `mi_token_secreto_2024`)

4. Suscribirte a estos eventos:
   - ✅ `messages` (mensajes entrantes)
   - ✅ `message_status` (estado: enviado, entregado, leído)
   - ✅ `message_template_status_update` (estado de plantillas)

> 💡 **Nota**: Por ahora puedes usar ngrok para probar localmente, luego lo pasamos a servidor

---

## 💰 PASO 6: Configurar Facturación (5 min)

1. Business Settings → **Pagos** → **Agregar método de pago**
2. Agrega tarjeta de crédito
3. Configura:
   - **Umbral de gasto**: $50 USD (recomendado)
   - **Alertas**: Activar notificaciones a $25 USD

### Costos Recordatorio:

```
Mes 1-1000 mensajes: $0 USD ✨
Mes con 2000 mensajes: ~$28 USD
Mes con 5000 mensajes: ~$112 USD
```

---

## ✅ VERIFICACIÓN FINAL

Antes de integrar con el código, verifica:

- [ ] Business Manager creado
- [ ] Negocio verificado (o en proceso)
- [ ] WhatsApp Business Account creada
- [ ] Número asignado (de Meta o propio)
- [ ] Perfil de negocio completado
- [ ] Token de acceso copiado
- [ ] Phone Number ID copiado
- [ ] WABA ID copiado
- [ ] Plantilla creada y aprobada (o pendiente)
- [ ] Webhook configurado (o URL preparada)
- [ ] Método de pago agregado

---

## 📞 SIGUIENTE PASO

Una vez tengas:

1. ✅ Token de acceso
2. ✅ Phone Number ID
3. ✅ Plantilla aprobada (o al menos enviada)

Avísame y procederemos a:

- Configurar el archivo `.env`
- Migrar el código a Meta SDK
- Hacer pruebas de envío

---

## 🆘 SOPORTE

**Recursos oficiales:**

- Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api
- Business Manager: https://business.facebook.com
- Soporte Meta: https://business.facebook.com/business/help

**Problemas comunes:**

- **Negocio no verificado**: Puedes probar con hasta 5 números mientras verifican
- **Plantilla rechazada**: Asegúrate de no incluir URLs sin aprobación
- **Token expirado**: Los tokens permanentes no expiran a menos que los revoques

---

¿Tienes alguna duda de esta configuración? Cuando estés listo, seguimos con el código. 🚀
