(function() {
    
    let DB;
    const listadoClientes = document.querySelector('#body_table');

    document.addEventListener('DOMContentLoaded', () => {

        crearDB();

        if(window.indexedDB.open('crm', 1)) {
            obtenerClientes();
        }

        listadoClientes.addEventListener('click', eliminarRegistro);
        
    });

    // Código de IndexedDB
    function crearDB() {
        // crear base de datos con la versión 1
        const crearDB = window.indexedDB.open('crm', 1);

        // si hay un error, lanzarlo
        crearDB.onerror = function() {
            console.log('Hubo un error');
        };

        // si todo esta bien, asignar a database el resultado
        crearDB.onsuccess = function() {
            // guardamos el resultado
            DB = crearDB.result;
        };

        // este método solo corre una vez
        crearDB.onupgradeneeded = function(e) {
            // el evento que se va a correr tomamos la base de datos
            const db = e.target.result;

            // definir el objectstore, primer parametro el nombre de la BD, segundo las opciones
            // keypath es de donde se van a obtener los indices
            const objectStore = db.createObjectStore('crm', { keyPath: 'id',  autoIncrement: true } );

            //createindex, nombre y keypath, 3ro los parametros
            objectStore.createIndex('nombre', 'nombre', { unique: false } );
            objectStore.createIndex('email', 'email', { unique: true } );
            objectStore.createIndex('phone', 'phone', { unique: false } );
            objectStore.createIndex('empresa', 'empresa', { unique: false } );
            objectStore.createIndex('id', 'id', { unique: true } );

        };
    }

    function obtenerClientes() {

        let abrirConexion = window.indexedDB.open('crm', 1);

        // si hay un error, lanzarlo
        abrirConexion.onerror = function() {
            console.log('Hubo un error');
        };
    
        // si todo esta bien, asignar a database el resultado
        abrirConexion.onsuccess = function() {
            // guardamos el resultado
            DB = abrirConexion.result;
            const objectStore = DB.transaction('crm').objectStore('crm');

            // retorna un objeto request o petición, 
            objectStore.openCursor().onsuccess = function(e) {
                 // cursor se va a ubicar en el registro indicado para acceder a los datos
                const cursor = e.target.result;

                //  console.log(e.target);
                if(cursor) {

                    const { nombre, empresa, email, phone, id } = cursor.value;
                    listadoClientes.innerHTML += `
                    <tr>
                        <td>
                            <ul class="list-unstyled">
                                <li class="lead fw-bold">${nombre}</li>
                                <li>${email}</li>
                            </ul>
                        </td>
                        <td>${phone}</td>
                        <td>${empresa}</td>
                        <td>
                            <a href="editar_cliente.html?id=${id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" data-bs-toggle="tooltip" title="Editar"><path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z"/></svg>
                            </a>
                            <a href="#" data-cliente="${id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="ionicon eliminar" viewBox="0 0 512 512" data-bs-toggle="tooltip" title="Eliminar" data-cliente="${id}"><path data-cliente="${id}" class="eliminar" d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path data-cliente="${id}" class="eliminar" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path data-cliente="${id}" class="eliminar" d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>
                            </a>
                        </td>
                    </tr>
                    `;
                    cursor.continue();
                } else {
                    //  console.log('llegamos al final...');
                }
            };
        };
    }

    function eliminarRegistro(e) {
        
        if (e.target.classList.contains('eliminar')) {
            
            const idEliminar = Number(e.target.dataset.cliente);
    
            swal({
                title: "¿Está seguro?",
                text: "Una vez eliminado, ¡no podrá recuperar este registro!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    
                    const transaction = DB.transaction(['crm'], 'readwrite');
                    const objectStore = transaction.objectStore('crm');
                    
                    objectStore.delete(idEliminar);
                    
                    transaction.oncomplete = function(){
                        if (e.target.tagName == 'svg') {
                            e.target.parentElement.parentElement.parentElement.remove();
                        }else{
                            e.target.parentElement.parentElement.parentElement.parentElement.remove();
                        }
                        swal("Cliente eliminado", {
                            icon: "success",
                        });
                        document.querySelector('.swal-button--confirm').style.backgroundColor = '#212529';
                    }
    
                    transaction.onerror = function(){
                        swal({
                            title: "¡Error!",
                            text: "Ha ocurrido un error eliminando el registro, intente nuevamente.",
                            icon: "error",
                            buttons: true,
                            dangerMode: true,
                        })
                    }
                } else {
                    //swal("Your imaginary file is safe!");
                }
            });
        }
    
    }

})();


