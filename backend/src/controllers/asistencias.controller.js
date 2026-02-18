const db = require('../config/db');

// Marcar entrada
exports.marcarEntrada = async (req, res) => {
  try {
    const { empleado_id } = req.body;

    if (!empleado_id) {
      return res.status(400).json({ mensaje: "Empleado requerido" });
    }

    const sql = `
      INSERT INTO ASISTENCIAS (empleado_id, fecha, hora_entrada)
      VALUES (?, CURDATE(), CURTIME())
    `;

    await db.execute(sql, [empleado_id]);

    res.json({ mensaje: "Entrada registrada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al marcar entrada" });
  }
};

// Marcar salida
exports.marcarSalida = async (req, res) => {
  try {
    const { empleado_id } = req.body;

    const sql = `
      UPDATE ASISTENCIAS
      SET hora_salida = CURTIME()
      WHERE empleado_id = ?
      AND fecha = CURDATE()
      AND hora_salida IS NULL
    `;

    await db.execute(sql, [empleado_id]);

    res.json({ mensaje: "Salida registrada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al marcar salida" });
  }
};

// Ver historial
exports.obtenerAsistencias = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT A.*, E.nombre, E.apellido
      FROM ASISTENCIAS A
      JOIN EMPLEADOS E ON E.id = A.empleado_id
      ORDER BY A.fecha DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener asistencias" });
  }
};
