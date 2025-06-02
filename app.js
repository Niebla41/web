// Configuración de la API
const API_BASE_URL = 'http://tu-backend.com/api.php'; // Cambiar por tu URL real

// Variables globales
let timerInterval;
let startTime;
let isRunning = false;
let yearLetter = 'A';
let currentMonth = '';
let currentProduct = '';

// Elementos del DOM
const currentYearElem = document.getElementById('currentYear');
const monthSelectElem = document.getElementById('monthSelect');
const productCodeElem = document.getElementById('productCode');
const productDescriptionElem = document.getElementById('productDescription');
const sequentialCodeElem = document.getElementById('sequentialCode');
const timerDisplayElem = document.getElementById('timerDisplay');
const startButtonElem = document.getElementById('startButton');
const stopButtonElem = document.getElementById('stopButton');
const activityTableElem = document.getElementById('activityTable').getElementsByTagName('tbody')[0];

// Función para buscar un producto por código
async function getProductByCode(code) {
    if (!code || code.length < 3) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}?action=get_product&code=${encodeURIComponent(code)}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const product = await response.json();
        return product || null;
    } catch (error) {
        console.error('Error al buscar producto:', error);
        return null;
    }
}

// Función para obtener el siguiente número secuencial
async function getNextSequential(month, productCode) {
    if (!month || !productCode) return 1;

    try {
        const response = await fetch(`${API_BASE_URL}?action=get_next_sequential&month=${month}&product_code=${productCode}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data.nextSequential || 1;
    } catch (error) {
        console.error('Error al obtener secuencial:', error);
        return 1;
    }
}

// Función para guardar actividad
async function saveActivity(activity) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save_record',
                ...activity
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al guardar actividad:', error);
        throw error;
    }
}

// Función para cargar actividades
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=get_records`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        return [];
    }
}

// Establecer el año actual
function setCurrentYear() {
    const today = new Date();
    const year = today.getFullYear();
    currentYearElem.value = year;
    
    // Calcular la letra del año actual (2025=A, 2026=B,...)
    const baseYear = 2025;
    const yearDiff = year - baseYear;
    yearLetter = String.fromCharCode(65 + yearDiff);
    
    // Establecer mes actual
    const month = today.getMonth() + 1;
    if (month <= 9) {
        monthSelectElem.value = String(month);
    } else if (month === 10) {
        monthSelectElem.value = 'A';
    } else if (month === 11) {
        monthSelectElem.value = 'B';
    } else if (month === 12) {
        monthSelectElem.value = 'C';
    }
    
    currentMonth = monthSelectElem.value;
    updateSequentialCode();
}

// Actualizar código secuencial
async function updateSequentialCode() {
    const month = monthSelectElem.value;
    currentMonth = month;
    
    if (currentProduct) {
        const sequential = String(await getNextSequential(month, currentProduct)).padStart(2, '0');
        sequentialCodeElem.querySelector('.sequential-code-display').textContent = `L.${yearLetter}${month}XM${sequential}`;
    } else {
        sequentialCodeElem.querySelector('.sequential-code-display').textContent = `L.${yearLetter}${month}XM01`;
    }
}

// Actualizar tabla de actividades
async function updateActivityTable() {
    try {
        const activities = await loadActivities();
        activityTableElem.innerHTML = '';
        
        activities.forEach(activity => {
            const row = activityTableElem.insertRow();
            
            const cells = [
                activity.date,
                activity.time,
                activity.code,
                activity.product,
                activity.duration,
                activity.option
            ];
            
            cells.forEach((text, index) => {
                const cell = row.insertCell(index);
                cell.textContent = text;
            });
        });
    } catch (error) {
        console.error('Error al actualizar tabla:', error);
    }
}

// Temporizador
function startTimer() {
    if (isRunning) return;
    
    if (!currentProduct) {
        alert('Por favor, ingrese un código de producto válido.');
        return;
    }
    
    isRunning = true;
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
    
    startButtonElem.disabled = true;
    stopButtonElem.disabled = false;
    productCodeElem.disabled = true;
    monthSelectElem.disabled = true;
}

function updateTimer() {
    const now = new Date();
    const diff = now - startTime;
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    timerDisplayElem.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function stopTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    
    // Obtener la opción seleccionada
    const selectedOption = document.querySelector('input[name="options"]:checked').value;
    let optionText = '';
    
    switch (selectedOption) {
        case 'cambioOrden': optionText = 'Cambio de Orden'; break;
        case 'generarSecuencial': optionText = 'Generar Secuencial'; break;
        case 'cambioBatch': optionText = 'Cambio de Batch'; break;
    }
    
    // Crear objeto de registro
    const now = new Date();
    const activity = {
        timestamp: now.getTime(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        code: sequentialCodeElem.querySelector('.sequential-code-display').textContent,
        product: productDescriptionElem.value,
        duration: timerDisplayElem.textContent,
        option: optionText,
        month: currentMonth,
        productCode: currentProduct
    };
    
    try {
        await saveActivity(activity);
        await updateActivityTable();
        
        // Resetear el timer y actualizar UI
        timerDisplayElem.textContent = '00:00:00';
        isRunning = false;
        startButtonElem.disabled = false;
        stopButtonElem.disabled = true;
        productCodeElem.disabled = false;
        monthSelectElem.disabled = false;
        
        // Actualizar el código secuencial para el próximo uso
        updateSequentialCode();
    } catch (error) {
        console.error('Error al guardar actividad:', error);
        alert('Ocurrió un error al guardar el registro');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    setCurrentYear();
    await updateActivityTable();
    await updateSequentialCode();
});

startButtonElem.addEventListener('click', startTimer);
stopButtonElem.addEventListener('click', stopTimer);
monthSelectElem.addEventListener('change', updateSequentialCode);
productCodeElem.addEventListener('input', async function() {
    const code = this.value.trim().toUpperCase();
    const product = await getProductByCode(code);
    
    if (product) {
        productDescriptionElem.value = `${product.name} - ${product.description}`;
    } else {
        productDescriptionElem.value = '';
    }
    
    currentProduct = code;
    updateSequentialCode();
});