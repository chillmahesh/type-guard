/**
 * TypeGuard — Secure Typing-Only Notepad
 * Clean, lightweight, modular JavaScript logic.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------------------
  const editor = document.getElementById('notepad-editor');
  const noteTitleInput = document.getElementById('note-title');
  const btnNew = document.getElementById('btn-new');
  const btnClear = document.getElementById('btn-clear');
  const btnDownload = document.getElementById('btn-download');
  const btnTheme = document.getElementById('btn-theme');
  const btnInfo = document.getElementById('btn-info');
  const btnCopyAll = document.getElementById('btn-copy-all');

  // Stats Elements
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');
  const readingTimeEl = document.getElementById('reading-time');

  // Save Status Elements
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  // Toast Element
  const pasteToast = document.getElementById('paste-toast');
  const toastClose = document.getElementById('toast-close');

  // Confirmation Modal Elements
  const confirmModal = document.getElementById('confirm-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');

  // Info Modal Elements
  const infoModal = document.getElementById('info-modal');
  const infoModalCloseBtn = document.getElementById('info-modal-close-btn');

  // -------------------------------------------------------------------------
  // State & Constants
  // -------------------------------------------------------------------------
  const STORAGE_KEY_CONTENT = 'typeguard_note_content';
  const STORAGE_KEY_TITLE = 'typeguard_note_title';
  const STORAGE_KEY_THEME = 'typeguard_theme';

  let saveTimeout = null;
  let toastTimeout = null;
  let pendingModalAction = null;

  // -------------------------------------------------------------------------
  // 1. Core Paste & Injection Prevention (Typing-Only Enforcement)
  // -------------------------------------------------------------------------

  /**
   * Show non-intrusive paste warning toast
   * @param {string} customMsg - Optional message override
   */
  function showPasteToast(customMsg) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    if (customMsg) {
      const msgEl = pasteToast.querySelector('.toast-message');
      if (msgEl) {
        msgEl.innerHTML = customMsg;
      }
    } else {
      const msgEl = pasteToast.querySelector('.toast-message');
      if (msgEl) {
        msgEl.innerHTML = '<strong>Pasting is disabled.</strong> Please type your text manually.';
      }
    }

    pasteToast.classList.add('show');

    // Auto-dismiss after 3.5 seconds
    toastTimeout = setTimeout(() => {
      pasteToast.classList.remove('show');
    }, 3500);
  }

  function hidePasteToast() {
    pasteToast.classList.remove('show');
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
  }

  // Intercept standard Paste event on the editor
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showPasteToast();
  });

  // Intercept standard Drag & Drop text insertion
  editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
  });

  editor.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showPasteToast('<strong>Drop is disabled.</strong> Dragging text into the editor is not allowed.');
  });

  // Intercept modern beforeinput event for clipboard / drop input types
  // Catches mobile keyboards (Gboard, iOS clipboard, etc.)
  editor.addEventListener('beforeinput', (e) => {
    const inputType = e.inputType || '';
    if (
      inputType === 'insertFromPaste' ||
      inputType === 'insertFromPasteAsQuotation' ||
      inputType === 'insertFromDrop' ||
      inputType === 'insertFromYank'
    ) {
      e.preventDefault();
      e.stopPropagation();
      showPasteToast();
    }
  });

  // Intercept keyboard shortcuts for paste & cut
  editor.addEventListener('keydown', (e) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const key = e.key ? e.key.toLowerCase() : '';

    // Block Ctrl+V / Cmd+V and Ctrl+Shift+V
    if (isCtrlOrCmd && key === 'v') {
      e.preventDefault();
      e.stopPropagation();
      showPasteToast();
      return;
    }

    // Block Shift+Insert (Standard Windows clipboard paste shortcut)
    if (e.shiftKey && (e.key === 'Insert' || e.code === 'Insert')) {
      e.preventDefault();
      e.stopPropagation();
      showPasteToast();
      return;
    }

    // Intercept Cut (Ctrl+X / Cmd+X) to protect against accidental text loss
    // since user won't be able to paste it back!
    if (isCtrlOrCmd && key === 'x') {
      const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
      if (selectedText.length > 0) {
        // Copy to clipboard first so text isn't lost
        try {
          navigator.clipboard.writeText(selectedText);
        } catch (_) {}
        // Don't cut, warn user
        e.preventDefault();
        showPasteToast('<strong>Cut is prevented.</strong> Text copied to clipboard instead, as pasting is disabled.');
      }
    }
  });

  // Close toast button listener
  toastClose.addEventListener('click', hidePasteToast);

  // -------------------------------------------------------------------------
  // 2. Editor Stats Calculation (Words, Characters, Reading Time)
  // -------------------------------------------------------------------------
  function updateStats() {
    const text = editor.value;
    const trimmed = text.trim();

    // Characters
    const charCount = text.length;
    charCountEl.textContent = charCount.toLocaleString();

    // Words
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    wordCountEl.textContent = words.toLocaleString();

    // Estimated Reading Time (based on 200 words per minute average)
    if (words === 0) {
      readingTimeEl.textContent = '0';
    } else {
      const minutes = Math.ceil(words / 200);
      readingTimeEl.textContent = minutes < 1 ? '< 1' : minutes.toString();
    }
  }

  // -------------------------------------------------------------------------
  // 3. Auto-save & LocalStorage Persistence
  // -------------------------------------------------------------------------
  function setStatus(state, message) {
    statusDot.className = 'status-dot';
    if (state === 'saved') {
      statusDot.classList.add('status-saved');
      statusText.textContent = message || 'All changes saved';
    } else if (state === 'typing') {
      statusDot.classList.add('status-typing');
      statusText.textContent = message || 'Typing...';
    } else if (state === 'saving') {
      statusDot.classList.add('status-saving');
      statusText.textContent = message || 'Saving...';
    }
  }

  function saveNote() {
    setStatus('saving', 'Saving changes...');
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT, editor.value);
      localStorage.setItem(STORAGE_KEY_TITLE, noteTitleInput.value);
      setTimeout(() => {
        setStatus('saved', 'All changes saved');
      }, 250);
    } catch (err) {
      console.warn('LocalStorage error:', err);
      setStatus('saved', 'Unable to save to storage');
    }
  }

  function handleEditorInput() {
    setStatus('typing', 'Typing...');
    updateStats();

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce save by 450ms
    saveTimeout = setTimeout(saveNote, 450);
  }

  function handleTitleInput() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(saveNote, 300);
  }

  editor.addEventListener('input', handleEditorInput);
  noteTitleInput.addEventListener('input', handleTitleInput);

  function loadSavedNote() {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY_CONTENT);
      const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);

      if (savedContent !== null) {
        editor.value = savedContent;
      }
      if (savedTitle !== null && savedTitle.trim() !== '') {
        noteTitleInput.value = savedTitle;
      }

      updateStats();
      if (savedContent) {
        setStatus('saved', 'Restored from local storage');
      } else {
        setStatus('saved', 'All changes saved');
      }
    } catch (err) {
      console.warn('Error loading from localStorage:', err);
      setStatus('saved', 'All changes saved');
    }
  }

  // -------------------------------------------------------------------------
  // 4. Modals (New Note & Clear Confirmations, Info Dialog)
  // -------------------------------------------------------------------------
  function openConfirmModal(title, message, confirmBtnLabel, onConfirm) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalConfirmBtn.textContent = confirmBtnLabel;
    pendingModalAction = onConfirm;
    confirmModal.hidden = false;
    modalConfirmBtn.focus();
  }

  function closeConfirmModal() {
    confirmModal.hidden = true;
    pendingModalAction = null;
  }

  modalCancelBtn.addEventListener('click', closeConfirmModal);

  modalConfirmBtn.addEventListener('click', () => {
    if (typeof pendingModalAction === 'function') {
      pendingModalAction();
    }
    closeConfirmModal();
  });

  // Close modals on clicking background backdrop
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
  });

  // Info Modal Handling
  function openInfoModal() {
    infoModal.hidden = false;
    infoModalCloseBtn.focus();
  }

  function closeInfoModal() {
    infoModal.hidden = true;
    editor.focus();
  }

  btnInfo.addEventListener('click', openInfoModal);
  infoModalCloseBtn.addEventListener('click', closeInfoModal);

  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      closeInfoModal();
    }
  });

  // Global ESC key listener to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!confirmModal.hidden) closeConfirmModal();
      if (!infoModal.hidden) closeInfoModal();
      hidePasteToast();
    }
    // Ctrl+S / Cmd+S shortcut for download
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      downloadNote();
    }
  });

  // -------------------------------------------------------------------------
  // 5. Actions: New Note, Clear, Download, Copy
  // -------------------------------------------------------------------------
  function createNewNote() {
    const hasContent = editor.value.trim().length > 0;
    if (hasContent) {
      openConfirmModal(
        'Create New Note?',
        'Starting a new note will clear your existing text. Make sure you have downloaded or copied any notes you want to keep.',
        'Create New',
        () => {
          editor.value = '';
          noteTitleInput.value = 'Untitled Note';
          saveNote();
          updateStats();
          editor.focus();
        }
      );
    } else {
      editor.value = '';
      noteTitleInput.value = 'Untitled Note';
      saveNote();
      updateStats();
      editor.focus();
    }
  }

  function clearNote() {
    const hasContent = editor.value.trim().length > 0;
    if (hasContent) {
      openConfirmModal(
        'Clear Note Content?',
        'Are you sure you want to completely erase the current text? This action cannot be undone.',
        'Clear Note',
        () => {
          editor.value = '';
          saveNote();
          updateStats();
          editor.focus();
        }
      );
    } else {
      editor.focus();
    }
  }

  function sanitizeFilename(name) {
    return name
      .trim()
      .replace(/[^a-z0-9_\-\s]/gi, '')
      .replace(/\s+/g, '_')
      .slice(0, 50) || 'Note';
  }

  function downloadNote() {
    const content = editor.value;
    const title = noteTitleInput.value || 'Untitled Note';
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${sanitizeFilename(title)}_${dateStr}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyAllToClipboard() {
    const text = editor.value;
    if (!text) {
      showPasteToast('<strong>Note is empty.</strong> Type some text first to copy.');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnCopyAll.querySelector('span').textContent;
      btnCopyAll.querySelector('span').textContent = 'Copied!';
      setTimeout(() => {
        btnCopyAll.querySelector('span').textContent = originalText;
      }, 2000);
    }).catch(() => {
      // Fallback
      editor.select();
      document.execCommand('copy');
      const originalText = btnCopyAll.querySelector('span').textContent;
      btnCopyAll.querySelector('span').textContent = 'Copied!';
      setTimeout(() => {
        btnCopyAll.querySelector('span').textContent = originalText;
      }, 2000);
    });
  }

  btnNew.addEventListener('click', createNewNote);
  btnClear.addEventListener('click', clearNote);
  btnDownload.addEventListener('click', downloadNote);
  btnCopyAll.addEventListener('click', copyAllToClipboard);

  // -------------------------------------------------------------------------
  // 6. Theme Toggle (Light / Dark)
  // -------------------------------------------------------------------------
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (_) {}
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  }

  function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    } catch (_) {}

    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Default to light theme as requested, or check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      // The user specifically requested: "Use a clean light theme with subtle borders"
      // So default is light theme.
      applyTheme('light');
    }
  }

  btnTheme.addEventListener('click', toggleTheme);

  // -------------------------------------------------------------------------
  // 7. Initialization
  // -------------------------------------------------------------------------
  initTheme();
  loadSavedNote();

  // Focus editor automatically on desktop for immediate typing experience
  if (window.innerWidth > 768) {
    editor.focus();
  }

})();
