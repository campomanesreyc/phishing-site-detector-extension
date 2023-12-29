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

// Add rule function
function addRule(ruleDefinition, callback) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules: [ruleDefinition],
    },
    (details) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        callback(false);
      } else {
        callback(true);
      }
    }
  );
}

// Remove rule function
function removeRule(ruleIds, callback) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: ruleIds,
    },
    (details) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        callback(false);
      } else {
        callback(true);
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  let urlParams = new URLSearchParams(window.location.search);
  let phishingUrl = urlParams.get("url");

  let urlElement = document.getElementById("url-span");
  let reportUrl = document.getElementById("reportUrl");

  urlElement.textContent = phishingUrl;
  reportUrl.value = phishingUrl;

  let proceedBtn = document.getElementById("proceedBtn");
  let goBackBtn = document.getElementById("goBackBtn");

  let rule2 = {
    id: 2,
    priority: 2,
    action: {
      type: "allow",
    },
    condition: {
      urlFilter: phishingUrl,
      resourceTypes: ["main_frame"],
    },
  };

  // close the modal
  function dismissModal() {
    $(".reportModal").modal("hide");
  }

  // Proceed button
  proceedBtn.addEventListener("click", () => {
    chrome.storage.local.get({ trustedSites: [] }, (result) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
      } else {
        let trustedSites = result.trustedSites;
        trustedSites.push(phishingUrl);
        chrome.storage.local.set({ trustedSites: trustedSites }, () => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
          } else {
            addRule(rule2, (added) => {
              if (added) {
                toastr.success(
                  "Successfully added to your Trusted Sites!",
                  "Success"
                );
                window.location.href = phishingUrl;
              } else {
                console.log("Failed to add rule with ID 2");
              }
            });
          }
        });
      }
    });
  });

  // Go back button
  goBackBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let currentTab = tabs[0];
      if (currentTab.index > 0) {
        chrome.tabs.goBack(currentTab.id, () => {
          if (chrome.runtime.lastError) {
            chrome.tabs.remove(currentTab.id);
            chrome.tabs.create({});
          }
        });
      } else {
        chrome.tabs.create({});
      }
    });
  });

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
