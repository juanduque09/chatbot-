#!/bin/bash

# Plantilla mejorada con dirección y botón de cancelación (v2)

WABA_ID="25747135574898164"
ACCESS_TOKEN=$(grep META_ACCESS_TOKEN .env | cut -d'=' -f2)

echo "🔧 Creando plantilla mejorada: recordatorio_cita_completo_v2"
echo ""

curl -X POST "https://graph.facebook.com/v18.0/${WABA_ID}/message_templates" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "recordatorio_cita_completo_v2",
    "language": "es",
    "category": "UTILITY",
    "components": [
      {
        "type": "BODY",
        "text": "Hola {{1}},\n\nLe recordamos su cita médica programada en *Unidad oftalmológica láser*\n\n📅 *Fecha:* {{2}}\n⏰ *Hora:* {{3}}\n👨‍⚕️ *Médico:* {{4}}\n🏢 *Sede:* {{5}}\n📍 *Dirección:* {{6}}\n📋 *Tipo:* {{7}}\n💳 *Entidad:* {{8}}\n\n⚠️ OBSERVACIONES:\n{{9}}\n\nSi no puede asistir, le agradecemos cancelar su cita con mínimo 1 día de anticipación, comunicándose al WhatsApp 320 680 3362.\n\n¡Gracias por confiar en Unidad Oftalmológica Láser!\nEstamos para cuidar de su salud visual 💙\n\nEste es un mensaje automático de recordatorio. Esta línea no recibe respuestas.\nPara cancelar o reprogramar su cita, por favor comuníquese al número indicado.",
        "example": {
          "body_text": [
            [
              "PACIENTE",
              "miércoles, 22 de octubre de 2025",
              "7:55 AM",
              "MEDICO",
              "PEREIRA",
              "Av Circunvalar Carrera 13 #9-42",
              "CONSULTA",
              "PARTICULAR",
              "CX CATARATA OI - REGISTRARSE 20 MINUTOS ANTES - ORDEN MEDICA - DOCUMENTO DE IDENTIFICACIÓN"
            ]
          ]
        }
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Plantilla enviada para aprobación"
echo "⏱️  Tiempo de aprobación: 15 minutos a 48 horas"
