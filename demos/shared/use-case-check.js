import { calculatePotentialHours } from './content.js';

export function createUseCaseCheck({ dialog, background, shell, triggers = [] } = {}) {
  const inertTarget = background ?? shell;
  if (!dialog || !inertTarget) throw new TypeError('dialog and background are required');

  const form = dialog.querySelector('[data-use-case-form]');
  const closeButton = dialog.querySelector('[data-close-use-case]');
  const firstChoice = dialog.querySelector('input[name="useCases"]');
  const hoursInput = form.querySelector('[name="weeklyHours"]');
  const error = dialog.querySelector('[data-calculator-error]');
  const result = dialog.querySelector('[data-calculator-result]');
  const triggerList = Array.from(triggers);
  const supportsModal = typeof dialog.showModal === 'function';
  let returnTarget = null;

  function finishClose() {
    inertTarget.inert = false;
    returnTarget?.focus();
    returnTarget = null;
  }

  function open(event) {
    event.preventDefault();
    returnTarget = event.currentTarget;
    inertTarget.inert = true;

    if (supportsModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
    }

    queueMicrotask(() => firstChoice.focus());
  }

  function close() {
    if (supportsModal) {
      dialog.close();
      return;
    }

    dialog.removeAttribute('open');
    dialog.removeAttribute('aria-modal');
    finishClose();
  }

  function showError(message) {
    result.hidden = true;
    error.textContent = message;
    error.hidden = false;
  }

  function submit(event) {
    event.preventDefault();
    error.hidden = true;
    error.textContent = '';

    const choices = Array.from(form.querySelectorAll('input[name="useCases"]:checked'));
    if (choices.length === 0) {
      showError('Wählen Sie mindestens einen Bereich aus.');
      return;
    }

    const rawHours = hoursInput.value.trim();
    if (!/^\d+$/.test(rawHours)) {
      showError('Bitte geben Sie eine ganze Zahl von 1 bis 80 ein.');
      return;
    }

    try {
      const potential = calculatePotentialHours(Number(rawHours));
      const labels = choices.map(({ value }) => value).join(', ');
      result.textContent = `${labels}: ${potential.min}–${potential.max} Stunden/Jahr als illustrativer Prüfbereich.`;
      result.hidden = false;
    } catch {
      showError('Bitte geben Sie eine ganze Zahl von 1 bis 80 ein.');
    }
  }

  function fallbackKeys(event) {
    if (supportsModal || !dialog.hasAttribute('open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.closest('[hidden]') && element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  for (const trigger of triggerList) trigger.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  form.addEventListener('submit', submit);
  dialog.addEventListener('close', finishClose);
  document.addEventListener('keydown', fallbackKeys);

  return {
    destroy() {
      for (const trigger of triggerList) trigger.removeEventListener('click', open);
      closeButton.removeEventListener('click', close);
      form.removeEventListener('submit', submit);
      dialog.removeEventListener('close', finishClose);
      document.removeEventListener('keydown', fallbackKeys);
      inertTarget.inert = false;
    },
  };
}
