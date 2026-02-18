const db = require('../config/db');

exports.calcularNomina = async (req, res) => {
  try {
    const { empleado_id } = req.params;

    // Obtener datos del empleado
    const [[empleado]] = await db.query(
      `SELECT salario_mensual, nombre, apellido 
       FROM EMPLEADOS 
       WHERE id = ?`,
      [empleado_id]
    );

    if (!empleado) {
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }

    // Contar asistencias del mes actual
    const [[asistencias]] = await db.query(
      `SELECT COUNT(*) AS dias_trabajados
       FROM ASISTENCIAS
       WHERE empleado_id = ?
       AND MONTH(fecha) = MONTH(CURDATE())
       AND YEAR(fecha) = YEAR(CURDATE())
       AND hora_salida IS NOT NULL`,
      [empleado_id]
    );

    const pago_por_dia = empleado.salario_mensual / 30;
    const total_pagar = pago_por_dia * asistencias.dias_trabajados;

    res.json({
      empleado: `${empleado.nombre} ${empleado.apellido}`,
      dias_trabajados: asistencias.dias_trabajados,
      pago_por_dia,
      total_pagar
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al calcular nómina" });
  }
};
