export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDistance = (distance: number) => {
  return distance < 1000 ? `${distance}m` : `${(distance/1000).toFixed(1)}km`;
};

export const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
    >
      ★
    </span>
  ));
};

export const getTimeLeft = (deadline: Date) => {
  const now = new Date();
  const timeLeft = deadline.getTime() - now.getTime();
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (daysLeft > 0) {
    return `${daysLeft} día${daysLeft > 1 ? 's' : ''}`;
  } else if (hoursLeft > 0) {
    return `${hoursLeft} hora${hoursLeft > 1 ? 's' : ''}`;
  } else {
    return 'Menos de 1 hora';
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'mudanzas': return '📦';
    case 'plomería': return '🔧';
    case 'electricidad': return '⚡';
    case 'carpintería': return '🔨';
    case 'pintura': return '🎨';
    case 'limpieza': return '🧽';
    case 'jardinería': return '🌱';
    case 'reparaciones': return '🛠️';
    default: return '🛠️';
  }
};

export const formatSchedule = (schedule: { type: 'flexible' | 'specific'; preferredTime?: string; timeRange?: string }) => {
  if (schedule.type === 'flexible') {
    return `Horario flexible${schedule.timeRange ? ` (${schedule.timeRange})` : ''}`;
  } else {
    return `Horario específico${schedule.preferredTime ? ` (${schedule.preferredTime})` : ''}`;
  }
};