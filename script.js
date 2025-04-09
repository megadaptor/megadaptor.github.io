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