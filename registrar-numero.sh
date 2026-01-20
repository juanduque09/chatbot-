#!/bin/bash

# Script para registrar el número de WhatsApp Business en la app de desarrolladores

PHONE_NUMBER_ID="955198551007760"
ACCESS_TOKEN=$(grep META_ACCESS_TOKEN .env | cut -d'=' -f2)

echo "🔧 Registrando número de WhatsApp Business en la aplicación..."
echo ""

curl -X POST "https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/register" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "pin": "123456"
  }' | python3 -m json.tool

echo ""
echo "Nota: Si te pide un PIN, verifica el código que te llegó por SMS o WhatsApp"
