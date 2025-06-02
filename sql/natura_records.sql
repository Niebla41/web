-- Creación de la base de datos de registros
CREATE DATABASE IF NOT EXISTS natura_records CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE natura_records;

-- Tabla de actividades
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp INT NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    code VARCHAR(50) NOT NULL,
    product TEXT NOT NULL,
    duration VARCHAR(20) NOT NULL,
    `option` VARCHAR(50) NOT NULL,
    month VARCHAR(2) NOT NULL,
    product_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Índices para búsquedas
CREATE INDEX idx_activities_timestamp ON activities(timestamp);
CREATE INDEX idx_activities_month_product ON activities(month, product_code);
CREATE INDEX idx_activities_code ON activities(code);