import { initDatabase } from "./db";
import logger from "../utils/logger";

/**
 * Script para ejecutar migraciones de la base de datos
 */
async function migrate() {
  try {
    logger.info("🚀 Ejecutando migraciones de base de datos...");

    initDatabase();

    logger.info("✅ Migraciones completadas exitosamente");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error al ejecutar migraciones:", error);
    process.exit(1);
  }
}

migrate();
