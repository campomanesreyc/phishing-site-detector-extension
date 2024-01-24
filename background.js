// declaring constant variables

const API_URL = "https://phishing-site-detector.onrender.com/predict";

const INITIAL_DATA = {
  detectionLevel: 0.5,
  cleaningInterval: 1,
};

const search_engine_domains = [
  "google.com/search/q",
  "duckduckgo.com/?q",
  "search.yahoo.com/search?",
  "bing.com/search?q",
  "baidu.com/s?",
  "yandex.com/search/?",
  "ask.com/web?q",
  "search.aol.com/aol/search?q",
  "ecosia.org/search?",
  "startpage.com/sp/search",
  "search.brave.com/search?q",
  "qwant.com/?q",
];

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdFXM8qrb0N2N9QzUrPf3Xtu-GdEKRul7-LRrCIu8rOkx0AUA/formResponse";

// show thank you page after installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(INITIAL_DATA, () => {
    chrome.tabs.create({ url: "./thank-you/thank-you.html" });
  });
});

// clear cache function
function clearCache() {
  chrome.storage.local.remove("cache", () => {});
}

// set cache cleanup interval
function setupCacheClearingTimeout() {
  chrome.storage.local.get("cleaningInterval", (result) => {
    let interval = result.cleaningInterval;

    function clearCacheAndReset() {
      clearCache();
      setTimeout(clearCacheAndReset, interval * 24 * 60 * 60 * 1000);
    }

    setTimeout(clearCacheAndReset, interval * 24 * 60 * 60 * 1000);
  });
}

// starting the timer for cache cleanup
chrome.runtime.onInstalled.addListener(function () {
  setupCacheClearingTimeout();
});

// if user changes the cleanup interval
chrome.storage.onChanged.addListener(function (changes) {
  if (changes.cacheClearInterval) {
    setupCacheClearingTimeout();
  }
});

//  add blocking rules
function addRule(ruleDefinition, callback) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules: [ruleDefinition],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        callback(false);
      } else {
        callback(true);
      }
    }
  );
}

// remove blocking rules
function removeRule(ruleIds, callback) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: ruleIds,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        callback(false);
      } else {
        callback(true);
      }
    }
  );
}

// checking if URL starts with HTTP or HTTPS
function isValidUrl(url) {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return true;
  } else {
    return false;
  }
}

// checking if the URL is in trusted sites
function notInTrustedSites(url, callback) {
  chrome.storage.local.get({ trustedSites: [] }, (result) => {
    let trustedSites = result.trustedSites;

    let isInTrustedSites = trustedSites.some(
      (trustedSites) => trustedSites === url
    );

    callback(!isInTrustedSites);
  });
}

// checking if rule 2 exists
function findRule2(callback) {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    let rule2Exists = rules.find((rule) => rule.id === 2);

    callback(rule2Exists !== undefined);
  });
}

// getting the cache object in local storage
function getCache(url, callback) {
  chrome.storage.local.get({ cache: {} }, (result) => {
    let cache = result.cache || {};
    let cachedResponse = cache[url];

    callback(cachedResponse === undefined);
  });
}

// getting the cache item in cache object
function getCacheItem(url, callback) {
  chrome.storage.local.get({ cache: {} }, (result) => {
    let cache = result.cache || {};
    let cachedResponse = cache[url];

    callback(cachedResponse);
  });
}

// caching the API response
function cacheResponse(responseData, size, callback) {
  chrome.storage.local.get({ cache: {} }, (result) => {
    let cache = result.cache || {};

    cache[responseData.url] = {
      data: responseData,
      size: size,
    };

    callback(chrome.storage.local.set({ cache: cache }));
  });
}

// getting the sensitivity level for API request
function getDetectionLevel(callback) {
  chrome.storage.local.get(["detectionLevel"], (result) => {
    let detectionLevel = result.detectionLevel;

    callback(detectionLevel);
  });
}

// creating an API request
function buildApiRequest(url, threshold) {
  let apiRequest = {
    url: API_URL,
    method: "POST",
    body: JSON.stringify({
      url: url,
      threshold: threshold,
    }),
    headers: { "Content-Type": "application/json" },
  };

  return apiRequest;
}

// showing warning page if the prediction is phishing
function showWarningPage(prediction, url, tabId) {
  if (prediction === "phishing") {
    let rule1 = {
      id: 1,
      priority: 1,
      action: {
        type: "block",
      },
      condition: {
        urlFilter: url,
        resourceTypes: ["main_frame"],
      },
    };
    addRule(rule1, (added) => {
      if (added) {
        removeRule([1], (removed) => {
          if (removed) {
            chrome.tabs.update(tabId, {
              url: `site-report/phishing/phishing.html?url=${encodeURIComponent(
                url
              )}`,
            });
          }
        });
      }
    });
  }
}

function isSearch(url) {
  return !search_engine_domains.some((search_domain) =>
    url.startsWith(search_domain)
  );
}

// analyzing the URL
async function handleNavigation(details) {
  let url = details.url;
  let tabId = details.tabId;

  if (isSearch(url)) {
    if (details.frameType === "outermost_frame") {
      if (isValidUrl(url)) {
        notInTrustedSites(url, (isInTrustedSites) => {
          if (isInTrustedSites) {
            findRule2((rule2Exists) => {
              if (rule2Exists) {
                removeRule([1, 2], () => {});
              } else {
                getCache(url, (isNotCached) => {
                  if (isNotCached) {
                    getDetectionLevel((detectionLevel) => {
                      let apiRequest = buildApiRequest(url, detectionLevel);
                      // sending the API request
                      fetch(apiRequest.url, {
                        method: apiRequest.method,
                        body: apiRequest.body,
                        headers: apiRequest.headers,
                      })
                        .then(async (apiRespose) => {
                          if (apiRespose.status === 200) {
                            let responseData = await apiRespose.json();
                            let urlSize = JSON.stringify(
                              responseData.url
                            ).length;
                            let predictionSize = JSON.stringify(
                              responseData.prediction
                            ).length;
                            // collect the URL for new dataset
                            let formData = new URLSearchParams({
                              "entry.2127874312": responseData.url,
                              "entry.1463676405": responseData.prediction,
                            });
                            fetch(GOOGLE_FORM_URL, {
                              method: "POST",
                              body: formData,
                              mode: "no-cors",
                            });
                            // caching the response data
                            let dataSize = urlSize + predictionSize;
                            cacheResponse(responseData, dataSize, () => {});
                            showWarningPage(
                              responseData.prediction,
                              responseData.url,
                              tabId
                            );
                          }
                        })
                        .catch((error) => {
                          console.log("Error: " + error);
                        });
                    });
                  } else {
                    getCacheItem(url, (result) => {
                      let prediction = result.data.prediction;
                      showWarningPage(prediction, url, tabId, () => {});
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  } else {
    // collect the URL for new dataset
    let formData = new URLSearchParams({
      "entry.2127874312": url,
      "entry.1463676405": "legitimate",
    });
    fetch(GOOGLE_FORM_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });
  }
}

// listens whenever a network request is about to happen
chrome.webNavigation.onBeforeNavigate.addListener(handleNavigation);
