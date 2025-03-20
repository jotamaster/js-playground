document.getElementById('run-btn').addEventListener('click', function() {
    const userCode = document.getElementById('js-code').value;
    const consoleOutput = document.getElementById('console-output');
    
    // Limpiar la consola antes de mostrar los nuevos resultados
    consoleOutput.textContent = '';
    
    // Redefinir console.log para capturar la salida
    const log = console.log;
    console.log = function(message) {
        consoleOutput.textContent += message + '\n';
    };

    try {
        // Ejecutar el código del usuario
        new Function(userCode)();
    } catch (error) {
        consoleOutput.textContent = `Error: ${error.message}\n`;
    }

    // Restaurar la función original de console.log
    console.log = log;
});
