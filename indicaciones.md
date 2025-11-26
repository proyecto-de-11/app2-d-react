nesceito que crees un pantalla para crear torneos 

que vaya a esta url 

post https://api-de-torneos-1.onrender.com/api/torneo

y los datos para crera torneo son

{
    "creado_por": {id de usuario},
    "nombre": "Copa de Fútbol Rápido 2026",
    "descripcion": "Torneo de fútbol 7 inter-empresarial con enfoque en la sana competencia y networking.",
    "tipo_deporte_id": 1,
    "categoria": "adulto",
    "nivel": "intermedio",
    "formato": "grupos_eliminacion",
    "max_equipos": 16,
    "min_equipos": 8,
    "premio_descripcion": "Primer lugar: $1000 en efectivo y trofeo. Segundo lugar: $300 y medallas.",
    "reglas": "Se aplicará el reglamento oficial de la federación local de fútbol rápido, con las siguientes modificaciones: tiempo de juego de 2x20 minutos, máximo de 3 cambios por equipo por partido.",
    "fecha_inicio": "2026-03-01",
    "fecha_fin": "2026-04-15",
    "fecha_inscripcion_inicio": "2025-12-01",
    "fecha_inscripcion_fin": "2026-02-15",
    "costo_inscripcion": 75.50,
    "ubicacion": "Canchas Sintéticas La Hacienda, Zona 10",
    "logo": "url_a_logo_del_torneo/copa_metro.png",
    "estado": "inscripciones_abiertas" 
}

esto es para crear un torneo 
aqui podras ver tus torneso crados
https://api-de-torneos-1.onrender.com/api/torneo/creadopor/1
[
    {
        "id": 1,
        "creado_por": 1,
        "nombre": "Copa de Fútbol Rápido 2026",
        "descripcion": "Torneo de fútbol 7 inter-empresarial con enfoque en la sana competencia y networking.",
        "tipo_deporte_id": 1,
        "categoria": "adulto",
        "nivel": "intermedio",
        "formato": "grupos_eliminacion",
        "max_equipos": 16,
        "min_equipos": 8,
        "premio_descripcion": "Primer lugar: $1000 en efectivo y trofeo. Segundo lugar: $300 y medallas.",
        "reglas": "Se aplicará el reglamento oficial de la federación local de fútbol rápido, con las siguientes modificaciones: tiempo de juego de 2x20 minutos, máximo de 3 cambios por equipo por partido.",
        "fecha_inicio": "2026-03-01T00:00:00.000Z",
        "fecha_fin": "2026-04-15T00:00:00.000Z",
        "fecha_inscripcion_inicio": "2025-12-01T00:00:00.000Z",
        "fecha_inscripcion_fin": "2026-02-15T00:00:00.000Z",
        "costo_inscripcion": "75.50",
        "ubicacion": "Canchas Sintéticas La Hacienda, Zona 10",
        "logo": "url_a_logo_del_torneo/copa_metro.png",
        "estado": "inscripciones_abiertas",
        "fecha_creacion": "2025-11-18T16:13:42.000Z",
        "fecha_actualizacion": "2025-11-18T16:13:42.000Z"
    }
]

luego nesecito una pantalla donde poodras ver los torneos que tu has creado y otra pantalla donde veas los torneos de las otras personas es esta url

get  https://api-de-torneos-1.onrender.com/api/torneo
te traera esta lista  de torneos
[

{
        "id": 2,
        "nombre": "Copa de Fútbol Rápido 2026",
        "tipo_deporte_id": 1,
        "categoria": "adulto",
        "nivel": "intermedio",
        "estado": "inscripciones_abiertas",
        "fecha_inicio": "2026-03-01T00:00:00.000Z",
        "costo_inscripcion": "75.50",
        "fecha_creacion": "2025-11-25T14:57:22.000Z",
        "fecha_actualizacion": "2025-11-25T14:57:22.000Z"
    }
]

cons eso deberas de mostar solo en la pantalla componentes pequeños que tenga imagen por defecto o icono de un trofeo y luego cuando le de click veras la informacion del torneo  
la informacion la podras poner ocualta para no aser otr llmada api y cuando le de click vera la informacion del torneo pasandolo como props a un componnete o pantalla nose

https://api-de-torneos-1.onrender.com/api/equipoTorr/{id del torneo}

el id del torneo debras de guardarlo en algun lugar para poder usarlo en la pantalla de equipos

con eso deberas de mostrar la lista de equipos que estan inscritos en el torneo 

si no hay equipos inscrito veras esto 
{
    "message": "No se encontraron inscripciones para el torneo ID 2."
}

sino veras esto el id del equipo
{
    "count": 2,
    "torneo_id": "1",
    "data": [
        {
            "id": 1,
            "equipo_id": 5,
            "torneo_id": 1,
            "fecha_inscripcion": "2025-11-18T16:21:56.000Z"
        },
        {
            "id": 2,
            "equipo_id": 6,
            "torneo_id": 1,
            "fecha_inscripcion": "2025-11-18T17:43:25.000Z"
        }
    ]
}

cuando tu vas ala pantalla donde estan los otros torneos que no son tuyos deberas poner un boton que diga unirme y iras ha esta ruta con estos datos

https://api-de-torneos-1.onrender.com/api/equipoTor

{
    "torneo_id": {id del torneo},
    "equipo_id": {id del equipo},
    "esta_confirmado": 0,
    "grupo": "B"
}

si tu eres el dueño del torneo deberas de mostrar un boton donde diga solicitudes que los equipos te asen ati pero para como en esa informaion solo va el id de equipo deberas de ir a esta api para ver el nombre del equipo

https://apiequiposyjugadores.onrender.com/api/equipos?busqueda={id del equipo}&page=0&size=1&sort=id

y la informacion que te traera es 
{
  "content": [
    {
      "id": 1,
      "nombre": "aquipo 1",
      "creadoPor": 1,
      "tipoDeporteId": 1,
      "descripcion": "asdfdsafds",
      "logo": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fes.vecteezy.com%2Fvectores-gratis%2Fsoccer-logo&psig=AOvVaw1k4cDhQlvR8Dt1RaUvyNmp&ust=1763128273515000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKjygOyi75ADFQAAAAAdAAAAABAE",
      "colorPrincipal": "rgba(27, 63, 75, 1)",
      "colorSecundario": "#943",
      "ciudad": "Sonsononate",
      "nivel": null,
      "maxMiembros": 12,
      "requiereAprobacion": true,
      "calificacionPromedio": 0,
      "totalCalificaciones": 0,
      "estaActivo": true,
      "fechaCreacion": "2025-11-13T07:52:12.638471",
      "fechaActualizacion": "2025-11-18T09:59:14.759375"
    }
  ],
  "page": 0,
  "size": 1,
  "totalPages": 1,
  "totalElements": 1
}

