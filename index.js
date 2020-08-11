const btnCupon = document.getElementById('btnCupon');
const inputCupon = document.getElementById('inputCupon');
const labelCuponNoValido = document.getElementById('labelCuponNoValido');
const lableCuponUsed = document.getElementById('lableCuponUsed');
const contCupon = document.getElementById('contCupon');
const contRenderConsultas = document.getElementById('contRenderConsultas');

btnCupon.disabled = true;
verificarCuponActivo();
proximaAgenda();

inputCupon.addEventListener('input', async() => {
    if (inputCupon.value.length >= 5) {
        btnCupon.disabled = false;
    } else {
        btnCupon.disabled = true;
    }
});

async function validarCupon(email) {
    const datosSend = {
        email,
        cupon: inputCupon.value
    }
    const sendCupon = await fetch('/validar-cupon', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosSend)
    });
    const respuesta = await sendCupon.json();
    switch (respuesta.estado) {
        case 'valid':
            contCupon.innerHTML = '';
            verificarCuponActivo();
            break;
        case 'used':
            lableCuponUsed.classList.remove('d-none');
            labelCuponNoValido.classList.add('d-none');
            break;
        case 'noExist':
            labelCuponNoValido.classList.remove('d-none');
            lableCuponUsed.classList.add('d-none');
            break;
    }
}

async function verificarCuponActivo() {
    const verificar = await fetch('/verificar-cupon');
    const respuesta = await verificar.json();
    if (JSON.stringify(respuesta) != '{}') {
        contCupon.innerHTML = `
                                <div class="col-md-12">
                                    <div class="p-2 border">
                                        <div class="col text-muted">
                                            Cupon Activo: ${respuesta[0].codigo}
                                        </div>
                                        <div class="col text-muted">
                                            Empresa: ${respuesta[0].empresa}
                                        </div>
                                        <div class="col text-muted">
                                            Consultas Restantes: ${respuesta[0].consultas}
                                        </div>
                                    </div>
                                </div>
                                    `;
    }
}


async function proximaAgenda() {
    contRenderConsultas.innerHTML = '';
    const consultas = await fetch('/consultas-agendadas');
    const respuesta = await consultas.json();
    console.log(respuesta);
    if (JSON.stringify(respuesta) != '{}') {
        respuesta.forEach(info => {
            contRenderConsultas.innerHTML += `
                        <div class="col-md-4 py-2 mr-1 mb-1 col-sm-5 shadow-sm bg-white d-flex justify-content-end align-items-end flex-column" style="border-left: solid 5px #3AB0F0; border-radius: 4px;" >
                            <div>
                                <button onclick="cancelarCita('${info.id}')" class="btn p-0"><i class="fas fa-window-close text-danger fa-2x"></i></button>
                            </div>
                            <div class="w-100 d-flex justify-content-between align-items-center">
                                <img src="${info.rutaImg}" alt="doctor de ubimed" width="70px" class="rounded-circle">
                                <div class="w-75 d-flex justify-content-end text-muted flex-column align-items-end">
                                    <small class="text-right">Motivo: ${info.motivo}</small>
                                    <small class="text-right">Nombre(s): ${info.nombre} ${info.apellido}</small>
                                    <small class="text-right">Cedula: ${info.cedula}</small>
                                    <small class="text-right">Fecha: ${info.fechaConsulta.split('T')[0]}</small>
                                    <small class="text-right">Hora: ${info.horaConsulta}</small>
                                    <small class="text-right">${info.correoPaciente}</small>
                                </div>
                            </div>
                        </div>
                        `;
        });
    } else {

    }
}

async function cancelarCita(id) {
    const decision = confirm(`Esta seguro que desea cancelar la consulta con su paciente`);
    if (decision) {
        const cancelar = await fetch(`/cancelar-cita/${id}`);
        proximaAgenda();
    }
}