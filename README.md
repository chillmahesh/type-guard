# TypeGuard — Typing-Only Online Notepad

**Type it yourself. Keep your writing intentional.**

TypeGuard is a simple, modern, browser-based online notepad designed to encourage manual typing by blocking common copy-and-paste actions inside the editor. It provides a distraction-free writing experience with live word and character counts, automatic local saving, and downloadable notes.

## ✨ Features

- ⌨️ **Typing-Only Editor** — Write notes manually using your keyboard.
- 🚫 **Paste Protection** — Blocks common paste actions using keyboard shortcuts and paste-event handling.
- 🖱️ **Drag-and-Drop Protection** — Prevents external text from being dragged into the editor.
- 💾 **Automatic Saving** — Saves notes locally in the browser using `localStorage`.
- 🔄 **Note Restoration** — Restores the last saved note when you reopen the website in the same browser.
- 🔢 **Live Word Count** — Tracks the number of words as you type.
- 📝 **Character Counter** — Displays the current character count.
- 📄 **Download Notes** — Export your notes as a `.txt` file.
- 🧹 **Clear and New Note** — Start fresh with confirmation to help prevent accidental data loss.
- 📱 **Responsive Design** — Works across desktop, tablet, and mobile screens.
- 🎯 **Minimal Interface** — A clean writing environment without unnecessary distractions.

## 🎯 Why TypeGuard?

Copying and pasting can make it difficult to distinguish manually written content from imported text. TypeGuard aims to encourage original writing by restricting common paste mechanisms within the editor.

Whether you are practising writing, taking notes, or working on typing exercises, TypeGuard offers a focused environment for entering text manually.

## 🛠️ Tech Stack

The project is designed to use lightweight web technologies:

- **HTML5** — Page structure and text editor
- **CSS3** — Styling and responsive layouts
- **JavaScript** — Editor interactions, paste restrictions, counters, and local saving
- **Browser Local Storage** — Local note persistence

## 🚀 Getting Started

### Prerequisites

You need a modern web browser and, optionally, a code editor such as Visual Studio Code.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/chillmahesh/type-guard.git
   ```

2. Navigate to the project directory:

   ```bash
   cd type-guard
   ```

3. Open `index.html` in your browser.

   Alternatively, use the Live Server extension in Visual Studio Code for local development.

## 📖 How to Use

1. Open TypeGuard in your browser.
2. Click inside the editor.
3. Type your content manually.
4. Track your word and character counts in real time.
5. Your latest note is saved locally by the browser.
6. Download your note as a text file when you finish.
7. Use **New Note** or **Clear** when you want to start again.

## 🔐 How Paste Protection Works

TypeGuard uses browser-side restrictions to discourage inserting externally copied text.

Typical protection mechanisms include:

- Listening for and preventing paste events.
- Intercepting common paste keyboard shortcuts, including `Ctrl + V` and `Cmd + V`.
- Preventing external text drag-and-drop insertion.
- Displaying a message when a paste attempt is blocked.

### Important Security Notice

TypeGuard is **not a tamper-proof security or examination system**. Browser-side restrictions cannot guarantee that all external text insertion methods are blocked. Alternative input methods, browser behavior, developer tools, or modifications to the application may bypass these restrictions.

Use TypeGuard as a writing aid and deterrent, not as proof that content was typed manually.

## 💾 Data and Privacy

- Notes are stored locally in the browser when local auto-saving is enabled.
- No backend or account is required for basic functionality.
- Notes may be lost if browser storage is cleared or the user changes browsers or devices.
- Downloaded notes are saved to the user's chosen download location.
- Avoid storing passwords or other sensitive information in the notepad.

The actual data practices depend on the deployed implementation and any additional services it uses.

## 🗺️ Future Improvements

Potential enhancements include:

- Multiple named notes.
- Light and dark themes.
- Typing speed and words-per-minute tracking.
- Session timers and writing goals.
- Improved keyboard accessibility.
- Optional cloud synchronization.
- Configurable writing sessions.

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the functionality.
5. Submit a Pull Request describing your improvements.

## 📄 License

Choose a license that matches your intended use and add the corresponding `LICENSE` file to the repository. Until then, no open-source license should be assumed.

---

**TypeGuard — A focused space for writing, one keystroke at a time.**
