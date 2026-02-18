CREATE DATABASE SGU;

USE SGU;

CREATE TABLE USUARIOS(
id INT auto_increment PRIMARY KEY,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
rol ENUM('admin_rh', 'empleado') default 'empleado',
created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE EMPLEADOS(
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT UNIQUE,
nombre VARCHAR(100) NOT NULL,
apellido VARCHAR(100) NOT NULL,
fecha_ingreso DATE NOT NULL,
salario_mensual DECIMAL(10,2) NOT NULL,
puesto VARCHAR(100),
dias_vacaciones INT DEFAULT 0,
activo BOOLEAN DEFAULT TRUE,
FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id)
);

CREATE TABLE ASISTENCIAS (
id INT AUTO_INCREMENT PRIMARY KEY,
empleado_id INT NOT NULL,
fecha DATE NOT NULL,
hora_entrada TIME,
hora_salida TIME,
estado ENUM('normal','retardo','falta') DEFAULT 'normal',
FOREIGN KEY (empleado_id) REFERENCES EMPLEADOS(id)
);

CREATE INDEX idx_asistencias_empleado ON ASISTENCIAS(empleado_id);

CREATE TABLE VACACIONES(
id INT AUTO_INCREMENT PRIMARY KEY,
empleado_id INT NOT NULL,
fecha_inicio DATE NOT NULL,
fecha_fin DATE NOT NULL,
dias_solicitados INT,
estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
FOREIGN KEY(empleado_id) REFERENCES EMPLEADOS(id)
);

CREATE INDEX idx_vacaciones_empleado ON VACACIONES(empleado_id);

CREATE TABLE DOCUMENTOS(
id INT AUTO_INCREMENT PRIMARY KEY,
empleado_id INT NOT NULL,
tipo_documento ENUM('contrato', 'nomina', 'otro'),
ruta_archivo VARCHAR(255) NOT NULL,
fecha_subida TIMESTAMP DEFAULT current_timestamp,
FOREIGN KEY(empleado_id) REFERENCES EMPLEADOS(id)
);

CREATE TABLE NOMINA(
id INT AUTO_INCREMENT PRIMARY KEY,
empleado_id INT NOT NULL,
periodo_inicio DATE NOT NULL,
periodo_fin DATE NOT NULL,
dias_trabajados INT DEFAULT 0,
faltas INT default 0,
horas_extra DECIMAL(5, 2) DEFAULT 0,
salario_base DECIMAL(10,2),
total_pago DECIMAL(10,2),
fecha_pago date,
FOREIGN KEY(empleado_id) REFERENCES EMPLEADOS(id)
);

CREATE INDEX idx_nomina_empleado ON NOMINA(empleado_id);

CREATE TABLE NOMINA_DETALLE(
id INT AUTO_INCREMENT PRIMARY KEY,
nomina_id INT NOT NULL,
concepto VARCHAR(100),
tipo ENUM('percepcion', 'deduccion'),
monto DECIMAL(10,2) NOT NULL,
FOREIGN KEY(nomina_id) REFERENCES NOMINA(id)
);


INSERT INTO USUARIOS (email, password, rol)
VALUES (
  'admin@sgu.com',
  '$2b$10$0RH0mrBqmnrbykjHXV4xjOsgFy.jp5rf/VyoZB4pv05IM2MREdy6q',
  'admin_rh'
);

DELETE FROM USUARIOS WHERE email = 'admin@sgu.com';

SELECT id, email, password, rol FROM USUARIOS;

SELECT id, email FROM USUARIOS;

SELECT id, nombre, apellido FROM EMPLEADOS;

select * from asistencias;

select * From nomina;