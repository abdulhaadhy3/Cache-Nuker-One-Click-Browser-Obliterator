# ☢️ Cache Nuker

**Cache Nuker** is a premium, high-performance Chrome extension designed for web developers and power users who need to purge browser data instantly and reliably. Built with a stunning **glassmorphism UI**, it offers one-click "nuking" of caches, cookies, and session data with surgical precision.

![Cache Nuker Screenshot](media/screenshot.png)

## 🚀 Key Features

- **Selective Scoping**: Toggle between **Current Site** (focus data removal only on the active tab) and **Global** (wipe everything).
- **11 Data Targets**: Clears Browser Cache, Cookies, Local Storage, Service Workers, Cache Storage, IndexedDB, WebSQL, File Systems, Form Data, Downloads, and History.
- **Micro-Animations**: Real-time feedback with a custom pulse-based progress system.
- **Developer-Grade UI**: A dark-mode, glassmorphism interface that feels like a professional terminal tool.
- **Manifest V3**: Built on the latest Chrome Extension architecture for maximum security and performance.

## 🛠️ Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the root folder of this project.

## � How to Use

1. Click the **☢️ Cache Nuker** icon in your toolbar.
2. Choose your **Cleaning Scope**:
   - **Global**: Cleans data across all websites.
   - **Current Site**: Targets only the origin of the active tab.
3. Select the categories you want to clear.
4. Hit **NUKE ALL CACHES**.
5. Wait for the "Mission Accomplished" notification.

## 💻 Technical Details

- **Tech Stack**: HTML5, CSS3 (Vanilla), JavaScript.
- **API**: Uses the `chrome.browsingData` API for reliable data removal.
- **Permissions**: `browsingData`, `storage`, `activeTab`.

---

*Stay fast. Stay clean. Nuke the cache.*

