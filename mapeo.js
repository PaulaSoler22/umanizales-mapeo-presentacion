// Datos del mapeo de la Universidad de Manizales · Contaduría Pública (virtual).
// Fuente: «UManizales - Contaduría Pública (PraxiLab).xlsx», hoja «Contaduría Pública»,
// recontada fila por fila el 19-nov-2026 (detalle y cifras completas en CLAUDE.md).
//
// Reglas (detalle en CLAUDE.md):
// - Asignaturas, periodos, simuladores y encaje salen del Excel, fila por fila. Nada se inventa.
// - Las cifras de la lámina 02 las CALCULA generar.js a partir de `programas`.
// - Nunca porcentajes de cobertura, total analizado ni asignaturas sin encaje.
// - Tono: el simulador se adapta al curso del docente, nunca al revés.
// - Los datos de cada simulador (modalidad, horas, entregables) NO van aquí: están en catalogo.js.
// - «Der. tributario …» del Excel se escribe completo: «Derecho tributario …».

module.exports = {
  universidad: {
    corto: 'UManizales',
    completo: 'Universidad de Manizales',
    pensum: 'Contaduría Pública virtual · SNIES 1034',
    periodo: 'periodo',                     // el programa se organiza en 8 periodos, no semestres
  },

  portada: {
    eyebrow: 'Mapeo curricular · Contaduría Pública',
    subtitulo: 'Cuatro asignaturas del programa pueden trabajarse con un simulador PraxiLab.',
    notas: 'Presentación para la dirección del programa de Contaduría Pública virtual de la Universidad de Manizales. Muestra el resultado de revisar el plan de estudios asignatura por asignatura frente a los simuladores PraxiLab: qué asignaturas pueden trabajarse con un simulador, con cuál y en qué periodo. Recorre en orden: las cifras del mapeo, los cinco simuladores, la ficha del programa, cómo se lleva el simulador al curso y la evidencia que deja.',
  },

  cifras: {
    titulo: 'Cuatro asignaturas, cinco simuladores',
    asignaturas: 'Pueden trabajarse con un simulador PraxiLab. Todas son obligatorias.',
    directa: 'El simulador cubre el núcleo de la asignatura: se usa sin modificar el temario.',
    apoyo: 'El simulador se integra a lo que el docente ya enseña.',
    semestres: 'El tramo en el que el estudiante aprende a tributar, a auditar y a reportar.',
    nota: 'No es una muestra: se revisó el plan de estudios asignatura por asignatura.',
    notas: 'Las cifras salen del mapeo del plan de estudios de la Universidad de Manizales, revisado asignatura por asignatura. Aplicación directa quiere decir que el simulador cubre el núcleo de la asignatura y se usa sin tocar el temario ni la evaluación. Como apoyo al curso quiere decir que el simulador aporta el caso práctico de una parte del temario y el docente conserva el control del curso. Las cuatro asignaturas son obligatorias, así que todos los estudiantes del programa pasan por ellas.',
  },

  seccionFicha: {
    eyebrow: 'Contaduría Pública',
    titulo: 'Dónde entra cada simulador en el plan de estudios',
    sub: 'Cuatro asignaturas obligatorias, entre quinto y octavo periodo.',
    notas: 'La ficha del programa es el centro de la reunión. Conviene dejarla leer en silencio antes de comentarla.',
  },

  programas: [
    {
      nombre: 'Contaduría Pública',
      titulo: 'Contaduría Pública: cuatro asignaturas con simulador',
      filas: [
        { sem: 5, asignatura: 'Derecho tributario sustantivo', simuladores: ['RentaSim', 'TerriTek'], encaje: 'apoyo' },
        { sem: 6, asignatura: 'Auditoría y aseguramiento', simuladores: ['AudiTek'], encaje: 'directa' },
        { sem: 6, asignatura: 'Derecho tributario procedimental', simuladores: ['ProcediTek'], encaje: 'directa' },
        { sem: 8, asignatura: 'Contabilidad ambiental', simuladores: ['SosteniTek ESG'], encaje: 'apoyo' },
      ],
      notas: 'Derecho tributario procedimental coincide con el foco de ProcediTek: la defensa de un contribuyente ante la DIAN, del requerimiento especial al recurso de reconsideración. Auditoría y aseguramiento se convierte con AudiTek en un encargo de auditoría completo, hasta el dictamen firmado. En Derecho tributario sustantivo el docente elige RentaSim (la renta y la conciliación fiscal), TerriTek (el ICA y lo territorial) o los dos. SosteniTek ESG acompaña Contabilidad ambiental con la materialidad y el dato no financiero.',

      lineas: {
        titulo: 'Los simuladores llegan al núcleo de la profesión',
        filas: [
          { label: 'Tributaria', text: '<b style="color:#0C1730">5.º · Derecho tributario sustantivo</b> con RentaSim, del balance a la declaración de renta, y TerriTek, lo territorial. <b style="color:#0C1730">6.º · Derecho tributario procedimental con ProcediTek:</b> la defensa ante la DIAN.' },
          { label: 'Auditoría', text: '<b style="color:#0C1730">6.º · Auditoría y aseguramiento con AudiTek.</b> Un encargo de auditoría externa completo, hasta el dictamen firmado.' },
          { label: 'Sostenibilidad', text: '<b style="color:#0C1730">8.º · Contabilidad ambiental con SosteniTek ESG.</b> Qué es material y cómo se sostiene el dato no financiero.' },
        ],
        nota: 'El estudiante termina el programa habiendo hecho el trabajo de un contador: conciliar, liquidar, defender, auditar y reportar.',
        notas: 'Las cuatro asignaturas caen en las tres líneas que definen el ejercicio de la profesión. En tributaria los simuladores forman una secuencia natural: en quinto periodo el estudiante liquida la renta de una empresa y trabaja los impuestos territoriales; en sexto pasa a defender a un contribuyente ante la DIAN. ProcediTek no exige haber usado RentaSim: la declaración llega ya hecha.',
      },
    },
  ],

  modelos: {
    A: 'El caso ya trae la estructura: cada fase acompaña una unidad del temario. Es la forma natural para las dos asignaturas de aplicación directa.',
    B: 'Se inserta en las sesiones que el docente ya tiene para su tema, por ejemplo solo lo territorial con TerriTek. El resto del curso sigue igual.',
    C: 'Los entregables de un caso ya resuelto —una conciliación fiscal, unos papeles de trabajo— se usan como caso base en clase.',
    notas: 'Las tres formas describen cómo se integra el simulador a un curso que ya existe, no una carga adicional para el docente. La forma A es la natural para Auditoría y aseguramiento y Derecho tributario procedimental. La B, para Derecho tributario sustantivo y Contabilidad ambiental. La C sirve para llevar a otras asignaturas el material que produjo un caso ya jugado.',
  },

  cierre: {
    titulo: 'Elegir la asignatura y el docente con los que arrancamos el próximo periodo.',
    notas: 'Las cuatro asignaturas están identificadas, con su simulador y su periodo. La propuesta es empezar por una, con un docente, en el próximo periodo, y crecer desde ahí.',
  },
};
