let hoveredElement = null;
let lastCopiedHoverLink = '';

// Track the element currently under the mouse cursor
document.addEventListener('mouseover', (event) => {
  hoveredElement = event.target;
}, true);

document.addEventListener('keydown', async (event) => {
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  // 1. HOVER + CTRL + C : Copy hovered link address
  if (isCtrlOrCmd && key === 'c') {
    if (hoveredElement) {
      // Find the nearest anchor element or any element carrying an href attribute
      const linkAnchor = hoveredElement.closest('a') || hoveredElement.closest('[href]');
      
      let targetUrl = '';
      if (linkAnchor) {
        targetUrl = linkAnchor.href || linkAnchor.getAttribute('href');
      }

      if (targetUrl) {
        event.preventDefault();
        event.stopPropagation();

        // Convert relative URLs to full absolute URLs
        const absoluteUrl = new URL(targetUrl, window.location.origin).href;
        lastCopiedHoverLink = absoluteUrl;

        try {
          await navigator.clipboard.writeText(absoluteUrl);
          // Give visual feedback on the actual link block if possible
          showFeedback(linkAnchor || hoveredElement);
          console.log('JioSaavn Hover Link Copied:', absoluteUrl);
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
        }
      }
    }
  }

  // 2. CTRL + V : Paste the hover-copied link address into active input field
  if (isCtrlOrCmd && key === 'v') {
    const activeEl = document.activeElement;

    if (lastCopiedHoverLink && isEditable(activeEl)) {
      event.preventDefault();
      event.stopPropagation();

      insertTextAtCursor(activeEl, lastCopiedHoverLink);
      console.log('Pasted hover link:', lastCopiedHoverLink);
    }
  }
}, true);

// Helper: Check if element can receive text input
function isEditable(el) {
  if (!el) return false;
  const tagName = el.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    el.isContentEditable
  );
}

// Helper: Insert text cleanly into standard inputs or contenteditable fields
function insertTextAtCursor(el, text) {
  if (el.isContentEditable) {
    document.execCommand('insertText', false, text);
  } else if (typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;

    el.value = val.slice(0, start) + text + val.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Visual green flash feedback when link is copied
function showFeedback(element) {
  if (!element) return;
  const originalOutline = element.style.outline;
  element.style.outline = '2px solid #C20000';
  setTimeout(() => {
    element.style.outline = originalOutline;
  }, 400);
}