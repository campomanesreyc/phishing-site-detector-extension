# Phishingscape

Phishingscape is a Chrome extension that helps protect users from phishing websites. However, **please note that the API used for phishing detection is no longer hosted online**. To use this extension, you will need to run the API locally on your machine. Instructions for setting up the API can be found in the separate repository. _(You can find the related links below)_

## Table of Contents

- [Phishingscape](#phishingscape)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [How it Works](#how-it-works)
- [Phishingscape](#phishingscape)
- [Installation](#installation)
- [User Manual](#user-manual)
- [Links](#links)

## Features

- **Real-time Phishing Detection**: It actively scans the websites that the users visit and alerts them instantly if a phishing site is detected.
- **Report Incorrect Labels**: If a website is incorrectly labeled, users can report it to improve the detection model.
- **Trusted Sites**: Users can designate a site as "Trusted," ensuring that they can navigate these sites without unnecessary alerts. This is designed specifically for instances where a site is incorrectly classified as a phishing site and if the user thinks that the site is safe.
- **Adjustable Sensitivity**: Users can set the sensitivity of phishing detection to suit their browsing needs. It is divided into three levels: High, Balanced, and Low.
- **Cache Management**: Users can clear the cache and select the frequency of cache cleaning to optimize performance. The intervals are: Everyday, Every 3 days, and Every 7 days.

## Technologies Used

This project utilizes the following tools and technologies:

- **Manifest V3**: The latest version of the Chrome extension manifest, providing enhanced security and performance features.
- **JavaScript**
- **HTML**
- **CSS**
- **Bootstrap**
- **Toastr**: JavaScript library for creating toast notifications, providing feedback to users.

## How it Works

1. Phishingscape sends the URL of the site that the users clicked/entered on the browser to a custom phishing-site detection API.
2. The API returns whether the site is a phishing attempt or not.
3. If the website is labeled as a phishing site, the extension will stop the HTTP request from proceeding, preventing the browser from loading the page.
4. Users will receive a warning when a site is flagged as suspicious or malicious. They can choose to proceed or go back.
5. Users can adjust the detection sensitivity for more or less strict detection.
6. Cache settings allow users to manage the storage and frequency of clearing cache data for performance optimization.

## Installation

> **Note: Before proceeding with the installation please make sure that you've already setup the phishing detection API on your device. You can find the setup instruction [here](https://github.com/campomanesreyc/phishing-site-detector-api)**.

Phishingscape is currently supported on the following browsers:

- Google Chrome
- Microsoft Edge
- Brave
- Opera
- Vivaldi

### Steps:

1. Clone this repository or download the ZIP file and extract it.
2. Open your preferred browser and navigate to the **Extensions** menu.
3. Enable the **Developer Mode**.
4. Click **Load Unpacked**.
5. Locate and choose the `phishing-site-detector-extension` folder
6. _(Optional)_ Pin the extension for easier access.

## User Manual

For detailed instructions on how to use Phishingscape, please refer to the [User Manual](./user-manual.pdf) available in this repository.

## Links

- [API Repository](https://github.com/campomanesreyc/phishing-site-detector-api)
- [Website](https://phishingscape.netlify.app/)
- [Phishingscape on the Chrome Web Store](https://chromewebstore.google.com/detail/phishingscape/ffjkffecdcomjjmdablhcknhgiajiako)
