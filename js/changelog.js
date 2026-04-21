// Changelog data — Claude updates this array each time a new feature is shipped.
export const CHANGELOG = [
  {
    version: "v1.5",
    date: "2026-04-21 17:30",
    items: [
      { type: "new", text: "Chọn độ khó Easy / Normal / Hard trước khi chơi (tốc độ ban đầu & tốc độ tăng khác nhau)" },
      { type: "new", text: "Screen shake khi rắn chết — canvas rung 400ms trước khi hiện Game Over" },
      { type: "new", text: "Combo system: ăn mồi liên tiếp trong 3 giây → điểm thưởng tăng dần + chữ COMBO xuất hiện trên canvas" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.4",
    date: "2026-04-21 17:00",
    items: [
      { type: "change", text: "Refactor: tách index.html thành CSS + 7 ES modules" },
      { type: "change", text: "Cấu trúc mới: css/styles.css, js/{main,game,themes,scores,tabs,particles,changelog}.js" },
      { type: "change", text: "Mỗi module có một trách nhiệm rõ ràng — dễ maintain" },
    ],
    by: "Claude (claude-opus-4-7)",
  },
  {
    version: "v1.3",
    date: "2026-04-21 16:00",
    items: [
      { type: "new", text: "Color themes: Classic / Neon / Retro / Mono" },
      { type: "new", text: "Pause game bằng phím P (hoặc click Resume)" },
      { type: "new", text: "High score board — lưu top 5 điểm cao nhất" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.2",
    date: "2026-04-21 15:00",
    items: [
      { type: "new", text: "Hiệu ứng particle bùng nổ khi rắn ăn mồi" },
      { type: "new", text: "Particles có màu sắc ngẫu nhiên, trọng lực và fade-out mượt" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.1",
    date: "2026-04-21 08:30",
    items: [
      { type: "new", text: "Thêm tab Changelog để theo dõi lịch sử cập nhật" },
      { type: "new", text: "Tab Game / Changelog có thể chuyển đổi" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.0",
    date: "2026-04-21 08:00",
    items: [
      { type: "new", text: "Khởi tạo game Snake trên web (HTML/JS/Canvas)" },
      { type: "new", text: "Lưu best score bằng localStorage" },
      { type: "new", text: "Điều khiển bằng Arrow Keys hoặc WASD" },
      { type: "new", text: "Tốc độ tăng dần theo điểm" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
];

export function renderChangelog() {
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
}
