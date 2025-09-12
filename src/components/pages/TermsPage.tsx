import React from 'react';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface TermsPageProps {
  onBackToProfile: () => void;
}

export function TermsPage({ onBackToProfile }: TermsPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('menu.terms')} onBack={onBackToProfile} />

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
          <p className="text-sm text-gray-500 mb-6">Última actualización: 15 de enero de 2024</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 leading-relaxed">
                Al acceder y utilizar la aplicación Parkiing, usted acepta estar sujeto a estos Términos y Condiciones de Uso. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Descripción del Servicio</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Parkiing es una plataforma digital que conecta usuarios que necesitan servicios de reparación, mantenimiento 
                y trabajos domésticos con profesionales calificados (handymen) en su área.
              </p>
              <p className="text-gray-700 leading-relaxed">
                La aplicación también incluye funcionalidades de ofertas comerciales y flash para negocios locales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Registro y Cuenta de Usuario</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Debe proporcionar información veraz y actualizada</p>
                <p className="text-gray-700 leading-relaxed">• Es responsable de mantener la confidencialidad de su cuenta</p>
                <p className="text-gray-700 leading-relaxed">• Debe notificar inmediatamente cualquier uso no autorizado</p>
                <p className="text-gray-700 leading-relaxed">• Debe ser mayor de 18 años para usar el servicio</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Uso Aceptable</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Al utilizar Parkiing, usted se compromete a:</p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Usar el servicio solo para fines legales</p>
                <p className="text-gray-700 leading-relaxed">• No publicar contenido falso, engañoso o fraudulento</p>
                <p className="text-gray-700 leading-relaxed">• Respetar a otros usuarios y profesionales</p>
                <p className="text-gray-700 leading-relaxed">• No intentar acceder a cuentas de otros usuarios</p>
                <p className="text-gray-700 leading-relaxed">• Cumplir con todas las leyes y regulaciones aplicables</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Pagos y Tarifas</h2>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Para Usuarios:</strong> Los pagos se procesan de forma segura a través de nuestros proveedores 
                  de pago certificados. El dinero se retiene hasta la finalización satisfactoria del trabajo.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Para Profesionales:</strong> Parkiing retiene una comisión del 8% sobre el valor de cada trabajo completado.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Responsabilidades</h2>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Parkiing actúa como intermediario</strong> entre usuarios y profesionales. No somos responsables 
                  por la calidad, seguridad o legalidad de los servicios prestados.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Los usuarios y profesionales son responsables de cumplir con sus obligaciones contractuales mutuas.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Verificación de Profesionales</h2>
              <p className="text-gray-700 leading-relaxed">
                Realizamos verificaciones básicas de identidad y antecedentes, pero no garantizamos la competencia 
                o confiabilidad de los profesionales. Se recomienda verificar credenciales adicionales según sea necesario.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Política de Cancelación</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Cancelación gratuita hasta 2 horas antes del trabajo</p>
                <p className="text-gray-700 leading-relaxed">• Cancelaciones tardías pueden incurrir en cargos</p>
                <p className="text-gray-700 leading-relaxed">• Reembolsos según políticas específicas por caso</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Resolución de Disputas</h2>
              <p className="text-gray-700 leading-relaxed">
                En caso de disputas, ofrecemos mediación a través de nuestro equipo de soporte. Las disputas no resueltas 
                se regirán por las leyes de Colombia.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed">
                Parkiing no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten 
                del uso de la aplicación o servicios contratados a través de ella.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Modificaciones</h2>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán 
                en vigencia al ser publicadas en la aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contacto</h2>
              <p className="text-gray-700 leading-relaxed">
                Para preguntas sobre estos términos, contáctanos en: <strong>legal@parkiing.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}