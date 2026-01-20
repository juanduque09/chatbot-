# 🎯 PRÓXIMOS PASOS

## ✅ Configuración de Meta WhatsApp Business

### 1. Crear y configurar cuenta de Meta

- [ ] Crear Facebook Business Manager
- [ ] Verificar negocio (con documentos de la clínica)
- [ ] Crear WhatsApp Business Account
- [ ] Obtener número virtual de Meta (gratis)

### 2. Crear plantilla de mensaje

- [ ] Ir a WhatsApp Manager → Plantillas
- [ ] Crear plantilla `recordatorio_cita_v1`
- [ ] Enviar para aprobación
- [ ] Esperar aprobación (24-48 hrs)

### 3. Obtener credenciales

- [ ] `META_ACCESS_TOKEN` - Token de acceso permanente
- [ ] `META_PHONE_NUMBER_ID` - ID del número de WhatsApp
- [ ] `META_WABA_ID` - ID de la cuenta de WhatsApp Business
- [ ] `META_APP_ID` - ID de la aplicación
- [ ] `META_APP_SECRET` - Secret de la aplicación

**Guía completa**: `docs/SETUP-META-WHATSAPP.md`

---

## 🔧 Configuración del Proyecto

### 4. Configurar variables de entorno

```bash
# Crear archivo .env
cp .env.example .env

# Editar con tus credenciales
nano .env
```

**Variables requeridas**:

- `API_URL` - URL de la API de citas de la clínica
- `API_KEY` - Key de autenticación de la API
- `META_ACCESS_TOKEN` - Token de Meta
- `META_PHONE_NUMBER_ID` - ID del número

### 5. Inicializar base de datos

```bash
npm run db:migrate
```

### 6. Probar el sistema

```bash
# Iniciar en modo desarrollo
npm run dev

# En otra terminal, probar health check
curl http://localhost:3000/health

# Verificar estado de Meta
curl http://localhost:3000/api/meta/estado
```

---

## 🧪 Pruebas

### 7. Enviar mensaje de prueba

```bash
curl -X POST http://localhost:3000/api/prueba-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "TU_NUMERO_AQUI",
    "nombre": "Juan Pérez",
    "medico": "DRA. PATRICIA LOPEZ",
    "sede": "PEREIRA",
    "consultorio": "CONSULTORIO 301",
    "hora": 1000,
    "ampm": "AM",
    "requerida": "2025-12-06",
    "tipo": "CONSULTA",
    "entidad": "EPS SURA"
  }'
```

### 8. Probar con citas reales

- [ ] Verificar que la API de citas funciona
- [ ] Ejecutar manualmente: `POST http://localhost:3000/api/ejecutar-recordatorios`
- [ ] Revisar logs: `tail -f logs/combined-*.log`
- [ ] Verificar estadísticas: `GET http://localhost:3000/api/estadisticas`

---

## 🌐 Configurar Webhooks (Opcional pero recomendado)

### 9. Exponer servidor públicamente

**Opción A: ngrok (para testing)**

```bash
npm install -g ngrok
ngrok http 3000
# Usar URL generada: https://xxxx.ngrok.io
```

**Opción B: Servidor en producción**

- Deploy en VPS, AWS, Heroku, etc.
- Asegurar con HTTPS

### 10. Configurar webhook en Meta

- [ ] Ir a Facebook Developers → Tu App → WhatsApp → Configuración
- [ ] Webhook URL: `https://tu-dominio.com/webhooks/whatsapp`
- [ ] Verify Token: `mi_token_secreto_2024` (o el de tu `.env`)
- [ ] Suscribirse a: `messages` y `message_status`

---

## 🚀 Poner en Producción

### 11. Deploy

```bash
# Compilar
npm run build

# Iniciar en producción
NODE_ENV=production npm start
```

### 12. Configurar como servicio (Linux)

```bash
# Crear servicio systemd
sudo nano /etc/systemd/system/chatbot-recordatorios.service
```

**Contenido**:

```ini
[Unit]
Description=Chatbot Recordatorios WhatsApp
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/a/chatbot-
ExecStart=/usr/bin/node /ruta/a/chatbot-/dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Activar servicio
sudo systemctl enable chatbot-recordatorios
sudo systemctl start chatbot-recordatorios
sudo systemctl status chatbot-recordatorios
```

### 13. Monitoreo

- [ ] Configurar alertas de logs
- [ ] Revisar estadísticas diariamente
- [ ] Configurar backup de base de datos

---

## 📊 Validación Final

### Checklist de producción:

- [ ] API de citas funcionando
- [ ] Meta WhatsApp configurado y verificado
- [ ] Plantilla aprobada por Meta
- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Cron job configurado correctamente (6 PM)
- [ ] Zona horaria correcta (America/Bogota)
- [ ] Webhooks funcionando (opcional)
- [ ] Logs rotando correctamente
- [ ] Servidor en producción estable
- [ ] Backup configurado

---

## 🆘 ¿Necesitas ayuda?

- 📖 Lee `docs/SETUP-META-WHATSAPP.md` para guía detallada
- 🐛 Revisa la sección de Troubleshooting en `README.md`
- 📝 Revisa los logs: `logs/combined-*.log`

---

**¡Listo para enviar recordatorios profesionales! 🎉**
