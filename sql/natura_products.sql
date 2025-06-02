-- Creación de la base de datos de productos
CREATE DATABASE IF NOT EXISTS natura_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE natura_products;

-- Tabla de productos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    serial_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Índices adicionales
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_serial ON products(serial_number);

-- Datos iniciales de ejemplo
INSERT INTO products (code, serial_number, name, description) VALUES
('P001', 'SN-001-2025', 'Crema Hidratante Ekos', 'Crema hidratante con ingredientes naturales de la línea Ekos'),
('P002', 'SN-002-2025', 'Perfume Kaiak', 'Perfume masculino de la línea Kaiak con fragancia fresca'),
('P003', 'SN-003-2025', 'Jabón Tododia', 'Jabón líquido de la línea Tododia con aroma a coco');