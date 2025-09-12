import React from 'react';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface PrivacyPageProps {
  onBackToProfile: () => void;
}

export function PrivacyPage({ onBackToProfile }: PrivacyPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('menu.privacy')} onBack={onBackToProfile} />

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
          <p className="text-sm text-gray-500 mb-6">Última actualización: 15 de enero de 2024</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Información que Recopilamos</h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Información Personal:</h3>
                <div className="space-y-1">
                  <p className="text-gray-700 text-sm">• Nombre completo y datos de contacto</p>
                  <p className="text-gray-700 text-sm">• Dirección de correo electrónico y número de teléfono</p>
                  <p className="text-gray-700 text-sm">• Información de ubicación para servicios locales</p>
                  <p className="text-gray-700 text-sm">• Información de pago y facturación</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Información de Uso:</h3>
                <div className="space-y-1">
                  <p className="text-gray-700 text-sm">• Historial de trabajos y servicios solicitados</p>
                  <p className="text-gray-700 text-sm">• Calificaciones y reseñas</p>
                  <p className="text-gray-700 text-sm">• Preferencias de servicios y comunicaciones</p>
                  <p className="text-gray-700 text-sm">• Datos de uso de la aplicación y navegación</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Cómo Utilizamos su Información</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Conectar usuarios con profesionales apropiados</p>
                <p className="text-gray-700 leading-relaxed">• Procesar pagos y transacciones de forma segura</p>
                <p className="text-gray-700 leading-relaxed">• Mejorar nuestros servicios y experiencia del usuario</p>
                <p className="text-gray-700 leading-relaxed">• Enviar notificaciones relevantes sobre trabajos y ofertas</p>
                <p className="text-gray-700 leading-relaxed">• Cumplir con obligaciones legales y regulatorias</p>
                <p className="text-gray-700 leading-relaxed">• Prevenir fraude y garantizar la seguridad de la plataforma</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Compartir Información</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en los siguientes casos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Con profesionales para completar servicios solicitados</p>
                <p className="text-gray-700 leading-relaxed">• Con proveedores de servicios que nos ayudan a operar la plataforma</p>
                <p className="text-gray-700 leading-relaxed">• Cuando sea requerido por ley o procesos legales</p>
                <p className="text-gray-700 leading-relaxed">• Para proteger nuestros derechos, seguridad o la de otros usuarios</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Seguridad de Datos</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Encriptación SSL/TLS para transmisión de datos</p>
                <p className="text-gray-700 leading-relaxed">• Autenticación de dos factores disponible</p>
                <p className="text-gray-700 leading-relaxed">• Acceso restringido a información personal</p>
                <p className="text-gray-700 leading-relaxed">• Monitoreo continuo de sistemas de seguridad</p>
                <p className="text-gray-700 leading-relaxed">• Auditorías regulares de seguridad</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Sus Derechos</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Usted tiene los siguientes derechos sobre su información personal:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• <strong>Acceso:</strong> Solicitar copia de sus datos personales</p>
                <p className="text-gray-700 leading-relaxed">• <strong>Rectificación:</strong> Corregir información inexacta</p>
                <p className="text-gray-700 leading-relaxed">• <strong>Eliminación:</strong> Solicitar eliminación de sus datos</p>
                <p className="text-gray-700 leading-relaxed">• <strong>Portabilidad:</strong> Obtener sus datos en formato transferible</p>
                <p className="text-gray-700 leading-relaxed">• <strong>Oposición:</strong> Oponerse al procesamiento de sus datos</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">• Mantener su sesión activa</p>
                <p className="text-gray-700 leading-relaxed">• Recordar sus preferencias</p>
                <p className="text-gray-700 leading-relaxed">• Analizar el uso de la aplicación</p>
                <p className="text-gray-700 leading-relaxed">• Personalizar contenido y ofertas</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Retención de Datos</h2>
              <p className="text-gray-700 leading-relaxed">
                Conservamos su información personal durante el tiempo necesario para proporcionar nuestros servicios 
                y cumplir con obligaciones legales. Los datos de trabajos completados se conservan por motivos de 
                auditoría y resolución de disputas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Transferencias Internacionales</h2>
              <p className="text-gray-700 leading-relaxed">
                Sus datos pueden ser transferidos y procesados en países fuera de Colombia donde operan nuestros 
                proveedores de servicios, siempre bajo estándares adecuados de protección.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Menores de Edad</h2>
              <p className="text-gray-700 leading-relaxed">
                Nuestros servicios están dirigidos a mayores de 18 años. No recopilamos intencionalmente información 
                de menores de edad. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Cambios a esta Política</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios 
                significativos a través de la aplicación o por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contacto</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                Para preguntas sobre esta política de privacidad o para ejercer sus derechos, contáctenos:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">Email: <strong>privacidad@parkiing.com</strong></p>
                <p className="text-sm text-gray-700">Teléfono: <strong>+57 1 234 5678</strong></p>
                <p className="text-sm text-gray-700">Dirección: Calle 93 #11-27, Bogotá, Colombia</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}