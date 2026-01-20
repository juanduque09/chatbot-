#!/bin/bash

# Script para verificar número de prueba con el código recibido

PHONE_NUMBER_ID="955198551007760"
ACCESS_TOKEN=$(grep META_ACCESS_TOKEN .env | cut -d'=' -f2)
NUMERO_PRUEBA=$1
CODIGO=$2

if [ -z "$NUMERO_PRUEBA" ] || [ -z "$CODIGO" ]; then
  echo "❌ Faltan parámetros"
  echo "Uso: ./verificar-numero-prueba.sh +573216779467 123456"
  exit 1
fi

echo "🔐 Verificando código para: $NUMERO_PRUEBA"
echo ""

# Paso 2: Verificar con el código recibido
curl -X POST "https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/register" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"pin\": \"${CODIGO}\"
  }" | python3 -m json.tool

echo ""
echo "✅ Si el código es correcto, el número está registrado como número de prueba"
echo ""
echo "Ahora puedes probar el envío:"
echo "  npm run test -- $NUMERO_PRUEBA"
echo ""
