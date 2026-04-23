// Changelog data — Claude updates this array each time a new feature is shipped.
export const CHANGELOG = [
  {
    version: "v1.9",
    date: "2026-04-23 20:00",
    items: [
      { type: "fix", text: "index.html không load modular structure — thêm <link css/styles.css> + <script type=module src=js/main.js>, bỏ toàn bộ inline <style>/<script> cũ (v1.4) đã stale. Mọi tính năng v1.5→v1.8 (shield, poison, milestone, sound, scores, difficulty, themes) giờ mới thực sự chạy" },
      { type: "fix", text: "Thêm các DOM elements thiếu: Scores tab + panel, .diff-btn (Easy/Normal/Hard), .theme-btn (4 màu), #warp-btn, #sound-btn" },
      { type: "fix", text: "scores.js/changelog.js: null-safety guard khi #sc-list / #cl-list chưa mount (tránh TypeError)" },
      { type: "fix", text: "sounds.js: gọi AudioContext.resume() trong getCtx() — browser modern treo context đến user gesture đầu tiên" },
      { type: "new", text: "Ghost Mode: orb trắng mờ xuất hiện mỗi 11 mồi — ăn vào rắn trở nên trong suốt và xuyên thân mình 5 giây (aura dashed ring + chỉ báo GHOST Xs)" },
      { type: "new", text: "Speed Burst: sét cam xuất hiện mỗi 9 mồi — ăn vào tốc độ gấp đôi 4 giây, +5 điểm bonus mỗi mồi (chỉ báo BOOST Xs)" },
      { type: "new", text: "Shrink Potion: viên teal xuất hiện mỗi 13 mồi — ăn vào cắt 4 đốt đuôi và +15 điểm (chiến thuật khi rắn quá dài)" },
    ],
    by: "Claude (claude-opus-4-7)",
  },
  {
    version: "v1.8",
    date: "2026-04-21 19:30",
    items: [
      { type: "new", text: "Shield power-up: hình thoi xanh cyan, xuất hiện mỗi 8 mồi — ăn vào chặn 1 lần va chạm bản thân, glow 5 giây" },
      { type: "new", text: "Poison food: quả tím nhỏ xuất hiện ngẫu nhiên — ăn +5 điểm nhưng rắn bị co ngắn 2 đốt" },
      { type: "new", text: "Score milestones: đạt 50/100/200/300/500 điểm → rainbow particle burst + flash chúc mừng trên canvas" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.7",
    date: "2026-04-21 18:30",
    items: [
      { type: "new", text: "Screen shake khi rắn chết — canvas rung 380ms với decay tự nhiên, overlay chỉ hiện sau khi shake xong" },
      { type: "new", text: "Snake eyes — rắn có mắt thể hiện hướng di chuyển, con ngươi nhìn về phía trước" },
      { type: "new", text: "New Best badge — nhãn '★ NEW BEST' sáng vàng trên canvas khi phá kỷ lục, tự mờ dần sau 2.5 giây" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.6",
    date: "2026-04-21 19:00",
    items: [
      { type: "new", text: "Combo Multiplier: ăn liên tiếp trong 3 giây để đạt x2/x3 — hiển thị nhãn trên canvas" },
      { type: "new", text: "Golden Apple: sau mỗi 5 mồi thường, mồi vàng nhấp nháy xuất hiện 5 giây (+30 điểm)" },
      { type: "new", text: "Warp Walls: toggle WARP ON/OFF — rắn xuyên tường thay vì chết" },
    ],
    by: "Claude (claude-sonnet-4-6)",
  },
  {
    version: "v1.5",
    date: "2026-04-21 18:00",
    items: [
      { type: "new", text: "Difficulty selector: Easy / Normal / Hard — chọn tốc độ ban đầu trước khi chơi" },
      { type: "new", text: "Mobile touch controls: vuốt trên canvas để điều hướng rắn" },
      { type: "new", text: "Sound effects: tiếng ăn mồi và game over bằng Web Audio API, có nút SFX ON/OFF" },
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
  if (!clList) return;
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
