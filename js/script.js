$(document).ready(function() {
    // Variables globales
    let facultades = [];
    let escuelas = [];
    let estudiantes = [];
    let seleccionFacultad = -1;
    let seleccionEscuela = -1;
    let seleccionEstudiante = -1;
    $('#genero').prop('selectedIndex', -1);

    let num = 1;

    function generarCodigoDesdeTabla(texto, tabla) {
        let iniciales = '';
        const palabras = texto.split(' ');
        for (let i = 0; i < palabras.length; i++) {
            if (palabras[i].trim() !== '') {
                iniciales += palabras[i][0].toUpperCase();
            }
        }

        let codigo = '';
        for (let i = 1; i <= tabla.rows.length + 1; i++) {
            codigo = `${iniciales}_${i}`;
            if (!buscarEnTabla(tabla, 0, codigo)) {
                return codigo;
            }
        }

        return `${iniciales}_${num++}`;
    }

    function buscarEnTabla(tabla, columna, valor) {
        for (let i = 0; i < tabla.rows.length; i++) {
            const celda = tabla.rows[i].cells[columna];
            if (celda && celda.textContent.trim() === valor) {
                return true;
            }
        }
        return false;
    }

    function actualizarOpcionesSelect(selector, lista) {
        const select = $(selector);
        select.empty();
        lista.forEach((item, index) => {
            select.append(`<option value="${index}">${item.nombre}</option>`);
        });
        $(selector).prop('selectedIndex', -1);
    }

    function mostrarFacultades() {
        const tbody = $('#facultadesList');
        tbody.empty();

        facultades.forEach((facultad, index) => {
            tbody.append(`
                <tr data-index="${index}">
                    <td>${facultad.codigo}</td>
                    <td>${facultad.nombre}</td>
                    <td>
                        <button class="btn btn-warning btn-sm editarFacultad">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarFacultad">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        actualizarOpcionesSelect('#facultadSelect', facultades);
        actualizarOpcionesSelect('#facultadSelectEstudiante', facultades);
    }

    function mostrarEscuelas() {
        const tbody = $('#escuelasList');
        tbody.empty();

        escuelas.forEach((escuela, index) => {
            tbody.append(`
                <tr data-index="${index}">
                    <td>${escuela.codigo}</td>
                    <td>${escuela.nombre}</td>
                    <td>${facultades[escuela.facultadId]?.nombre || 'Sin Facultad'}</td>
                    <td>
                        <button class="btn btn-warning btn-sm editarEscuela">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarEscuela">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        actualizarOpcionesSelect('#escuelaSelect', escuelas);
    }

    function mostrarEstudiantes() {
        const tbody = $('#estudiantesList');
        tbody.empty();

        estudiantes.forEach((estudiante, index) => {
            tbody.append(`
                <tr data-index="${index}">
                    <td>${estudiante.codigo}</td>
                    <td>${estudiante.apellidos}</td>
                    <td>${estudiante.nombres}</td>
                    <td>${estudiante.genero}</td>
                    <td>${escuelas[estudiante.escuelaId]?.nombre || 'Sin Escuela'}</td>
                    <td>${estudiante.edad}</td>
                    <td>
                        <button class="btn btn-warning btn-sm editarEstudiante">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarEstudiante">Eliminar</button>
                    </td>
                </tr>
            `);
        });
    }

    function calcularEdad(fecha) {
        const hoy = new Date();
        const nacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad;
    }

    function gestionarFacultades() {
        $('#facultadForm').on('submit', function(e) {
            e.preventDefault();
            const nombre = $('#nombreFacultad').val().trim();

            if (!nombre) {
                alert('Debe ingresar el nombre de la facultad.');
                return;
            }
            if (buscarEnTabla(document.getElementById('facultadesList'), 1, nombre)) {
                alert('La facultad ya existe.');
                return;
            }
            const tablaFacultades = document.getElementById('facultadesList');
            const codigo = generarCodigoDesdeTabla(nombre, tablaFacultades);

            if (seleccionFacultad === -1) {
                facultades.push({ codigo, nombre });
            } else {
                facultades[seleccionFacultad].nombre = nombre;
            }

            $('#nombreFacultad').val('');
            seleccionFacultad = -1;
            mostrarFacultades();
        });

        $(document).on('click', '.editarFacultad', function() {
            const index = $(this).closest('tr').data('index');
            seleccionFacultad = index;
            $('#nombreFacultad').val(facultades[index].nombre);
        });

        $(document).on('click', '.eliminarFacultad', function() {
            const index = $(this).closest('tr').data('index');
            if (escuelas.find(escuela => escuela.facultadId === index)) {
                alert('No se puede eliminar la facultad porque tiene escuelas asociadas.');
                return;
            }
            facultades.splice(index, 1);
            mostrarFacultades();
        });
    }

    function gestionarEscuelas() {
        $('#escuelaForm').on('submit', function(e) {
            e.preventDefault();
            const nombre = $('#nombreEscuela').val().trim();
            const facultadId = $('#facultadSelect').val();

            if (!nombre || facultadId === '') {
                alert('Debe ingresar el nombre de la escuela y seleccionar una facultad.');
                return;
            }
            if (buscarEnTabla(document.getElementById('escuelasList'), 1, nombre)) {
                alert('La escuela ya existe.');
                return;
            }

            const tablaEscuelas = document.getElementById('escuelasList');
            const codigo = generarCodigoDesdeTabla(nombre, tablaEscuelas);

            if (seleccionEscuela === -1) {
                escuelas.push({ codigo, nombre, facultadId: parseInt(facultadId) });
            } else {
                escuelas[seleccionEscuela] = { codigo, nombre, facultadId: parseInt(facultadId) };
            }

            $('#nombreEscuela').val('');
            $('#facultadSelect').val('');
            seleccionEscuela = -1;
            mostrarEscuelas();
        });

        $(document).on('click', '.editarEscuela', function() {
            const index = $(this).closest('tr').data('index');
            seleccionEscuela = index;
            $('#nombreEscuela').val(escuelas[index].nombre);
            $('#facultadSelect').val(escuelas[index].facultadId);
        });

        $(document).on('click', '.eliminarEscuela', function() {
            const index = $(this).closest('tr').data('index');
            if(estudiantes.find(estudiante => estudiante.escuelaId === index)){
                alert('No se puede eliminar la escuela porque tiene estudiantes asociados.');
                return;
            }
            escuelas.splice(index, 1);
            mostrarEscuelas();
        });
    }

    function gestionarEstudiantes() {
        $('#estudianteForm').on('submit', function(e) {
            e.preventDefault();
            const apellidos = $('#apellidos').val().trim();
            const nombres = $('#nombres').val().trim();
            const genero = $('#genero').val();
            const direccion = $('#direccion').val().trim();
            const fechaNacimiento = $('#fechaNacimiento').val();
            const celular = $('#celular').val().trim();
            const escuelaId = $('#escuelaSelect').val();

            if (!apellidos || !nombres || !genero || !direccion || !fechaNacimiento || !celular || escuelaId === '') {
                alert('Debe completar todos los campos.');
                return;
            }
            // Verificar Duplicidad de estudiantes
            if (buscarEnTabla(document.getElementById('estudiantesList'), 1, apellidos) === true && buscarEnTabla(document.getElementById('estudiantesList'), 2, nombres) === true) {
                alert('El estudiante ya existe.');
                return;
            }
            // Verificar Numero de telefono
            if (VerificaTelefono(celular)=== false) {
                alert('Ingrese un numero valido');
                return;
            }
            // Verificar Fecha de Nacimiento
            if (VerificaFecha(fechaNacimiento)=== false) {
                alert('Ingrese una fecha valida');
                return;
            }

            const tablaEstudiantes = document.getElementById('estudiantesList');
            const textoCodigo = `${apellidos} ${nombres}`;
            const codigo = generarCodigoDesdeTabla(textoCodigo, tablaEstudiantes);
            const edad = calcularEdad(fechaNacimiento);

            if (seleccionEstudiante === -1) {
                estudiantes.push({ codigo, apellidos, nombres, genero, direccion, fechaNacimiento, celular, edad, escuelaId: parseInt(escuelaId) });
            } else {
                estudiantes[seleccionEstudiante] = { codigo, apellidos, nombres, genero, direccion, fechaNacimiento, celular, edad, escuelaId: parseInt(escuelaId) };
            }

            $('#estudianteForm')[0].reset();
            $('#genero').prop('selectedIndex', -1);
            seleccionEstudiante = -1;
            mostrarEstudiantes();
        });

        $(document).on('click', '.editarEstudiante', function() {
            const index = $(this).closest('tr').data('index');
            seleccionEstudiante = index;
            const estudiante = estudiantes[index];
            $('#apellidos').val(estudiante.apellidos);
            $('#nombres').val(estudiante.nombres);
            $('#genero').val(estudiante.genero);
            $('#direccion').val(estudiante.direccion);
            $('#fechaNacimiento').val(estudiante.fechaNacimiento);
            $('#celular').val(estudiante.celular);
            $('#escuelaSelect').val(estudiante.escuelaId);
        });

        $(document).on('click', '.eliminarEstudiante', function() {
            const index = $(this).closest('tr').data('index');
            estudiantes.splice(index, 1);
            mostrarEstudiantes();
        });
    }

    function limpiarFormularioFacultad() {
        $('#nombreFacultad').val('');
        $('#facultadId').val('');
        seleccionFacultad = -1;
    }

    function VerificaTelefono(telefono) {
        const regex = /^[0-9]{9}$/;
        return regex.test(telefono);
    }
    // Verifica Fecha de Nacimiento no mayor a fecha actual
    function VerificaFecha(fecha) {
        const fechaNacimiento = new Date(fecha);
        const hoy = new Date();
        if (fechaNacimiento > hoy) {
            return false;
        }
        return true;
    }

    function limpiarFormularioEscuela() {
        $('#nombreEscuela').val('');
        $('#facultadSelect').val('');
        $('#escuelaId').val('');
        seleccionEscuela = -1;
    }

    function limpiarFormularioEstudiante() {
        $('#estudianteForm')[0].reset();
        $('#estudianteId').val('');
        $('#genero').prop('selectedIndex', -1);
        seleccionEstudiante = -1;
    }

    $('#div-facultades #limpiarForm').on('click', function() {
        limpiarFormularioFacultad();
    });

    $('#div-escuela #limpiarForm').on('click', function() {
        limpiarFormularioEscuela();
    });

    $('#div-estudiante #limpiarForm').on('click', function() {
        limpiarFormularioEstudiante();
    });

    function filtrarTabla(input, tabla) {
        const filtro = input.val().toLowerCase().trim();
        tabla.find('tr').each(function() {
            const texto = $(this).text().toLowerCase();
            $(this).toggle(texto.includes(filtro));
        });
    }

    $('#buscarFacultad').on('keyup', function() {
        filtrarTabla($(this), $('#facultadesList'));
    });

    $('#buscarEscuela').on('keyup', function() {
        filtrarTabla($(this), $('#escuelasList'));
    });

    $('#buscarEstudiante').on('keyup', function() {
        filtrarTabla($(this), $('#estudiantesList'));
    });

    // Ocultar todos los divs al cargar la página, excepto el primero
    $("#div-facultades, #div-escuela, #div-estudiante").hide();
    $("#div-facultades").show();

    // Detectar clic en los enlaces del navbar
    $(".navbar-nav .nav-link").click(function(event) {
        event.preventDefault();
        const targetDiv = $(this).attr("href");

        $("#div-facultades, #div-escuela, #div-estudiante").hide();
        $(targetDiv).fadeIn();
    });


    mostrarFacultades();
    mostrarEscuelas();
    mostrarEstudiantes();
    gestionarFacultades();
    gestionarEscuelas();
    gestionarEstudiantes();
});