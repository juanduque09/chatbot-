import dayjs from "dayjs";
import apiUOLaserService from "./src/services/api-uolaser.service";

async function testear() {
  const manana = dayjs().add(1, "day").format("YYYY-MM-DD");
  console.log("🔍 Consultando fecha:", manana);

  const citas = await apiUOLaserService.obtenerAgendasTodasSedes(manana);
  console.log("\n📊 Total de citas encontradas:", citas.length);

  if (citas.length > 0) {
    console.log("\n📋 Primeras 5 citas:");
    citas.slice(0, 5).forEach((c, i) => {
      console.log(`\n  Cita ${i + 1}:`);
      console.log("    - ID:", c.id);
      console.log("    - Nombre:", c.nombre);
      console.log("    - requerida:", c.requerida); // ⭐ CAMPO CLAVE
      console.log("    - hora:", c.hora, c.ampm);
      console.log("    - medico:", c.medico);
      console.log("    - sede:", c.sede);
      console.log("    - estado:", c.estado);
    });

    // Verificar si todas las citas tienen la fecha correcta
    const citasConFechaIncorrecta = citas.filter((c) => c.requerida !== manana);
    if (citasConFechaIncorrecta.length > 0) {
      console.log("\n⚠️  PROBLEMA DETECTADO:");
      console.log(
        `   Se consultó para ${manana}, pero ${citasConFechaIncorrecta.length} citas tienen fecha diferente en el campo "requerida"`,
      );
      console.log("\n   Ejemplos:");
      citasConFechaIncorrecta.slice(0, 3).forEach((c) => {
        console.log(
          `   - Cita ${c.id}: requerida="${c.requerida}" (debería ser "${manana}")`,
        );
      });
    } else {
      console.log(`\n✅ Todas las citas tienen la fecha correcta: ${manana}`);
    }
  }
}

testear();
