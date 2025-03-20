// Esperar a que Ace Editor cargue completamente
window.onload = function () {
    // Crear el editor Ace
    const editor = ace.edit("js-editor");
    editor.setTheme("ace/theme/monokai"); // Tema oscuro
    editor.session.setMode("ace/mode/javascript"); // Modo JavaScript

    // Habilitar las herramientas de autocompletado
    ace.require("ace/ext/language_tools");
    editor.setOptions({
        useSoftTabs: true,
        tabSize: 4,
        enableBasicAutocompletion: true, // Autocompletado básico
        enableLiveAutocompletion: true, // Autocompletado en vivo
        enableSnippets: true, // Snippets de código
    });

    // Lista de sugerencias personalizadas
    const customCompletions = [
        { caption: "console.log", value: "console.log();", meta: "Método" },
        { caption: "document.getElementById", value: "document.getElementById('');", meta: "DOM" },
        { caption: "document.querySelector", value: "document.querySelector('');", meta: "DOM" },
        { caption: "setTimeout", value: "setTimeout(() => {\n\t\n}, 1000);", meta: "Timer" },
        { caption: "setInterval", value: "setInterval(() => {\n\t\n}, 1000);", meta: "Timer" },
        { caption: "fetch", value: "fetch('https://api.example.com').then(response => response.json()).then(data => console.log(data));", meta: "HTTP Request" }
    ];

    // Agregar sugerencias personalizadas a Ace Editor
    const langTools = ace.require("ace/ext/language_tools");
    langTools.addCompleter({
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (prefix.length === 0) return;
            callback(null, customCompletions.map(item => ({
                caption: item.caption,
                value: item.value,
                meta: item.meta
            })));
        }
    });

    // Función para ejecutar el código
    function ejecutarCodigo() {
        const userCode = editor.getValue();
        const sandboxFrame = document.getElementById('sandbox-frame');
        const consoleOutput = document.getElementById('console-output');

        // Limpiar la consola antes de mostrar nuevos resultados
        consoleOutput.textContent = '';

        // Código seguro para ejecutar en el iframe
        const sandboxHTML = `
            <script>
                (function() {
                    window.parent.postMessage({ type: 'log', message: 'Código ejecutado...' }, '*');

                    console.log = function(...args) {
                        try {
                            const output = args.map(arg => {
                                if (typeof arg === 'object') {
                                    return JSON.stringify(arg, null, 2);
                                }
                                return String(arg);
                            }).join(' ');

                            window.parent.postMessage({ type: 'log', message: output }, '*');
                        } catch (error) {
                            window.parent.postMessage({ type: 'error', message: 'Error en console.log' }, '*');
                        }
                    };

                    try {
                        ${userCode}
                    } catch (error) {
                        window.parent.postMessage({ type: 'error', message: error.message }, '*');
                    }
                })();
            <\/script>
        `;

        // Cargar el código en el iframe
        sandboxFrame.srcdoc = sandboxHTML;
    }

    // Evento para el botón de ejecutar
    document.getElementById('run-btn').addEventListener('click', ejecutarCodigo);

    // Evento para ejecutar con Ctrl + Enter
    editor.commands.addCommand({
        name: "executeCode",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: ejecutarCodigo
    });

    // Escuchar mensajes del iframe y mostrarlos en la consola
    window.addEventListener('message', function (event) {
        if (event.data.type === 'log') {
            document.getElementById('console-output').textContent += event.data.message + '\n';
        } else if (event.data.type === 'error') {
            document.getElementById('console-output').textContent += 'Error: ' + event.data.message + '\n';
        }
    });
};
