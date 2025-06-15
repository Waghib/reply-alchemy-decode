
// Text selection and quick analyze functionality
export class TextSelectionManager {
  constructor(onAnalyzeText) {
    this.selectedText = '';
    this.onAnalyzeText = onAnalyzeText;
    this.setupTextSelection();
  }

  setupTextSelection() {
    document.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      if (selection.toString().length > 10) {
        this.selectedText = selection.toString();
        this.showQuickAnalyzeButton(e.pageX, e.pageY);
      }
    });
  }

  showQuickAnalyzeButton(x, y) {
    // Remove existing quick button
    const existingBtn = document.getElementById('dm-quick-analyze');
    if (existingBtn) existingBtn.remove();
    
    // Create quick analyze button
    const quickBtn = document.createElement('button');
    quickBtn.id = 'dm-quick-analyze';
    quickBtn.innerHTML = '🧠 Analyze';
    quickBtn.className = 'dm-quick-btn';
    quickBtn.style.position = 'absolute';
    quickBtn.style.left = x + 'px';
    quickBtn.style.top = (y - 40) + 'px';
    quickBtn.style.zIndex = '999999';
    
    quickBtn.addEventListener('click', () => {
      this.onAnalyzeText(this.selectedText);
      quickBtn.remove();
    });
    
    document.body.appendChild(quickBtn);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (quickBtn.parentNode) quickBtn.remove();
    }, 3000);
  }

  hideQuickButton() {
    const quickBtn = document.getElementById('dm-quick-analyze');
    if (quickBtn) quickBtn.remove();
  }
}
