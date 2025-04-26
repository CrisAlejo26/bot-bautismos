// Script principal para la aplicación web del Bot de Bautismos

document.addEventListener('DOMContentLoaded', function() {
  // Añadir animaciones de entrada
  const animatedElements = document.querySelectorAll('.hero-section, .feature-card, .bot-info');
  animatedElements.forEach(element => {
    element.classList.add('fade-in');
  });

  // Navegación suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });

  // Detectar si el usuario está en un dispositivo móvil para optimizar la experiencia
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    // Ajustes específicos para móviles si es necesario
    document.body.classList.add('mobile-device');
  }

  // Botones de Telegram con seguimiento de eventos
  const telegramButtons = document.querySelectorAll('a[href^="https://t.me/"]');
  telegramButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Aquí podrías añadir código para seguimiento de eventos
      console.log('Usuario haciendo clic en botón de Telegram');
    });
  });
});
