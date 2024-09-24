# sAveIt - Paywall Bypasser & Archiver Chrome Extension

This Chrome extension allows you to bypass paywalls and archive web pages.

## Features

- Bypass paywalls on current page
- Archive current page content
- User authentication system
- View archived pages

## Installation Guide

### Chrome Extension
1. Open Chrome browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select the folder containing these extension files

## Usage Guide

1. After installing the extension, click on the extension icon in the Chrome toolbar
2. Log in or register a new account
3. Once logged in, you'll see three options:
   - Click "Bypass Paywall" to attempt bypassing a paywall on the current page
   - Click "Archive Page" to save the current page's content
   - Click "View My Archives" to see your archived pages

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

### Viewing Archived Pages

1. Click the sAveIt extension icon
2. Select "View My Archives"
3. A new tab will open showing your archived pages
4. Click on any archived page to view its content

## File Structure

### Chrome Extension
- `manifest.json`: Extension configuration file
- `popup.html`: Extension popup window HTML
- `popup.js`: JavaScript file handling popup logic
- `background.js`: Extension background script

### Backend Service
- `server.py`: Python Flask server file

## Note

This is a basic implementation and should be enhanced with proper security measures, error handling, and data persistence for production use. The current implementation uses SQLite, which is suitable for development but may not be ideal for production environments with high concurrency.