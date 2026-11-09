const CIRCUMFERENCE = 2 * Math.PI * 130; // 816.81

const DEFAULT_WORK_SEC = 40 * 60;
const DEFAULT_BREAK_SEC = 0;

let state = 'IDLE';
let workDurationSec = DEFAULT_WORK_SEC;
let breakTargetDurationSec = DEFAULT_BREAK_SEC;
let currentRemainingSec = DEFAULT_WORK_SEC;
let totalSpanSec = DEFAULT_WORK_SEC;

let breakCountUpSec = 0;
let lastTimestamp = null;
let intervalId = null;
let wakeLock = null;

// Referencje do elementów DOM
const dialContainer = document.getElementById('dialContainer');
const statusBadge = document.getElementById('statusBadge');
const dialProgress = document.getElementById('dialProgress');
const timeText = document.getElementById('timeText');
const timeSub = document.getElementById('timeSub');
const inputMin = document.getElementById('inputMin');
const inputSec = document.getElementById('inputSec');
const breakInputMin = document.getElementById('breakInputMin');
const breakInputSec = document.getElementById('breakInputSec');
const setupSection = document.getElementById('setupSection');
const quickAddGroup = document.getElementById('quickAddGroup');
const breakNowContainer = document.getElementById('breakNowContainer');
const btnAction = document.getElementById('btnAction');
const btnSecondary = document.getElementById('btnSecondary');

// Dźwięk syntetyczny Web Audio API dla działania w przeglądarce / PWA
let audioCtx = null;
function playGentleSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.18); // A4

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 1.2);

        if ('vibrate' in navigator) {
            navigator.vibrate([300, 150, 300]);
        }
    } catch (err) {
        console.log('Audio playback error:', err);
    }
}

// Obsługa powiadomień systemowych (Windows / Chrome / PWA)
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(err => {
            console.log('Błąd żądania uprawnień powiadomień:', err);
        });
    }
}

function sendWorkEndNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification('Rusz się!', {
                body: 'Wstań, rozprostuj kości!',
                tag: 'work-end-alarm',
                renotify: true,
                requireInteraction: true
            });
        } catch (e) {
            console.log('Błąd wyświetlania powiadomienia:', e);
        }
    }
}

async function requestWakeLock() {
    if ('wakeLock' in navigator && !wakeLock) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {
            console.log('Wake Lock error:', e);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

function formatDisplay(totalSec, showSign = false) {
    const isNegative = totalSec < 0;
    const absVal = Math.floor(Math.abs(totalSec));
    const m = Math.floor(absVal / 60);
    const s = absVal % 60;
    const signPrefix = (showSign && isNegative && absVal > 0) ? '-' : '';
    return `${signPrefix}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateUI() {
    if (state === 'IDLE') {
        dialContainer.classList.add('dial-compact');
        statusBadge.textContent = 'PRACA';
        statusBadge.className = 'status-badge status-work';
        dialProgress.style.stroke = '#3b82f6';
        dialProgress.style.strokeDashoffset = '0';
        timeText.textContent = formatDisplay(workDurationSec);
        timeSub.textContent = 'GOTOWY';

        setupSection.style.display = 'flex';
        quickAddGroup.style.display = 'none';
        breakNowContainer.style.display = 'none';

        btnAction.textContent = 'Start';
        btnAction.className = 'btn-main btn-start';
        btnSecondary.textContent = 'Reset';
        btnSecondary.className = 'btn-main btn-reset';

    } else if (state === 'RUNNING_WORK' || state === 'PAUSED_WORK') {
        dialContainer.classList.remove('dial-compact');
        statusBadge.textContent = 'PRACA';
        statusBadge.className = 'status-badge status-work';
        dialProgress.style.stroke = '#3b82f6';
        timeText.textContent = formatDisplay(Math.max(0, currentRemainingSec));
        timeSub.textContent = state === 'RUNNING_WORK' ? 'W TOKU' : 'PAUZA';

        setupSection.style.display = 'none';
        quickAddGroup.style.display = 'flex';
        breakNowContainer.style.display = 'block';

        const progress = totalSpanSec > 0 ? (currentRemainingSec / totalSpanSec) : 0;
        dialProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));

        btnAction.textContent = state === 'RUNNING_WORK' ? 'Pauza' : 'Wznów';
        btnAction.className = state === 'RUNNING_WORK' ? 'btn-main btn-pause' : 'btn-main btn-start';
        btnSecondary.textContent = 'Zakończ';
        btnSecondary.className = 'btn-main btn-reset';

    } else if (state === 'ALARM_WORK') {
        dialContainer.classList.remove('dial-compact');
        statusBadge.textContent = 'RUSZ SIĘ!';
        statusBadge.className = 'status-badge status-alarm';
        dialProgress.style.stroke = '#ef4444';
        dialProgress.style.strokeDashoffset = '0';
        
        timeText.textContent = formatDisplay(currentRemainingSec, true);
        timeSub.textContent = 'PO CZASIE';

        setupSection.style.display = 'none';
        quickAddGroup.style.display = 'flex';
        breakNowContainer.style.display = 'none';

        // Lewy przycisk: Pomiń (szary)
        btnAction.textContent = 'Pomiń';
        btnAction.className = 'btn-main btn-start';

        // Prawy przycisk: Przerwa (zielony)
        btnSecondary.textContent = 'Przerwa';
        btnSecondary.className = 'btn-main btn-break';

    } else if (state === 'RUNNING_BREAK' || state === 'PAUSED_BREAK') {
        dialContainer.classList.remove('dial-compact');
        statusBadge.textContent = 'PRZERWA';
        statusBadge.className = 'status-badge status-break';
        dialProgress.style.stroke = '#10b981';

        setupSection.style.display = 'none';
        breakNowContainer.style.display = 'none';

        if (breakTargetDurationSec === 0) {
            quickAddGroup.style.display = 'none';
            timeText.textContent = formatDisplay(breakCountUpSec);
            timeSub.textContent = state === 'RUNNING_BREAK' ? 'STOPER (OD 0s)' : 'PAUZA';
            dialProgress.style.strokeDashoffset = '0';
        } else {
            quickAddGroup.style.display = 'flex';
            timeText.textContent = formatDisplay(Math.max(0, currentRemainingSec));
            timeSub.textContent = state === 'RUNNING_BREAK' ? 'W TOKU' : 'PAUZA';
            const progress = totalSpanSec > 0 ? (currentRemainingSec / totalSpanSec) : 0;
            dialProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
        }

        btnAction.textContent = state === 'RUNNING_BREAK' ? 'Pauza' : 'Wznów';
        btnAction.className = state === 'RUNNING_BREAK' ? 'btn-main btn-pause' : 'btn-main btn-break';
        btnSecondary.textContent = 'Koniec przerwy';
        btnSecondary.className = 'btn-main btn-break-end';

    } else if (state === 'ALARM_BREAK') {
        dialContainer.classList.remove('dial-compact');
        statusBadge.textContent = 'KONIEC PRZERWY!';
        statusBadge.className = 'status-badge status-alarm';
        dialProgress.style.stroke = '#ef4444';
        dialProgress.style.strokeDashoffset = '0';
        
        timeText.textContent = formatDisplay(currentRemainingSec, true);
        timeSub.textContent = 'PO CZASIE';

        setupSection.style.display = 'none';
        quickAddGroup.style.display = 'flex';
        breakNowContainer.style.display = 'none';

        btnAction.textContent = 'Wznów przerwę';
        btnAction.className = 'btn-main btn-break';
        btnSecondary.textContent = 'Koniec przerwy';
        btnSecondary.className = 'btn-main btn-break-end';
    }
}

function startLoop() {
    if (intervalId) clearInterval(intervalId);
    lastTimestamp = performance.now();
    intervalId = setInterval(tick, 200);
    requestWakeLock();
}

function stopLoop() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    releaseWakeLock();
}

function tick() {
    const now = performance.now();
    const deltaSec = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    if (state === 'RUNNING_WORK') {
        currentRemainingSec -= deltaSec;
        if (currentRemainingSec <= 0) {
            state = 'ALARM_WORK';
            playGentleSound();
            sendWorkEndNotification();
        }
        updateUI();
    } else if (state === 'ALARM_WORK') {
        currentRemainingSec -= deltaSec;
        updateUI();
    } else if (state === 'RUNNING_BREAK') {
        if (breakTargetDurationSec === 0) {
            breakCountUpSec += deltaSec;
        } else {
            currentRemainingSec -= deltaSec;
            if (currentRemainingSec <= 0) {
                state = 'ALARM_BREAK';
                playGentleSound();
            }
        }
        updateUI();
    } else if (state === 'ALARM_BREAK') {
        currentRemainingSec -= deltaSec;
        updateUI();
    }
}

function handlePrimaryAction() {
    requestNotificationPermission();

    if (state === 'IDLE') {
        totalSpanSec = workDurationSec;
        currentRemainingSec = workDurationSec;
        state = 'RUNNING_WORK';
        startLoop();
    } else if (state === 'RUNNING_WORK') {
        state = 'PAUSED_WORK';
        stopLoop();
    } else if (state === 'PAUSED_WORK') {
        state = 'RUNNING_WORK';
        startLoop();
    } else if (state === 'ALARM_WORK') {
        // Kliknięcie lewego przycisku ("Pomiń") w stanie alarmu pracy
        stopLoop();
        startWorkCycle();
    } else if (state === 'RUNNING_BREAK') {
        state = 'PAUSED_BREAK';
        stopLoop();
    } else if (state === 'PAUSED_BREAK') {
        state = 'RUNNING_BREAK';
        startLoop();
    } else if (state === 'ALARM_BREAK') {
        stopLoop();
        startBreakCycle();
    }
    updateUI();
}

function handleSecondaryAction() {
    if (state === 'RUNNING_WORK' || state === 'PAUSED_WORK') {
        resetToIdle();
    } else if (state === 'ALARM_WORK') {
        // Kliknięcie prawego przycisku ("Przerwa") w stanie alarmu pracy
        stopLoop();
        startBreakCycle();
    } else if (state === 'RUNNING_BREAK' || state === 'PAUSED_BREAK' || state === 'ALARM_BREAK') {
        stopLoop();
        startWorkCycle();
    } else if (state === 'IDLE') {
        resetToDefaults();
    }
    updateUI();
}

function triggerImmediateBreak() {
    stopLoop();
    startBreakCycle();
}

function startBreakCycle() {
    if (breakTargetDurationSec === 0) {
        breakCountUpSec = 0;
    } else {
        currentRemainingSec = breakTargetDurationSec;
        totalSpanSec = breakTargetDurationSec;
    }
    state = 'RUNNING_BREAK';
    startLoop();
    updateUI();
}

function startWorkCycle() {
    currentRemainingSec = workDurationSec;
    totalSpanSec = workDurationSec;
    state = 'RUNNING_WORK';
    startLoop();
    updateUI();
}

function resetToIdle() {
    stopLoop();
    state = 'IDLE';
    currentRemainingSec = workDurationSec;
    totalSpanSec = workDurationSec;
    updateUI();
}

function resetToDefaults() {
    stopLoop();
    state = 'IDLE';
    workDurationSec = DEFAULT_WORK_SEC;
    breakTargetDurationSec = DEFAULT_BREAK_SEC;
    currentRemainingSec = DEFAULT_WORK_SEC;
    totalSpanSec = DEFAULT_WORK_SEC;

    inputMin.value = '40';
    inputSec.value = '00';
    breakInputMin.value = '00';
    breakInputSec.value = '00';

    document.querySelectorAll('.preset-grid-3 .btn-preset').forEach((b, idx) => {
        b.classList.toggle('active-work', idx === 1);
    });
    document.querySelectorAll('.break-row-1 .btn-preset, .break-row-2 .btn-preset').forEach(b => {
        b.classList.remove('active-break');
    });
    document.querySelector('.break-row-1 .btn-preset').classList.add('active-break');

    updateUI();
}

function adjustWorkTime(seconds) {
    if (state !== 'IDLE') return;
    let newSec = workDurationSec + seconds;
    if (newSec < 1) newSec = 1;
    if (newSec > 5999) newSec = 5999;
    workDurationSec = newSec;
    currentRemainingSec = newSec;
    totalSpanSec = newSec;

    inputMin.value = Math.floor(newSec / 60);
    inputSec.value = String(newSec % 60).padStart(2, '0');
    clearPresetSelection('work');
    updateUI();
}

function manualWorkInputChanged() {
    let m = parseInt(inputMin.value) || 0;
    let s = parseInt(inputSec.value) || 0;
    if (m < 0) m = 0;
    if (s < 0) s = 0;
    if (s > 59) s = 59;
    let total = m * 60 + s;
    if (total < 1) total = 1;

    workDurationSec = total;
    currentRemainingSec = total;
    totalSpanSec = total;

    inputMin.value = m;
    inputSec.value = String(s).padStart(2, '0');
    clearPresetSelection('work');
    updateUI();
}

function adjustBreakTime(seconds) {
    if (state !== 'IDLE') return;
    let newSec = breakTargetDurationSec + seconds;
    if (newSec < 0) newSec = 0;
    if (newSec > 3599) newSec = 3599;
    breakTargetDurationSec = newSec;

    breakInputMin.value = String(Math.floor(newSec / 60)).padStart(2, '0');
    breakInputSec.value = String(newSec % 60).padStart(2, '0');
    clearPresetSelection('break');
}

function manualBreakInputChanged() {
    let m = parseInt(breakInputMin.value) || 0;
    let s = parseInt(breakInputSec.value) || 0;
    if (m < 0) m = 0;
    if (s < 0) s = 0;
    if (s > 59) s = 59;
    let total = m * 60 + s;

    breakTargetDurationSec = total;
    breakInputMin.value = String(m).padStart(2, '0');
    breakInputSec.value = String(s).padStart(2, '0');
    clearPresetSelection('break');
}

function setWorkPreset(seconds, btnElement) {
    workDurationSec = seconds;
    currentRemainingSec = seconds;
    totalSpanSec = seconds;

    inputMin.value = Math.floor(seconds / 60);
    inputSec.value = String(seconds % 60).padStart(2, '0');

    document.querySelectorAll('.preset-grid-3 .btn-preset').forEach(b => b.classList.remove('active-work'));
    if (btnElement) btnElement.classList.add('active-work');
    updateUI();
}

function setBreakPreset(seconds, btnElement) {
    breakTargetDurationSec = seconds;
    breakInputMin.value = String(Math.floor(seconds / 60)).padStart(2, '0');
    breakInputSec.value = String(seconds % 60).padStart(2, '0');

    document.querySelectorAll('.break-row-1 .btn-preset, .break-row-2 .btn-preset').forEach(b => b.classList.remove('active-break'));
    if (btnElement) btnElement.classList.add('active-break');
}

function clearPresetSelection(type) {
    if (type === 'work') {
        document.querySelectorAll('.preset-grid-3 .btn-preset').forEach(b => b.classList.remove('active-work'));
    } else {
        document.querySelectorAll('.break-row-1 .btn-preset, .break-row-2 .btn-preset').forEach(b => b.classList.remove('active-break'));
    }
}

function addSeconds(secToAdd) {
    if (state === 'RUNNING_WORK' || state === 'PAUSED_WORK') {
        currentRemainingSec += secToAdd;
        totalSpanSec += secToAdd;
    } else if (state === 'ALARM_WORK') {
        const newTime = currentRemainingSec + secToAdd;
        currentRemainingSec = newTime > 0 ? newTime : 0;
        totalSpanSec = currentRemainingSec;
        if (currentRemainingSec > 0) {
            state = 'RUNNING_WORK';
        }
    } else if (state === 'RUNNING_BREAK' || state === 'PAUSED_BREAK') {
        if (breakTargetDurationSec > 0) {
            currentRemainingSec += secToAdd;
            totalSpanSec += secToAdd;
        }
    } else if (state === 'ALARM_BREAK') {
        const newTime = currentRemainingSec + secToAdd;
        currentRemainingSec = newTime > 0 ? newTime : 0;
        totalSpanSec = currentRemainingSec;
        if (currentRemainingSec > 0) {
            state = 'RUNNING_BREAK';
        }
    } else if (state === 'IDLE') {
        adjustWorkTime(secToAdd);
    }
    updateUI();
}

// Obsługa powrotu do aplikacji po wybudzeniu
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        lastTimestamp = performance.now();
        if (state === 'RUNNING_WORK' || state === 'RUNNING_BREAK' || state === 'ALARM_WORK' || state === 'ALARM_BREAK') {
            requestWakeLock();
        }
        updateUI();
    }
});

// Inicjalizacja przy pierwszym uruchomieniu
window.addEventListener('DOMContentLoaded', () => {
    updateUI();
});