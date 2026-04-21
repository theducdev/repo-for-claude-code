// Entry point — wires all modules together.
import { renderChangelog } from './changelog.js';
import { initTabs } from './tabs.js';
import { initScores } from './scores.js';
import { initGame } from './game.js';
import { initThemes } from './themes.js';
import { initSound } from './sounds.js';

renderChangelog();
initTabs();
initScores();
initGame();
initThemes();
initSound();
