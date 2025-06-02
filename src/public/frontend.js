// navbar modal
function toggleNavbar() {
  const navbar = document.getElementById("navbar-default");
  navbar.classList.toggle("hidden");
  console.log(`hit`);
}
const logoutModal = document.getElementById("logoutModal");
const cancelBtn = document.getElementById("cancelLogoutBtn");

// Function to show the modal
function showLogoutModal() {
  logoutModal.classList.remove("hidden");
}

// Cancel button hides the modal
cancelBtn.addEventListener("click", () => {
  logoutModal.classList.add("hidden");
});