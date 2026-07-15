const CAMERA_KEYFRAMES = [
  { x: 218, y: -136, z: -30, rx: 61, rz: -38 },
  { x: 44, y: -76, z: 16, rx: 59, rz: -41 },
  { x: -132, y: -142, z: -8, rx: 62, rz: -35 },
  { x: -188, y: 52, z: 34, rx: 58, rz: -43 },
  { x: 2, y: 122, z: 8, rx: 61, rz: -39 },
  { x: 196, y: 64, z: 48, rx: 57, rz: -33 },
];

let host = null;
let world = null;
let islands = [];

function interpolate(from, to, progress) {
  return from + (to - from) * progress;
}

export function mount(stage) {
  host = stage;
  host.innerHTML = `
    <div class="island-world" data-island-world>
      <div class="world-plane" aria-hidden="true"></div>
      <svg class="island-route" data-island-route viewBox="0 0 620 540" aria-hidden="true">
        <path class="route-bed" d="M 82 432 C 145 419 207 390 269 368 S 392 413 461 432 S 511 324 522 241 S 410 175 317 156 S 185 184 115 216" pathLength="1" />
        <path class="route-live" d="M 82 432 C 145 419 207 390 269 368 S 392 413 461 432 S 511 324 522 241 S 410 175 317 156 S 185 184 115 216" pathLength="1" />
        <g class="route-junctions">
          <circle cx="82" cy="432" r="5"/><circle cx="269" cy="368" r="5"/>
          <circle cx="461" cy="432" r="5"/><circle cx="522" cy="241" r="5"/>
          <circle cx="317" cy="156" r="5"/><circle cx="115" cy="216" r="5"/>
        </g>
      </svg>

      <section class="machine-island island-chaos" data-island="chaos" style="--island-x: 82px; --island-y: 432px">
        <div class="island-plinth"><span>01</span><b>EINGÄNGE</b></div>
        <div class="intake-carousel"><i></i><i></i><i></i><i></i></div>
        <div class="paper-feed"><span>MAIL</span><span>NOTIZ</span><span>PDF</span></div>
        <p>12 NEU</p>
      </section>

      <section class="machine-island island-inbox" data-island="inbox" style="--island-x: 269px; --island-y: 368px">
        <div class="island-plinth"><span>02</span><b>SORTIERUNG</b></div>
        <div class="sorting-tower"><b>PRIO</b><i></i><i></i><i></i></div>
        <div class="sorting-chutes"><span>A</span><span>B</span><span>C</span></div>
        <p>83 → 7</p>
      </section>

      <section class="machine-island island-offer" data-island="offer" style="--island-x: 461px; --island-y: 432px">
        <div class="island-plinth"><span>03</span><b>ANGEBOT</b></div>
        <div class="offer-printer"><span>ANGEBOT</span><i></i><i></i><b>ENTWURF</b></div>
        <div class="crm-cube">CRM<small>+1</small></div>
        <p>PRÜFBAR</p>
      </section>

      <section class="machine-island island-meeting" data-island="meeting" style="--island-x: 522px; --island-y: 241px">
        <div class="island-plinth"><span>04</span><b>MEETING</b></div>
        <div class="meeting-reactor"><b>42:18</b><i></i><i></i><i></i></div>
        <div class="output-tokens"><span>E</span><span>A</span><span>T</span></div>
        <p>3 RESULTATE</p>
      </section>

      <section class="machine-island island-knowledge" data-island="knowledge" style="--island-x: 317px; --island-y: 156px">
        <div class="island-plinth"><span>05</span><b>WISSEN</b></div>
        <div class="knowledge-array"><i>Q1</i><i>Q2</i><i>Q3</i><i>Q4</i></div>
        <div class="answer-beacon"><span></span><b>BELEGT</b></div>
        <p>2 QUELLEN</p>
      </section>

      <section class="machine-island island-control" data-island="control" style="--island-x: 115px; --island-y: 216px">
        <div class="island-plinth"><span>06</span><b>KONTROLLE</b></div>
        <div class="approval-frame"><i></i><b>FREIGABE</b></div>
        <div class="trust-cells"><span>DSGVO</span><span>ON-PREM</span></div>
        <p>MENSCH</p>
      </section>
    </div>
  `;

  world = host.querySelector('[data-island-world]');
  islands = Array.from(host.querySelectorAll('[data-island]'));
}

export function render(frame) {
  if (!world) return;

  const sceneIndex = Math.max(0, Math.min(5, frame?.scene?.index ?? 0));
  const localProgress = Math.max(0, Math.min(1, Number(frame?.scene?.localProgress) || 0));
  const progress = Math.max(0, Math.min(1, Number(frame?.progress) || 0));
  const current = CAMERA_KEYFRAMES[sceneIndex];
  const next = CAMERA_KEYFRAMES[Math.min(5, sceneIndex + 1)];

  for (const key of ['x', 'y', 'z', 'rx', 'rz']) {
    const value = interpolate(current[key], next[key], localProgress);
    const unit = key.startsWith('r') ? 'deg' : 'px';
    world.style.setProperty(`--camera-${key}`, `${value.toFixed(3)}${unit}`);
  }
  world.style.setProperty('--route-progress', progress.toFixed(5));

  for (const [index, island] of islands.entries()) {
    const active = index === sceneIndex;
    island.dataset.active = String(active);
    island.style.setProperty('--island-active', active ? '1' : '0');
  }
}

export function destroy() {
  host?.replaceChildren();
  host = null;
  world = null;
  islands = [];
}
