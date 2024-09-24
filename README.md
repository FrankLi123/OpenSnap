# sAveIt - Paywall Bypasser & Archiver Chrome Extension

This Chrome extension allows you to bypass paywalls and archive web pages.

## Features

- Bypass paywalls on current page
- Archive current page content and screenshot

## Installation Guide

1. Open Chrome browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select the folder containing these extension files

## Usage Guide

1. After installing the extension, click on the extension icon in the Chrome toolbar
2. In the popup window, you'll see two options:
   - Click "Bypass Paywall" to attempt bypassing a paywall on the current page
   - Click "Archive Page" to save the current page's content and screenshot

### Bypassing a Paywall

1. Navigate to a website with a paywall
2. Click the sAveIt extension icon
3. Select "Bypass Paywall"
4. The page will reload, attempting to bypass the paywall

### Archiving a Page

1. Navigate to the page you want to archive
2. Click the sAveIt extension icon
3. Select "Archive Page"
4. Wait for the confirmation message that the page has been archived

## File Structure

- `manifest.json`: Extension configuration file
- `popup.html`: Extension popup window HTML
- `popup.js`: JavaScript file handling popup logic
- `background.js`: Extension background script
- `README.md`: This readme file