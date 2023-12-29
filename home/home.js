// Toastr initialization
toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: true,
  progressBar: false,
  positionClass: "toast-top-right",
  preventDuplicates: false,
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

// Tooltip initialization
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);

const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

// add separate HTML files
function addHtmlFiles() {
  $("#t-and-c-container").load("terms-and-conditions.html");
  $("#priv-pol-container").load("privacy-policy.html");
}

// Function to get Tab URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  let regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  let results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let tabParam = getUrlParameter("tab");
if (tabParam) {
  let tabElement = document.getElementById(tabParam);
  if (tabElement) {
    let tab = new bootstrap.Tab(tabElement);
    tab.show();
  }
}

// initialize element references
const tableBody = document.getElementById("table-body");
const emptyList = document.getElementById("empty-list-div");
const detectionLevelSelect = document.getElementById("detection-level");
const cleaningIntervalSelect = document.getElementById("cleaning-interval");
const clearCacheButton = document.getElementById("clear-cache-btn");
const saveSettingsButton = document.getElementById("saveSettingsBtn");

// display trusted sites
function getTrustedSites() {
  chrome.storage.local.get({ trustedSites: [] }, (result) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    } else {
      let trustedSitesList = result.trustedSites;

      if (trustedSitesList.length > 0) {
        tableBody.innerHTML = "";
        emptyList.style.display = "none";

        for (let index = trustedSitesList.length - 1; index >= 0; index--) {
          let trustedSite = trustedSitesList[index];
          let row = document.createElement("tr");
          row.innerHTML = `
                    <td class="text-break user-select-all">${trustedSite}</td>
                    <td>
                      <button type="button" class="btn btn-danger w-100 deleteBtn" id="${index}">
                        <i class="bi bi-trash3-fill"></i>
                      </button>
                    </td>
                  `;
          tableBody.appendChild(row);

          let deleteButton = row.querySelector(".deleteBtn");
          deleteButton.addEventListener("click", () => {
            deleteTrustedSite(index);
          });
        }
      } else {
        tableBody.innerHTML = "";
        emptyList.style.display = "block";
      }
    }
  });
}

// delete a trusted site by index
function deleteTrustedSite(index) {
  chrome.storage.local.get({ trustedSites: [] }, (result) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    } else {
      let trustedSitesList = result.trustedSites;

      if (index >= 0 && index < trustedSitesList.length) {
        trustedSitesList.splice(index, 1);
        chrome.storage.local.set({ trustedSites: trustedSitesList }, () => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
          } else {
            toastr.success("URL Removed.", "Success");
            getTrustedSites();
          }
        });
      } else {
        toastr.error("Error removing the URL. Please Try again.", "Error");
      }
    }
  });
}

// detection level conversion
function getDetectionLevel(operation, levelInput, callback) {
  if (operation === "save") {
    let detectionLevel = 0;

    if (levelInput === "high") {
      detectionLevel = 0.47;
    } else if (levelInput === "low") {
      detectionLevel = 0.53;
    } else {
      detectionLevel = 0.5;
    }

    callback(detectionLevel);
  } else {
    chrome.storage.local.get(["detectionLevel"], (result) => {
      let detectionLevel = "";
      let level = result.detectionLevel;

      if (level === 0.47) {
        detectionLevel = "high";
      } else if (level === 0.5) {
        detectionLevel = "balanced";
      } else {
        detectionLevel = "low";
      }

      callback(detectionLevel);
    });
  }
}

// get cache cleanup interval
function getCleaningInterval(callback) {
  chrome.storage.local.get(["cleaningInterval"], (result) => {
    let cleaningInterval = result.cleaningInterval;

    callback(cleaningInterval);
  });
}

// compute total cache size
function getTotalCache(callback) {
  chrome.storage.local.get("cache", (result) => {
    let cache = result.cache || {};

    let totalSize = Object.values(cache).reduce(
      (acc, item) => acc + item.size,
      0
    );

    let totalSizeKB = (totalSize / 1024).toFixed(2);

    callback(totalSizeKB);
  });
}

// initialize settings values
function setSettingsValues() {
  getDetectionLevel("set", 0, (detectionLevel) => {
    detectionLevelSelect.value = detectionLevel;
  });

  getCleaningInterval((interval) => {
    cleaningIntervalSelect.value = interval;
  });

  getTotalCache((total) => {
    if (total > 0) {
      clearCacheButton.innerHTML = "Clear " + total + " kB";
    } else {
      clearCacheButton.innerHTML = "Clear 0 kB";
      clearCacheButton.disabled = true;
    }
  });
}

// toggles button state
function toggleSaveSettings() {
  let isSaveButtonDisabled =
    !detectionLevelSelect.value && !cleaningIntervalSelect.value;

  function areValuesChanged() {
    saveSettingsButton.disabled = isSaveButtonDisabled;
  }

  detectionLevelSelect.addEventListener("change", areValuesChanged);
  cleaningIntervalSelect.addEventListener("change", areValuesChanged);
}

// save settings
function saveSettings() {
  let detectionLevelInput = document.getElementById("detection-level").value;
  let cleaningIntervalInput =
    document.getElementById("cleaning-interval").value;

  let cleaningInterval = parseInt(cleaningIntervalInput);
  let detectionLevel = "";

  getDetectionLevel("save", detectionLevelInput, (level) => {
    detectionLevel = level;
  });

  chrome.storage.local.set(
    {
      detectionLevel: detectionLevel,
      cleaningInterval: cleaningInterval,
    },
    () => {
      toastr.success("Settings Saved!", "Success");
      toggleSaveSettings();
    }
  );
}

// clear cache
function clearCache() {
  chrome.storage.local.remove("cache", () => {
    clearCacheButton.disabled = true;
    clearCacheButton.innerHTML = "Clear 0 kB";
    toastr.success("Cache Cleared!", "Success");
  });
}

// initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  saveSettingsButton.disabled = true;

  addHtmlFiles();
  getTrustedSites();
  setSettingsValues();
  toggleSaveSettings();
  saveSettingsButton.addEventListener("click", saveSettings);
  clearCacheButton.addEventListener("click", clearCache);
});
