[README.md](https://github.com/user-attachments/files/24372038/README.md)
# ExtensionArchitect AI

![App Screenshot](./screenshot.png)

> **A professional AI-powered coding suite specialized in generating production-ready browser extensions for Chrome, Firefox, and Safari with real-time debugging chat and file tree visualization.**

## Overview

**ExtensionArchitect AI** is a development environment designed to streamline the creation of browser extensions using cutting-edge AI models. With a beautiful, modern UI and collaborative chat debugger, it generates source code, helps with debugging, and visualizes your project structure—all from a single workspace.

## Features

- **AI-powered Architecture**: Instantly generate production-ready Chrome, Firefox, and Safari extensions using AI.
- **Manifest V3 Standard**: Ensures all extensions are secure and up-to-date with the latest browser standards.
- **Live File Tree**: Visualize and interact with your extension's complete source project.
- **Chat-based Debugging**: Discuss, debug, or refactor your code with a real-time AI assistant.
- **Multi-platform Support**: Switch between Chrome, Firefox, and Safari and generate platform-adapted builds.
- **Download as ZIP**: Export your generated extension with a single click—ready to load or publish.

## UI Highlights

- **Project Sidebar:**
  - Credentials setup and status
  - Platform/browser selection
  - AI model selection
  - Prompt field for extension specifications
  - File tree explorer
- **Main Editor:**
  - Real-time code viewing and editing
  - Download build option
- **AI Debugger Chat:**
  - Contextual assistant for troubleshooting, explaining, and generating code fixes

## Getting Started

### Prerequisites
- Node.js (>=18.x)
- Yarn or npm

### Installation
```bash
# Clone the repo
$ git clone https://github.com/sirmirzaei/Extension-Architect-AI.git
$ cd Extension-Architect-AI

# Install dependencies
$ npm install

# Start development (Vite JS)
$ npm run dev
```

Then visit `http://localhost:3000` in your browser.

### Production Build
```bash
$ npm run build
# Preview the build
$ npm run preview
```

## Loading an Extension
Once you generate and download a browser extension ZIP:
1. Unzip the folder.
2. In your browser, open the extension manager (e.g., `chrome://extensions` for Chrome).
3. Enable **Developer Mode**.
4. Select "Load unpacked" and choose the extracted extension folder.

## Project Structure
```
extensionarchitect-ai/
├─ components/
│   ├─ Chat.tsx         # AI debugger chat interface
│   └─ FileTree.tsx     # Visual file explorer
├─ services/
│   └─ geminiService.ts # AI interaction logic
├─ index.tsx            # Entry point
├─ App.tsx              # Main UI container
├─ types.ts             # TypeScript types & enums
├─ vite.config.ts       # Vite configuration
├─ index.html           # Main HTML template
├─ package.json         # Dependencies & scripts
└─ ...
```

## Technologies Used
- **React 19** + TypeScript
- **Vite** (Build system)
- **TailwindCSS** (Styling)
- **@google/genai** (Gemini AI integration)
- **lucide-react** (Iconography)
- **JSZip** (For packaging downloads)

## Contributing
Contributions, issues and feature requests are welcome! Open a PR or an issue to get started.

## License
MIT

## Acknowledgements
- Powered by [Google Gemini](https://ai.google.dev/) and modern open-source tools.
- UI inspired by contemporary developer environments and AI copilots.

---

> **Screenshots**
> ![Main App UI](./screenshot.png)

---

*For more, see the source or open the project.*

