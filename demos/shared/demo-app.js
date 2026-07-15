import { SCENES } from './content.js';
import { createMediaController } from './media-controller.js';
import { MODE_STORAGE_KEY, resolveMode } from './mode-controller.js';
import { createScrollController } from './scroll-engine.js';
import { createUseCaseCheck } from './use-case-check.js';

const MODE_LABELS = {
  default: 'Full · Standard für dieses Gerät',
  explicit: 'Bewusst gewählter Modus',
  session: 'Aus dieser Sitzung übernommen',
  'media-error': 'Static · Medium nicht verfügbar',
  'reduced-motion': 'Static · Reduced Motion aktiv',
  'animation-off': 'Static · Animation ausgeschaltet',
  'save-data': 'Static · Datensparmodus aktiv',
};

function safeSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function createVideo() {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  return video;
}

function addParticles(container) {
  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement('i');
    particle.className = 'particle';
    particle.style.setProperty('--particle-x', `${8 + ((index * 37) % 84)}%`);
    particle.style.setProperty('--particle-y', `${12 + ((index * 29) % 58)}%`);
    particle.style.setProperty('--particle-delay', `${-(index % 7)}s`);
    container.append(particle);
  }
}

async function boot() {
  const root = document.documentElement;
  const demoId = root.dataset.demoId;
  const renderer = await import(`../${demoId}/renderer.js`);
  const stage = document.querySelector('[data-demo-stage]');
  const rendererStage = document.querySelector('[data-renderer-stage]');
  const mediaLayer = document.querySelector('[data-media-layer]');
  const particleLayer = document.querySelector('[data-particles]');
  const modeStatus = document.querySelector('[data-mode-status]');
  const consentButton = document.querySelector('[data-save-data-consent]');
  const modeButtons = Array.from(document.querySelectorAll('[data-mode-choice]'));
  const animationButton = document.querySelector('[data-toggle-animation]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const session = safeSessionStorage();
  let explicitMode = null;
  let animationOff = false;
  let saveDataConsent = false;
  let mediaError = false;
  let mediaController = null;
  let scrollController = null;
  let activeSceneIndex = 0;
  let resolvedMode = null;

  renderer.mount(rendererStage, { scenes: SCENES });

  function environment() {
    return {
      animationOff,
      mediaError,
      reducedMotion: reducedMotion.matches,
      saveData: navigator.connection?.saveData === true,
      saveDataConsent,
    };
  }

  function setModeStructure(mode) {
    mediaController?.destroy();
    mediaController = null;
    mediaLayer.replaceChildren();
    particleLayer.replaceChildren();

    if (mode === 'static') return;

    const videoCount = mode === 'full' ? 2 : 1;
    const videos = Array.from({ length: videoCount }, () => createVideo());
    mediaLayer.append(...videos);
    if (mode === 'full') addParticles(particleLayer);

    mediaController = createMediaController({
      videos,
      manifest: [],
      onError() {
        mediaError = true;
        applyMode();
      },
    });
  }

  function applyMode() {
    resolvedMode = resolveMode(environment(), session, explicitMode);
    root.dataset.mode = resolvedMode.mode;
    root.dataset.modeReason = resolvedMode.reason;
    modeStatus.textContent = MODE_LABELS[resolvedMode.reason];
    consentButton.hidden = !resolvedMode.needsSaveDataConsent;

    for (const button of modeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.modeChoice === resolvedMode.mode));
    }

    setModeStructure(resolvedMode.mode);
    requestAnimationFrame(() => {
      if (!scrollController) return;
      scrollController.stop();
      scrollController.start();
    });
  }

  function storeMode(mode) {
    try {
      session?.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // The mode remains active for the current page even when storage is unavailable.
    }
  }

  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      explicitMode = button.dataset.modeChoice;
      animationOff = false;
      animationButton.textContent = 'Animation aus';
      storeMode(explicitMode);
      applyMode();
    });
  }

  consentButton.addEventListener('click', () => {
    saveDataConsent = true;
    applyMode();
  });

  animationButton.addEventListener('click', () => {
    animationOff = !animationOff;
    animationButton.textContent = animationOff ? 'Animation ein' : 'Animation aus';
    applyMode();
  });

  reducedMotion.addEventListener?.('change', applyMode);
  applyMode();

  const headline = document.querySelector('[data-scene-headline]');
  const label = document.querySelector('[data-scene-label]');
  const problem = document.querySelector('[data-scene-problem]');
  const solution = document.querySelector('[data-scene-solution]');
  const counter = document.querySelector('[data-scene-counter]');
  const exampleDay = document.querySelector('[data-example-day]');
  const viewportClass = document.querySelector('[data-viewport-class]');

  function updateScene(scene) {
    if (scene.index === activeSceneIndex && root.dataset.activeScene) return;

    activeSceneIndex = scene.index;
    root.dataset.activeScene = scene.id;
    label.textContent = scene.label;
    headline.textContent = scene.headline;
    problem.textContent = scene.problem;
    solution.textContent = scene.solution;
    counter.textContent = `${String(scene.index + 1).padStart(2, '0')}/${String(SCENES.length).padStart(2, '0')}`;
    exampleDay.hidden = scene.id !== 'inbox';
  }

  scrollController = createScrollController({
    element: document.querySelector('[data-scroll-track]'),
    clipCount: 2,
    onFrame(frame) {
      stage.style.setProperty('--stage-progress', frame.progress.toFixed(5));
      updateScene(frame.scene);
      renderer.render(frame);
      mediaController?.setProgress(frame.progress);
      root.dataset.frameReady = 'true';
    },
  });

  function setViewportClass() {
    viewportClass.textContent = window.innerWidth < 600 ? 'MOBIL' : (window.innerWidth < 1000 ? 'TABLET' : 'DESKTOP');
  }

  setViewportClass();
  window.addEventListener('resize', setViewportClass);
  document.querySelector('[data-to-start]').addEventListener('click', () => scrollController.scrollToScene(0));
  document.querySelector('[data-next-scene]').addEventListener('click', () => {
    scrollController.scrollToScene(Math.min(SCENES.length - 1, activeSceneIndex + 1));
  });

  createUseCaseCheck({
    dialog: document.querySelector('#use-case-dialog'),
    background: document.querySelector('#page-content'),
    triggers: document.querySelectorAll('[data-open-use-case]'),
  });

  const primeMedia = () => mediaController?.prime();
  window.addEventListener('pointerdown', primeMedia, { passive: true });
  window.addEventListener('keydown', primeMedia);
  scrollController.start();
}

boot().catch(() => {
  document.documentElement.dataset.appError = 'true';
});
