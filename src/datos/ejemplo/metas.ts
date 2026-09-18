/**
 * Las dos metas de ejemplo de una instalación nueva (sección 11).
 *
 * Son datos de relleno, igual que los hábitos y el historial de este mismo
 * directorio. El repositorio es público y las medidas del cuerpo de una persona
 * no viven en el código: el usuario las reemplaza por las suyas dentro de la
 * app, que es el único lugar donde deben estar.
 *
 * Dos notas sobre la meta de inglés. Su punto de partida, 50 puntos, es
 * **provisional**: el puntaje base real llega con el primer examen y se corrige
 * desde la app. Y su fecha de inicio es la de ese examen, no
 * la de hoy: la meta empieza a contar cuando hay de dónde contar.
 */

import type { Habito, Medicion, Meta } from '../../tipos'

/** El día en que arranca la meta de peso, y el de su primera pesada. */
const ARRANQUE_DEL_PESO = '2026-09-15'

/** Las dos metas. Solo se vinculan los hábitos que existan de verdad. */
export function metasIniciales(habitos: Habito[]): Meta[] {
  const existe = (id: string): boolean => habitos.some((habito) => habito.id === id)

  return [
    {
      id: 'peso',
      nombre: 'Peso',
      fechaInicio: ARRANQUE_DEL_PESO,
      fechaObjetivo: '2027-04-14',
      valorInicial: 80,
      valorObjetivo: 72,
      unidad: 'kg',
      direccion: 'bajar',
      campos: [
        { clave: 'peso', etiqueta: 'Peso', unidad: 'kg' },
        { clave: 'cintura', etiqueta: 'Cintura', unidad: 'cm' },
        { clave: 'pecho', etiqueta: 'Pecho', unidad: 'cm' },
        { clave: 'cuello', etiqueta: 'Cuello', unidad: 'cm' },
      ],
      // 76 kg son 4 de los 8 kg del camino: justo la mitad, y ahí cruza la recta.
      hitos: [{ nombre: 'Mitad del camino', fecha: '2026-12-29', valor: 76 }],
      habitosVinculados: ['gym', 'sin-refresco', 'sin-postre'].filter(existe),
      frecuencia: 'semanal',
      // Domingo. La semana de la app empieza en lunes, así que el domingo es el 6.
      diaDeMedicion: 6,
      estado: 'activa',
      cerradaEn: null,
    },
    {
      id: 'ingles',
      nombre: 'Inglés',
      fechaInicio: '2026-10-01',
      fechaObjetivo: '2027-09-15',
      // Provisional: el puntaje base real llega con el primer examen.
      valorInicial: 50,
      valorObjetivo: 70,
      unidad: 'puntos',
      direccion: 'subir',
      campos: [{ clave: 'puntaje', etiqueta: 'Puntaje', unidad: 'puntos' }],
      hitos: [{ nombre: 'B1 confirmado', fecha: '2027-03-15', valor: 58 }],
      habitosVinculados: ['ingles'].filter(existe),
      frecuencia: 'mensual',
      // Sin día fijo: el examen cae cuando cae.
      diaDeMedicion: null,
      estado: 'activa',
      cerradaEn: null,
    },
  ]
}

/**
 * La única medición que trae una instalación nueva, también de ejemplo.
 *
 * Trae solo el peso porque solo el peso se midió ese día. Cintura, pecho y
 * cuello se capturan en la próxima medición; dejarlos vacíos es lo correcto,
 * ponerles un cero sería mentir y torcería la grasa estimada.
 */
export function medicionesIniciales(metas: Meta[]): Medicion[] {
  if (!metas.some((meta) => meta.id === 'peso')) return []

  return [
    {
      id: `peso:${ARRANQUE_DEL_PESO}`,
      metaId: 'peso',
      fecha: ARRANQUE_DEL_PESO,
      momento: 'manana',
      valores: { peso: 80 },
      nota: null,
    },
  ]
}
