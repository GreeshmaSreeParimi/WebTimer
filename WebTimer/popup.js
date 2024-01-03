// popup.js

document.addEventListener('DOMContentLoaded', function () {
    
    var addSiteButton = document.getElementById('add-site');
    console.log(addSiteButton);
    addSiteButton.addEventListener('click', addSite);
});

/**
 * Method to display the popup UI
 */

const displaySiteUrls = () =>{
  chrome.storage.local.get("urlSet", function(result) {

      const ulEle = document.createElement('ul');
      var existingUrlSet = result.urlSet || [];

      existingUrlSet.forEach((siteObject, index) => {
        const url = siteObject.url
        const liEle = document.createElement('li');
        // liEle.textContent = `${url}`;

        // Create a paragraph for the URL
        const pEle = document.createElement('p');
        pEle.textContent = url;
        liEle.appendChild(pEle);

        // Create a delete button for each li item
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.id="index_"+index;
        
        deleteButton.addEventListener('click', function(event) {
          deleteItem(index, event);
        });

        liEle.appendChild(deleteButton);


        // Create a toggle switch (checkbox)
        const status = siteObject.status;
        const toggleSwitch = document.createElement('input');
        toggleSwitch.type = 'checkbox';
        toggleSwitch.id = 'toggleSwitch_' + index;
        toggleSwitch.checked = status === 'active';

        // Create a label for the toggle switch
        const label = document.createElement('label');
        label.textContent = toggleSwitch.checked ? 'On' : 'Off';
        label.htmlFor = toggleSwitch.id;

        // Add an event listener to the toggle switch
        toggleSwitch.addEventListener('change', function() {
          const newStatus = toggleSwitch.checked ? 'active' : 'inactive';
          label.textContent = toggleSwitch.checked ? 'On' : 'Off';
          updateStatus(index, newStatus);
        });

        // Append the radio button and label to the list item
        liEle.appendChild(label);
        liEle.appendChild(toggleSwitch);




        // Time options (in minutes)
        const time= siteObject.time;

         // Create a dropdown for selecting time
        const timeDropdown = document.createElement('select');
        timeDropdown.id = 'timeDropdown_' + index;
        const timeOptions = [1,30, 60, 120, 180, 240];
        
        timeOptions.forEach(option => {
          const optionEle = document.createElement('option');
          optionEle.value = option;
          optionEle.text = option + ' min';
          optionEle.selected = time === option; // Select the current time value
          timeDropdown.appendChild(optionEle);
        });

        // Add an event listener to the dropdown
        timeDropdown.addEventListener('change', function() {
          const newTime = parseInt(timeDropdown.value, 10);
          updateTime(index, newTime);
        });

        // Append the dropdown to the list item
        liEle.appendChild(timeDropdown);

        ulEle.appendChild(liEle);
      });

      const parentEle = document.getElementById('sites-list');
      parentEle.textContent = '';
      parentEle.append(ulEle);
  });
}
/**
 * delete the site from saved sites
 * @param {*} index 
 * @param {*} event 
 * @returns 
 */
const deleteItem =async (index, event)=>{
  const result = await new Promise((resolve) => {
    chrome.storage.local.get("urlSet", (result) => {
      resolve(result);
    });
  });

  if (result.urlSet == null || result.urlSet  == undefined) {
    return;
  }

  const existingUrlSet = result.urlSet;
  existingUrlSet.splice(index, 1);

  await new Promise((resolve) => {
    chrome.storage.local.set({ "urlSet": existingUrlSet }, () => {
      resolve();
    });
  });
  displaySiteUrls();
}

/**
 * Update the active status of the site.
 * On: time management activates
 * Off: time management is not active
 */
 updateStatus = async(index, newStatus)=> {

    const result = await new Promise((resolve) => {
      chrome.storage.local.get("urlSet", (result) => {
        resolve(result);
      });
    });

    if (result.urlSet == null || result.urlSet  == undefined) {
      return;
    }
  
    // Update the status in the existingUrlSet
    const existingUrlSet = result.urlSet;
    existingUrlSet[index].status = newStatus;

    // Save the updated URL set to chrome.storage.local
    await new Promise((resolve) => {
      chrome.storage.local.set({ "urlSet": existingUrlSet }, function() {
        console.log("Status updated:", existingUrlSet[index]);
        resolve();
      });
    });
    displaySiteUrls();

}

/**
 * Method to set the time for each site.
 */
updateTime = async(index, newTime) => {
  const result = await new Promise((resolve) => {
    chrome.storage.local.get("urlSet", (result) => {
      resolve(result);
    });
  });

  if (result.urlSet == null || result.urlSet  == undefined) {
    return;
  }

  var existingUrlSet = result.urlSet || [];
  // Update the time in the existingUrlSet
  existingUrlSet[index].time = newTime;

  // Save the updated URL set to chrome.storage.local
  await new Promise((resolve) => {
    chrome.storage.local.set({ "urlSet": existingUrlSet }, function() {
      console.log("time updated:", existingUrlSet[index]);
      resolve();
    });
  });
  displaySiteUrls();
} 

displaySiteUrls();

/**
 * Method to add sites by the user.
 * @param {} event 
 * @returns 
 */
const addSite = async(event) => {
  var inputEle = document.getElementById('enter-url');
  var url = inputEle.value;
  inputEle.value = "";
  if(url == null || url == "")return;
  
  url = extractDomain(url);

  var siteObject = {
    url: url,
    time: 60, // min
    status: "active" // You can set an initial status if needed
  };

  const result = await new Promise((resolve) => {
      chrome.storage.local.get("urlSet", function(result) {
          var existingUrlSet = result.urlSet || [];
    
          // Check if the URL is not already in the set
          if (!existingUrlSet.some(site => site.url === url)) {
            existingUrlSet.push(siteObject);

            // Save the updated URL set to chrome.storage.local
            chrome.storage.local.set({ "urlSet": existingUrlSet }, function() {
              
              console.log("Site added to the set:", siteObject);
              displaySiteUrls();
              resolve();
            });

          
          } else {
            console.log("Site is already in the set:", siteObject);
            // displaySiteUrls();
            resolve();
          }
    });
    
  });
  
  
 // window.close();
}

/**
 * Extract domain from url.
 * @param {*} url 
 * @returns 
 */
function extractDomain(url) {
  // Use the URL object to extract the domain
  const urlObj = new URL(url);
  return urlObj.hostname;
}