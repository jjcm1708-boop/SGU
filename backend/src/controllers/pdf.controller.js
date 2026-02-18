const db = require('../config/db');
const PDFDocument = require('pdfkit');

exports.descargarRecibo = async (req, res) => {
  try {
    const { empleado_id } = req.params;

    const [[empleado]] = await db.query(
      `SELECT nombre, apellido, salario_mensual 
       FROM EMPLEADOS 
       WHERE id = ?`,
      [empleado_id]
    );

    if (!empleado) {
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }

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

    const doc = new PDFDocument();

    //HEADERES
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=recibo_nomina_${empleado_id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text('Recibo de Nómina', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Empleado: ${empleado.nombre} ${empleado.apellido}`);
    doc.text(`Salario mensual: $${empleado.salario_mensual}`);
    doc.text(`Días trabajados: ${asistencias.dias_trabajados}`);
    doc.text(`Pago por día: $${pago_por_dia.toFixed(2)}`);
    doc.text(`Total a pagar: $${total_pagar.toFixed(2)}`);

    doc.moveDown();
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`);

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al generar PDF" });
  }
};
