# 📝 Guía: Crear Plantilla en Meta WhatsApp Manager

## 🚀 Pasos para Crear la Plantilla

### 1️⃣ Acceder a Meta WhatsApp Manager

1. Ve a: **https://business.facebook.com/wa/manage/message-templates/**
2. Inicia sesión con tu cuenta de Facebook
3. Selecciona tu WhatsApp Business Account: **"Unidad Oftalmológica Laser S.A"**

### 2️⃣ Crear Nueva Plantilla

1. Click en el botón **"Crear plantilla"** (arriba a la derecha)
2. Completa el formulario:

---

## 📋 DATOS DE LA PLANTILLA

### **Nombre de la plantilla:**

```
recordatorio_cita_v1
```

⚠️ **IMPORTANTE:** Debe ser exactamente este nombre (sin espacios, en minúsculas)

### **Categoría:**

Selecciona: **`UTILITY`** (Utilidad)

- Esta categoría es para mensajes transaccionales/recordatorios

### **Idiomas:**

Selecciona: **`Spanish`** o **`es`**

---

## 💬 CONTENIDO DEL MENSAJE

### **Encabezado (Header) - OPCIONAL:**

```
🏥 Recordatorio de Cita
```

### **Cuerpo (Body) - OBLIGATORIO:**

Copia y pega exactamente este texto:

```
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

**Explicación de variables:**

- `{{1}}` = Nombre del paciente
- `{{2}}` = Fecha (ej: "Viernes, 6 de diciembre de 2024")
- `{{3}}` = Hora (ej: "10:00 AM")
- `{{4}}` = Nombre del médico
- `{{5}}` = Sede
- `{{6}}` = Consultorio
- `{{7}}` = Tipo de cita
- `{{8}}` = Entidad/EPS

### **Pie de página (Footer) - OPCIONAL:**

```
Unidad Oftalmológica Laser S.A
```

### **Botones - OPCIONAL (Recomendado):**

**Opción 1: Botón de respuesta rápida**

- Tipo: `QUICK_REPLY`
- Texto: `Confirmar asistencia ✅`

**Opción 2: Botón de llamada**

- Tipo: `PHONE_NUMBER`
- Texto: `Llamar para cancelar`
- Número: `+57 XXX XXX XXXX` (tu número de atención)

---

## 3️⃣ Vista Previa

Meta te mostrará una vista previa. Verifica que:

- ✅ Los emojis se vean correctamente
- ✅ El formato del texto sea legible
- ✅ Las variables {{1}}, {{2}}, etc. estén presentes

---

## 4️⃣ Enviar para Aprobación

1. Click en **"Enviar"**
2. Meta revisará la plantilla
3. **Tiempo de aprobación:** 15 minutos a 48 horas (usualmente 2-4 horas)

---

## 5️⃣ Estados de la Plantilla

Después de enviar, verás uno de estos estados:

| Estado          | Significado | Acción               |
| --------------- | ----------- | -------------------- |
| **PENDING**     | En revisión | Esperar              |
| **APPROVED** ✅ | Aprobada    | ¡Listo para usar!    |
| **REJECTED** ❌ | Rechazada   | Ver razón y corregir |

---

## ⚠️ CONSEJOS PARA APROBACIÓN RÁPIDA

### ✅ **LO QUE SE DEBE HACER:**

- Usar lenguaje claro y profesional
- Ser específico sobre el propósito del mensaje
- Incluir información útil para el usuario
- Usar variables para personalización

### ❌ **LO QUE SE DEBE EVITAR:**

- Lenguaje promocional o ventas agresivas
- Contenido engañoso
- Información de salud sensible
- URLs acortadas o sospechosas
- Emojis excesivos

---

## 🔍 Verificar Estado de la Plantilla

Una vez que la crees, ejecuta este comando para verificar su estado:

\`\`\`bash
npm run test
\`\`\`

O accede directamente a:
https://business.facebook.com/wa/manage/message-templates/

---

## 📞 ¿Necesitas Ayuda?

Si la plantilla es rechazada, Meta te dará una razón. Puedes:

1. Leer la razón del rechazo
2. Modificar el contenido
3. Volver a enviar

---

## ✅ DESPUÉS DE LA APROBACIÓN

Una vez aprobada (estado: **APPROVED**), podrás:

- ✅ Enviar mensajes masivos
- ✅ Iniciar conversaciones con cualquier número
- ✅ Usar el sistema de recordatorios automático

**Comando para probar:**
\`\`\`bash
npm run test -- +573206233559
\`\`\`

---

🎉 **¡Listo! Sigue estos pasos y tendrás tu plantilla aprobada pronto.**
