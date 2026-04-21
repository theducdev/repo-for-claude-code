export const CHANGELOG = [
  {
    version: 'v1.3',
    date: '2026-04-21 16:00',
    items: [
      { type: 'new', text: '4 themes: Classic, Neon, Retro, Ocean — lưu localStorage' },
      { type: 'new', text: 'Power-up food (ngôi sao vàng) mỗi 5 lần ăn: +50 điểm + slow 3.5s' },
      { type: 'new', text: 'Sound effects qua Web Audio API (ăn, power-up, game over)' },
      { type: 'change', text: 'Tách thành modules: game, themes, sounds, powerups, particles, scores, tabs' },
    ],
    by: 'Claude (claude-sonnet-4-6)',
  },
  {
    version: 'v1.2',
    date: '2026-04-21 15:00',
    items: [
      { type: 'new', text: 'Hiệu ứng particle bùng nổ khi rắn ăn mồi' },
      { type: 'new', text: 'Particles có màu sắc ngẫu nhiên, trọng lực và fade-out mượt' },
    ],
    by: 'Claude (claude-sonnet-4-6)',
  },
  {
    version: 'v1.1',
    date: '2026-04-21 08:30',
    items: [
      { type: 'new', text: 'Thêm tab Changelog để theo dõi lịch sử cập nhật' },
      { type: 'new', text: 'Tab Game / Changelog có thể chuyển đổi' },
    ],
    by: 'Claude (claude-sonnet-4-6)',
  },
  {
    version: 'v1.0',
    date: '2026-04-21 08:00',
    items: [
      { type: 'new', text: 'Khởi tạo game Snake trên web (HTML/JS/Canvas)' },
      { type: 'new', text: 'Lưu best score bằng localStorage' },
      { type: 'new', text: 'Điều khiển bằng Arrow Keys hoặc WASD' },
      { type: 'new', text: 'Tốc độ tăng dần theo điểm' },
    ],
    by: 'Claude (claude-sonnet-4-6)',
  },
];

export function renderChangelog() {
  const list = document.getElementById('cl-list');
  CHANGELOG.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'cl-entry';
    el.innerHTML = `
      <div class="cl-entry-header">
        <span class="cl-version">${entry.version}</span>
        <span class="cl-date">${entry.date}</span>
      </div>
      <ul class="cl-items">
        ${entry.items.map(i => `<li class="${i.type}">${i.text}</li>`).join('')}
      </ul>
      <div class="cl-by">by ${entry.by}</div>
    `;
    list.appendChild(el);
  });
}
