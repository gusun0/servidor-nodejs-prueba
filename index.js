// usamos el modulo http
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;



const enrutador = {
 ruta: (data, callback) => {
	 callback(200, {mensaje: 'esta es ruta'})
 },

 usuarios: (data, callback) => {
	callback(200, [{nombre: 'usuario1'},{nombre: 'usuario2'}]);
 },
 noEncontrado: (data, callback) => {
	 callback(404, {mensaje: 'no encontrado'});
 }
}


// se utiliza el método create server
const server = http.createServer((req, res) => {
	// 1. Obtener url desde el objeto request
	const urlActual = req.url;
	const urlParseada = url.parse(urlActual,true);
	
	// 2. Obtener la ruta
	const ruta = urlParseada.pathname;
	

	// 3. quitar slash
	const rutaLimpia = ruta.replace(/^\/|\/$|(?<!\d)(\/)(?!\d)/g, '');

	// 3.1 Obtener el método http
	const metodo = req.method.toLowerCase();

	// 3.2 Obtener las variables del query url
	const {query = {}} = urlParseada;

	// 3.3 Obtener los headers
	const {headers = {}} = req;

	// 3.4 Obtener payload en el caso de haber uno
	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	
	// 3.4.1 acumulando la tabla cuando el request reciba un payload
	req.on('data',(data) => {
 		buffer += decoder.write(data);
	});


	// 3.4.2 termina de acumular datos y decirle a decoder que analice
	req.on('end',() => {
 		buffer += decoder.end;

  	// 3.5 ordenar la data
 	const data = {
		ruta: rutaLimpia,
		query,
		metodo,
		headers,
		payload: buffer
	}	

	// 3.6 elegir el manejador dependiendo de la ruta y asignarle la fn que el enrutador tiene
		
	let handler;
	if(rutaLimpia){
		handler = enrutador[rutaLimpia];
	}else{
		handler = enrutador.noEncontrado;
	}

	
	// 4. Ejecutar handler (manejador) para enviar la respuesta
	if(typeof handler === 'function'){
		handler(data, (status = 200, mensaje) =>{
	 		const respuesta = JSON.stringify(mensaje);
			res.writeHead(status);
			// se manda a respueta donde ya estamos respondiendo al cliente
			res.end(respuesta);
		});
	}
	/*  cierre if typeof */

		
	});

});


server.listen(8000, () => {
 console.log('El servidor esta escuchando peticiones en localhost');
});
