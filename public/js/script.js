(() => {
  'use strict'

  // ---------- Bootstrap Form Validation ----------
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })

  // ---------- Auto-dismiss Flash Alerts ----------
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const alerts = document.querySelectorAll('.alert:not(.keep-alert)')
      alerts.forEach(alert => {
        const bsAlert = new bootstrap.Alert(alert)
        bsAlert.close()
      })
    }, 10000) // 3 seconds
  })
})()
