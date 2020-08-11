const telefonoDiv = document.getElementById('telefonoDiv');
const cedulaDiv = document.getElementById('cedulaDiv');
const fechaDiv = document.getElementById('fechaDiv');
const generoDiv = document.getElementById('generoDiv');
const direccionDiv = document.getElementById('direccionDiv');
const paisDiv = document.getElementById('paisDiv');
const ciudadDiv = document.getElementById('ciudadDiv');
const actualizarDiv = document.getElementById('actualizarDiv');
const profesionDiv = document.getElementById('profesionDiv');
const especialidadDiv = document.getElementById('especialidadDiv');
const carneDiv = document.getElementById('carneDiv');
const contenedorAlerta = document.getElementById('contenedorAlerta');
const inputs = document.querySelectorAll('input');
const select = document.querySelectorAll('select');

let cond = 0;

function mostrarForm(){
    if(cond == 0){
        telefonoDiv.classList.remove('d-none');
        cedulaDiv.classList.remove('d-none');
        fechaDiv.classList.remove('d-none');
        generoDiv.classList.remove('d-none');
        direccionDiv.classList.remove('d-none');
        paisDiv.classList.remove('d-none');
        ciudadDiv.classList.remove('d-none');
        actualizarDiv.classList.remove('d-none');
        profesionDiv.classList.remove('d-none');
        especialidadDiv.classList.remove('d-none');
        carneDiv.classList.remove('d-none');
        cond = 1;
    } else {
        telefonoDiv.classList.add('d-none');
        cedulaDiv.classList.add('d-none');
        fechaDiv.classList.add('d-none');
        generoDiv.classList.add('d-none');
        direccionDiv.classList.add('d-none');
        paisDiv.classList.add('d-none');
        ciudadDiv.classList.add('d-none');
        actualizarDiv.classList.add('d-none');
        profesionDiv.classList.add('d-none');
        especialidadDiv.classList.add('d-none');
        carneDiv.classList.add('d-none');
        cond = 0;
    }
}

async function actualizarDatos(){
    let datos1 = [];
    let datos2 = [];

    inputs.forEach(item => {
        if(item.value.length >= 0) {
            datos1.push(item.value);
          }
    })

    select.forEach(item => {
        if(item.value.length >= 0) {
            datos2.push(item.value);
        }
    })

    if(datos1[0].length != 0 && datos1[1].length != 0 && datos1[2].length != 0 
        && datos1[3].length != 0 && datos1[4].length != 0 && datos1[5].length != 0 && datos1[6].length != 0){
            const datosEnviar = {
                profesion: datos2[0],
                especialidad: datos2[1],
                cedula: datos1[2],
                fechaNacimiento: datos1[3],
                genero: datos2[2],
                telefono: datos1[1],
                direccion: datos1[4],
                pais: datos1[5],
                ciudad: datos1[6],
                numeroCarne: datos1[0]
            }
            const peticionUpdate = await fetch('/actualizar-perfil-doctor', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosEnviar)
            })
            const respuesta = await peticionUpdate.json();
            if(respuesta.estado === 'ok'){
                location.reload();
            }
        } else {
            contenedorAlerta.innerHTML = `
            <div class="alert alert-warning" role="alert">
                Por favor no dejes ningún campo vació
            </div>
            `;
        }
}
