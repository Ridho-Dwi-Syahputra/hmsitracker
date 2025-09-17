document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("hmsi-sidebar");
  const toggle = document.getElementById("hmsi-sidebar-toggle");
  const overlay = document.getElementById("hmsi-sidebar-overlay");

  if (!sidebar || !toggle || !overlay) return;

  const openSidebar = () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  };

  const closeSidebar = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("-translate-x-full")) {
      openSidebar();
    } else {
      closeSidebar();
    }
  });

  overlay.addEventListener("click", closeSidebar);
});
