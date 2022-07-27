(function() {

    let DB;
    let idCliente;
    const formulario   = document.querySelector('#form_editar_cliente');
    const nombreInput  = document.querySelector('#nombre');
    const emailInput   = document.querySelector('#email');
    const empresaInput = document.querySelector('#empresa');
    const phoneInput   = document.querySelector('#phone');

    document.addEventListener('DOMContentLoaded', () => {

        conectarDB();
        formulario.addEventListener('submit', actualizarCliente);

        // Verificar si el cliente existe
        const parametrosURL = new URLSearchParams(window.location.search);
        idCliente = parametrosURL.get('id');
        if(idCliente) {
            setTimeout( () => {
                obtenerCliente(idCliente);
            }, 100);
        }

    });

    function conectarDB() {
        // ABRIR CONEXIÓN EN LA BD:
        let abrirConexion = window.indexedDB.open('crm', 1);

        // si hay un error, lanzarlo
        abrirConexion.onerror = function() {
            console.log('Hubo un error');
        };

        // si todo esta bien, asignar a database el resultado
        abrirConexion.onsuccess = function() {
            // guardamos el resultado
            DB = abrirConexion.result;
        };
    }

    function obtenerCliente(id) {

        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        let request = objectStore.openCursor();
        request.onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                if(cursor.value.id  == id ) {
                    // pasar el que estamos editando...
                    llenarFormulario(cursor.value);
                }
                cursor.continue();          
            }
        };

    }

    function llenarFormulario(datosCliente) {
        const {nombre, email, empresa, phone } = datosCliente;
        nombreInput.value = nombre;
        emailInput.value = email;
        empresaInput.value = empresa;
        phoneInput.value = phone;
    }

    function actualizarCliente(e) {

        e.preventDefault();

        if( nombreInput.value === '' || emailInput.value === '' || empresaInput.value === '' || phoneInput.value === '' ) {

            imprimirAlerta('Error','¡Todos los campos son obligatorios!', 'error', 'Cerrar');
            return;
        }

        // actualizar...
        const clienteActualizado = {
            nombre: nombreInput.value,
            email: emailInput.value,
            empresa: empresaInput.value,
            phone: phoneInput.value,
            id: Number(idCliente)
        };

        // actualizar...
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        objectStore.put(clienteActualizado);

        transaction.oncomplete = () => {
            imprimirAlerta('Genial','¡Cliente modificado correctamente!', 'success', 'Cerrar');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        };

        transaction.onerror = (error) => {
            const incorrect = error.target; 
            imprimirAlerta('¡Error!', String(incorrect.error), 'error', 'Cerrar');
        };
    }

    function imprimirAlerta(titulo, mensaje, tipo, btn){
        swal({
            title: titulo,
            text: mensaje,
            icon: tipo,
            button: btn,
        });
        document.querySelector('.swal-button--confirm').style.backgroundColor = '#212529';
    }

})();