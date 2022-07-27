(function() {

    let DB;

    const formulario = document.querySelector('#form_nuevo_cliente');

    document.addEventListener('DOMContentLoaded', () => {

        conectarDB();
        formulario.addEventListener('submit', validarCliente);
    });

    function conectarDB(){
        // ABRIR CONEXIÓN EN LA BD:
        let abrirConexion = window.indexedDB.open('crm', 1);

        // si hay un error, lanzarlo
        abrirConexion.onerror = function(){
            console.log('Hubo un error');
        };
    
        // si todo esta bien, asignar a database el resultado
        abrirConexion.onsuccess = function(){
            // guardamos el resultado
            DB = abrirConexion.result;
        };
    }

    function validarCliente(e){

        e.preventDefault();

        const nombre = document.querySelector('#nombre').value;
        const email = document.querySelector('#email').value;
        const phone = document.querySelector('#phone').value;
        const empresa = document.querySelector('#empresa').value;

        if(nombre === '' || email === '' || phone === '' || empresa === ''){

            imprimirAlerta('Error','¡Todos los campos son obligatorios!', 'error', 'Cerrar');
            return;
        }

        // añadir a la BD...
        // crear un nuevo objeto con toda la info
        const cliente = {
            nombre, 
            email,
            phone,
            empresa
        };

        // Generar un ID único
        cliente.id = Date.now();
        crearNuevoCliente(cliente);
    }

    function crearNuevoCliente(cliente){

        // NUEVO: 
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');
        // console.log(objectStore);
        objectStore.add(cliente);

        transaction.oncomplete = () => {
            // Mostrar mensaje de que todo esta bien...
            imprimirAlerta('Genial','¡Cliente agregado correctamente!', 'success', 'Cerrar');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        };

        transaction.onerror = () => {
            imprimirAlerta('Error','¡Verifica los datos nuevamente!', 'error', 'Cerrar');
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