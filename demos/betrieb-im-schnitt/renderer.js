const CAMERA_Y = [-184, -112, -38, 38, 112, 184];
const CAMERA_Z = [18, 42, 26, 56, 34, 68];

let host = null;
let building = null;
let floors = [];

function interpolate(from, to, progress) {
  return from + (to - from) * progress;
}

export function mount(stage) {
  host = stage;
  host.innerHTML = `
    <div class="section-building" data-building-stack>
      <div class="building-spine" aria-hidden="true"><i></i><i></i></div>
      <div class="service-core" data-service-core>
        <span class="core-cap">SERVICE<br>CORE</span>
        <div class="core-shaft"><i></i><i></i><i></i></div>
        <ol class="core-levels">
          <li>06</li><li>05</li><li>04</li><li>03</li><li>02</li><li>01</li>
        </ol>
      </div>

      <section class="building-floor floor-chaos" data-floor="chaos" style="--floor-y: 180px; --floor-z: -90px">
        <div class="floor-slab"><span class="floor-number">01</span><span class="floor-name">EINGÄNGE</span></div>
        <div class="floor-grid"></div>
        <div class="intake-bin"><i></i><i></i><i></i></div>
        <div class="loose-document doc-a">ANFRAGE</div>
        <div class="loose-document doc-b">RÜCKRUF</div>
        <div class="floor-signal">12 NEU</div>
      </section>

      <section class="building-floor floor-inbox" data-floor="inbox" style="--floor-y: 108px; --floor-z: -54px">
        <div class="floor-slab"><span class="floor-number">02</span><span class="floor-name">SORTIERUNG</span></div>
        <div class="floor-grid"></div>
        <div class="sort-machine"><b>PRIO</b><i></i><i></i><i></i></div>
        <div class="sort-lanes"><span>A</span><span>B</span><span>C</span></div>
        <div class="floor-signal">83 → 7</div>
      </section>

      <section class="building-floor floor-offer" data-floor="offer" style="--floor-y: 36px; --floor-z: -18px">
        <div class="floor-slab"><span class="floor-number">03</span><span class="floor-name">ANGEBOT</span></div>
        <div class="floor-grid"></div>
        <div class="document-press"><b>ENTWURF</b><i></i><i></i><i></i></div>
        <div class="crm-terminal"><span>CRM</span><b>+ EINTRAG</b></div>
        <div class="floor-signal">PRÜFBAR</div>
      </section>

      <section class="building-floor floor-meeting" data-floor="meeting" style="--floor-y: -36px; --floor-z: 18px">
        <div class="floor-slab"><span class="floor-number">04</span><span class="floor-name">MEETING</span></div>
        <div class="floor-grid"></div>
        <div class="meeting-table"><b>42:18</b><i></i><i></i><i></i></div>
        <div class="meeting-output out-a">AUFGABE</div>
        <div class="meeting-output out-b">TERMIN</div>
        <div class="floor-signal">3 RESULTATE</div>
      </section>

      <section class="building-floor floor-knowledge" data-floor="knowledge" style="--floor-y: -108px; --floor-z: 54px">
        <div class="floor-slab"><span class="floor-number">05</span><span class="floor-name">WISSEN</span></div>
        <div class="floor-grid"></div>
        <div class="archive-rack"><i>Q1</i><i>Q2</i><i>Q3</i><i>Q4</i></div>
        <div class="answer-console"><span>ANTWORT</span><b>2 QUELLEN</b></div>
        <div class="floor-signal">BELEGT</div>
      </section>

      <section class="building-floor floor-control" data-floor="control" style="--floor-y: -180px; --floor-z: 90px">
        <div class="floor-slab"><span class="floor-number">06</span><span class="floor-name">KONTROLLE</span></div>
        <div class="floor-grid"></div>
        <div class="control-gate"><i></i><b>FREIGABE</b></div>
        <div class="control-badges"><span>DSGVO</span><span>ON-PREMISE</span></div>
        <div class="floor-signal">MENSCH</div>
      </section>
    </div>
  `;

  building = host.querySelector('[data-building-stack]');
  floors = Array.from(host.querySelectorAll('[data-floor]'));
}

export function render(frame) {
  if (!building) return;

  const sceneIndex = Math.max(0, Math.min(5, frame?.scene?.index ?? 0));
  const localProgress = Math.max(0, Math.min(1, Number(frame?.scene?.localProgress) || 0));
  const nextIndex = Math.min(5, sceneIndex + 1);
  const cameraY = interpolate(CAMERA_Y[sceneIndex], CAMERA_Y[nextIndex], localProgress);
  const cameraZ = interpolate(CAMERA_Z[sceneIndex], CAMERA_Z[nextIndex], localProgress);

  building.style.setProperty('--camera-y', `${cameraY.toFixed(3)}px`);
  building.style.setProperty('--camera-z', `${cameraZ.toFixed(3)}px`);

  for (const [index, floor] of floors.entries()) {
    const active = index === sceneIndex;
    floor.dataset.active = String(active);
    floor.style.setProperty('--floor-active', active ? '1' : '0');
  }
}

export function destroy() {
  host?.replaceChildren();
  host = null;
  building = null;
  floors = [];
}
