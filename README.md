# WABOT – WhatsApp Bot

A WhatsApp bot built on **Baileys** (`@angstvorfrauen/baileys`), runnable on Windows, Linux, macOS, and Android (Termux).

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
  - [Windows](#windows)
  - [Linux / macOS](#linux--macos)
  - [Android (Termux)](#android-termux)
- [Starting the Bot](#starting-the-bot)
  - [Windows (CMD / PowerShell)](#windows-cmd--powershell)
  - [Linux / macOS](#linux--macos-1)
  - [Termux](#termux)
- [First Login (Pairing Code)](#first-login-pairing-code)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Requirements

- **Node.js** version 18 or newer
- **npm** (bundled with Node.js)
- A WhatsApp account with a phone number to link

---

## Installation

### Windows

1. Download and run the installer from [nodejs.org](https://nodejs.org).
2. Verify the installation in **CMD** or **PowerShell**:
   ```cmd
   node -v
   npm -v
   ```
3. Extract the project and open the folder in CMD/PowerShell:
   ```cmd
   cd WABOT
   ```
4. Install dependencies:
   ```cmd
   npm install
   npm install @hapi/boom figlet gradient-string jimp
   ```
   > The last command adds packages the code actually requires (`index.js`/`cmd.js`) but that are missing from `package.json`. Without them you'll get "Cannot find module" errors.

### Linux / macOS

1. Install Node.js:
   - Debian/Ubuntu:
     ```bash
     sudo apt update
     sudo apt install -y nodejs npm
     ```
   - macOS (Homebrew):
     ```bash
     brew install node
     ```
2. Verify:
   ```bash
   node -v
   npm -v
   ```
3. Extract the project and enter the folder:
   ```bash
   cd WABOT
   ```
4. Install dependencies:
   ```bash
   npm install
   npm install @hapi/boom figlet gradient-string jimp
   ```

### Android (Termux)

1. Install **Termux** from [F-Droid](https://f-droid.org/packages/com.termux/) (not the Play Store version — it's outdated).
2. Update packages and install Node.js and git:
   ```bash
   pkg update && pkg upgrade -y
   pkg install -y nodejs git
   ```
3. Grant storage access (needed to reach files outside Termux's home, e.g. in Downloads):
   ```bash
   termux-setup-storage
   ```
4. Verify:
   ```bash
   node -v
   npm -v
   ```
5. Enter the project folder and install dependencies:
   ```bash
   cd WABOT
   npm install
   npm install @hapi/boom figlet gradient-string jimp
   ```

---

## Starting the Bot

There are three equivalent ways to run the bot: `npm start`, `node index.js` directly, or `node start.js` (auto-restart on crash). Each platform below shows all three.

### Windows (CMD / PowerShell)

```cmd
:: Option 1: via npm
npm start

:: Option 2: direct
node index.js

:: Option 3: with auto-restart on crash (recommended)
node start.js
```
`start.sh` is a bash script and does **not** run natively in CMD/PowerShell — use `node start.js` directly on Windows instead.

### Linux / macOS

```bash
# Option 1: via npm
npm start

# Option 2: direct
node index.js

# Option 3: with auto-restart on crash (recommended)
node start.js
# or, equivalently:
bash start.sh
```

### Termux

```bash
# Option 1: via npm
npm start

# Option 2: direct
node index.js

# Option 3: with auto-restart on crash (recommended)
node start.js
# or, equivalently:
bash start.sh
```
For long-running sessions in Termux, prevent Android from killing the process when the screen locks:
```bash
termux-wake-lock
```

`start.js` spawns `index.js` as a child process and automatically restarts it whenever it exits or crashes — useful for keeping the bot alive continuously on any platform.

---

## First Login (Pairing Code)

On first start (when no session exists yet under `./session`), the bot asks for a phone number in the terminal:

```
Number: 
```

- Enter the number **with country code, no `+` or spaces** (e.g. `4915123456789`).
- The bot then generates a **pairing code**.
- On your phone, in WhatsApp: **Settings → Linked Devices → Link a Device → Link with phone number instead**, then enter the code shown.

After a successful link, the session is saved in the `session/` folder, so you won't need to re-authenticate on future starts.

---

## Project Structure

```
WABOT/
├── index.js      # Main file: WhatsApp connection, event handling
├── cmd.js        # Command logic / message handling
├── start.js      # Runs index.js with automatic restart on crash
├── start.sh      # Shell wrapper for start.js (Linux/macOS/Termux)
└── package.json  # Project metadata and dependencies
```

---

## Troubleshooting

**"Cannot find module '...'"**
→ Install the missing package, e.g.:
```bash
npm install <package-name>
```
(commonly affects `@hapi/boom`, `figlet`, `gradient-string`, `jimp` — see the note above)

**Bot doesn't reconnect after a connection drop**
→ Start it with `node start.js` (or `bash start.sh` on Linux/Termux) instead of `node index.js` directly, so the auto-restart logic applies.

**Termux: process gets killed when the screen turns off**
→ Run before starting:
```bash
termux-wake-lock
```

**Re-link / reset session**
→ Delete the `session/` folder and restart:
```bash
rm -rf session
node index.js
```
On Windows CMD, use `rmdir /s /q session` instead of `rm -rf session`.
