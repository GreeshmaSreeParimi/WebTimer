let activeTabId; // Keep track of the currently active tab information

chrome.tabs.onActivated.addListener(function (activeInfo) {
  // Update the active tab information when a tab is activated
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    activeTabId = tab.id;
    // Check and set the timer for the newly active tab
    checkAndSetTimer(tab.id, tab.url);
  });
});



chrome.tabs.onCreated.addListener(function (tab) {
    checkAndSetTimer(tab.id, tab.url);
  });

  

/**
 * set time for current tab if its in user added sites.
 * @param {*} tabId 
 * @param {*} url 
 */

function checkAndSetTimer(tabId, url) {
    // Retrieve the URL set from chrome.storage.local

    chrome.storage.local.get("urlSet", function(result) {
      var storedUrlSet = result.urlSet || [];
      
      const tabDomain = extractDomain(url);

      console.log("domain name " + tabDomain);

      

      for (let siteObject of storedUrlSet) {
        var urlDomain = siteObject.url

         // min to ms
        var urlDomain = extractDomain(url);

        console.log("active tab url", url);

        if ((urlDomain === tabDomain ) && siteObject.status === 'active') {
            const time = siteObject.time * 60  * 1000;

            console.log("time"+  time);
            console.log("timer started");

          // Set a timer to send a notification after 1 minute
          setTimeout(function() {
            console.log("timer ended");
           
            if(tabId === activeTabId){
              addScriptToTab(tabId, siteObject.time);
            }
            
          }, time);

          break; // Stop checking once a match is found
        }
      }
    });
  }

/**
 * Extracts url domain from url
 */
const extractDomain = (url) => {
    // Use the URL object to extract the domain
    const urlObj = new URL(url);
    return urlObj.hostname;
  }

/**
 * addScriptToTab: Injects script to a chrome tab
 * @param {} tabId 
 * @param {*} time 
 */
function addScriptToTab(tabId, time) {
    chrome.scripting
    .executeScript({
      target : {tabId : tabId},
      func : blurThePage,
      args: [time],
    })
    .then(() => console.log("injected script file"));
}

/**
 * Blurs the current page and shows a warning.
 * @param {*} time 
 */
function blurThePage(time) {

    document.body.style.filter = "blur(10px)";
    setTimeout(()=>{
        var removeBlur = confirm(`You have been on this page ${time} min. Take Rest !!!!`);

        if(removeBlur){
        document.body.style.filter = "blur(0px)";
        }
    },1000);
}