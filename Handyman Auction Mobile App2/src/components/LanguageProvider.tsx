import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'es' | 'en' | 'pt';
  setLanguage: (lang: 'es' | 'en' | 'pt') => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Languages translations
    languages: {
      spanish: 'Español',
      english: 'Inglés',
      portuguese: 'Português'
    },

    // Menu translations
    menu: {
      quickActions: 'Acciones Rápidas',
      flashOffer: 'Ofertas Flash',
      flashOfferDesc: 'Trabajos rápidos publicados',
      quickJobs: 'Trabajos Rápidos',
      quickJobsDesc: 'Reparaciones y domicilios urgentes',
      publishJob: 'Publicar Trabajo',
      publishJobDesc: 'Encuentra profesionales',
      allOffers: 'Ofertas del Día',
      allOffersDesc: 'Ofertas de restaurantes y negocios',
      dailyOffers: 'Ofertas del Día',
      myProfile: 'Mi Perfil',
      myJobs: 'Mis Trabajos',
      notifications: 'Notificaciones',
      professionalProfile: 'Perfil Profesional',
      settings: 'Configuración',
      helpSupport: 'Ayuda y Soporte',
      contact: 'Contacto',
      terms: 'Términos y Condiciones',
      privacy: 'Política de Privacidad',
      logout: 'Cerrar Sesión'
    },

    // Offers translations
    offers: {
      dailyOffers: 'Ofertas del Día',
      beforeTenPM: 'Válidas hasta las 10:00 PM',
      available: 'disponibles',
      searchOffers: 'Buscar ofertas...',
      itemsLeft: 'Quedan {count}',
      orderNow: 'Ordenar Ahora',
      specialOffer: 'Oferta Especial',
      specialDiscount: 'DESCUENTO ESPECIAL',
      originalPrice: 'Precio original',
      discountedPrice: 'Precio con descuento',
      offerInformation: 'Información de la oferta',
      status: 'Estado',
      active: 'Activa',
      expired: 'Expirada',
      termsAndConditions: 'Términos y condiciones',
      call: 'Llamar',
      getDirections: 'Ir al lugar',
      useOfferNow: 'Usar Oferta Ahora',
      presentCoupon: 'Presenta este cupón en el establecimiento',
      location: 'Ubicación',
      locationMap: 'Mapa de ubicación',
      daysLeft: '{days} día{days, plural, one {} other {s}}',
      hoursLeft: '{hours} hora{hours, plural, one {} other {s}}',
      lessThanOneHour: 'Menos de 1 hora',
      noOffersFound: 'No se encontraron ofertas',
      tryDifferentSearch: 'Intenta con una búsqueda diferente',
      limitedTime: 'Tiempo limitado'
    },

    // Profile translations
    profile: {
      myProfile: 'Mi Perfil',
      manageAccount: 'Administrar cuenta',
      verified: 'Verificado',
      userMode: 'Modo de Usuario',
      clientMode: 'Modo Cliente',
      handymanMode: 'Modo Profesional',
      professionalStats: 'Estadísticas Profesionales',
      completedJobs: 'Trabajos Completados',
      rating: 'Calificación',
      quickActions: 'Acciones Rápidas',
      dailyOffers: 'Ofertas del Día',
      dailyOffersDesc: 'Comida en descuento antes del cierre',
      myJobs: 'Mis Trabajos',
      manageJobs: 'Gestionar trabajos activos',
      messages: 'Mensajes',
      chatWithClients: 'Chat con clientes',
      payments: 'Pagos',
      paymentsHistory: 'Historial de pagos',
      reviews: 'Reseñas',
      seeReviews: 'Ver mis reseñas',
      account: 'Cuenta',
      settings: 'Configuración',
      helpSupport: 'Ayuda y Soporte',
      createProfessionalProfile: 'Crear Perfil Profesional',
      startReceivingJobs: 'Comienza a recibir trabajos',
      create: 'Crear',
      limitedTime: 'Tiempo limitado'
    },

    // Quick Opportunity translations
    quickOpportunity: {
      flashOffers: 'Ofertas Flash',
      publishUrgent: 'Publica ofertas urgentes y especializadas',
      backToProfile: 'Volver al perfil',
      dailyOffers: 'Ofertas del Día',
      foodExcess: 'Comida en exceso - Vence antes de las 10 PM',
      seeAll: 'Ver todas',
      remainingTime: 'Tiempo restante',
      from: 'Desde',
      publishNew: 'Publicar Nueva Oferta',
      offerType: 'Tipo de Oferta',
      dailyOffer: 'Oferta del Día',
      dailyOfferDesc: 'Comida en exceso que vence hoy',
      serviceOffer: 'Oferta de Servicio',
      serviceOfferDesc: 'Servicios especiales con descuento',
      productOffer: 'Oferta de Producto',
      productOfferDesc: 'Inventario en exceso',
      title: 'Título de la oferta',
      description: 'Descripción',
      originalPrice: 'Precio original',
      discountedPrice: 'Precio con descuento',
      quantity: 'Cantidad disponible',
      expirationTime: 'Hora de vencimiento',
      category: 'Categoría',
      selectCategory: 'Seleccionar categoría...',
      pizza: 'Pizza',
      sandwich: 'Sandwich',
      coffee: 'Café',
      dessert: 'Postres',
      asian: 'Comida Asiática',
      mexican: 'Comida Mexicana',
      publish: 'Publicar Oferta',
      publishing: 'Publicando...',
      expired: 'Expirado',
      titlePlaceholder: 'Ej: Pizza Margherita Familiar',
      descriptionPlaceholder: 'Describe tu oferta...',
      haveExcess: '¿Tienes excedentes para vender?',
      dailyOffersDescription: 'Perfectas para restaurantes que necesitan vender excedentes de comida antes del cierre. Todas las ofertas vencen automáticamente a las 10:00 PM.'
    },

    // Home translations
    home: {
      createProfile: 'Crea tu perfil profesional',
      title: 'Encuentra trabajos cerca de ti',
      flashOfferCTA: 'Crear Oferta Flash',
      flashOffer: 'Oferta Flash',
      createProfileTitle: 'Crea tu Perfil Profesional',
      createProfileDesc: 'Comienza a recibir trabajos hoy mismo',
      create: 'Crear',
      searchJobs: 'Buscar trabajos...',
      availableJobs: 'Trabajos Disponibles',
      clearFilter: 'Limpiar filtro',
      noJobsFound: 'No se encontraron trabajos',
      tryChangingFilters: 'Intenta cambiar los filtros'
    },

    // Dashboard translations
    dashboard: {
      hello: 'Hola, {name}',
      perfectJobs: 'Encuentra trabajos perfectos para ti',
      profileVerified: 'Perfil Verificado',
      profileComplete: '{count} trabajos disponibles',
      newThisWeek: 'Nuevos esta semana',
      averageBudget: 'Presupuesto promedio',
      urgentJobs: 'Trabajos urgentes',
      availableJobs: 'Trabajos disponibles',
      quickActions: 'Acciones Rápidas',
      myProfile: 'Mi Perfil',
      myJobs: 'Mis Trabajos',
      myReviews: 'Mis Reseñas',
      recommendedForYou: 'Recomendados para ti',
      bestPaying: 'Mejor pagados',
      closest: 'Más cercanos',
      newest: 'Más nuevos',
      tipsForMoreJobs: 'Consejos para más trabajos',
      tips: [
        'Mantén tu perfil actualizado',
        'Responde rápido a las propuestas',
        'Ofrece precios competitivos',
        'Solicita reseñas a los clientes'
      ]
    },

    // Search translations
    search: {
      title: 'Buscar Profesionales',
      searchPlaceholder: 'Buscar profesionales...',
      professionalsFound: '{count} profesionales encontrados',
      noProfessionalsFound: 'No se encontraron profesionales',
      tryChangingFilters: 'Intenta cambiar los filtros',
      jobs: 'trabajos',
      more: 'más',
      mostJobs: 'Más trabajos',
      from: 'Desde'
    },

    // Job translations
    job: {
      reviews: 'reseñas',
      message: 'Mensaje',
      viewProfile: 'Ver Perfil'
    },

    // Flash Job translations
    flashJob: {
      quickUrgentJobs: '¡Trabajos rápidos y urgentes!',
      repairsDeliveriesServices: 'Reparaciones, domicilios y servicios express',
      whatDoYouNeed: '¿Qué necesitas?',
      titlePlaceholder: 'Ej. Reparar fuga de agua, Pintar habitación...',
      characters: 'caracteres',
      where: '¿Dónde?',
      locationPlaceholder: 'Barrio, Ciudad',
      approximateBudget: 'Presupuesto aproximado',
      budgetPlaceholder: 'Ej. 150000',
      additionalDetails: 'Detalles adicionales (opcional)',
      detailsPlaceholder: 'Agrega cualquier detalle importante...',
      urgency: 'Urgencia',
      normal: 'Normal',
      noRush: 'Sin prisa',
      perfectForUrgentRepairs: 'Perfecto para reparaciones urgentes',
      idealForDeliveries: 'Ideal para domicilios y mandados',
      professionalsRespondQuickly: 'Profesionales responden rápidamente',
      expressSolutions: 'Soluciones express disponibles',
      publishFlashJob: 'Publicar Trabajo Flash',
      completeRequiredFields: 'Completa todos los campos obligatorios (*)',
      preferFullForm: '¿Prefieres el formulario completo?'
    },

    // Post Job translations
    postJob: {
      title: 'Publicar Trabajo',
      subtitle: 'Encuentra el profesional perfecto',
      needSomethingUrgent: '¿Necesitas algo urgente?',
      useFlashOffer: 'Usa Ofertas Flash para resultados inmediatos',
      projectPhotos: 'Fotos del proyecto',
      addPhotos: 'Añadir fotos ayuda a obtener mejores ofertas',
      uploadPhotos: 'Subir fotos',
      jobTitle: 'Título del trabajo',
      jobTitlePlaceholder: 'Ej: Reparar grifo de la cocina',
      category: 'Categoría',
      selectCategory: 'Seleccionar categoría...',
      detailedDescription: 'Descripción detallada',
      detailedDescriptionPlaceholder: 'Describe en detalle qué necesitas que se haga...',
      location: 'Ubicación',
      locationPlaceholder: 'Dirección donde se realizará el trabajo',
      preferredSchedule: 'Horario preferido',
      flexibleSchedule: 'Horario flexible',
      flexibleScheduleDesc: 'Puedo coordinar con el profesional',
      specificSchedule: 'Horario específico',
      specificScheduleDesc: 'Tengo fechas y horas específicas',
      scheduleExample: 'Ej: Mañanas entre 9-12, disponible fines de semana',
      suggestion: 'Sugerencia',
      flexibleTip: 'Los horarios flexibles suelen recibir más ofertas y mejores precios',
      budget: 'Presupuesto',
      budgetHint: 'Los presupuestos flexibles suelen recibir más ofertas',
      fixedBudget: 'Presupuesto fijo',
      fixedBudgetDesc: 'Sé exactamente cuánto quiero pagar',
      averageBudget: 'Presupuesto promedio',
      averageBudgetDesc: 'Tengo una idea del costo',
      budgetExample: '150000',
      howItWorks: '¿Cómo funciona?',
      fixedExplanation: 'Fijo: Los profesionales sabrán tu presupuesto exacto',
      averageExplanation: 'Promedio: Los profesionales pueden ofertar alrededor de este monto',
      deadline: 'Fecha límite',
      projectUrgency: 'Urgencia del proyecto',
      urgency: 'Urgencia',
      'urgency.low': 'Baja',
      'urgency.normal': 'Normal',
      'urgency.high': 'Alta',
      notUrgent: 'No urgente',
      moderate: 'Moderada',
      urgent: 'Urgente',
      images: 'Imágenes',
      imagesHint: 'Añade fotos para obtener mejores ofertas (opcional)',
      addImages: 'Añadir Imágenes',
      summary: 'Resumen del Trabajo',
      step: 'Paso',
      of: 'de',
      publish: 'Publicar Trabajo',
      publishJob: 'Publicar Trabajo',
      publishInfo: 'Tu trabajo será publicado',
      publishDescription: 'Los profesionales verificados podrán ver tu trabajo y enviar ofertas.',
      jobVisibility: 'Tu trabajo será visible para profesionales verificados'
    },

    // Success translations
    success: {
      jobPublished: 'Trabajo Publicado',
      jobPublishedDesc: 'Tu trabajo ha sido publicado exitosamente',
      flashOfferPublished: 'Oferta Flash Publicada',
      flashOfferPublishedDesc: 'Tu oferta flash ha sido publicada con éxito',
      newOfferReceived: 'Nueva Oferta Recibida',
      newOfferReceivedDesc: 'Has recibido una nueva oferta para "{title}"',
      offerSent: 'Oferta Enviada',
      offerSentDesc: 'Tu oferta de {amount} ha sido enviada',
      profileCreated: 'Perfil Creado',
      profileCreatedDesc: 'Tu perfil profesional ha sido creado exitosamente'
    },

    // Notifications translations
    notifications: {
      title: 'Notificaciones',
      markAllRead: 'Marcar todas como leídas',
      noNotifications: 'No hay notificaciones',
      noNotificationsDesc: 'Cuando recibas ofertas, mensajes o haya trabajos cerca de ti aparecerán aquí',
      newJobAlert: 'Nueva oferta de trabajo',
      messageReceived: 'Mensaje recibido',
      bidAccepted: 'Oferta aceptada',
      jobCompleted: 'Trabajo completado',
      paymentReceived: 'Pago recibido',
      unread: 'Sin leer',
      previous: 'Anteriores',
      acceptOpportunity: 'Aceptar Oportunidad',
      unreadCount: 'notificación sin leer',
      jobPublished: 'Trabajo Publicado',
      jobPublishedDesc: 'Tu trabajo ha sido publicado exitosamente y los profesionales pueden verlo'
    },

    // Categories translations
    categories: {
      all: 'Todas las categorías',
      plumbing: 'Plomería',
      electrical: 'Electricidad',
      painting: 'Pintura',
      cleaning: 'Limpieza',
      gardening: 'Jardinería',
      carpentry: 'Carpintería',
      appliances: 'Electrodomésticos',
      moving: 'Mudanzas'
    },

    // Job card translations
    jobCard: {
      postedBy: 'Publicado por',
      timeAgo: 'Hace {time}',
      distance: '{distance}',
      urgent: 'Urgente',
      budget: 'Presupuesto',
      fixed: 'Fijo',
      average: 'Promedio',
      deadline: 'Hasta',
      statusOpen: 'Abierto',
      statusInProgress: 'En Progreso',
      statusCompleted: 'Completado',
      statusClosed: 'Cerrado',
      offersReceived: '{count} oferta{count, plural, one {} other {s}} recibida{count, plural, one {} other {s}}'
    },

    // Job details translations
    jobDetails: {
      jobDetails: 'Detalles del Trabajo',
      description: 'Descripción',
      location: 'Ubicación',
      schedule: 'Horario',
      flexible: 'Flexible',
      specific: 'Específico',
      deadline: 'Fecha límite',
      budgetType: 'Tipo de presupuesto',
      sendOffer: 'Enviar Oferta',
      yourOffer: 'Tu oferta',
      message: 'Mensaje (opcional)',
      messagePlaceholder: 'Describe tu experiencia y por qué eres el mejor para este trabajo...',
      send: 'Enviar',
      sending: 'Enviando...',
      bids: 'Ofertas recibidas',
      noBids: 'Aún no hay ofertas',
      yourUser: 'Tu Usuario',
      daysLeft: '{days} días',
      expired: 'Vencido',
      offersCount: '{count} ofertas',
      fixedBudgetTip: 'Presupuesto fijo - Se prefieren ofertas cercanas a este monto',
      averageBudgetTip: 'Presupuesto promedio - Puedes ofertar el monto que consideres justo',
      interestedInJob: '¿Interesado en este trabajo?',
      makeOffer: 'Hacer Oferta',
      reference: 'Referencia',
      start: 'Inicio',
      delivery: 'Entrega',
      startPlaceholder: 'Mañana',
      deliveryPlaceholder: 'En 3 días',
      estimatedDuration: 'Duración estimada',
      durationPlaceholder: '2 días laborales',
      describeProposal: 'Describe tu propuesta',
      proposalPlaceholder: 'Explica tu experiencia, metodología, materiales incluidos, garantías, etc.',
      acceptOffer: 'Aceptar Oferta',
      bidsWillAppear: 'Las ofertas de profesionales aparecerán aquí'
    },

    // Navigation translations
    nav: {
      home: 'Inicio',
      search: 'Buscar',
      radar: 'Radar',
      post: 'Publicar',
      messages: 'Mensajes',
      profile: 'Perfil'
    },

    // Common translations
    common: {
      back: 'Volver',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Eliminar',
      confirm: 'Confirmar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      all: 'Todos',
      hour: 'hora',
      active: 'Activos',
      recent: 'Recientes',
      yesterday: 'Ayer',
      distance: 'de distancia',
      timeAgo: 'Hace {time}',
      next: 'Siguiente',
      previous: 'Anterior'
    },

    // Messages translations
    messages: {
      title: 'Mensajes',
      noMessages: 'No hay mensajes',
      startConversation: 'Comienza una conversación con un profesional',
      searchMessages: 'Buscar mensajes...',
      online: 'En línea',
      offline: 'Desconectado',
      typing: 'Escribiendo...',
      sendMessage: 'Enviar mensaje',
      messagePlaceholder: 'Escribe un mensaje...',
      canStartTomorrow: 'Perfecto, puedo comenzar mañana por la mañana',
      willSendPhotos: 'Te enviaré fotos de trabajos similares',
      thankYouOffer: 'Gracias por considerar mi oferta'
    },

    // Radar translations
    radar: {
      active: 'Activo',
      inactive: 'Inactivo',
      scanningJobs: 'Escaneando trabajos cercanos...',
      radarPaused: 'Radar pausado',
      radius: 'Radio',
      offers: 'ofertas',
      radarConfig: 'Configuración del Radar',
      searchRadius: 'Radio de búsqueda',
      jobsOnly: 'Solo trabajos',
      hideCommercialOffers: 'Ocultar ofertas comerciales',
      jobs: 'Trabajos',
      published: 'Publicado',
      noNearbyJobs: 'No hay trabajos cercanos',
      activateRadarDesc: 'Activa el radar para recibir notificaciones de nuevos trabajos',
      noNearbyOffers: 'No hay ofertas cercanas',
      commercialOffersDesc: 'Las ofertas comerciales aparecerán aquí cuando estén disponibles',
      validUntil: 'Válido hasta',
      jobNearYou: 'Trabajo cerca de ti',
      pays: 'Paga',
      viewJob: 'Ver trabajo'
    },

    // Flash Job translations
    flashJob: {
      title: 'Trabajo Flash',
      subtitle: 'Para trabajos urgentes y rápidos',
      category: 'Categoría del trabajo',
      jobTitle: 'Título del trabajo',
      description: 'Descripción',
      location: 'Ubicación',
      budget: 'Presupuesto',
      urgency: 'Urgencia',
      urgent: 'Urgente',
      high: 'Alta',
      normal: 'Normal',
      publish: 'Publicar Flash Job',
      backToProfile: 'Volver al perfil'
    },

    // Flash Offers translations
    flashOffers: {
      title: 'Ofertas Flash',
      subtitle: 'Trabajos rápidos y ofertas especiales',
      flashJobs: 'Trabajos Flash',
      businessOffers: 'Ofertas de Negocios',
      noFlashJobs: 'No hay trabajos flash disponibles',
      noBusinessOffers: 'No hay ofertas de negocios disponibles',
      createFlashJob: 'Crear Trabajo Flash',
      backToProfile: 'Volver al perfil'
    },

    // Mock Data translations
    mockData: {
      jobs: {
        kitchenPipe: {
          title: 'Reparación de tubería en cocina',
          description: 'Necesito reparar una tubería que está goteando en la cocina. Es urgente.'
        },
        electricalInstallation: {
          title: 'Instalación eléctrica apartamento',
          description: 'Necesito instalar tomacorrientes y puntos de luz en apartamento nuevo.'
        },
        roomPainting: {
          title: 'Pintura de habitación',
          description: 'Pintar una habitación de 3x4 metros, incluye preparación de superficie.'
        },
        officeCleaning: {
          title: 'Limpieza profunda oficina',
          description: 'Limpieza completa de oficina de 80m2, incluye ventanas y muebles.'
        },
        gardenMaintenance: {
          title: 'Mantenimiento jardín',
          description: 'Poda de plantas, corte de césped y mantenimiento general de jardín.'
        },
        furnitureRepair: {
          title: 'Reparación mueble de madera',
          description: 'Restaurar mesa de comedor antigua, cambiar una pata rota.'
        }
      },
      users: {
        mariaGonzalez: 'María González',
        carlosRuiz: 'Carlos Ruiz',
        anaLopez: 'Ana López',
        empresaXYZ: 'Empresa XYZ',
        jorgeMartinez: 'Jorge Martínez',
        luisHernandez: 'Luis Hernández'
      },
      schedule: {
        morningOrAfternoon: 'Mañana o tarde',
        weekend: 'Fin de semana',
        anyWeekday: 'Cualquier día de la semana',
        saturdayWeekend: 'Fin de semana - sábado',
        morningsPreferably: 'Mañanas preferiblemente',
        anyDay: 'Cualquier día'
      },
      handymen: {
        pedroRamirez: {
          name: 'Pedro Ramírez',
          bio: 'Plomero certificado con 8 años de experiencia en instalaciones residenciales y comerciales. Especializado en reparaciones urgentes y mantenimiento preventivo.'
        },
        mariaRodriguez: {
          name: 'María Rodríguez',
          bio: 'Electricista profesional certificada con especialización en domótica y automatización. Amplia experiencia en instalaciones residenciales y comerciales.'
        },
        carlosMendoza: {
          name: 'Carlos Mendoza',
          bio: 'Pintor profesional especializado en técnicas decorativas y restauración de fachadas. Más de 5 años de experiencia en proyectos residenciales y comerciales.'
        }
      },
      specialties: {
        plumbing: 'Plomería',
        installations: 'Instalaciones',
        repairs: 'Reparaciones',
        electrical: 'Electricidad',
        automation: 'Automatización',
        industrialMaintenance: 'Mantenimiento industrial',
        painting: 'Pintura',
        specialFinishes: 'Acabados especiales',
        restoration: 'Restauración'
      },
      reviews: {
        excellent: 'Excelente trabajo, muy profesional y puntual. Lo recomiendo 100%.',
        good: 'Buen trabajo, aunque se demoró un poco más de lo esperado.'
      },
      restaurants: {
        napolitana: 'Pizzería Napolitana',
        cafeCentral: 'Café Central',
        dulcesPostres: 'Dulces & Postres'
      },
      offers: {
        pizzaMargherita: {
          title: 'Pizza Margherita Familiar',
          description: 'Pizza familiar recién horneada con ingredientes frescos'
        },
        sandwichClub: {
          title: 'Sandwich Club + Café',
          description: 'Combo perfecto: sandwich club gigante + café americano'
        },
        chocolateCake: {
          title: 'Torta de Chocolate',
          description: 'Deliciosa torta de chocolate con cobertura de fresa'
        }
      },
      businesses: {
        techStore: 'TechStore Pro',
        buenSabor: 'Restaurante El Buen Sabor'
      },
      commercialOffers: {
        techDiscount: {
          title: '50% OFF en Accesorios',
          description: 'Descuento especial en todos los accesorios tecnológicos',
          terms: 'Válido hasta agotar existencias. No aplica para productos en promoción.'
        },
        lunchDiscount: {
          title: '30% OFF en Almuerzos',
          description: 'Descuento especial en todos nuestros almuerzos ejecutivos',
          terms: 'Válido de lunes a viernes de 12:00 PM a 3:00 PM.'
        }
      }
    },

    // Notifications translations
    notifications: {
      nearbyJob: '🎯 Nuevo trabajo cerca de ti',
      nearbyJobDesc: 'Reparación de tubería en cocina - 500m de distancia. Paga $150,000',
      newOffer: '💰 Nueva oferta recibida',
      newOfferDesc: 'Carlos Mendoza ofertas $180,000 por pintura de habitación',
      jobCompleted: '✅ Trabajo completado',
      jobCompletedDesc: 'Instalación eléctrica apartamento ha sido marcada como completada',
      viewJob: 'Ver trabajo',
      viewOffer: 'Ver oferta',
      jobPublished: '📝 Trabajo publicado',
      jobPublishedDesc: 'Tu trabajo ha sido publicado exitosamente'
    },

    // Radar translations
    radar: {
      title: 'Radar de Trabajos',
      jobNearYou: 'Nuevo trabajo cerca de ti',
      pays: 'Paga',
      viewJob: 'Ver trabajo',
      active: 'Activo',
      inactive: 'Inactivo',
      scanningJobs: 'Escaneando trabajos cercanos...',
      radarPaused: 'Radar pausado',
      radius: 'Radio',
      offers: 'ofertas',
      radarConfig: 'Configuración del Radar',
      searchRadius: 'Radio de búsqueda',
      jobsOnly: 'Solo trabajos',
      hideCommercialOffers: 'Ocultar ofertas comerciales',
      jobs: 'Trabajos',
      published: 'Publicado hace',
      noNearbyJobs: 'No hay trabajos cercanos',
      activateRadarDesc: 'Activa el radar para encontrar trabajos en tu área',
      noNearbyOffers: 'No hay ofertas cercanas',
      commercialOffersDesc: 'Las ofertas comerciales aparecerán aquí',
      validUntil: 'Válido hasta'
    },

    // Profile Creation translations
    profileCreation: {
      createProfile: 'Crear Perfil',
      personalInformation: 'Información Personal',
      completeBasicInfo: 'Completa tu información básica',
      fullName: 'Nombre completo',
      fullNamePlaceholder: 'Ej. Carlos Rodríguez',
      phone: 'Teléfono',
      phonePlaceholder: 'Ej. +57 300 123 4567',
      email: 'Email',
      emailPlaceholder: 'Ej. carlos@email.com',
      professionalDescription: 'Descripción profesional',
      bioPlaceholder: 'Describe tu experiencia, especialidades y qué te hace único como profesional...',
      servicesAndSpecialties: 'Servicios y Especialidades',
      selectWorkCategories: 'Selecciona las categorías en las que trabajas',
      serviceCategories: 'Categorías de servicios',
      specificSpecialties: 'Especialidades específicas',
      specialtyPlaceholder: 'Ej. Instalación de aires acondicionados',
      yearsOfExperience: 'Años de experiencia',
      zeroYears: '0 años',
      years: 'años',
      twentyFivePlusYears: '25+ años',
      ratesAndPrices: 'Tarifas y Precios',
      defineHourlyRates: 'Define tus tarifas por hora y trabajo mínimo',
      hourlyRate: 'Tarifa por hora',
      minimumJob: 'Trabajo mínimo',
      pricingTips: 'Consejos de precios',
      checkCompetitorPrices: 'Revisa precios de competidores en tu área',
      considerExperience: 'Considera tu experiencia y especialización',
      includeTransportCosts: 'Incluye costos de transporte y herramientas',
      canAdjustLater: 'Puedes ajustar precios más tarde',
      spanish: 'Español'
    },

    // Settings translations
    settings: {
      notifications: {
        title: 'Notificaciones',
        push: 'Notificaciones Push',
        pushDesc: 'Recibir notificaciones en el dispositivo',
        email: 'Email',
        emailDesc: 'Recibir notificaciones por correo',
        sms: 'SMS',
        smsDesc: 'Recibir notificaciones por mensaje',
        newOffers: 'Nuevas ofertas',
        messages: 'Mensajes',
        jobUpdates: 'Actualizaciones de trabajos',
        nearbyJobs: 'Trabajos cercanos',
        commercialOffers: 'Ofertas comerciales',
        surplusAuctions: 'Subastas de excedentes',
        internalMessages: 'Mensajes internos',
        promotions: 'Promociones'
      },
      privacy: {
        title: 'Privacidad',
        showProfile: 'Mostrar perfil',
        showProfileDesc: 'Los profesionales pueden ver tu perfil',
        showLocation: 'Mostrar ubicación',
        showLocationDesc: 'Mostrar tu ubicación aproximada',
        shareLocationForJobs: 'Compartir ubicación para trabajos',
        shareLocationForJobsDesc: 'Permitir ubicación para encontrar trabajos cercanos',
        allowDirectContact: 'Contacto directo',
        allowDirectContactDesc: 'Permitir contacto fuera de la app'
      },
      preferences: {
        title: 'Preferencias',
        language: 'Idioma',
        currency: 'Moneda',
        theme: 'Tema',
        radarRadius: 'Radio del radar',
        currencyOptions: {
          cop: 'Peso Colombiano (COP)',
          usd: 'Dólar Estadounidense (USD)',
          eur: 'Euro (EUR)',
          brl: 'Real Brasileño (BRL)'
        },
        themeOptions: {
          light: 'Claro',
          dark: 'Oscuro',
          auto: 'Automático'
        },
        radiusOptions: {
          meters500: '500 metros',
          km1: '1 kilómetro',
          km2: '2 kilómetros',
          km5: '5 kilómetros'
        }
      },
      account: {
        title: 'Información de la cuenta',
        appVersion: 'Versión de la app',
        lastSync: 'Última sincronización',
        serverStatus: 'Estado del servidor',
        fiveMinutesAgo: 'Hace 5 minutos',
        connected: 'Conectado'
      },
      dangerZone: {
        title: 'Zona de peligro',
        deactivateAccount: 'Desactivar cuenta temporalmente',
        deleteAccount: 'Eliminar cuenta permanentemente'
      }
    },

    // Help Page translations
    help: {
      contact: {
        title: 'Contacta con nosotros',
        phone: 'Teléfono',
        email: 'Email',
        liveChat: 'Chat en vivo',
        available247: 'Disponible 24/7'
      },
      faq: {
        title: 'Preguntas Frecuentes',
        howToPublishJob: {
          question: '¿Cómo publico un trabajo?',
          answer: 'Ve a la pestaña "Publicar", llena todos los campos requeridos incluyendo título, descripción, presupuesto y ubicación. Una vez publicado, los profesionales podrán ver tu trabajo y enviar ofertas.'
        },
        howRadarWorks: {
          question: '¿Cómo funciona el radar de trabajos?',
          answer: 'El radar busca trabajos cerca de tu ubicación en tiempo real. Cuando encuentra trabajos disponibles, te envía una notificación con la distancia y el pago ofrecido.'
        },
        whatAreCommercialOffers: {
          question: '¿Qué son las ofertas comerciales?',
          answer: 'Son promociones especiales de negocios locales como restaurantes, tiendas y servicios. Puedes recibir descuentos y ofertas exclusivas de negocios cerca de ti.'
        },
        howBiddingWorks: {
          question: '¿Cómo funciona el sistema de ofertas?',
          answer: 'Los profesionales revisan tu trabajo y envían ofertas con su precio y tiempo estimado. Puedes revisar todas las ofertas, chatear con los profesionales y elegir la que mejor se adapte a tus necesidades.'
        },
        howToPayForJob: {
          question: '¿Cómo pago por un trabajo?',
          answer: 'Una vez que aceptes una oferta, el dinero se retiene de forma segura. Se libera al profesional cuando marques el trabajo como completado y estés satisfecho con el resultado.'
        },
        whatIfNotSatisfied: {
          question: '¿Qué pasa si no estoy satisfecho?',
          answer: 'Tienes garantía de satisfacción. Si hay problemas, puedes reportarlos a través de la app y nuestro equipo de soporte te ayudará a resolverlos.'
        },
        howProfessionalsVerified: {
          question: '¿Cómo verifican a los profesionales?',
          answer: 'Todos los profesionales pasan por un proceso de verificación que incluye documentos de identidad, referencias y revisión de trabajos anteriores.'
        }
      },
      resources: {
        title: 'Recursos útiles',
        termsAndConditions: 'Términos y Condiciones',
        privacyPolicy: 'Política de Privacidad',
        userGuide: 'Guía de uso'
      },
      appInfo: {
        title: 'Información de la app',
        version: 'Versión',
        lastUpdate: 'Última actualización',
        lastUpdateDate: '15 Enero 2024',
        deviceId: 'ID de dispositivo'
      }
    },

    // Contact Page translations
    contact: {
      info: {
        title: 'Información de Contacto',
        phone: 'Teléfono',
        email: 'Email',
        liveChat: 'Chat en vivo',
        available247: 'Disponible 24/7',
        offices: 'Oficinas',
        address: 'Calle 93 #11-27, Bogotá'
      },
      hours: {
        title: 'Horarios de Atención',
        mondayFriday: 'Lunes - Viernes',
        mondayFridayTime: '9:00 AM - 6:00 PM',
        saturday: 'Sábados',
        saturdayTime: '10:00 AM - 4:00 PM',
        sunday: 'Domingos',
        closed: 'Cerrado',
        onlineChat: 'Chat en línea'
      },
      form: {
        title: 'Envíanos un mensaje',
        fullName: 'Nombre completo',
        fullNamePlaceholder: 'Tu nombre',
        email: 'Email',
        emailPlaceholder: 'tu@email.com',
        phone: 'Teléfono',
        phonePlaceholder: '+57 300 123 4567',
        subject: 'Asunto',
        selectSubject: 'Selecciona un tema',
        subjects: {
          support: 'Soporte técnico',
          billing: 'Facturación',
          account: 'Problemas de cuenta',
          suggestion: 'Sugerencia',
          other: 'Otro'
        },
        message: 'Mensaje',
        messagePlaceholder: 'Describe tu consulta o problema detalladamente...',
        sendMessage: 'Enviar Mensaje',
        responseTime: 'Te responderemos en un plazo máximo de 24 horas'
      },
      emergency: {
        title: 'Contacto de Emergencia',
        description: 'Para problemas urgentes relacionados con la seguridad o situaciones de emergencia:',
        callEmergency: 'Llamar Emergencias: 123'
      }
    },

    // My Jobs Page translations
    myJobs: {
      tabs: {
        open: 'Abiertos',
        inProgress: 'En Progreso',
        completed: 'Completados'
      },
      empty: {
        noOpenJobs: 'No tienes trabajos abiertos',
        publishToReceiveOffers: 'Publica un nuevo trabajo para recibir ofertas',
        publishJob: 'Publicar Trabajo',
        noProgressJobs: 'No tienes trabajos en progreso',
        acceptedJobsAppearHere: 'Los trabajos que hayas aceptado aparecerán aquí',
        noCompletedJobs: 'No tienes trabajos completados',
        finishedJobsAppearHere: 'Los trabajos finalizados aparecerán aquí'
      }
    },

    // Payments Page translations
    payments: {
      methods: {
        title: 'Métodos de Pago',
        add: 'Agregar',
        creditCard: 'Tarjeta de crédito',
        primary: 'Principal'
      },
      history: {
        title: 'Historial de Transacciones',
        transactionId: 'ID',
        download: 'Descargar'
      },
      status: {
        completed: 'Completado',
        pending: 'Pendiente',
        failed: 'Fallido',
        refunded: 'Reembolsado'
      }
    }
  },

  en: {
    // Languages translations
    languages: {
      spanish: 'Spanish',
      english: 'English',
      portuguese: 'Portuguese'
    },

    // Menu translations
    menu: {
      quickActions: 'Quick Actions',
      flashOffer: 'Flash Offers',
      flashOfferDesc: 'Published quick jobs',
      quickJobs: 'Quick Jobs',
      quickJobsDesc: 'Urgent repairs and deliveries',
      publishJob: 'Publish Job',
      publishJobDesc: 'Find professionals',
      allOffers: 'Daily Offers',
      allOffersDesc: 'Restaurant and business offers',
      dailyOffers: 'Daily Offers',
      myProfile: 'My Profile',
      myJobs: 'My Jobs',
      notifications: 'Notifications',
      professionalProfile: 'Professional Profile',
      settings: 'Settings',
      helpSupport: 'Help & Support',
      contact: 'Contact',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      logout: 'Logout'
    },

    // Offers translations
    offers: {
      dailyOffers: 'Daily Offers',
      beforeTenPM: 'Valid until 10:00 PM',
      available: 'available',
      searchOffers: 'Search offers...',
      itemsLeft: '{count} left',
      orderNow: 'Order Now',
      specialOffer: 'Special Offer',
      specialDiscount: 'SPECIAL DISCOUNT',
      originalPrice: 'Original price',
      discountedPrice: 'Discounted price',
      offerInformation: 'Offer information',
      status: 'Status',
      active: 'Active',
      expired: 'Expired',
      termsAndConditions: 'Terms and conditions',
      call: 'Call',
      getDirections: 'Get directions',
      useOfferNow: 'Use Offer Now',
      presentCoupon: 'Present this coupon at the establishment',
      location: 'Location',
      locationMap: 'Location map',
      daysLeft: '{days} day{days, plural, one {} other {s}}',
      hoursLeft: '{hours} hour{hours, plural, one {} other {s}}',
      lessThanOneHour: 'Less than 1 hour',
      noOffersFound: 'No offers found',
      tryDifferentSearch: 'Try a different search',
      limitedTime: 'Limited time'
    },

    // Mock Data translations
    mockData: {
      jobs: {
        kitchenPipe: {
          title: 'Kitchen pipe repair',
          description: 'I need to repair a leaking pipe in the kitchen. It\'s urgent.'
        },
        electricalInstallation: {
          title: 'Apartment electrical installation',
          description: 'I need to install outlets and light points in a new apartment.'
        },
        roomPainting: {
          title: 'Room painting',
          description: 'Paint a 3x4 meter room, includes surface preparation.'
        },
        officeCleaning: {
          title: 'Deep office cleaning',
          description: 'Complete cleaning of 80m2 office, includes windows and furniture.'
        },
        gardenMaintenance: {
          title: 'Garden maintenance',
          description: 'Pruning plants, mowing lawn and general garden maintenance.'
        },
        furnitureRepair: {
          title: 'Wooden furniture repair',
          description: 'Restore antique dining table, replace broken leg.'
        }
      },
      users: {
        mariaGonzalez: 'Maria Gonzalez',
        carlosRuiz: 'Carlos Ruiz',
        anaLopez: 'Ana Lopez',
        empresaXYZ: 'XYZ Company',
        jorgeMartinez: 'Jorge Martinez',
        luisHernandez: 'Luis Hernandez'
      },
      schedule: {
        morningOrAfternoon: 'Morning or afternoon',
        weekend: 'Weekend',
        anyWeekday: 'Any weekday',
        saturdayWeekend: 'Weekend - Saturday',
        morningsPreferably: 'Mornings preferably',
        anyDay: 'Any day'
      },
      handymen: {
        pedroRamirez: {
          name: 'Pedro Ramirez',
          bio: 'Certified plumber with 8 years of experience in residential and commercial installations. Specialized in urgent repairs and preventive maintenance.'
        },
        mariaRodriguez: {
          name: 'Maria Rodriguez',
          bio: 'Certified professional electrician with specialization in home automation. Extensive experience in residential and commercial installations.'
        },
        carlosMendoza: {
          name: 'Carlos Mendoza',
          bio: 'Professional painter specialized in decorative techniques and facade restoration. More than 5 years of experience in residential and commercial projects.'
        }
      },
      specialties: {
        plumbing: 'Plumbing',
        installations: 'Installations',
        repairs: 'Repairs',
        electrical: 'Electrical',
        automation: 'Automation',
        industrialMaintenance: 'Industrial maintenance',
        painting: 'Painting',
        specialFinishes: 'Special finishes',
        restoration: 'Restoration'
      },
      reviews: {
        excellent: 'Excellent work, very professional and punctual. I recommend 100%.',
        good: 'Good work, although it took a little longer than expected.'
      },
      restaurants: {
        napolitana: 'Napolitana Pizzeria',
        cafeCentral: 'Central Café',
        dulcesPostres: 'Sweets & Desserts'
      },
      offers: {
        pizzaMargherita: {
          title: 'Family Margherita Pizza',
          description: 'Fresh baked family pizza with fresh ingredients'
        },
        sandwichClub: {
          title: 'Club Sandwich + Coffee',
          description: 'Perfect combo: giant club sandwich + american coffee'
        },
        chocolateCake: {
          title: 'Chocolate Cake',
          description: 'Delicious chocolate cake with strawberry topping'
        }
      },
      businesses: {
        techStore: 'TechStore Pro',
        buenSabor: 'El Buen Sabor Restaurant'
      },
      commercialOffers: {
        techDiscount: {
          title: '50% OFF on Accessories',
          description: 'Special discount on all tech accessories',
          terms: 'Valid while supplies last. Does not apply to promotional products.'
        },
        lunchDiscount: {
          title: '30% OFF on Lunches',
          description: 'Special discount on all our executive lunches',
          terms: 'Valid Monday to Friday from 12:00 PM to 3:00 PM.'
        }
      }
    },

    // Notifications translations
    notifications: {
      nearbyJob: '🎯 New job near you',
      nearbyJobDesc: 'Kitchen pipe repair - 500m away. Pays $150,000',
      newOffer: '💰 New offer received',
      newOfferDesc: 'Carlos Mendoza offers $180,000 for room painting',
      jobCompleted: '✅ Job completed',
      jobCompletedDesc: 'Apartment electrical installation has been marked as completed',
      viewJob: 'View job',
      viewOffer: 'View offer',
      jobPublished: '📝 Job published',
      jobPublishedDesc: 'Your job has been published successfully'
    },

    // Radar translations
    radar: {
      title: 'Jobs Radar',
      jobNearYou: 'New job near you',
      pays: 'Pays',
      viewJob: 'View job',
      active: 'Active',
      inactive: 'Inactive',
      scanningJobs: 'Scanning nearby jobs...',
      radarPaused: 'Radar paused',
      radius: 'Radius',
      offers: 'offers',
      radarConfig: 'Radar Configuration',
      searchRadius: 'Search radius',
      jobsOnly: 'Jobs only',
      hideCommercialOffers: 'Hide commercial offers',
      jobs: 'Jobs',
      published: 'Published',
      noNearbyJobs: 'No nearby jobs',
      activateRadarDesc: 'Activate radar to find jobs in your area',
      noNearbyOffers: 'No nearby offers',
      commercialOffersDesc: 'Commercial offers will appear here',
      validUntil: 'Valid until'
    },

    // Settings translations
    settings: {
      notifications: {
        title: 'Notifications',
        push: 'Push Notifications',
        pushDesc: 'Receive notifications on device',
        email: 'Email',
        emailDesc: 'Receive notifications by email',
        sms: 'SMS',
        smsDesc: 'Receive notifications by message',
        newOffers: 'New offers',
        messages: 'Messages',
        jobUpdates: 'Job updates',
        nearbyJobs: 'Nearby jobs',
        commercialOffers: 'Commercial offers',
        surplusAuctions: 'Surplus auctions',
        internalMessages: 'Internal messages',
        promotions: 'Promotions'
      },
      privacy: {
        title: 'Privacy',
        showProfile: 'Show profile',
        showProfileDesc: 'Professionals can see your profile',
        showLocation: 'Show location',
        showLocationDesc: 'Show your approximate location',
        shareLocationForJobs: 'Share location for jobs',
        shareLocationForJobsDesc: 'Allow location to find nearby jobs',
        allowDirectContact: 'Direct contact',
        allowDirectContactDesc: 'Allow contact outside the app'
      },
      preferences: {
        title: 'Preferences',
        language: 'Language',
        currency: 'Currency',
        theme: 'Theme',
        radarRadius: 'Radar radius',
        currencyOptions: {
          cop: 'Colombian Peso (COP)',
          usd: 'US Dollar (USD)',
          eur: 'Euro (EUR)',
          brl: 'Brazilian Real (BRL)'
        },
        themeOptions: {
          light: 'Light',
          dark: 'Dark',
          auto: 'Automatic'
        },
        radiusOptions: {
          meters500: '500 meters',
          km1: '1 kilometer',
          km2: '2 kilometers',
          km5: '5 kilometers'
        }
      },
      account: {
        title: 'Account information',
        appVersion: 'App version',
        lastSync: 'Last sync',
        serverStatus: 'Server status',
        fiveMinutesAgo: '5 minutes ago',
        connected: 'Connected'
      },
      dangerZone: {
        title: 'Danger zone',
        deactivateAccount: 'Temporarily deactivate account',
        deleteAccount: 'Permanently delete account'
      }
    },

    // Help Page translations
    help: {
      contact: {
        title: 'Contact us',
        phone: 'Phone',
        email: 'Email',
        liveChat: 'Live chat',
        available247: 'Available 24/7'
      },
      faq: {
        title: 'Frequently Asked Questions',
        howToPublishJob: {
          question: 'How do I publish a job?',
          answer: 'Go to the "Post" tab, fill in all required fields including title, description, budget and location. Once published, professionals will be able to see your job and send offers.'
        },
        howRadarWorks: {
          question: 'How does the job radar work?',
          answer: 'The radar searches for jobs near your location in real time. When it finds available jobs, it sends you a notification with the distance and payment offered.'
        },
        whatAreCommercialOffers: {
          question: 'What are commercial offers?',
          answer: 'They are special promotions from local businesses like restaurants, stores and services. You can receive discounts and exclusive offers from businesses near you.'
        },
        howBiddingWorks: {
          question: 'How does the bidding system work?',
          answer: 'Professionals review your job and send offers with their price and estimated time. You can review all offers, chat with professionals and choose the one that best suits your needs.'
        },
        howToPayForJob: {
          question: 'How do I pay for a job?',
          answer: 'Once you accept an offer, the money is held securely. It is released to the professional when you mark the job as completed and are satisfied with the result.'
        },
        whatIfNotSatisfied: {
          question: 'What if I\'m not satisfied?',
          answer: 'You have a satisfaction guarantee. If there are problems, you can report them through the app and our support team will help you resolve them.'
        },
        howProfessionalsVerified: {
          question: 'How are professionals verified?',
          answer: 'All professionals go through a verification process that includes identity documents, references and review of previous work.'
        }
      },
      resources: {
        title: 'Useful resources',
        termsAndConditions: 'Terms & Conditions',
        privacyPolicy: 'Privacy Policy',
        userGuide: 'User guide'
      },
      appInfo: {
        title: 'App information',
        version: 'Version',
        lastUpdate: 'Last update',
        lastUpdateDate: 'January 15, 2024',
        deviceId: 'Device ID'
      }
    },

    // Contact Page translations
    contact: {
      info: {
        title: 'Contact Information',
        phone: 'Phone',
        email: 'Email',
        liveChat: 'Live chat',
        available247: 'Available 24/7',
        offices: 'Offices',
        address: 'Calle 93 #11-27, Bogotá'
      },
      hours: {
        title: 'Office Hours',
        mondayFriday: 'Monday - Friday',
        mondayFridayTime: '9:00 AM - 6:00 PM',
        saturday: 'Saturday',
        saturdayTime: '10:00 AM - 4:00 PM',
        sunday: 'Sunday',
        closed: 'Closed',
        onlineChat: 'Online chat'
      },
      form: {
        title: 'Send us a message',
        fullName: 'Full name',
        fullNamePlaceholder: 'Your name',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        phone: 'Phone',
        phonePlaceholder: '+57 300 123 4567',
        subject: 'Subject',
        selectSubject: 'Select a topic',
        subjects: {
          support: 'Technical support',
          billing: 'Billing',
          account: 'Account issues',
          suggestion: 'Suggestion',
          other: 'Other'
        },
        message: 'Message',
        messagePlaceholder: 'Describe your question or problem in detail...',
        sendMessage: 'Send Message',
        responseTime: 'We will respond within 24 hours'
      },
      emergency: {
        title: 'Emergency Contact',
        description: 'For urgent issues related to security or emergency situations:',
        callEmergency: 'Call Emergency: 123'
      }
    },

    // My Jobs Page translations
    myJobs: {
      tabs: {
        open: 'Open',
        inProgress: 'In Progress',
        completed: 'Completed'
      },
      empty: {
        noOpenJobs: 'You have no open jobs',
        publishToReceiveOffers: 'Publish a new job to receive offers',
        publishJob: 'Publish Job',
        noProgressJobs: 'You have no jobs in progress',
        acceptedJobsAppearHere: 'Jobs you have accepted will appear here',
        noCompletedJobs: 'You have no completed jobs',
        finishedJobsAppearHere: 'Finished jobs will appear here'
      }
    },

    // Payments Page translations
    payments: {
      methods: {
        title: 'Payment Methods',
        add: 'Add',
        creditCard: 'Credit card',
        primary: 'Primary'
      },
      history: {
        title: 'Transaction History',
        transactionId: 'ID',
        download: 'Download'
      },
      status: {
        completed: 'Completed',
        pending: 'Pending',
        failed: 'Failed',
        refunded: 'Refunded'
      }
    },

    // Profile translations
    profile: {
      myProfile: 'My Profile',
      manageAccount: 'Manage account',
      verified: 'Verified',
      userMode: 'User Mode',
      clientMode: 'Client Mode',
      handymanMode: 'Professional Mode',
      professionalStats: 'Professional Stats',
      completedJobs: 'Completed Jobs',
      rating: 'Rating',
      quickActions: 'Quick Actions',
      dailyOffers: 'Daily Offers',
      dailyOffersDesc: 'Discounted food before closing',
      myJobs: 'My Jobs',
      manageJobs: 'Manage active jobs',
      messages: 'Messages',
      chatWithClients: 'Chat with clients',
      payments: 'Payments',
      paymentsHistory: 'Payment history',
      reviews: 'Reviews',
      seeReviews: 'See my reviews',
      account: 'Account',
      settings: 'Settings',
      helpSupport: 'Help & Support',
      createProfessionalProfile: 'Create Professional Profile',
      startReceivingJobs: 'Start receiving jobs',
      create: 'Create',
      limitedTime: 'Limited time'
    },

    // Quick Opportunity translations
    quickOpportunity: {
      flashOffers: 'Flash Offers',
      publishUrgent: 'Publish urgent and specialized offers',
      backToProfile: 'Back to profile',
      dailyOffers: 'Daily Offers',
      foodExcess: 'Excess food - Expires before 10 PM',
      seeAll: 'See all',
      remainingTime: 'Time remaining',
      from: 'From',
      publishNew: 'Publish New Offer',
      offerType: 'Offer Type',
      dailyOffer: 'Daily Offer',
      dailyOfferDesc: 'Excess food expiring today',
      serviceOffer: 'Service Offer',
      serviceOfferDesc: 'Special discounted services',
      productOffer: 'Product Offer',
      productOfferDesc: 'Excess inventory',
      title: 'Offer title',
      description: 'Description',
      originalPrice: 'Original price',
      discountedPrice: 'Discounted price',
      quantity: 'Available quantity',
      expirationTime: 'Expiration time',
      category: 'Category',
      selectCategory: 'Select category...',
      pizza: 'Pizza',
      sandwich: 'Sandwich',
      coffee: 'Coffee',
      dessert: 'Desserts',
      asian: 'Asian Food',
      mexican: 'Mexican Food',
      publish: 'Publish Offer',
      publishing: 'Publishing...',
      expired: 'Expired',
      titlePlaceholder: 'Ex: Family Margherita Pizza',
      descriptionPlaceholder: 'Describe your offer...',
      haveExcess: 'Do you have surplus to sell?',
      dailyOffersDescription: 'Perfect for restaurants that need to sell food surplus before closing. All offers automatically expire at 10:00 PM.'
    },

    // Home translations
    home: {
      createProfile: 'Create your professional profile',
      title: 'Find jobs near you',
      flashOfferCTA: 'Create Flash Offer',
      flashOffer: 'Flash Offer',
      createProfileTitle: 'Create Your Professional Profile',
      createProfileDesc: 'Start receiving jobs today',
      create: 'Create',
      searchJobs: 'Search jobs...',
      availableJobs: 'Available Jobs',
      clearFilter: 'Clear filter',
      noJobsFound: 'No jobs found',
      tryChangingFilters: 'Try changing the filters'
    },

    // Dashboard translations
    dashboard: {
      hello: 'Hello, {name}',
      perfectJobs: 'Find perfect jobs for you',
      profileVerified: 'Profile Verified',
      profileComplete: '{count} jobs available',
      newThisWeek: 'New this week',
      averageBudget: 'Average budget',
      urgentJobs: 'Urgent jobs',
      availableJobs: 'Available jobs',
      quickActions: 'Quick Actions',
      myProfile: 'My Profile',
      myJobs: 'My Jobs',
      myReviews: 'My Reviews',
      recommendedForYou: 'Recommended for you',
      bestPaying: 'Best paying',
      closest: 'Closest',
      newest: 'Newest',
      tipsForMoreJobs: 'Tips for more jobs',
      tips: [
        'Keep your profile updated',
        'Respond quickly to proposals',
        'Offer competitive prices',
        'Request reviews from clients'
      ]
    },

    // Search translations
    search: {
      title: 'Search Professionals',
      searchPlaceholder: 'Search professionals...',
      professionalsFound: '{count} professionals found',
      noProfessionalsFound: 'No professionals found',
      tryChangingFilters: 'Try changing the filters',
      jobs: 'jobs',
      more: 'more',
      mostJobs: 'Most jobs',
      from: 'From'
    },

    // Job translations
    job: {
      reviews: 'reviews',
      message: 'Message',
      viewProfile: 'View Profile'
    },

    // Flash Job translations
    flashJob: {
      quickUrgentJobs: 'Quick and urgent jobs!',
      repairsDeliveriesServices: 'Repairs, deliveries and express services',
      whatDoYouNeed: 'What do you need?',
      titlePlaceholder: 'Ex. Fix water leak, Paint room...',
      characters: 'characters',
      where: 'Where?',
      locationPlaceholder: 'Neighborhood, City',
      approximateBudget: 'Approximate budget',
      budgetPlaceholder: 'Ex. 150000',
      additionalDetails: 'Additional details (optional)',
      detailsPlaceholder: 'Add any important details...',
      urgency: 'Urgency',
      normal: 'Normal',
      noRush: 'No rush',
      perfectForUrgentRepairs: 'Perfect for urgent repairs',
      idealForDeliveries: 'Ideal for deliveries and errands',
      professionalsRespondQuickly: 'Professionals respond quickly',
      expressSolutions: 'Express solutions available',
      publishFlashJob: 'Publish Flash Job',
      completeRequiredFields: 'Complete all required fields (*)',
      preferFullForm: 'Do you prefer the full form?'
    },

    // Post Job translations
    postJob: {
      title: 'Post Job',
      subtitle: 'Find the perfect professional',
      needSomethingUrgent: 'Need something urgent?',
      useFlashOffer: 'Use Flash Offers for immediate results',
      projectPhotos: 'Project photos',
      addPhotos: 'Adding photos helps get better offers',
      uploadPhotos: 'Upload photos',
      jobTitle: 'Job title',
      jobTitlePlaceholder: 'Ex: Fix kitchen faucet',
      category: 'Category',
      selectCategory: 'Select category...',
      detailedDescription: 'Detailed description',
      detailedDescriptionPlaceholder: 'Describe in detail what you need done...',
      location: 'Location',
      locationPlaceholder: 'Address where the work will be done',
      preferredSchedule: 'Preferred schedule',
      flexibleSchedule: 'Flexible schedule',
      flexibleScheduleDesc: 'I can coordinate with the professional',
      specificSchedule: 'Specific schedule',
      specificScheduleDesc: 'I have specific dates and times',
      scheduleExample: 'Ex: Mornings between 9-12, available weekends',
      suggestion: 'Suggestion',
      flexibleTip: 'Flexible schedules usually receive more offers and better prices',
      budget: 'Budget',
      budgetHint: 'Flexible budgets usually receive more offers',
      fixedBudget: 'Fixed budget',
      fixedBudgetDesc: 'I know exactly how much I want to pay',
      averageBudget: 'Average budget',
      averageBudgetDesc: 'I have an idea of the cost',
      budgetExample: '150000',
      howItWorks: 'How it works?',
      fixedExplanation: 'Fixed: Professionals will know your exact budget',
      averageExplanation: 'Average: Professionals can bid around this amount',
      deadline: 'Deadline',
      projectUrgency: 'Project urgency',
      urgency: 'Urgency',
      'urgency.low': 'Low',
      'urgency.normal': 'Normal',
      'urgency.high': 'High',
      notUrgent: 'Not urgent',
      moderate: 'Moderate',
      urgent: 'Urgent',
      images: 'Images',
      imagesHint: 'Add photos to get better offers (optional)',
      addImages: 'Add Images',
      summary: 'Job Summary',
      step: 'Step',
      of: 'of',
      publish: 'Publish Job',
      publishJob: 'Publish Job',
      publishInfo: 'Your job will be published',
      publishDescription: 'Verified professionals will be able to see your job and send offers.',
      jobVisibility: 'Your job will be visible to verified professionals'
    },

    // Success translations
    success: {
      jobPublished: 'Job Published',
      jobPublishedDesc: 'Your job has been published successfully',
      flashOfferPublished: 'Flash Offer Published',
      flashOfferPublishedDesc: 'Your flash offer has been published successfully',
      newOfferReceived: 'New Offer Received',
      newOfferReceivedDesc: 'You have received a new offer for "{title}"',
      offerSent: 'Offer Sent',
      offerSentDesc: 'Your offer of {amount} has been sent',
      profileCreated: 'Profile Created',
      profileCreatedDesc: 'Your professional profile has been created successfully'
    },

    // Categories translations
    categories: {
      all: 'All categories',
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      painting: 'Painting',
      cleaning: 'Cleaning',
      gardening: 'Gardening',
      carpentry: 'Carpentry',
      appliances: 'Appliances',
      moving: 'Moving'
    },

    // Job card translations
    jobCard: {
      postedBy: 'Posted by',
      timeAgo: '{time} ago',
      distance: '{distance}',
      urgent: 'Urgent',
      budget: 'Budget',
      fixed: 'Fixed',
      average: 'Average',
      deadline: 'Until',
      statusOpen: 'Open',
      statusInProgress: 'In Progress',
      statusCompleted: 'Completed',
      statusClosed: 'Closed',
      offersReceived: '{count} offer{count, plural, one {} other {s}} received'
    },

    // Job details translations
    jobDetails: {
      jobDetails: 'Job Details',
      description: 'Description',
      location: 'Location',
      schedule: 'Schedule',
      flexible: 'Flexible',
      specific: 'Specific',
      deadline: 'Deadline',
      budgetType: 'Budget type',
      sendOffer: 'Send Offer',
      yourOffer: 'Your offer',
      message: 'Message (optional)',
      messagePlaceholder: 'Describe your experience and why you are the best for this job...',
      send: 'Send',
      sending: 'Sending...',
      bids: 'Offers received',
      noBids: 'No offers yet',
      yourUser: 'Your User',
      daysLeft: '{days} days',
      expired: 'Expired',
      offersCount: '{count} offers',
      fixedBudgetTip: 'Fixed budget - Offers close to this amount are preferred',
      averageBudgetTip: 'Average budget - You can bid the amount you consider fair',
      interestedInJob: 'Interested in this job?',
      makeOffer: 'Make Offer',
      reference: 'Reference',
      start: 'Start',
      delivery: 'Delivery',
      startPlaceholder: 'Tomorrow',
      deliveryPlaceholder: 'In 3 days',
      estimatedDuration: 'Estimated duration',
      durationPlaceholder: '2 work days',
      describeProposal: 'Describe your proposal',
      proposalPlaceholder: 'Explain your experience, methodology, included materials, warranties, etc.',
      acceptOffer: 'Accept Offer',
      bidsWillAppear: 'Professional offers will appear here'
    },

    // Navigation translations
    nav: {
      home: 'Home',
      search: 'Search',
      radar: 'Radar',
      post: 'Post',
      messages: 'Messages',
      profile: 'Profile'
    },

    // Common translations
    common: {
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      all: 'All',
      hour: 'hour',
      active: 'Active',
      recent: 'Recent',
      yesterday: 'Yesterday',
      distance: 'away',
      timeAgo: '{time} ago',
      next: 'Next',
      previous: 'Previous'
    },

    // Messages translations
    messages: {
      title: 'Messages',
      noMessages: 'No messages',
      startConversation: 'Start a conversation with a professional',
      searchMessages: 'Search messages...',
      online: 'Online',
      offline: 'Offline',
      typing: 'Typing...',
      sendMessage: 'Send message',
      messagePlaceholder: 'Type a message...',
      canStartTomorrow: 'Perfect, I can start tomorrow morning',
      willSendPhotos: 'I\'ll send you photos of similar work',
      thankYouOffer: 'Thank you for considering my offer'
    },

    // Notifications translations
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
      noNotificationsDesc: 'When you receive offers, messages or there are jobs near you they will appear here',
      newJobAlert: 'New job alert',
      messageReceived: 'Message received',
      bidAccepted: 'Bid accepted',
      jobCompleted: 'Job completed',
      paymentReceived: 'Payment received',
      unread: 'Unread',
      previous: 'Previous',
      acceptOpportunity: 'Accept Opportunity',
      unreadCount: 'unread notification',
      jobPublished: 'Job Published',
      jobPublishedDesc: 'Your job has been published successfully and professionals can see it'
    },

    // Radar translations
    radar: {
      active: 'Active',
      inactive: 'Inactive',
      scanningJobs: 'Scanning nearby jobs...',
      radarPaused: 'Radar paused',
      radius: 'Radius',
      offers: 'offers',
      radarConfig: 'Radar Configuration',
      searchRadius: 'Search radius',
      jobsOnly: 'Jobs only',
      hideCommercialOffers: 'Hide commercial offers',
      jobs: 'Jobs',
      published: 'Published',
      noNearbyJobs: 'No nearby jobs',
      activateRadarDesc: 'Activate radar to receive notifications of new jobs',
      noNearbyOffers: 'No nearby offers',
      commercialOffersDesc: 'Commercial offers will appear here when available',
      validUntil: 'Valid until',
      jobNearYou: 'Job near you',
      pays: 'Pays',
      viewJob: 'View job'
    },

    // Flash Job translations
    flashJob: {
      title: 'Flash Job',
      subtitle: 'For urgent and quick jobs',
      category: 'Job category',
      jobTitle: 'Job title',
      description: 'Description',
      location: 'Location',
      budget: 'Budget',
      urgency: 'Urgency',
      urgent: 'Urgent',
      high: 'High',
      normal: 'Normal',
      publish: 'Publish Flash Job',
      backToProfile: 'Back to profile'
    },

    // Flash Offers translations
    flashOffers: {
      title: 'Flash Offers',
      subtitle: 'Quick jobs and special offers',
      flashJobs: 'Flash Jobs',
      businessOffers: 'Business Offers',
      noFlashJobs: 'No flash jobs available',
      noBusinessOffers: 'No business offers available',
      createFlashJob: 'Create Flash Job',
      backToProfile: 'Back to profile'
    }
  },

  pt: {
    // Languages translations
    languages: {
      spanish: 'Espanhol',
      english: 'Inglês',
      portuguese: 'Português'
    },

    // Menu translations
    menu: {
      quickActions: 'Ações Rápidas',
      flashOffer: 'Ofertas Flash',
      flashOfferDesc: 'Trabalhos rápidos publicados',
      quickJobs: 'Trabalhos Rápidos',
      quickJobsDesc: 'Reparos e entregas urgentes',
      publishJob: 'Publicar Trabalho',
      publishJobDesc: 'Encontre profissionais',
      allOffers: 'Ofertas do Dia',
      allOffersDesc: 'Ofertas de restaurantes e negócios',
      dailyOffers: 'Ofertas do Dia',
      myProfile: 'Meu Perfil',
      myJobs: 'Meus Trabalhos',
      notifications: 'Notificações',
      professionalProfile: 'Perfil Profissional',
      settings: 'Configurações',
      helpSupport: 'Ajuda e Suporte',
      contact: 'Contato',
      terms: 'Termos e Condições',
      privacy: 'Política de Privacidade',
      logout: 'Sair'
    },

    // Offers translations
    offers: {
      dailyOffers: 'Ofertas do Dia',
      beforeTenPM: 'Válidas até às 22:00',
      available: 'disponíveis',
      searchOffers: 'Buscar ofertas...',
      itemsLeft: 'Restam {count}',
      orderNow: 'Pedir Agora',
      specialOffer: 'Oferta Especial',
      specialDiscount: 'DESCONTO ESPECIAL',
      originalPrice: 'Preço original',
      discountedPrice: 'Preço com desconto',
      offerInformation: 'Informações da oferta',
      status: 'Status',
      active: 'Ativa',
      expired: 'Expirada',
      termsAndConditions: 'Termos e condições',
      call: 'Ligar',
      getDirections: 'Ir ao local',
      useOfferNow: 'Usar Oferta Agora',
      presentCoupon: 'Apresente este cupom no estabelecimento',
      location: 'Localização',
      locationMap: 'Mapa de localização',
      daysLeft: '{days} dia{days, plural, one {} other {s}}',
      hoursLeft: '{hours} hora{hours, plural, one {} other {s}}',
      lessThanOneHour: 'Menos de 1 hora',
      noOffersFound: 'Nenhuma oferta encontrada',
      tryDifferentSearch: 'Tente uma busca diferente',
      limitedTime: 'Tempo limitado'
    },

    // Profile translations
    profile: {
      myProfile: 'Meu Perfil',
      manageAccount: 'Gerenciar conta',
      verified: 'Verificado',
      userMode: 'Modo de Usuário',
      clientMode: 'Modo Cliente',
      handymanMode: 'Modo Profissional',
      professionalStats: 'Estatísticas Profissionais',
      completedJobs: 'Trabalhos Concluídos',
      rating: 'Avaliação',
      quickActions: 'Ações Rápidas',
      dailyOffers: 'Ofertas do Dia',
      dailyOffersDesc: 'Comida com desconto antes do fechamento',
      myJobs: 'Meus Trabalhos',
      manageJobs: 'Gerenciar trabalhos ativos',
      messages: 'Mensagens',
      chatWithClients: 'Conversar com clientes',
      payments: 'Pagamentos',
      paymentsHistory: 'Histórico de pagamentos',
      reviews: 'Avaliações',
      seeReviews: 'Ver minhas avaliações',
      account: 'Conta',
      settings: 'Configurações',
      helpSupport: 'Ajuda e Suporte',
      createProfessionalProfile: 'Criar Perfil Profissional',
      startReceivingJobs: 'Comece a receber trabalhos',
      create: 'Criar',
      limitedTime: 'Tempo limitado'
    },

    // Quick Opportunity translations
    quickOpportunity: {
      flashOffers: 'Ofertas Flash',
      publishUrgent: 'Publique ofertas urgentes e especializadas',
      backToProfile: 'Voltar ao perfil',
      dailyOffers: 'Ofertas do Dia',
      foodExcess: 'Comida em excesso - Vence antes das 22h',
      seeAll: 'Ver todas',
      remainingTime: 'Tempo restante',
      from: 'A partir de',
      publishNew: 'Publicar Nova Oferta',
      offerType: 'Tipo de Oferta',
      dailyOffer: 'Oferta do Dia',
      dailyOfferDesc: 'Comida em excesso vencendo hoje',
      serviceOffer: 'Oferta de Serviço',
      serviceOfferDesc: 'Serviços especiais com desconto',
      productOffer: 'Oferta de Produto',
      productOfferDesc: 'Estoque em excesso',
      title: 'Título da oferta',
      description: 'Descrição',
      originalPrice: 'Preço original',
      discountedPrice: 'Preço com desconto',
      quantity: 'Quantidade disponível',
      expirationTime: 'Hora de vencimento',
      category: 'Categoria',
      selectCategory: 'Selecionar categoria...',
      pizza: 'Pizza',
      sandwich: 'Sanduíche',
      coffee: 'Café',
      dessert: 'Sobremesas',
      asian: 'Comida Asiática',
      mexican: 'Comida Mexicana',
      publish: 'Publicar Oferta',
      publishing: 'Publicando...',
      expired: 'Expirado',
      titlePlaceholder: 'Ex: Pizza Margherita Familiar',
      descriptionPlaceholder: 'Descreva sua oferta...',
      haveExcess: 'Você tem excedentes para vender?',
      dailyOffersDescription: 'Perfeitas para restaurantes que precisam vender excedentes de comida antes do fechamento. Todas as ofertas expiram automaticamente às 22:00.'
    },

    // Home translations
    home: {
      createProfile: 'Crie seu perfil profissional',
      title: 'Encontre trabalhos perto de você',
      flashOfferCTA: 'Criar Oferta Flash',
      flashOffer: 'Oferta Flash',
      createProfileTitle: 'Crie Seu Perfil Profissional',
      createProfileDesc: 'Comece a receber trabalhos hoje',
      create: 'Criar',
      searchJobs: 'Buscar trabalhos...',
      availableJobs: 'Trabalhos Disponíveis',
      clearFilter: 'Limpar filtro',
      noJobsFound: 'Nenhum trabalho encontrado',
      tryChangingFilters: 'Tente alterar os filtros'
    },

    // Dashboard translations
    dashboard: {
      hello: 'Olá, {name}',
      perfectJobs: 'Encontre trabalhos perfeitos para você',
      profileVerified: 'Perfil Verificado',
      profileComplete: '{count} trabalhos disponíveis',
      newThisWeek: 'Novos esta semana',
      averageBudget: 'Orçamento médio',
      urgentJobs: 'Trabalhos urgentes',
      availableJobs: 'Trabalhos disponíveis',
      quickActions: 'Ações Rápidas',
      myProfile: 'Meu Perfil',
      myJobs: 'Meus Trabalhos',
      myReviews: 'Minhas Avaliações',
      recommendedForYou: 'Recomendados para você',
      bestPaying: 'Melhor pagamento',
      closest: 'Mais próximos',
      newest: 'Mais novos',
      tipsForMoreJobs: 'Dicas para mais trabalhos',
      tips: [
        'Mantenha seu perfil atualizado',
        'Responda rapidamente às propostas',
        'Ofereça preços competitivos',
        'Solicite avaliações dos clientes'
      ]
    },

    // Search translations
    search: {
      title: 'Buscar Profissionais',
      searchPlaceholder: 'Buscar profissionais...',
      professionalsFound: '{count} profissionais encontrados',
      noProfessionalsFound: 'Nenhum profissional encontrado',
      tryChangingFilters: 'Tente alterar os filtros',
      jobs: 'trabalhos',
      more: 'mais',
      mostJobs: 'Mais trabalhos',
      from: 'A partir de'
    },

    // Job translations
    job: {
      reviews: 'avaliações',
      message: 'Mensagem',
      viewProfile: 'Ver Perfil'
    },

    // Flash Job translations
    flashJob: {
      quickUrgentJobs: 'Trabalhos rápidos e urgentes!',
      repairsDeliveriesServices: 'Reparos, entregas e serviços expressos',
      whatDoYouNeed: 'O que você precisa?',
      titlePlaceholder: 'Ex. Consertar vazamento, Pintar quarto...',
      characters: 'caracteres',
      where: 'Onde?',
      locationPlaceholder: 'Bairro, Cidade',
      approximateBudget: 'Orçamento aproximado',
      budgetPlaceholder: 'Ex. 150000',
      additionalDetails: 'Detalhes adicionais (opcional)',
      detailsPlaceholder: 'Adicione qualquer detalhe importante...',
      urgency: 'Urgência',
      normal: 'Normal',
      noRush: 'Sem pressa',
      perfectForUrgentRepairs: 'Perfeito para reparos urgentes',
      idealForDeliveries: 'Ideal para entregas e recados',
      professionalsRespondQuickly: 'Profissionais respondem rapidamente',
      expressSolutions: 'Soluções expressas disponíveis',
      publishFlashJob: 'Publicar Trabalho Flash',
      completeRequiredFields: 'Complete todos os campos obrigatórios (*)',
      preferFullForm: 'Prefere o formulário completo?'
    },

    // Post Job translations
    postJob: {
      title: 'Publicar Trabalho',
      subtitle: 'Encontre o profissional perfeito',
      needSomethingUrgent: 'Precisa de algo urgente?',
      useFlashOffer: 'Use Ofertas Flash para resultados imediatos',
      projectPhotos: 'Fotos do projeto',
      addPhotos: 'Adicionar fotos ajuda a obter melhores ofertas',
      uploadPhotos: 'Fazer upload de fotos',
      jobTitle: 'Título do trabalho',
      jobTitlePlaceholder: 'Ex: Consertar torneira da cozinha',
      category: 'Categoria',
      selectCategory: 'Selecionar categoria...',
      detailedDescription: 'Descrição detalhada',
      detailedDescriptionPlaceholder: 'Descreva em detalhes o que precisa ser feito...',
      location: 'Localização',
      locationPlaceholder: 'Endereço onde o trabalho será realizado',
      preferredSchedule: 'Horário preferido',
      flexibleSchedule: 'Horário flexível',
      flexibleScheduleDesc: 'Posso coordenar com o profissional',
      specificSchedule: 'Horário específico',
      specificScheduleDesc: 'Tenho datas e horários específicos',
      scheduleExample: 'Ex: Manhãs entre 9-12, disponível finais de semana',
      suggestion: 'Sugestão',
      flexibleTip: 'Horários flexíveis geralmente recebem mais ofertas e melhores preços',
      budget: 'Orçamento',
      budgetHint: 'Orçamentos flexíveis geralmente recebem mais ofertas',
      fixedBudget: 'Orçamento fixo',
      fixedBudgetDesc: 'Sei exatamente quanto quero pagar',
      averageBudget: 'Orçamento médio',
      averageBudgetDesc: 'Tenho uma ideia do custo',
      budgetExample: '150000',
      howItWorks: 'Como funciona?',
      fixedExplanation: 'Fixo: Os profissionais saberão seu orçamento exato',
      averageExplanation: 'Médio: Os profissionais podem ofertar em torno deste valor',
      deadline: 'Prazo',
      projectUrgency: 'Urgência do projeto',
      urgency: 'Urgência',
      'urgency.low': 'Baixa',
      'urgency.normal': 'Normal',
      'urgency.high': 'Alta',
      notUrgent: 'Não urgente',
      moderate: 'Moderada',
      urgent: 'Urgente',
      images: 'Imagens',
      imagesHint: 'Adicione fotos para obter melhores ofertas (opcional)',
      addImages: 'Adicionar Imagens',
      summary: 'Resumo do Trabalho',
      step: 'Passo',
      of: 'de',
      publish: 'Publicar Trabalho',
      publishJob: 'Publicar Trabalho',
      publishInfo: 'Seu trabalho será publicado',
      publishDescription: 'Profissionais verificados poderão ver seu trabalho e enviar ofertas.',
      jobVisibility: 'Seu trabalho será visível para profissionais verificados'
    },

    // Success translations
    success: {
      jobPublished: 'Trabalho Publicado',
      jobPublishedDesc: 'Seu trabalho foi publicado com sucesso',
      flashOfferPublished: 'Oferta Flash Publicada',
      flashOfferPublishedDesc: 'Sua oferta flash foi publicada com sucesso',
      newOfferReceived: 'Nova Oferta Recebida',
      newOfferReceivedDesc: 'Você recebeu uma nova oferta para "{title}"',
      offerSent: 'Oferta Enviada',
      offerSentDesc: 'Sua oferta de {amount} foi enviada',
      profileCreated: 'Perfil Criado',
      profileCreatedDesc: 'Seu perfil profissional foi criado com sucesso'
    },

    // Categories translations
    categories: {
      all: 'Todas as categorias',
      plumbing: 'Encanamento',
      electrical: 'Elétrica',
      painting: 'Pintura',
      cleaning: 'Limpeza',
      gardening: 'Jardinagem',
      carpentry: 'Carpintaria',
      appliances: 'Eletrodomésticos',
      moving: 'Mudanças'
    },

    // Job card translations
    jobCard: {
      postedBy: 'Publicado por',
      timeAgo: 'Há {time}',
      distance: '{distance}',
      urgent: 'Urgente',
      budget: 'Orçamento',
      fixed: 'Fixo',
      average: 'Médio',
      deadline: 'Até',
      statusOpen: 'Aberto',
      statusInProgress: 'Em Andamento',
      statusCompleted: 'Concluído',
      statusClosed: 'Fechado',
      offersReceived: '{count} oferta{count, plural, one {} other {s}} recebida{count, plural, one {} other {s}}'
    },

    // Job details translations
    jobDetails: {
      jobDetails: 'Detalhes do Trabalho',
      description: 'Descrição',
      location: 'Localização',
      schedule: 'Horário',
      flexible: 'Flexível',
      specific: 'Específico',
      deadline: 'Prazo',
      budgetType: 'Tipo de orçamento',
      sendOffer: 'Enviar Oferta',
      yourOffer: 'Sua oferta',
      message: 'Mensagem (opcional)',
      messagePlaceholder: 'Descreva sua experiência e por que você é o melhor para este trabalho...',
      send: 'Enviar',
      sending: 'Enviando...',
      bids: 'Ofertas recebidas',
      noBids: 'Ainda não há ofertas',
      yourUser: 'Seu Usuário',
      daysLeft: '{days} dias',
      expired: 'Expirado',
      offersCount: '{count} ofertas',
      fixedBudgetTip: 'Orçamento fixo - Ofertas próximas a este valor são preferidas',
      averageBudgetTip: 'Orçamento médio - Você pode ofertar o valor que considerar justo',
      interestedInJob: 'Interessado neste trabalho?',
      makeOffer: 'Fazer Oferta',
      reference: 'Referência',
      start: 'Início',
      delivery: 'Entrega',
      startPlaceholder: 'Amanhã',
      deliveryPlaceholder: 'Em 3 dias',
      estimatedDuration: 'Duração estimada',
      durationPlaceholder: '2 dias úteis',
      describeProposal: 'Descreva sua proposta',
      proposalPlaceholder: 'Explique sua experiência, metodologia, materiais incluídos, garantias, etc.',
      acceptOffer: 'Aceitar Oferta',
      bidsWillAppear: 'Ofertas de profissionais aparecerão aqui'
    },

    // Navigation translations
    nav: {
      home: 'Início',
      search: 'Buscar',
      radar: 'Radar',
      post: 'Publicar',
      messages: 'Mensagens',
      profile: 'Perfil'
    },

    // Common translations
    common: {
      back: 'Voltar',
      save: 'Salvar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Excluir',
      confirm: 'Confirmar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      all: 'Todos',
      hour: 'hora',
      active: 'Ativos',
      recent: 'Recentes',
      yesterday: 'Ontem',
      distance: 'de distância',
      timeAgo: 'Há {time}',
      next: 'Próximo',
      previous: 'Anterior'
    },

    // Messages translations
    messages: {
      title: 'Mensagens',
      noMessages: 'Nenhuma mensagem',
      startConversation: 'Comece uma conversa com um profissional',
      searchMessages: 'Buscar mensagens...',
      online: 'Online',
      offline: 'Offline',
      typing: 'Digitando...',
      sendMessage: 'Enviar mensagem',
      messagePlaceholder: 'Digite uma mensagem...',
      canStartTomorrow: 'Perfeito, posso começar amanhã de manhã',
      willSendPhotos: 'Vou te enviar fotos de trabalhos similares',
      thankYouOffer: 'Obrigado por considerar minha oferta'
    },

    // Notifications translations
    notifications: {
      title: 'Notificações',
      markAllRead: 'Marcar todas como lidas',
      noNotifications: 'Nenhuma notificação',
      noNotificationsDesc: 'Quando você receber ofertas, mensagens ou houver trabalhos perto de você, eles aparecerão aqui',
      newJobAlert: 'Alerta de novo trabalho',
      messageReceived: 'Mensagem recebida',
      bidAccepted: 'Oferta aceita',
      jobCompleted: 'Trabalho concluído',
      paymentReceived: 'Pagamento recebido',
      unread: 'Não lida',
      previous: 'Anteriores',
      acceptOpportunity: 'Aceitar Oportunidade',
      unreadCount: 'notificação não lida',
      jobPublished: 'Trabalho Publicado',
      jobPublishedDesc: 'Seu trabalho foi publicado com sucesso e os profissionais podem vê-lo'
    },

    // Radar translations
    radar: {
      active: 'Ativo',
      inactive: 'Inativo',
      scanningJobs: 'Escaneando trabalhos próximos...',
      radarPaused: 'Radar pausado',
      radius: 'Raio',
      offers: 'ofertas',
      radarConfig: 'Configuração do Radar',
      searchRadius: 'Raio de busca',
      jobsOnly: 'Apenas trabalhos',
      hideCommercialOffers: 'Ocultar ofertas comerciais',
      jobs: 'Trabalhos',
      published: 'Publicado',
      noNearbyJobs: 'Nenhum trabalho próximo',
      activateRadarDesc: 'Ative o radar para receber notificações de novos trabalhos',
      noNearbyOffers: 'Nenhuma oferta próxima',
      commercialOffersDesc: 'Ofertas comerciais aparecerão aqui quando disponíveis',
      validUntil: 'Válido até',
      jobNearYou: 'Trabalho perto de você',
      pays: 'Paga',
      viewJob: 'Ver trabalho'
    },

    // Flash Job translations
    flashJob: {
      title: 'Trabalho Flash',
      subtitle: 'Para trabalhos urgentes e rápidos',
      category: 'Categoria do trabalho',
      jobTitle: 'Título do trabalho',
      description: 'Descrição',
      location: 'Localização',
      budget: 'Orçamento',
      urgency: 'Urgência',
      urgent: 'Urgente',
      high: 'Alta',
      normal: 'Normal',
      publish: 'Publicar Trabalho Flash',
      backToProfile: 'Voltar ao perfil'
    },

    // Flash Offers translations
    flashOffers: {
      title: 'Ofertas Flash',
      subtitle: 'Trabalhos rápidos e ofertas especiais',
      flashJobs: 'Trabalhos Flash',
      businessOffers: 'Ofertas de Negócios',
      noFlashJobs: 'Nenhum trabalho flash disponível',
      noBusinessOffers: 'Nenhuma oferta de negócio disponível',
      createFlashJob: 'Criar Trabalho Flash',
      backToProfile: 'Voltar ao perfil'
    }
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'es' | 'en' | 'pt'>('es');

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Spanish if key not found
        value = translations.es;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match;
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}