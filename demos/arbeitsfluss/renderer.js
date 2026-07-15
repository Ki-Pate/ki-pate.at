const STATION_POSITIONS = [3, 21.6, 40.2, 58.8, 77.4, 96];

let host = null;
let workbench = null;

export function mount(stage) {
  host = stage;
  host.innerHTML = `
    <div class="workbench" data-workbench>
      <div class="bench-surface" aria-hidden="true"></div>
      <div class="flow-rail rail-a" data-rail="input"></div>
      <div class="flow-rail rail-b" data-rail="process"></div>
      <div class="flow-rail rail-c" data-rail="result"></div>

      <section class="workbench-station station-chaos" data-station="chaos" style="--station-pos: ${STATION_POSITIONS[0]}%">
        <span class="station-index">01</span>
        <div class="paper-note note-one">RÜCKRUF<br>09:30</div>
        <div class="paper-note note-two">ANFRAGE<br>#1842</div>
        <div class="loose-mail"><i></i><b>12 NEU</b></div>
        <span class="station-caption">EINGÄNGE</span>
      </section>

      <section class="workbench-station station-inbox" data-station="inbox" style="--station-pos: ${STATION_POSITIONS[1]}%">
        <span class="station-index">02</span>
        <div class="inbox-stack" data-object="inbox-cards">
          <article class="inbox-card"><i>PRIO A</i><b>Angebotsanfrage</b><span>2 Anhänge</span></article>
          <article class="inbox-card"><i>PRIO B</i><b>Terminabgleich</b><span>Antwort bereit</span></article>
          <article class="inbox-card"><i>INFO</i><b>Statusbericht</b><span>zusammengefasst</span></article>
        </div>
        <span class="station-caption">SORTIERUNG</span>
      </section>

      <section class="workbench-station station-offer" data-station="offer" style="--station-pos: ${STATION_POSITIONS[2]}%">
        <span class="station-index">03</span>
        <article class="offer-sheet" data-object="offer-sheet">
          <header><span>ANGEBOT</span><b>ENTWURF</b></header>
          <p>KUNDE · BAUTEIL 7A</p>
          <i></i><i></i><i></i>
          <footer><span>€ —,—</span><b>PRÜFEN</b></footer>
        </article>
        <div class="crm-block"><span>CRM</span><i>+ EINTRAG</i></div>
        <span class="station-caption">ENTWURF</span>
      </section>

      <section class="workbench-station station-meeting" data-station="meeting" style="--station-pos: ${STATION_POSITIONS[3]}%">
        <span class="station-index">04</span>
        <div class="meeting-core" data-object="meeting-tokens"><span>MEETING</span><b>42:18</b></div>
        <div class="meeting-token token-decision">ENTSCHEIDUNG</div>
        <div class="meeting-token token-task">AUFGABE</div>
        <div class="meeting-token token-date">TERMIN</div>
        <span class="station-caption">EXTRAKTION</span>
      </section>

      <section class="workbench-station station-knowledge" data-station="knowledge" style="--station-pos: ${STATION_POSITIONS[4]}%">
        <span class="station-index">05</span>
        <div class="source-stack" data-object="source-cards">
          <article class="source-card"><span>Q1</span><b>Handbuch.pdf</b><i>S. 18</i></article>
          <article class="source-card"><span>Q2</span><b>Richtlinie.docx</b><i>§ 4.2</i></article>
          <article class="source-answer"><span>ANTWORT</span><b>belegt</b><i>2 Quellen</i></article>
        </div>
        <span class="station-caption">QUELLEN</span>
      </section>

      <section class="workbench-station station-control" data-station="control" style="--station-pos: ${STATION_POSITIONS[5]}%">
        <span class="station-index">06</span>
        <div class="approval-gate" data-object="approval-gate">
          <div class="gate-frame"><span>MENSCHLICHE</span><b>FREIGABE</b></div>
          <div class="gate-bar"><i></i></div>
          <div class="gate-base"><span>DSGVO</span><span>ON-PREMISE</span></div>
        </div>
        <span class="station-caption">KONTROLLE</span>
      </section>
    </div>
  `;
  workbench = host.querySelector('[data-workbench]');
}

export function render(frame) {
  if (!workbench) return;

  const progress = Math.max(0, Math.min(1, Number(frame?.progress) || 0));
  const cameraProgress = Math.max(0, Math.min(1, (progress - 1 / 12) / (5 / 6)));
  const stationCoordinate = 3 + cameraProgress * 93;
  const sceneIndex = Math.max(0, Math.min(5, frame?.scene?.index ?? 0));
  const localProgress = Math.max(0, Math.min(1, Number(frame?.scene?.localProgress) || 0));

  workbench.style.setProperty('--bench-x', `calc(50vw - ${stationCoordinate.toFixed(3)}%)`);
  workbench.style.setProperty('--flow-progress', progress.toFixed(5));
  workbench.style.setProperty('--local-progress', localProgress.toFixed(5));

  for (let index = 0; index < 6; index += 1) {
    workbench.style.setProperty(`--scene-${index}`, index === sceneIndex ? '1' : '0');
  }
}

export function destroy() {
  host?.replaceChildren();
  host = null;
  workbench = null;
}
