// Smooth scroll for nav links
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(targetId);
      if (el) {
        const offset = 70; // navbar height
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

// Scroll reveal using IntersectionObserver
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback
  revealElements.forEach((el) => el.classList.add('visible'));
}


function sendWhatsApp(event) {
  event.preventDefault();

  const name = document.getElementById("w-name").value;
  const phone = document.getElementById("w-phone").value;
  const email = document.getElementById("w-email").value;
  const message = document.getElementById("w-msg").value;

  const whatsappNumber = "918238005301"; // India code +91

  const text =
    "New Portfolio Message%0A%0A" +
    "*Name:* " + name + "%0A" +
    "*Phone:* " + phone + "%0A" +
    "*Email:* " + email + "%0A" +
    "*Message:* " + message;

  const url = `https://wa.me/${whatsappNumber}?text=${text}`;

  window.open(url, "_blank");
}

