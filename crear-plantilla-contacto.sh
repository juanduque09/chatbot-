#!/bin/bash

# Plantilla con contacto y 10 parámetros

WABA_ID="25747135574898164"
ACCESS_TOKEN=$(grep META_ACCESS_TOKEN .env | cut -d'=' -f2)

echo "🔧 Creando plantilla: recordatorio_cita_contacto_v5"
echo ""

curl -X POST "https://graph.facebook.com/v18.0/${WABA_ID}/message_templates" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "recordatorio_cita_contacto_v1",
    "language": "es",
    "category": "UTILITY",
    "components": [
      {
        "type": "BODY",
        "text": "Recordatorio de cita médica Unidad Oftalmológica Láser\n\nPaciente: {{1}}\n📅 Fecha: {{2}}\n⏰ Hora: {{3}}\n👨‍⚕️ Médico: {{4}}\n\n🏥 Sede: {{5}}\n📍 Dirección: {{6}}\n\n📋 Tipo: {{7}}\n💳 Entidad: {{8}}\n\n⚠️ Observaciones:\n{{9}}\n\nSi no puede asistir cancelar con 24 horas de anticipación al: {{10}}\n\nMensaje automático.",
        "example": {
          "body_text": [
            [
              "MARIA GONZÁLEZ",
              "miércoles 22 octubre 2025",
              "7:55 AM",
              "CARLOS FELIPE CAÑAS",
              "PEREIRA",
              "Av Circunvalar Carrera 13 #9-42",
              "CONSULTA",
              "PARTICULAR",
              "Llegar 20 min antes. Traer orden médica y documento de identidad",
              "WhatsApp 320 680 3362 o llamando al 606 3253000"
            ]
          ]
        }
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Plantilla enviada para aprobación"
echo "⏱️  Tiempo de aprobación: 15 minutos a 48 horas"
echo ""
echo "📝 Esta plantilla es categoría UTILITY (recordatorios de citas)"
