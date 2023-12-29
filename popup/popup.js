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

// compute total cache size
function estimateCacheSize(callback) {
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

// set the value of cache size element
let cacheSizeEl = document.getElementById("cache-size");
estimateCacheSize((cacheSize) => {
  if (cacheSize > 0) {
    cacheSizeEl.innerHTML = cacheSize + " kB";
  } else {
    cacheSizeEl.innerHTML = "0 kB";
  }
});

// when the clear cache is clicked
let clearCacheItem = document.getElementById("clear-cache");
clearCacheItem.addEventListener("click", (event) => {
  estimateCacheSize((cacheSize) => {
    if (cacheSize <= 0) {
      event.preventDefault();
      toastr.error("Cache is Empty", "Error");
    } else {
      console.log(cacheSize);
      chrome.storage.local.remove("cache", () => {
        cacheSizeEl.innerHTML = "0 kB";
        toastr.success("Cache Cleared!", "Success");
      });
    }
  });
});

// when the view site report is clicked
let viewSiteReport = document.getElementById("view-site-report");
viewSiteReport.addEventListener("click", (event) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let currentTab = tabs[0];
    let currentUrl = currentTab.url;
    if (currentUrl.startsWith("https://") || currentUrl.startsWith("http://")) {
      chrome.tabs.create({
        url: `site-report/legitimate/legitimate.html?url=${encodeURIComponent(
          currentUrl
        )}`,
      });
    } else {
      event.preventDefault();
      toastr.error("This operation doesn't apply with the current tab");
    }
  });
});

// when the trusted sites is clicked
let trustedSites = document.getElementById("trusted-sites");
trustedSites.addEventListener("click", () => {
  chrome.tabs.create({
    url: `home/home.html?tab=trusted-sites-tab`,
  });
});

// when the settings is clicked
let settings = document.getElementById("settings");
settings.addEventListener("click", () => {
  chrome.tabs.create({
    url: `home/home.html?tab=settings-tab`,
  });
});

// when the privacy is clicked
let privacyPolicy = document.getElementById("privacy-policy");
privacyPolicy.addEventListener("click", () => {
  chrome.tabs.create({
    url: `home/home.html?tab=privacy-policy-tab`,
  });
});

// when the terms and conditions is clicked
let termsAndConditions = document.getElementById("terms-and-conditions");
termsAndConditions.addEventListener("click", () => {
  chrome.tabs.create({
    url: `home/home.html?tab=terms-and-conditions-tab`,
  });
});
