// Catálogo de simuladores PraxiLab para los mapeos curriculares.
//
// Todo lo que hay aquí sale de la GUÍA PARA DOCENTES de cada simulador, no del Excel del mapeo
// (los Excel han traído datos desactualizados: AudiTek «en equipos y con niveles», horas de
// TerriTek y ProcediTek, SosteniTek «por definir»). Revisado contra las guías el 12-nov-2026.
//
// Si una guía cambia, se actualiza aquí y se regeneran los decks que la usen.
// Si aparece un simulador nuevo, se añade con su guía delante: nunca con datos del Excel.
//
//   color    matiz del simulador (cuadrito junto a su nombre)
//   hace     «El estudiante…» (lámina Los simuladores)
//   formato  modalidad y horas (lámina Los simuladores)
//   evidencia lo que entrega el estudiante (lámina Evidencia)
//   nota     frase para las notas del presentador de la lámina Los simuladores
//   guia     dónde está la guía oficial

module.exports = {
  AudiTek: {
    color: '#4B49C6',
    hace: 'Audita una empresa colombiana bajo las NIA, de la aceptación del cliente al dictamen firmado.',
    formato: 'Individual',
    evidencia: 'Dictamen firmado, informe de auditoría detallado y carta a la gerencia, con sus papeles de trabajo.',
    nota: 'AudiTek: encargo individual de auditoría externa bajo las NIA (Decreto 2420 de 2015); entrega dictamen firmado, informe detallado y carta a la gerencia.',
    guia: 'C:\\Users\\simsy\\Downloads\\Presentación Auditek\\',
    // Salvedades que NO van al deck (ver CLAUDE.md): un solo caso (Automotores del Caribe); los
    // niveles Junior/Senior/Gerente-Socio no existen en el producto; la guía lo sugiere para
    // 7.º–9.º, después de control interno.
  },
  RentaSim: {
    color: '#4A968E',
    hace: 'Concilia la contabilidad NIIF con lo fiscal y liquida la declaración de renta de una empresa.',
    formato: 'Individual · 15 a 20 h',
    evidencia: 'Memorando de riesgos, conciliación fiscal, declaración de renta y carta a la gerencia.',
    nota: 'RentaSim: dos casos seguidos en cuatro fases, año gravable 2025.',
    guia: 'C:\\Users\\simsy\\Downloads\\Presentación RentaSim\\',
  },
  TerriTek: {
    color: '#C77400',
    hace: 'Decide en qué municipio se paga el ICA de una empresa que opera en varios, y defiende esa posición.',
    formato: 'Individual · hasta 3 rondas de 30 a 45 min',
    evidencia: 'Atribución de cada ingreso a su municipio, retenciones con soporte, fundamento y defensa ante el municipio.',
    nota: 'TerriTek: ciclo del ICA (impuesto, reteICA, avisos y tableros y sobretasa bomberil) en Bogotá, Cota y Medellín.',
    guia: 'Repositorio Praxilab/territek/docs/presentacion-docentes/',
  },
  ProcediTek: {
    color: '#C43B18',
    hace: 'Defiende a un cliente ante la DIAN: requerimiento especial, liquidación oficial y recurso de reconsideración.',
    formato: 'En firma de 3 o 4 con roles · 7 a 14 h',
    evidencia: 'Memorando de estrategia, índice probatorio, cuadros de sanciones, escritos radicados y memorando al cliente.',
    nota: 'ProcediTek: siempre en firma; cada miembro recibe nota de firma más nota individual.',
    guia: 'proceditek/docs/presentacion-docentes/',
  },
  'SosteniTek ESG': {
    color: '#4E8A20',
    hace: 'Decide qué asuntos de sostenibilidad son materiales y lo sostiene cuando la gerencia presiona.',
    formato: 'Individual · 19 a 24 h',
    evidencia: 'Matriz de doble materialidad, decisión sobre cada dato no financiero y sustentación escrita.',
    nota: 'SosteniTek ESG: doble materialidad, aseverabilidad del dato no financiero e integridad, en 3 a 4 semanas.',
    guia: 'Sostenitek/docs/presentacion-docentes/',
  },
};

// Grafías que aparecen en los Excel → nombre del catálogo.
module.exports.alias = {
  auditek: 'AudiTek', rentasim: 'RentaSim', territek: 'TerriTek', proceditek: 'ProcediTek',
  sostenitek: 'SosteniTek ESG', 'sostenitek esg': 'SosteniTek ESG',
};
