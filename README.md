# ETLab Auto Filler

ETLab Auto Filler is a lightweight Microsoft Edge extension designed to automate repetitive ETLab staff appraisal form filling. The extension automatically detects appraisal questions and selects answers instantly, reducing manual effort and saving time.

## Features

* Auto fill top/preferred answers
* Random answer filling mode
* Lightweight and fast
* Modern popup UI
* Real-time form interaction
* Edge Chromium compatibility

## Available on Microsoft Edge Add-ons Store

ETLab Auto Filler is also available through the Microsoft Edge Extensions Store for quick and easy installation.

## Tech Stack

* JavaScript
* HTML
* CSS
* Browser Extension API
* DOM Manipulation

## How It Works

The extension injects a content script into the ETLab webpage, scans all radio button groups, and automatically selects predefined answers. It also triggers ETLab’s internal AJAX save system to simulate normal user interaction.

## Installation

### From GitHub

```bash
git clone https://github.com/samuelmdileep/etlab_filler.git
```

### Manual Installation

1. Open Edge and go to:

```text
edge://extensions
```

2. Enable **Developer Mode**

3. Click **Load unpacked**

4. Select the project folder

5. Open ETLab appraisal page

## Folder Structure

```text
ETLab-Auto/
│
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── icon16.png
├── icon48.png
├── icon128.png
└── privacy.html
```

## Future Improvements

* One-click auto submit
* Human-like delay simulation
* Subject-wise presets
* Custom answer profiles
* Analytics dashboard

## Author

Samuel M Dileep

* Portfolio: https://samuelmdileep.vercel.app/
* LinkedIn: https://www.linkedin.com/in/samuel-m-dileep-b84960314

## License

This project is intended for educational and productivity purposes only.
