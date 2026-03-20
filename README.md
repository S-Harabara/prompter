# 🚀 SourceFlow

[![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00?logo=svelte)](https://svelte.dev/)
[![Electron](https://img.shields.io/badge/Electron-33-47848f?logo=electron)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwind-css)](https://tailwindcss.com/)

SourceFlow is a premium Electron-based prompt engineering studio designed for developers. It streamlines the creation, management, and optimization of LLM prompts with a focus on project-aware context and modular skills.

---

## ✨ Key Features

- **🛠️ Prompt Builder**: A sophisticated interface to craft prompts by selecting specific files and folders from your project.
- **🔍 Code Review Pro**: Specialized tool for generating high-quality code review prompts by comparing git branches.
- **🧠 Skill Library**: Import, create, and reuse "Skills"—modular pieces of prompt logic that can be shared across projects.
- **📜 Smart History**: Automatically records all generated prompts in a local SQLite database for easy retrieval and tracking.
- **📟 Token Estimation**: Real-time token counting.
- **📂 Intelligent Scanner**: Automatically respects `.gitignore` rules and excludes heavy directories like `node_modules` and `.git`.
- **💻 Modern Editor**: Integrated CodeMirror 6 with syntax highlighting and virtual scrolling for handling large prompts efficiently.

## 🛠️ Built With

- **Frontend**: [Svelte 5](https://svelte.dev/) (Runes), [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime**: [Electron](https://www.electronjs.org/) & [Node.js](https://nodejs.org/)
- **Database**: [SQLite](https://sqlite.org/) (via `better-sqlite3`)
- **Editor**: [CodeMirror 6](https://codemirror.net/)
- **UI Toolkit**: [Animate.css](https://animate.style/), [Tippy.js](https://atomiks.github.io/tippyjs/)

## 📂 Project Structure

| Directory / File | Description |
| :--- | :--- |
| `main.js` | Electron main process, handles IPC and system interactions. |
| `db.js` | Database schema definition and local persistence logic. |
| `src/` | Frontend source code. |
| `src/App.svelte` | Root Svelte component and layout manager. |
| `src/views/` | Main application views (Builder, Review, History, Skills). |
| `src/components/` | Reusable UI design system and shared components. |
| `src/lib/` | Application state management using Svelte stores. |
| `src/utils/` | Internal utilities for tokenization, scanning, and formatting. |
| `public/` | Static assets and icons. |

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/S-Harabara/prompter.git
   cd prompter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the Vite dev server and Electron app simultaneously:
```bash
npm run dev
```

### Production Build

To package the application for your current platform:
```bash
npm run package
```
*Executables will be generated in the `release/` directory.*

## 📐 Project Best Practices

- **Svelte 5 Runes**: The project uses `$state`, `$derived`, and `$props` for modern reactivity and performance.
- **IPC Security**: All heavy lifting (file system, database, git commands) is handled in the main process and exposed via secure IPC handlers.
- **Modular Stores**: Each major feature (History, Skills, Prompts) has its own dedicated store for focused state management.
- **SQLite Persistence**: All local state that needs to survive restarts is stored in structured relational tables.

---
*Built with ❤️ for the developer community.*
