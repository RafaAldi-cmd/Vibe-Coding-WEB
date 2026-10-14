// HabitTracker JS Logic
document.addEventListener('DOMContentLoaded', () => {
  const habitForm = document.getElementById('habitForm');
  const habitInput = document.getElementById('habitInput');
  const habitsList = document.getElementById('habitsList');
  const emptyState = document.getElementById('emptyState');
  const totalHabitsCount = document.getElementById('totalHabitsCount');
  const completedTodayCount = document.getElementById('completedTodayCount');

  // Load state dari localStorage
  let habits = JSON.parse(localStorage.getItem('habits_data')) || [];

  // Helper: Format tanggal hari ini (YYYY-MM-DD)
  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Hitung jumlah streak berturut-turut
  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;

    const sortedDates = [...completedDates].sort((a, b) => new Date(b) - new Date(a));
    const todayStr = getTodayDateStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yYear = yesterday.getFullYear();
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

    if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date();

    if (!sortedDates.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const cYear = checkDate.getFullYear();
      const cMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
      const cDay = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${cYear}-${cMonth}-${cDay}`;

      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Simpan ke localStorage dan render ulang UI
  const saveAndRender = () => {
    localStorage.setItem('habits_data', JSON.stringify(habits));
    renderHabits();
  };

  // Render Daftar Kebiasaan
  const renderHabits = () => {
    habitsList.innerHTML = '';
    const todayStr = getTodayDateStr();

    if (habits.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }

    let completedCount = 0;

    habits.forEach((habit, index) => {
      const isCompletedToday = habit.completedDates && habit.completedDates.includes(todayStr);
      if (isCompletedToday) completedCount++;

      const streak = calculateStreak(habit.completedDates || []);

      const habitCard = document.createElement('div');
      habitCard.className = `habit-item ${isCompletedToday ? 'completed' : ''}`;

      habitCard.innerHTML = `
        <div class="habit-info">
          <button class="checkbox-btn" onclick="toggleHabit(${index})">
            ${isCompletedToday ? '✓' : ''}
          </button>
          <span class="habit-title">${escapeHtml(habit.name)}</span>
        </div>
        <span class="streak-badge">🔥 ${streak} Hari</span>
        <div class="habit-actions">
          <button class="btn-icon" onclick="editHabit(${index})" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteHabit(${index})" title="Hapus">🗑️</button>
        </div>
      `;

      habitsList.appendChild(habitCard);
    });

    // Update Angka Statistik
    totalHabitsCount.textContent = habits.length;
    completedTodayCount.textContent = completedCount;
  };

  // Proteksi XSS sederhana
  const escapeHtml = (str) => {
    return str.replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  };

  // Fitur: Tambah Kebiasaan Baru
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;

    habits.push({
      id: Date.now().toString(),
      name: name,
      completedDates: []
    });

    habitInput.value = '';
    saveAndRender();
  });

  // Fitur: Centang / Batal Centang Harian
  window.toggleHabit = (index) => {
    const todayStr = getTodayDateStr();
    if (!habits[index].completedDates) {
      habits[index].completedDates = [];
    }

    const dateIndex = habits[index].completedDates.indexOf(todayStr);
    if (dateIndex > -1) {
      habits[index].completedDates.splice(dateIndex, 1);
    } else {
      habits[index].completedDates.push(todayStr);
    }

    saveAndRender();
  };

  // Fitur: Edit Kebiasaan
  window.editHabit = (index) => {
    const currentName = habits[index].name;
    const newName = prompt('Edit nama kebiasaan:', currentName);
    if (newName !== null && newName.trim() !== '') {
      habits[index].name = newName.trim();
      saveAndRender();
    }
  };

  // Fitur: Hapus Kebiasaan
  window.deleteHabit = (index) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kebiasaan "${habits[index].name}"?`)) {
      habits.splice(index, 1);
      saveAndRender();
    }
  };

  // Inisialisasi awal
  renderHabits();
});
