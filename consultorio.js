const listaPacientes = document.getElementById('listaPacientes');
const listaPacientesPendientes = document.getElementById('listaPacientesPendientes');
const pacienteAdd = document.getElementById('pacienteAdd');
const buscarPacienteAdd = document.getElementById('buscarPacienteAdd');
const inputCedula = document.getElementById('inputCedula');
const loadBar = document.getElementById('loadBar');
const imgSearch = document.getElementById('imgSearch');
const guardarConsulta = document.getElementById('guardarConsulta');
const horaDeConsulta = document.getElementById('horaDeConsulta');

window.addEventListener('load', () => {
    buscarPacienteAdd.disabled = true;
    guardarConsulta.disabled = true;
    comprobarPacientesAprobados();
    comprobarPacientesRechazados();

    inputCedula.addEventListener('input', () => {
        if (inputCedula.value.length >= 4) {
            buscarPacienteAdd.disabled = false;
        } else {
            buscarPacienteAdd.disabled = true;
        }
    })

    buscarPacienteAdd.addEventListener('click', async(e) => {
        imgSearch.classList.add('d-none');
        e.preventDefault();
        e.stopPropagation();
        buscarPaciente(inputCedula.value);
    })
});

async function comprobarPacientesAprobados() {
    const consultarPacientes = await fetch('/signals');
    const jsonPacientes = await consultarPacientes.json();
    if (JSON.stringify(jsonPacientes) != '{}') {
        renderPacientesAprobados(jsonPacientes);
    }
}

async function comprobarPacientesRechazados() {
    const consultarPacientes = await fetch('/signals-pendientes');
    const jsonPacientes = await consultarPacientes.json();
    if (JSON.stringify(jsonPacientes) != '{}') {
        renderPacientesPendientes(jsonPacientes);
    }
}

function renderPacientesAprobados(datos) {
    datos.forEach(info => {
        const anioActual = new Date().getFullYear();
        const fechaNacimiento = info.fechaNacimiento;
        const edad = anioActual - parseInt(fechaNacimiento.split('T')[0]);
        listaPacientes.innerHTML += `
        <tr>
            <th scope="row">
                <img src="${info.rutaImg}" width="40px" height="40px" class="rounded-circle" alt="${info.nombre}">
            </th>
            <th class="align-middle">
                <a href="#">${info.nombre} ${info.apellido}</a>
            </th>
            <th class="align-middle">
                ${edad} años
            </th>
            <th class="align-middle">
                ${info.email}
            </th>
            <th class="align-middle">
                ${info.cedula}
            </th>
            <th class="align-middle">
                <button onclick="agendarConsulta('${info.email}')" class="btn p-0" data-toggle="modal" data-target="#agendarConsultaModal"> <small class="text-muted">Agendar Consulta </small> <i class="fas fa-edit text-secondary"></i></button>
            </th>
            <th class=""align-middle>
                <button class="btn" onclick="abrirModalDescargas('${info.email}')">
                    <i class="fas fa-cloud-download-alt" style="color: #41E296"></i>
                </button>
            </th>
        </tr>`;
    });
}

function renderPacientesPendientes(datos) {
    datos.forEach(info => {
        listaPacientesPendientes.innerHTML += `
        <tr>
            <th scope="row">
                <img src="${info.rutaImg}" width="40px" height="40px" class="rounded-circle" alt="">
            </th>
            <th class="align-middle">
                ${info.nombre} ${info.apellido}
            </th>
            <th class="align-middle" style="color: rgb(255, 174, 0);">
                ${info.estado}
            </th>
            <th class="align-middle">
                ${info.email}
            </th>
            <th class="align-middle">
                ${info.cedula}
            </th>
        </tr>`;
    });
}


async function buscarPaciente(cedula) {
    imgSearch.classList.remove('shadow');
    imgSearch.classList.add('d-none');
    loadBar.classList.add('d-flex');
    const getPaciente = await fetch(`/signals-search/${cedula}`);
    const getInfo = await getPaciente.json();
    if (JSON.stringify(getInfo) != '{}') {
        getInfo.forEach(info => {
            const anioActual = new Date().getFullYear();
            const fechaNacimiento = info.fechaNacimiento;
            const edad = anioActual - parseInt(fechaNacimiento.split('T')[0]);
            imgSearch.innerHTML = `
                            <div class="w-50">
                                <img src="${info.rutaImg}" alt=" ubimed perfil" class="img-fluid rounded-circle">
                            </div>
                            <div class="w-100">
                                <div class="w-100 d-flex justify-content-between">
                                    <small>Nombres:</small>
                                    <small>${info.nombre}  ${info.apellido}</small>
                                </div>
                                <div class="w-100 d-flex justify-content-between">
                                    <small>Genero:</small>
                                    <small>${info.genero}</small>
                                </div>
                                <div class="w-100 d-flex justify-content-between">
                                    <small>${info.tipoDoc}</small>
                                    <small>${cedula}</small>
                                </div>
                                <div class="w-100 d-flex justify-content-between">
                                    <small>edad:</small>
                                    <small>${edad} años</small>
                                </div>
                                <div class="w-100 d-flex justify-content-between">
                                    <small>Correo:</small>
                                    <small>${info.email}</small>
                                </div>
                                <div class="w-100 d-flex justify-content-center mt-2">
                                    <button onclick="enviarSolicitud('${info.email}')" class="btn btn-main">Enviar Solicitud</button>
                                </div>
                            </div>`;
            loadBar.classList.remove('d-flex');
            imgSearch.classList.add('shadow');
            imgSearch.classList.remove('d-none');
        });
    } else {
        imgSearch.innerHTML = `<p class="text-muted text-center w-75 mx-auto">No encontramos coincidencias con el numero de identificación: ${cedula} </p>`;
        loadBar.classList.remove('d-flex');
        imgSearch.classList.remove('d-none');
    }
}


async function enviarSolicitud(email) {
    const datosSend = {
        email
    }
    const addSignal = await fetch('/signals-add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosSend)
    });
    const request = await addSignal.json();
    if (request.estado == 'ok') {
        await comprobarPacientesRechazados();
        $('#staticBackdrop').modal('hide');
    }
}

const renderInfoAgendaPaciente = document.getElementById('renderInfoAgendaPaciente');
let correoPac = '';

async function agendarConsulta(email) {
    const datosSend = {
        email
    }
    const solicitarInfoPaciente = await fetch('/agendar', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosSend)
    });
    const datosPaciente = await solicitarInfoPaciente.json();
    correoPac = datosPaciente.email;
    renderInfoAgendaPaciente.innerHTML = `
        <div class="w-100 p-3">
            <div class="d-flex justify-content-between align-items-center">
                <img src="${datosPaciente.rutaImg}" width="100px" height="100px" class="rounded-circle">
                <div class="text-rigth d-flex flex-column align-items-end">
                    <small>${datosPaciente.nombre} ${datosPaciente.apellido}</small>
                    <small>${datosPaciente.genero}  /  ${datosPaciente.rh}</small>
                    <small>${datosPaciente.email}</small>
                    <small>${datosPaciente.telefono}</small>
                    <small>${datosPaciente.cedula}</small>
                    <small>${datosPaciente.ocupacion} - ${datosPaciente.descripcion_ocupacion}</small>
                </div>
            </div>
            <hr>
            <div class="Perfil-Paciente w-100">
                <div class="w-100">
                    <div class="my-2 d-flex justify-content-between align-items-center flex-wrap">
                        <p id="reRenderSalud" class="m-0">Salud: ${datosPaciente.servicio_salud} - ${datosPaciente.nombre_salud}</p>
                        <button id="btnDesplegarUpdate" class="ml-2 btn btn-sec" onclick="updateSal()">Actualizar</button>
                        <div id="updateSalud" class="w-100 d-none justify-content-between align-items-center mt-2">
                            <select id="renderSalud" class="form-control col-6">
                            </select>
                            <button onclick="UpdateSalud()" class="btn btn-sec">Guardar</button>
                        </div>
                    </div>
                    <hr>
                    <div class="row p-0">
                                <div class="col mb-2">
                                    <select id="tipoUser" name="tipoUser" class="form-control">
                                        <option>Tipo usuario</option>
                                        <option value="Contributivo">Contributivo</option>
                                        <option value="Subsidiado">Subsidiado</option>
                                        <option value="Vinculado">Vinculado</option>
                                        <option value="Particular">Particular</option>
                                        <option value="Particular">Particular</option>
                                        <option value="Desplazado con afiliación al
                                        Régimen Contributivo">Desplazado con afiliación al
                                        Régimen Contributivo</option>
                                        <option value="Desplazado con afiliación al
                                        Régimen subsidiado">Desplazado con afiliación al
                                        Régimen subsidiado</option>
                                        <option value="Desplazado no asegurado">Desplazado no asegurado</option>
                                    </select>
                                </div>
                                <div class="col mb-2">
                                    <select id="afiliacion" name="tipoAfiliacion" class="form-control">
                                        <option>Tipo de afiliación</option>
                                        <option value="Cotizante">Cotizante</option>
                                        <option value="Beneficiario">Beneficiario</option>
                                        <option value="Adicional">Adicional</option>
                                    </select>
                                </div>
                                <div class="col-12 mb-2">
                                    <input id="autorizacion" placeholder="Código Autorización" name="numeroAutorizacion" type="text" class="form-control" required>
                                <div>
                                <br>
                                <label class="text-danger text-center">Antecedentes Alérgicos: </label>
                                <div class="border border-danger rounded p-1">
                                    <p class="m-0 text-danger">${datosPaciente.alergias}</p>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-12 mb-2">
                                        <label>Motivo de consulta</label>
                                        <input id="motivoConsulta" type="text" name="motivoConsulta" class="form-control" placeholder="Motivo de consulta">
                                    </div>
                                    <div class="col mb-2">
                                        <label for="fechaConsulta">Fecha consulta</label>
                                        <input id="fechaDeConsulta" type="date" name="fechaConsulta" class="form-control">
                                    </div>
                                    <div class="col mb-2">
                                        <label for="horaConsulta">Hora de consulta</label>
                                        <input id="horaDeConsulta" type="time" name="fechaConsulta" class="form-control">
                                        <small class="text-muted">Formato 24 Hrs<small>
                                    </div>
                            </div>
                            </div>
                </div>
                <hr>
                <div class="w-100">
                        <small id="leyendaCita" style="font-size: 1.1em;" class="text-danger d-none">Debes programar con al menos un minuto de anticipación </small>
                    </div>
                </div>
            </div>
        </div>`;

    const fechaDeConsulta = document.getElementById('fechaDeConsulta');
    const horaDeConsulta = document.getElementById('horaDeConsulta');

    fechaDeConsulta.addEventListener('input', () => {
        confirmarHoraFecha(fechaDeConsulta.value, horaDeConsulta.value);
    });
    horaDeConsulta.addEventListener('input', () => {
        confirmarHoraFecha(fechaDeConsulta.value, horaDeConsulta.value);
    })
}

async function UpdateSalud() {
    const datos = {
        emailPaciente: correoPac,
        salud: document.getElementById('renderSalud').value
    }
    const peticion = await fetch('/Actualizar/salud', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    updateSal();
    document.getElementById('reRenderSalud').innerText = datos.salud;
}

let condicionUpdate = 1;
async function getDataEps() {
    let eps = [];
    const consultaEps = await fetch('/consultar-eps');
    const listaEps = await consultaEps.json();
    listaEps.forEach(item => {
        eps.push(item.eps);
    });
    return eps;
}

async function updateSal() {
    if (condicionUpdate == 0) {
        document.getElementById('updateSalud').classList.remove('d-flex');
        document.getElementById('updateSalud').classList.add('d-none');
        document.getElementById('btnDesplegarUpdate').innerText = 'Actualizar';
        condicionUpdate = 1;
    } else {
        document.getElementById('btnDesplegarUpdate').innerText = 'cargando';
        const datosSalud = await getDataEps();
        document.getElementById('btnDesplegarUpdate').innerText = 'cerrar';
        let epss = '';
        datosSalud.forEach(item => {
            epss += `<option value="${item}">${item}</option>`
        })
        document.getElementById('renderSalud').innerHTML = epss;
        condicionUpdate = 0;
        document.getElementById('updateSalud').classList.add('d-flex');
        document.getElementById('updateSalud').classList.remove('d-none');
    }
}

let horaCon = '';
let fechaCon = '';
let motivoCon = '';

function confirmarHoraFecha(fecha, hora) {
    const motivoConsulta = document.getElementById('motivoConsulta');
    const leyendaCita = document.getElementById('leyendaCita');
    const fechaInput = new Date(fecha + 'T' + hora);
    const fechaActual = new Date(moment().format());
    const unaHoraDespuesActual = fechaActual.getTime();
    const horaCita = fechaInput.getTime();
    if (motivoConsulta.value.length >= 3) {
        if (horaCita >= unaHoraDespuesActual) {
            leyendaCita.classList.add('d-none');
            guardarConsulta.disabled = false;
            fechaCon = fecha;
            horaCon = hora;
            motivoCon = motivoConsulta.value;
        } else {
            guardarConsulta.disabled = true;
            leyendaCita.classList.remove('d-none');
        }
    } else {
        guardarConsulta.disabled = true;
    }
}

const leyendSinConsulta = document.getElementById('leyendSinConsulta');

guardarConsulta.addEventListener('click', async() => {
    const datosConsulta = {
        motivo: motivoCon,
        fechaConsulta: fechaCon,
        horaConsulta: horaCon,
        correoPaciente: correoPac,
        afiliacion: document.getElementById('afiliacion').value,
        tipoUser: document.getElementById('tipoUser').value,
        autorizacion: document.getElementById('autorizacion').value
    }
    const saveConsulta = await fetch('/agendar-consulta', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosConsulta)
    });
    const respuesta = await saveConsulta.json();
    switch (respuesta.estado) {
        case 'agendada':
            guardarConsulta.disabled = true;
            const enviarCorreo = await fetch('/enviar-correo-consulta', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosConsulta)
            })
            leyendSinConsulta.innerText = 'Consulta agendada correctamente, en tu agenda la podrás visualizar.';
            leyendSinConsulta.classList.remove('d-none');
            leyendSinConsulta.classList.remove('text-danger');
            leyendSinConsulta.classList.add('text-success');
            break;
        case 'noCupons':
            leyendSinConsulta.classList.remove('d-none');
            break;
    }
});

async function abrirModalDescargas(emailPaciente) {
    const datosEnviar = {
        emailPaciente
    };
    const datosRender = await fetch('/historial-hc', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEnviar)
    });

    const infoRender = await datosRender.json();

    let cont = 1;
    let htmlDescargar = '';
    const descargasHistorial = document.getElementById('descargasHistorial');

    infoRender.forEach(informacion => {
        let descargarFormula = '';

        if (informacion.formula != 'notFound') {
            descargarFormula = `<a href="/descargar/formula/${informacion.id_consulta}" download>Formula</a>`;
        } else {
            descargarFormula = 'No Formulo';
        }

        htmlDescargar += `
                                        <tr>
                                            <th scope="row">${cont}</th>
                                            <td>${informacion.fecha}</td>
                                            <td>
                                                <a href="/descargar/consentimiento/${informacion.id_consulta}" download>Consentimiento</a>
                                            </td>
                                            <td>
                                                <a href="/descargar/hc/${informacion.id_consulta}" download>Descargar HC</a>
                                            </td>
                                            <td>${descargarFormula}</td>
                                        </tr>
                                        `;

        cont++;
        descargasHistorial.innerHTML = `
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">fecha</th>
                            <th scope="col">Consentimiento</th>
                            <th scope="col">Historia</th>
                            <th scope="col">Formula</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlDescargar}  
                    </tbody>
                    `;
    });

    $('#hisorialModal').modal('show');
    console.log(descargasHistorial);
    // descargasHistorial.innerHTML = htmlDescargar;
}