# Generador de Códigos Secuenciales Natura

Sistema para generar códigos secuenciales según estándares Natura, con conexión a dos bases de datos MySQL.

## Requisitos

- Servidor web (Apache, Nginx)
- PHP 7.4+
- MySQL 5.7+
- Navegador moderno

## Instalación

1. Crear las bases de datos ejecutando los scripts SQL:
   ```bash
   mysql -u root -p < sql/natura_products.sql
   mysql -u root -p < sql/natura_records.sql
   ```

2. Configurar las credenciales en `backend/config.php`

3. Subir los archivos al servidor:
   - Frontend en la carpeta pública (ej. `public_html`)
   - Backend en una carpeta protegida (ej. `api`)

4. Configurar la URL de la API en `frontend/app.js`:
   ```javascript
   const API_BASE_URL = 'https://tudominio.com/api';
   ```

## Estructura

- **Frontend**: HTML, CSS y JavaScript puro
- **Backend**: API REST en PHP
- **Bases de Datos**:
  - `natura_products`: Solo lectura, contiene catálogo de productos
  - `natura_records`: Lectura/escritura, registra las actividades

## Seguridad

Para producción:
1. Usar HTTPS
2. Proteger el acceso al backend con autenticación
3. Limitar acceso a las bases de datos por IP
4. Implementar copias de seguridad periódicas