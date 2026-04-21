export const CHANGELOG = [
  {
    version: 'v1.3',
    date: '2026-04-21 16:30',
    items: [
      { type: 'new', text: 'Wall Wrap Mode: nhn [ bt/tt — rn xuyn tng thay v cht' },
      { type: 'new', text: 'Speed Boost: gi SPACE tng tc 2x, thanh energy 5 ô hi dn' },
      { type: 'new', text: 'Bonus Food: mồi vàng xuất hiện ngẫu nhiên ~25s, trị giá 30 điểm, pulsing glow' },
      { type: 'change', text: 'Tách code thành các module JS riêng biệt: game, particles, tabs, scores, themes, changelog' },
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

const clList = document.getElementById('cl-list');
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
  clList.appendChild(el);
});
