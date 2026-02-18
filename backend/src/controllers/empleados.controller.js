const db = require('../config/db');

// Obtener todos los empleados
exports.obtenerEmpleados = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM EMPLEADOS');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener empleados' });
  }
};

// Crear empleado
exports.crearEmpleado = async (req, res) => {
  try {
    const { nombre, apellido, fecha_ingreso, salario_mensual, puesto, usuario_id } = req.body;

    if (!nombre || !apellido || !fecha_ingreso || !salario_mensual || !puesto || !usuario_id) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const sql = `
      INSERT INTO EMPLEADOS
      (nombre, apellido, fecha_ingreso, salario_mensual, puesto, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      nombre,
      apellido,
      fecha_ingreso,
      salario_mensual,
      puesto,
      usuario_id
    ]);

    res.status(201).json({
      mensaje: 'Empleado creado',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear empleado' });
  }
};

// Actualizar empleado
exports.actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, salario_mensual, puesto, activo } = req.body;

    const sql = `
      UPDATE EMPLEADOS
      SET nombre = ?, apellido = ?, salario_mensual = ?, puesto = ?, activo = ?
      WHERE id = ?
    `;

    await db.execute(sql, [nombre, apellido, salario_mensual, puesto, activo, id]);

    res.json({ mensaje: 'Empleado actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar empleado' });
  }
};

// Eliminar empleado
exports.eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute('DELETE FROM EMPLEADOS WHERE id = ?', [id]);

    res.json({ mensaje: 'Empleado eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar empleado' });
  }
};
