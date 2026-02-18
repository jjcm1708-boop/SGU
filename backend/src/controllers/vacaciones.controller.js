const db = require('../config/db');

exports.solicitarVacaciones = async (req, res) => {
  try {
    const { empleado_id, fecha_inicio, fecha_fin } = req.body;

    // 1️⃣ Calcular días solicitados
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    const diferencia = fin - inicio;
    const dias_solicitados = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;

    if (dias_solicitados <= 0) {
      return res.status(400).json({ message: "Fechas inválidas" });
    }

    // 2️⃣ Obtener fecha de ingreso
    const [empleado] = await db.query(
      "SELECT fecha_ingreso FROM EMPLEADOS WHERE id = ?",
      [empleado_id]
    );

    if (empleado.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const fechaIngreso = new Date(empleado[0].fecha_ingreso);
    const hoy = new Date();
    const anios = hoy.getFullYear() - fechaIngreso.getFullYear();

    // 3️⃣ Obtener días totales según política
    const [politica] = await db.query(
      "SELECT dias FROM POLITICA_VACACIONES WHERE ? BETWEEN anios_min AND anios_max",
      [anios]
    );

    const diasTotales = politica[0]?.dias || 0;

    // 4️⃣ Días ya usados
    const [usados] = await db.query(
      `SELECT SUM(dias_solicitados) AS usados
       FROM VACACIONES
       WHERE empleado_id = ?
       AND estado = 'aprobado'`,
      [empleado_id]
    );

    const diasUsados = usados[0].usados || 0;
    const disponibles = diasTotales - diasUsados;

    // 5️⃣ Validar disponibilidad
    if (dias_solicitados > disponibles) {
      return res.status(400).json({
        message: "No tienes suficientes días de vacaciones",
        dias_disponibles: disponibles
      });
    }

    // 6️⃣ Guardar solicitud
    const sql = `
      INSERT INTO VACACIONES 
      (empleado_id, fecha_inicio, fecha_fin, dias_solicitados)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      empleado_id,
      fecha_inicio,
      fecha_fin,
      dias_solicitados
    ]);

    return res.status(201).json({
      message: "Solicitud creada correctamente",
      dias_solicitados,
      dias_restantes: disponibles - dias_solicitados,
      id: result.insertId
    });

  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ error });
  }
};

exports.listarSolicitudes = (req, res) => {
    const sql = `
        SELECT v.*, e.nombre
        FROM VACACIONES v
        JOIN EMPLEADOS e ON v.empleado_id = e.id
        ORDER BY v.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        res.json(results);
    });
};

exports.aprobarVacaciones = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Obtener solicitud
    const [solicitud] = await db.query(
      "SELECT * FROM VACACIONES WHERE id = ?",
      [id]
    );

    if (solicitud.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    if (solicitud[0].estado !== "pendiente") {
      return res.status(400).json({
        message: "La solicitud ya fue procesada",
        estado_actual: solicitud[0].estado
      });
    }

    const empleado_id = solicitud[0].empleado_id;
    const diasSolicitados = solicitud[0].dias_solicitados;

    // 2️⃣ Calcular días disponibles actuales
    const [usados] = await db.query(
      `SELECT SUM(dias_solicitados) AS usados
       FROM VACACIONES
       WHERE empleado_id = ?
       AND estado = 'aprobado'`,
      [empleado_id]
    );

    const diasUsados = usados[0].usados || 0;

    const [empleado] = await db.query(
      "SELECT fecha_ingreso FROM EMPLEADOS WHERE id = ?",
      [empleado_id]
    );

    const fechaIngreso = new Date(empleado[0].fecha_ingreso);
    const hoy = new Date();
    const anios = hoy.getFullYear() - fechaIngreso.getFullYear();

    const [politica] = await db.query(
      "SELECT dias FROM POLITICA_VACACIONES WHERE ? BETWEEN anios_min AND anios_max",
      [anios]
    );

    const diasTotales = politica[0]?.dias || 0;
    const disponibles = diasTotales - diasUsados;

    // 3️⃣ Validar nuevamente
    if (diasSolicitados > disponibles) {
      return res.status(400).json({
        message: "No hay días disponibles para aprobar esta solicitud",
        dias_disponibles: disponibles
      });
    }

    // 4️⃣ Aprobar
    await db.query(
      "UPDATE VACACIONES SET estado = 'aprobado' WHERE id = ?",
      [id]
    );

    return res.json({
      message: "Vacaciones aprobadas correctamente",
      dias_restantes: disponibles - diasSolicitados
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};


exports.rechazarVacaciones = async (req, res) => {
  try {
    const { id } = req.params;

    const [solicitud] = await db.query(
      "SELECT estado FROM VACACIONES WHERE id = ?",
      [id]
    );

    if (solicitud.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    if (solicitud[0].estado !== "pendiente") {
      return res.status(400).json({
        message: "La solicitud ya fue procesada",
        estado_actual: solicitud[0].estado
      });
    }

    await db.query(
      "UPDATE VACACIONES SET estado = 'rechazado' WHERE id = ?",
      [id]
    );

    return res.json({ message: "Solicitud rechazada correctamente" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};


exports.diasDisponibles = async (req, res) => {
  try {
    const { empleado_id } = req.params;

    // Obtener fecha de ingreso
    const [empleado] = await db.query(
      "SELECT fecha_ingreso FROM EMPLEADOS WHERE id = ?",
      [empleado_id]
    );

    if (empleado.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const fechaIngreso = new Date(empleado[0].fecha_ingreso);
    const hoy = new Date();

    const anios = hoy.getFullYear() - fechaIngreso.getFullYear();

    // Obtener política correspondiente
    const [politica] = await db.query(
      "SELECT dias FROM POLITICA_VACACIONES WHERE ? BETWEEN anios_min AND anios_max",
      [anios]
    );

    const diasTotales = politica[0]?.dias || 0;

    // Días ya usados
    const [usados] = await db.query(
      `SELECT SUM(dias_solicitados) AS usados
       FROM VACACIONES
       WHERE empleado_id = ?
       AND estado = 'aprobado'`,
      [empleado_id]
    );

    const diasUsados = usados[0].usados || 0;
    const disponibles = diasTotales - diasUsados;

    return res.json({
      años_antiguedad: anios,
      dias_totales: diasTotales,
      dias_usados: diasUsados,
      dias_disponibles: disponibles
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

