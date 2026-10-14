# Chef's Menu Manager (Part 2)

A React Native (Expo) app that lets a chef add menu items and view them in a live-updating list.

## Features
- Clear app title and clean, consistent layout
- Capture **Dish Name**, **Description**, **Course** (Starter / Main / Dessert) and **Price**
- Validation for all required fields with inline error messages (price must be a positive number)
- Success confirmation (banner + alert) when an item is added
- Add multiple items; the list updates automatically (newest first)
- Friendly empty-state message when no items exist

## Run it
```bash
npm install
npx expo start
```
Scan the QR code with **Expo Go** (Android/iOS), or press `a` for an Android emulator / `w` for web.

## Structure
- `App.js` – all UI, state (`useState`), validation and list rendering
- `app.json`, `package.json`, `babel.config.js` – Expo config

## Not included yet (Final PoE)
Editing, deleting, searching, filtering and menu statistics.
