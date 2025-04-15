(function() {
    document.addEventListener("mousemove", parallax);
    const wrapper = document.querySelector("#parallax-wrapper");
    const main = document.querySelector("#main");

    function parallax(e) {
      const _w = window.innerWidth / 2;
      const _h = window.innerHeight / 2;
      const _mouseX = e.clientX;
      const _mouseY = e.clientY;

      const offsetX = (_mouseX - _w) * 0.01; 
      const offsetY = (_mouseY - _h) * 0.01;

      main.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      wrapper.style.backgroundPosition = `${offsetX}% ${offsetY}%`;
    }
  })();

  (function() {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        document.addEventListener("mousemove", parallax);
    } else {
        // Add touch support for mobile hover effects
        const h2 = document.querySelector('h2');
        h2.addEventListener('touchstart', function() {
            this.classList.add('hover');
        });
        h2.addEventListener('touchend', function() {
            this.classList.remove('hover');
        });
    }
    
    const wrapper = document.querySelector("#parallax-wrapper");
    const main = document.querySelector("#main");

    function parallax(e) {
        if (isMobile) return; // Exit if mobile
        
        const _w = window.innerWidth / 2;
        const _h = window.innerHeight / 2;
        const _mouseX = e.clientX;
        const _mouseY = e.clientY;

        const offsetX = (_mouseX - _w) * 0.01; 
        const offsetY = (_mouseY - _h) * 0.01;

        main.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        wrapper.style.backgroundPosition = `${offsetX}% ${offsetY}%`;
    }
    
    // Center content on mobile
    if (isMobile) {
        wrapper.style.backgroundPosition = "center center";
        main.style.transform = "translate(-50%, -50%)";
    }
})();

