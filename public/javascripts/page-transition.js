document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("page-header");
    const root = document.getElementById("page-root");
    const rows = document.querySelectorAll("tbody tr");
  
    setTimeout(() => {
      if (header) {
        header.classList.remove("opacity-0", "translate-y-4");
        header.classList.add("opacity-100", "translate-y-0");
      }
    }, 200);
  
    setTimeout(() => {
      if (root) {
        root.classList.remove("opacity-0", "translate-y-4");
        root.classList.add("opacity-100", "translate-y-0");
      }
      rows.forEach((row, i) => {
        setTimeout(() => {
          row.classList.remove("opacity-0", "translate-y-4");
          row.classList.add("opacity-100", "translate-y-0");
        }, i * 100);
      });
    }, 400);
  });
  