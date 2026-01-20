#!/bin/bash

# Script para solicitar código y registrar número de prueba

PHONE_NUMBER_ID="955198551007760"
ACCESS_TOKEN=$(grep META_ACCESS_TOKEN .env | cut -d'=' -f2)
NUMERO_PRUEBA=$1

if [ -z "$NUMERO_PRUEBA" ]; then
  echo "❌ Debes proporcionar el número a agregar"
  echo "Uso: ./agregar-numero-prueba.sh +573216779467"
  exit 1
fi

echo "📱 Solicitando código de verificación para: $NUMERO_PRUEBA"
echo ""

# Paso 1: Solicitar código (te llegará por WhatsApp)
curl -X POST "https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/register" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"phone_number\": \"${NUMERO_PRUEBA}\"
  }" | python3 -m json.tool

echo ""
echo "✅ Código de verificación enviado al WhatsApp: $NUMERO_PRUEBA"
echo ""
echo "🔍 Revisa tu WhatsApp, te debe llegar un código de 6 dígitos"
echo ""
echo "Para completar el registro, ejecuta:"
echo "  ./verificar-numero-prueba.sh $NUMERO_PRUEBA <CODIGO>"
echo ""
