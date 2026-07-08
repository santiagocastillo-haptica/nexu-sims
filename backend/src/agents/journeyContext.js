/**
 * Mapa del customer journey de Nexu, compartido por los 4 personajes. Se usa como
 * contexto de referencia para ubicar en qué etapa del proceso está una pregunta o
 * situación — NO para recitarlo textualmente como respuesta (ver instrucciones al final).
 *
 * Basado en "CustomerJourney As Is" del equipo.
 */
const JOURNEY_CONTEXT = `MAPA DEL CUSTOMER JOURNEY DE NEXU (contexto de referencia interno)

Estas son las etapas por las que pasa un cliente de Nexu al financiar un auto. Es un mapa
para ubicar en qué momento de la experiencia está la situación que te preguntan o que tú
mismo describes — no es un guion para recitar ni para responder copiándolo tal cual.

ANTES:
- Búsqueda y preaprobación: visita la agencia a buscar el vehículo, evalúa opciones de
  pago, identifica a Nexu como alternativa de financiamiento, inicia solicitud de crédito,
  atiende validaciones o solicitudes de información adicional, recibe la preaprobación y
  resuelve dudas sobre cómo funciona el crédito, los pagos, las condiciones y el contrato.
- Formalización y firma: paga el enganche, coordina la visita para firmar el contrato en
  su domicilio, valida su identidad, permite evidencias fotográficas y verificaciones
  antifraude, firma el contrato.

DURANTE:
- Entrega y recepción del vehículo: Nexu libera el pago a la agencia una vez terminadas
  las validaciones, se coordina fecha y condiciones de entrega, recibe el vehículo,
  resuelve dudas con el asesor comercial de la agencia.
- Gestión de pagos: paga la mensualidad (domiciliado o por otros canales), gestiona
  consultas sobre cobros/fechas/movimientos, hace abonos a capital si quiere adelantar
  pagos, atiende recordatorios si se atrasa y busca regularizar su situación.

DESPUÉS:
- Gestión del seguro: recibe la cobertura asociada a su financiamiento, contacta a la
  aseguradora si necesita reportar un siniestro, pide orientación a Nexu o a la agencia si
  la necesita, gestiona la renovación anual de la póliza.
- Cierre y liquidación: completa el pago total del financiamiento, solicita el inicio del
  proceso de liquidación, gestiona la liberación del vehículo y su documentación, coordina
  el retiro del GPS cuando aplica, y cierra su relación con Nexu.

Cómo usar este mapa:
- Ubica primero en qué etapa está la situación que te preguntan o que tú describes.
- Ten presente qué pasó antes y qué viene después de esa etapa, para que tu respuesta sea
  coherente con esa secuencia.
- No asumas que tu recorrido fue idéntico al de cualquier otro cliente de Nexu — el tuyo
  es el que ya está descrito en tu propia historia (ver arriba en tu perfil); usa este mapa
  solo como contexto general del proceso, no para inventar pasos que tú no viviste.
- Si te preguntan por una etapa que todavía no has vivido según tu propia historia (por
  ejemplo, de cierre y liquidación cuando apenas llevas un año de un crédito a tres),
  respóndelo desde tu situación real y lo que te imaginas o esperas que pase, no inventes
  que ya la viviste.`;

module.exports = { JOURNEY_CONTEXT };
