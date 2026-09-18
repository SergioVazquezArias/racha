/**
 * El cartel de las tres pestañas que todavía no existen.
 *
 * La barra de abajo ya tiene sus cuatro pestañas desde esta fase para que la
 * app se navegue completa, así que las tres que faltan dicen con claridad en
 * qué fase llegan en lugar de quedarse en blanco.
 */

interface Props {
  titulo: string
  fase: string
  descripcion: string
}

export default function Pendiente({ titulo, fase, descripcion }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-8 pb-28 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{titulo}</h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{descripcion}</p>
      <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500">Llega en la {fase}.</p>
    </div>
  )
}
