import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y Condiciones de uso de TramitexFederal.",
};

const sections = [
  ["1. Aceptación de los términos", "Al acceder, registrarse o utilizar tramitexfederal.com, solicitar asesoría, iniciar un trámite, cargar documentos, solicitar una cotización o utilizar cualquier servicio disponible, el usuario acepta estos Términos y Condiciones. Si no está de acuerdo, deberá abstenerse de utilizar la plataforma."],
  ["2. Identidad y naturaleza del servicio", "TramitexFederal es un servicio privado de asesoría, integración documental, gestión y seguimiento de trámites relacionados con autotransporte y placas federales. El prestador responsable es Jorge Benitez Carrera, con domicilio en Av Guelatao Mz. 12-Mz 1 Lte 7, Santa María Aztahuacan, Iztapalapa, 09570 Ciudad de México, CDMX. TramitexFederal no es una dependencia gubernamental, no forma parte de la Secretaría de Infraestructura, Comunicaciones y Transportes (SICT) y no representa a ninguna autoridad federal, estatal o municipal."],
  ["3. Servicios", "La plataforma puede ofrecer servicios relacionados con alta o inclusión de placas federales, baja de placas federales, modificaciones en tarjetas de circulación, reposición de placas y tarjetas de circulación y canje o actualización de placas federales. Los requisitos pueden cambiar según el solicitante, vehículo, modalidad, regulación vigente y criterio de la autoridad competente."],
  ["4. Registro y verificación de usuarios", "Para determinadas funciones es necesario crear una cuenta con información verdadera, completa y actualizada. El usuario deberá verificar su correo electrónico mediante el código enviado por la plataforma y es responsable de mantener la confidencialidad de su contraseña. Se prohíbe crear cuentas con datos falsos, suplantar a terceros o utilizar mecanismos automatizados para registrar cuentas masivamente."],
  ["5. Información y documentos", "El usuario declara que la información y documentación que entrega es auténtica, vigente y que cuenta con derecho o autorización para proporcionarla. El usuario es responsable de revisar sus datos antes de enviarlos. TramitexFederal podrá solicitar correcciones, actualizaciones o documentos adicionales cuando sean necesarios."],
  ["6. Documentos pendientes y asistencia", "Cuando la plataforma permita seleccionar opciones como “No lo tengo aún”, “Omitir por ahora” o “Solicitar ayuda”, el requisito seguirá pendiente hasta que sea completado o se determine que no aplica. Poder continuar en la plataforma no significa que la autoridad haya dejado de exigir el documento. TramitexFederal podrá orientar al usuario para obtenerlo cuando dicho servicio esté disponible."],
  ["7. Revisión de documentos", "Los documentos podrán mostrarse como pendientes, recibidos, en revisión, aprobados, rechazados, cancelados o con necesidad de asistencia. Una aprobación interna únicamente significa que el documento superó una revisión administrativa de TramitexFederal y no garantiza su aceptación por parte de la autoridad competente."],
  ["8. Cotizaciones, pagos y pago contra entrega", "TramitexFederal podrá emitir cotizaciones con conceptos, honorarios y cargos aplicables. Cuando se anuncie o acuerde la modalidad “Pago contra entrega”, su alcance estará sujeto a la cotización y condiciones específicas del servicio. Derechos gubernamentales, verificaciones, seguros, pagos a terceros u otros gastos necesarios pueden requerir pago anticipado y no se consideran incluidos salvo que la cotización lo indique expresamente."],
  ["9. Cancelaciones y reembolsos", "Las solicitudes de cancelación se analizarán según el avance del trámite. Los derechos, pagos a terceros, verificaciones, gestiones ya realizadas y demás gastos no recuperables pueden no ser reembolsables. Cuando corresponda un reembolso, se informará al usuario el importe y condiciones aplicables."],
  ["10. Tiempos y resultados", "Los tiempos comunicados son estimados y pueden variar por disponibilidad de citas, sistemas gubernamentales, requisitos adicionales, terceros o circunstancias fuera del control razonable de TramitexFederal. La contratación del servicio no garantiza la aprobación del trámite. La resolución final corresponde exclusivamente a la autoridad competente."],
  ["11. Comunicaciones", "Al proporcionar correo electrónico o teléfono, el usuario autoriza comunicaciones relacionadas con su cuenta, documentación, cotizaciones, pagos, soporte y seguimiento. Los enlaces de WhatsApp son operados por un tercero y están sujetos a sus propias políticas. El sistema puede registrar la apertura de un enlace de WhatsApp desde la plataforma, sin que ello confirme que el mensaje haya sido enviado."],
  ["12. Seguridad y uso prohibido", "Queda prohibido intentar vulnerar la plataforma, acceder a cuentas o expedientes ajenos, realizar ataques de fuerza bruta, inyección SQL, manipulación de rutas, extracción automatizada de información, carga de archivos maliciosos, suplantación de identidad o cualquier acceso sin autorización. TramitexFederal podrá registrar actividad sospechosa, limitar acciones, cerrar sesiones o suspender cuentas cuando sea necesario."],
  ["13. Privacidad y datos personales", "Los datos personales y documentos serán utilizados principalmente para operar la cuenta, integrar expedientes, revisar requisitos, dar seguimiento y prestar los servicios solicitados. TramitexFederal deberá mantener un Aviso de Privacidad independiente para detallar las finalidades, conservación y derechos aplicables al tratamiento de datos personales."],
  ["14. Propiedad intelectual", "El software, diseño, logotipos, interfaz, textos propios, estructura y demás elementos desarrollados para TramitexFederal están protegidos por la legislación aplicable. El uso de la plataforma no transfiere derechos de propiedad al usuario."],
  ["15. Disponibilidad y terceros", "TramitexFederal procurará mantener disponible la plataforma, pero puede haber interrupciones por mantenimiento, actualizaciones, hosting, bases de datos, correo, mensajería, proveedores tecnológicos o situaciones fuera de su control razonable."],
  ["16. Limitación de responsabilidad", "TramitexFederal no será responsable por consecuencias derivadas de información incorrecta proporcionada por el usuario, documentación falsa o incompleta, rechazo de una autoridad, cambios regulatorios, fallas de sistemas gubernamentales, retrasos de terceros o hechos fuera de su control razonable. Lo anterior no excluye las responsabilidades que legalmente correspondan al prestador del servicio."],
  ["17. Modificaciones", "Estos Términos podrán actualizarse por cambios en servicios, procesos, tecnología o requisitos legales. La versión vigente será la publicada en tramitexfederal.com y mostrará su fecha de actualización."],
  ["18. Terminación del servicio", "TramitexFederal podrá limitar, suspender o cancelar el acceso cuando exista incumplimiento de estos términos, actividad fraudulenta, documentación ilícita, intentos de vulneración o utilización indebida de la plataforma."],
  ["19. Legislación aplicable", "Estos Términos se interpretarán conforme a las leyes aplicables de los Estados Unidos Mexicanos. Las partes procurarán resolver inicialmente cualquier controversia mediante comunicación directa y, cuando no sea posible, podrán acudir a los mecanismos y autoridades competentes."],
  ["20. Contacto", "Para dudas, aclaraciones o soporte relacionados con estos Términos y con la plataforma, el usuario puede escribir a soporte@tramitexfederal.com."],
] as const;

export default function TermsPage() {
  return <section className="container py-12 sm:py-16">
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Información legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy">Términos y Condiciones</h1>
      <p className="mt-3 text-sm text-slate-500">Última actualización: 11 de septiembre de 2026</p>
      <div className="mt-8 rounded-2xl border border-blue/15 bg-blue-pale/50 p-5 text-sm leading-6 text-navy">
        <strong>Importante:</strong> TramitexFederal es un servicio privado de gestión y asesoría. No es una dependencia gubernamental ni garantiza la aprobación de trámites por parte de la SICT u otra autoridad.
      </div>
      <div className="mt-8 space-y-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        {sections.map(([title, body]) => <section key={title}>
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
        </section>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="button button-outline">Volver al inicio</Link>
        <Link href="/contacto" className="button">Contactar soporte</Link>
      </div>
    </div>
  </section>;
}
