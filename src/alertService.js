// alertService.js
import Swal from "sweetalert2";

/**
 * Muestra un alerta con SweetAlert2
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - Tipo de alerta: 'success', 'error', 'warning', 'info', 'question'
 */
export function showAlert(message, type = "info") {
  Swal.fire({
    icon: type,
    title: message,
    confirmButtonColor: "#007bff",
  });
}