import { defineConfig } from 'vitest/config'

/**
 * Configuración de las pruebas.
 *
 * `TZ` fija la zona horaria de México (UTC−6) a propósito. Las pruebas de
 * fechas no servirían de nada corriendo en UTC: cualquier código que leyera un
 * día en UTC pasaría sin que nos diéramos cuenta. Con un huso negativo, ese
 * error se delata solo. Es la red de seguridad de la regla 2.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    env: { TZ: 'America/Mexico_City' },
  },
})
