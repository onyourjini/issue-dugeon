const quests = [
  {
    id: 'null-pointer',
    title: 'The Null Pointer Crypt',
    type: 'BUG',
    difficulty: 2,
    xp: 120,
    gold: 45,
    description: 'A dereferenced value is haunting the checkout chamber.',
    enemy: 'The Null Wraith',
    enemyHp: 100,
    clue: 'The stack trace points to OrderSummary.tsx:84. The user object arrives empty after guest checkout.',
    symbol: 'BUG',
  },
  {
    id: 'flaky-test',
    title: 'The Flaky Test Forge',
    type: 'TEST',
    difficulty: 3,
    xp: 190,
    gold: 70,
    description: 'An unreliable assertion keeps forging false failures.',
    enemy: 'The Timing Imp',
    enemyHp: 140,
    clue: 'The failure appears after the third retry. A missing await leaves the forge door ajar.',
    symbol: 'TEST',
  },
  {
    id: 'infinite-loop',
    title: 'The Infinite Loop Catacombs',
    type: 'PERFORMANCE',
    difficulty: 4,
    xp: 280,
    gold: 110,
    description: 'A recursive process is eating cycles deep below the runtime.',
    enemy: 'The Ouroboros Process',
    enemyHp: 190,
    clue: 'The profiler finds a watcher re-registering itself in useRouteSync. Break the dependency cycle.',
    symbol: 'LOOP',
  },
];

const state = {
  level: 4,
  xp: 470,
  gold: 286,
  completedIds: [],
  encounter: null,
};

const app = document.querySelector('#app');
const modal = document.querySelector('#encounter-modal');

function findQuest(id) {
  return quests.find((quest) => quest.id === id);
}

function createEncounter(quest, openingMessage) {
  return {
    questId: quest.id,
    enemyHp: quest.enemyHp,
    playerHp: 100,
    inspected: false,
    clues: [],
    log: [openingMessage || `You enter ${quest.title}. The air tastes like stale code.`],
    status: 'fighting',
  };
}

function renderMainScreen() {
  const completedCount = state.completedIds.length;
  const xpPercent = Math.min(100, Math.round(((state.xp % 600) / 600) * 100));

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">X</div>
        <div>
          <span class="brand-name">Issue Dungeon</span>
          <span class="brand-version">vanilla edition // local realm</span>
        </div>
      </div>
      <div>
        <span class="status">dungeon online</span>
        <span class="run-id">RUN #PATCH-004</span>
      </div>
    </header>

    <section class="hero">
      <div>
        <p class="eyebrow">The sprint begins below</p>
        <h1>Every bug has a lair.<br /><span>Every fix leaves a mark.</span></h1>
      </div>
      <p class="hero-copy">Descend into the backlog, read the traces, and turn dangerous issues into clean, passing builds.</p>
    </section>

    <section class="hero-panel">
      <div class="hero-profile">
        <div class="portrait">/patch</div>
        <div>
          <h2>Patch <span>the Resolute</span></h2>
          <p>class: senior debugger / rank: maintainer</p>
          <span class="level">level ${state.level} · code knight</span>
        </div>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-label">HP</span>
          <strong class="stat-value health">100</strong>
        </div>
        <div class="stat">
          <span class="stat-label">Gold</span>
          <strong class="stat-value gold">${state.gold}</strong>
        </div>
        <div class="stat">
          <span class="stat-label">XP</span>
          <strong class="stat-value xp">${state.xp}<small> / 600</small></strong>
          <div class="progress"><span style="width: ${xpPercent}%"></span></div>
        </div>
      </div>
    </section>

    <div class="dungeon-progress">
      <span>Dungeon depth</span>
      <div class="progress"><span style="width: ${Math.max(18, (completedCount / quests.length) * 100)}%"></span></div>
      <span>${completedCount} / ${quests.length}</span>
    </div>

    <div class="main-grid">
      <section>
        <div class="section-heading">
          <h2>Choose your descent</h2>
          <span>${completedCount} / ${quests.length} cleared</span>
        </div>
        <div class="quest-grid">
          ${quests.map((quest) => `
            <button class="quest-card" type="button" data-quest-id="${quest.id}">
              <div class="quest-symbol">${quest.symbol}</div>
              <div class="quest-type">${quest.type} · threat ${quest.difficulty}/5</div>
              <h3>${quest.title}</h3>
              <p class="quest-description">${quest.description}</p>
              <div class="quest-footer">
                <span class="quest-reward">+${quest.xp} XP · +${quest.gold} G</span>
                <span>${state.completedIds.includes(quest.id) ? 'cleared' : 'enter'} →</span>
              </div>
            </button>
          `).join('')}
        </div>
      </section>

      <aside class="side-stack">
        <section class="panel">
          <div class="panel-heading">
            <h3>Quest log</h3>
            <span>active run</span>
          </div>
          <div class="summary">
            <div><strong>${completedCount}</strong><span>completed</span></div>
            <div><strong>${quests.length - completedCount}</strong><span>active</span></div>
          </div>
          <div class="quest-log">
            ${quests.map((quest) => `<div>${quest.title}</div>`).join('')}
          </div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <h3>Developer relics</h3>
            <span>3 equipped</span>
          </div>
          <div class="relic-list">
            <div class="relic"><strong>Stacktrace Lens</strong><span>+10% clue clarity</span></div>
            <div class="relic"><strong>Copper Keyboard</strong><span>+8 patch force</span></div>
            <div class="relic"><strong>Test Runner Sigil</strong><span>+1 retry ward</span></div>
          </div>
        </section>
      </aside>
    </div>

    <footer class="footer">
      <span>THE DUNGEON REMEMBERS EVERY COMMIT</span>
      <span>patch responsibly · ship bravely</span>
    </footer>
  `;
}

function renderEncounter() {
  if (!state.encounter) {
    modal.classList.add('hidden');
    modal.innerHTML = '';
    return;
  }

  const quest = findQuest(state.encounter.questId);
  const encounter = state.encounter;
  if (!quest) return;

  modal.classList.remove('hidden');

  if (encounter.status === 'victory') {
    modal.innerHTML = `
      <section class="modal-card">
        <div class="result">
          <p class="eyebrow">Issue resolved</p>
          <h2>Victory in the logs.</h2>
          <p>${quest.enemy} has been retired. Your patch is now part of the dungeon record.</p>
          <p class="reward">+${quest.xp} XP · +${quest.gold} gold</p>
          <button class="modal-button primary" type="button" data-modal-action="close">Return to dungeon</button>
        </div>
      </section>
    `;
    return;
  }

  if (encounter.status === 'defeat') {
    modal.innerHTML = `
      <section class="modal-card">
        <div class="result">
          <p class="eyebrow">Build failed</p>
          <h2>The issue pushed back.</h2>
          <p>Patch lost this round, but the trace is still warm. Retry with a different opening move.</p>
          <button class="modal-button" type="button" data-modal-action="close">Retreat</button>
          <button class="modal-button danger" type="button" data-modal-action="retry">Retry encounter</button>
        </div>
      </section>
    `;
    return;
  }

  const enemyPercent = Math.max(0, (encounter.enemyHp / quest.enemyHp) * 100);
  const playerPercent = Math.max(0, encounter.playerHp);

  modal.innerHTML = `
    <section class="modal-card">
      <header class="modal-header">
        <div>
          <p class="modal-label">${quest.type} encounter · threat ${quest.difficulty}</p>
          <h2>${quest.title}</h2>
          <p>${quest.description} Read the trace, choose an action, and keep your build alive.</p>
        </div>
        <button class="close-button" type="button" data-modal-action="close" aria-label="Close encounter">×</button>
      </header>
      <div class="encounter">
        <div class="enemy">
          <div class="enemy-line"><span>hostile process</span><span>${encounter.enemyHp} HP</span></div>
          <div class="enemy-art">BUG</div>
          <div class="enemy-name">${quest.enemy}</div>
          <div class="health-line"><span>enemy integrity</span><span>${encounter.enemyHp} / ${quest.enemyHp}</span></div>
          <div class="bar"><span style="width: ${enemyPercent}%"></span></div>
        </div>
        <div class="combat">
          <div class="player">
            <div class="health-line"><span>Patch · level ${state.level}</span><span>${encounter.playerHp} / 100 HP</span></div>
            <div class="bar"><span style="width: ${playerPercent}%"></span></div>
          </div>
          <div class="combat-log">
            ${encounter.log.slice(-7).map((entry) => `<p>${entry}</p>`).join('')}
          </div>
          ${encounter.clues.length ? `<div class="clue"><strong>Trace clue recovered</strong><p>${encounter.clues.at(-1)}</p></div>` : ''}
          <div class="actions">
            <button class="action" type="button" data-combat-action="inspect"><strong>Inspect Trace</strong><span>reveal a clue</span></button>
            <button class="action" type="button" data-combat-action="patch"><strong>Apply Patch</strong><span>deal direct damage</span></button>
            <button class="action" type="button" data-combat-action="test"><strong>Run Tests</strong><span>verify the fix</span></button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function resolveAction(action) {
  const quest = findQuest(state.encounter.questId);
  const encounter = state.encounter;
  if (!quest || !encounter || encounter.status !== 'fighting') return;

  let enemyDamage = 0;
  let playerDamage = 0;
  let message = '';
  let clue = null;

  if (action === 'inspect') {
    encounter.inspected = true;
    clue = quest.clue;
    message = 'Inspect Trace reveals a useful clue in the stack.';
    playerDamage = 4;
  } else if (action === 'patch') {
    enemyDamage = encounter.inspected ? 48 : 30;
    playerDamage = 10;
    message = 'Apply Patch changes the code path and hits the issue.';
  } else {
    enemyDamage = encounter.inspected ? 52 : 22;
    playerDamage = encounter.inspected ? 5 : 14;
    message = encounter.inspected
      ? 'Run Tests turns green. The fix holds under pressure.'
      : 'Run Tests finds another failure in the dark.';
  }

  encounter.enemyHp = Math.max(0, encounter.enemyHp - enemyDamage);
  encounter.playerHp = Math.max(0, encounter.playerHp - playerDamage);
  encounter.log.push(message);
  if (playerDamage) encounter.log.push(`${quest.enemy} strikes back for ${playerDamage} damage.`);
  if (clue && !encounter.clues.includes(clue)) encounter.clues.push(clue);

  if (encounter.enemyHp <= 0) {
    encounter.status = 'victory';
    state.xp += quest.xp;
    state.gold += quest.gold;
    if (!state.completedIds.includes(quest.id)) state.completedIds.push(quest.id);
    encounter.log.push(`${quest.enemy} dissolves into clean, passing builds.`);
  } else if (encounter.playerHp <= 0) {
    encounter.status = 'defeat';
    encounter.log.push('Your HP reaches zero. The issue survives this round.');
  }

  renderMainScreen();
  renderEncounter();
}

app.addEventListener('click', (event) => {
  const questButton = event.target.closest('[data-quest-id]');
  if (questButton) {
    state.encounter = createEncounter(findQuest(questButton.dataset.questId));
    renderEncounter();
    return;
  }
});

modal.addEventListener('click', (event) => {
  const combatButton = event.target.closest('[data-combat-action]');
  const modalButton = event.target.closest('[data-modal-action]');

  if (combatButton) {
    resolveAction(combatButton.dataset.combatAction);
    return;
  }

  if (!modalButton) return;

  if (modalButton.dataset.modalAction === 'retry') {
    const quest = findQuest(state.encounter.questId);
    state.encounter = createEncounter(quest, 'You steady your stance. The dungeon grants one more attempt.');
    renderEncounter();
  } else {
    state.encounter = null;
    renderEncounter();
  }
});

renderMainScreen();
