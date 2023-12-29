// Toastr initialization
toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: true,
  progressBar: false,
  positionClass: "toast-top-full-width",
  preventDuplicates: true,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "2500",
  extendedTimeOut: "0",
  showEasing: "swing",
  hideEasing: "swing",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

document.addEventListener("DOMContentLoaded", () => {
  let urlParams = new URLSearchParams(window.location.search);
  let siteUrl = urlParams.get("url");

  let urlElement = document.getElementById("url-span");
  let urlReport = document.getElementById("reportUrl");

  urlElement.textContent = siteUrl;
  urlReport.value = siteUrl;

  function dismissModal() {
    $(".reportModal").modal("hide");
  }

  chrome.storage.local.get("userEmail", (result) => {
    let userEmail = "";
    if (result.userEmail != undefined) {
      userEmail = result.userEmail;
    } else {
      userEmail = "";
    }

    // Submit Report
    const form = document.getElementById("reportForm");
    let emailInput = form.querySelector('[id="userEmail"]');

    if (form) {
      emailInput.value = userEmail;

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        let email = form.querySelector('[id="userEmail"]').value;
        chrome.storage.local.set({ userEmail: email }, () => {});

        let formData = new FormData(form);

        fetch(form.action, {
          method: "POST",
          body: formData,
          mode: "no-cors",
        })
          .then((response) => {
            if (response.type === "opaque") {
              toastr.success("Report Submitted Successfully!");
              dismissModal();
            } else {
              toastr.error("Error Submitting the Report. Please try again.");
            }
          })
          .catch((error) => {
            console.log("An error occurred:" + error);
          });
      });
    }
  });
});
