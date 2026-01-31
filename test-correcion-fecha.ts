import dayjs from "dayjs";
import "dayjs/locale/es";
import apiUOLaserService from "./src/services/api-uolaser.service";

dayjs.locale("es");

function formatearFecha(fechaStr: string): string {
  const fecha = dayjs(fechaStr);
  return fecha.format("dddd, D [de] MMMM [de] YYYY");
}

async function testear() {
  const manana = dayjs().add(1, "day").format("YYYY-MM-DD");
  console.log("🔍 Fecha consultada:", manana);
  console.log("✅ Fecha formateada correcta:", formatearFecha(manana), "\n");

  const citas = await apiUOLaserService.obtenerAgendasTodasSedes(manana);

  if (citas.length > 0) {
    const citaEjemplo = citas[1]; // ISABELA
    console.log("📋 Ejemplo de cita (ISABELA):");
    console.log("   - ID:", citaEjemplo.id);
    console.log("   - Nombre:", citaEjemplo.nombre);
    console.log(
      "   - cita.requerida (INCORRECTA del API):",
      citaEjemplo.requerida,
    );
    console.log(
      "   - Fecha formateada INCORRECTA:",
      formatearFecha(citaEjemplo.requerida),
    );
    console.log("\n🔧 CON LA CORRECCIÓN:");
    console.log("   - Fecha consultada (CORRECTA):", manana);
    console.log("   - Fecha formateada CORRECTA:", formatearFecha(manana));
  }
}

testear();
