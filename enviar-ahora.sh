#!/bin/bash

# Script para enviar mensaje de prueba AHORA MISMO
# Usa los datos de ejemplo-citas.json (JUAN VILLADA)

echo "📱 Enviando mensaje de prueba a JUAN VILLADA..."
echo ""

curl -X POST http://localhost:3000/api/prueba-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "3206233559",
    "nombre": "JUAN VILLADA",
    "hora": 1000,
    "ampm": "AM",
    "consultorio": "CONSULTORIO 301",
    "medico": "DRA. PATRICIA LOPEZ",
    "sede": "PEREIRA",
    "requerida": "2025-11-20",
    "tipo": "CONSULTA",
    "concepto": "CONTROL",
    "entidad": "EPS SURA",
    "observacion": "LLEGAR 20 MIN ANTES, CITA OPTOMETRIA, , DOCUMENTO DE IDENTIDAD, DISPONIBILIDAD DE TIEMPO. DIRECCION, AV CIRCUNVALAR N 9-42 PEREIRA, ESQUINA SEGUIDA DE JUAN VALDEZ. PLAN COMPLEMENTARIO $24.500/LLEGAR 20 MIN ANTES, TRAER ORDEN MEDICA, DOCUMENTO DE IDENTIDAD, DISPONIBILIDAD DE TIEMPO. DIRECCION, AV CIRCUNVALAR N 9-42 PEREIRA, ESQUINA SEGUIDA DE JUAN VALDEZ."
  }'

echo ""
echo ""
echo "✅ Mensaje enviado! Revisa el WhatsApp del número 3206233559"
