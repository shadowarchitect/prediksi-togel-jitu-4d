document.addEventListener('DOMContentLoaded', () => {

  /* =====================
     SHORTCUT
  ====================== */
  const qs  = s => document.querySelector(s);
  const qsa = s => document.querySelectorAll(s);

  /* =====================
     PAGE NAV
  ====================== */
  const pages = qsa('.section');
  const showPage = id => {
    pages.forEach(p => p.classList.add('hidden'));
    const el = qs('#' + id);
    if (el) el.classList.remove('hidden');
    window.scrollTo(0, 0);
  };

  /* =====================
     UTIL
  ====================== */
  const onlyDigits = s => /^[0-9]+$/.test(s);
  const randDigit = () => Math.floor(Math.random() * 10).toString();

  const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const getTodayDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  };

  /* =====================
     STATE
  ====================== */
  const userData = {
    country: 'Singapore',
    feeling: '',
    history: [],
    bbfs: '',
    ladder: { bbfs6d: [], bbfs5d: [] },
    results: {},
    currentView: 'main' // 'main' or 'colok'
  };

  /* =====================
     BUTTON FLOW - UPDATED
  ====================== */
  qs('#btnStartIntro').onclick = () => showPage('page-country');
  
  qs('#btnMulai').onclick = () => {
    userData.country = qs('#countrySelect').value;
    showPage('page-input');
  };
  
  qs('#btnBack').onclick = () => showPage('page-country');

  qs('#btnNextFeeling').onclick = () => {
    const v = qs('#feelingInput').value.trim();
    if (v.length !== 4 || !onlyDigits(v)) {
      alert('Isi 4 angka');
      return;
    }
    userData.feeling = v;
    showPage('page-history-choice');
  };

  // History Choice Buttons
  qs('#btnWithHistory').onclick = () => showPage('page-history');
  
  qs('#btnSkipHistory').onclick = () => {
    userData.history = [];
    generateBBFSAndResults();
  };

  // History Next Button
  qs('#btnHistoryNext').onclick = () => {
    const history = [...qsa('.history')].map(i => i.value.trim());
    const filledHistory = history.filter(h => h.length > 0);
    
    // Allow empty history
    if (filledHistory.length === 0) {
      userData.history = [];
      generateBBFSAndResults();
      return;
    }

    // Validate filled history
    if (filledHistory.some(h => h.length !== 4 || !onlyDigits(h))) {
      alert('History harus 4 digit angka');
      return;
    }

    // Check for duplicates
    const uniqueHistory = [...new Set(filledHistory)];
    if (uniqueHistory.length !== filledHistory.length) {
      alert('History tidak boleh ada yang sama');
      return;
    }

    // Check if history matches feeling
    if (filledHistory.includes(userData.feeling)) {
      alert('History tidak boleh sama dengan feeling');
      return;
    }

    userData.history = filledHistory;
    generateBBFSAndResults();
  };

  // Education page
  qs('#btnEduNext').onclick = () => {
    qs('#feelingInput').value = '';
    showPage('page-input');
  };

  // Result page buttons
  qs('#btnHome').onclick = () => showPage('page-intro');
  qs('#btnDonate').onclick = () => showPage('page-donation');
  qs('#btnBackHome').onclick = () => showPage('page-intro');

  // Generate Again Button
  qs('#btnGenerateAgain').onclick = () => {
    generateBBFSAndResults();
  };

  /* =====================
     GENERATE BBFS 7D (FEELING + 3 RANDOM, MAX 2 DUPS)
  ====================== */
  function generateBBFS7D(feeling) {
    let digits = feeling.split('');
    
    // Add 3 random digits
    for(let i = 0; i < 3; i++) {
      digits.push(randDigit());
    }
    
    // Validate: no digit appears 3+ times
    let valid = false;
    let attempts = 0;
    while(!valid && attempts < 50) {
      const digitCount = {};
      digits.forEach(d => {
        digitCount[d] = (digitCount[d] || 0) + 1;
      });
      
      const hasTriple = Object.values(digitCount).some(count => count >= 3);
      
      if(hasTriple) {
        digits[digits.length - 1] = randDigit();
      } else {
        valid = true;
      }
      attempts++;
    }
    
    return shuffle(digits).join('');
  }

  /* =====================
     GENERATE BBFS 6D DAN 5D DARI 7D
  ====================== */
  function generateBBFSLadder(bbfs7d) {
    const digits = bbfs7d.split('');
    
    // BBFS 6D - 2 results
    const bbfs6d = [
      digits.slice(0, 6).join(''),
      digits.slice(1, 7).join('')
    ];
    
    // BBFS 5D - 4 results
    const bbfs5d = [
      digits.slice(0, 5).join(''),
      digits.slice(1, 6).join(''),
      digits.slice(2, 7).join(''),
      [digits[0], digits[2], digits[3], digits[5], digits[6]].join('')
    ];
    
    return { bbfs6d, bbfs5d };
  }

  /* =====================
     GENERATE RESULTS (4D/3D/2D/COLOK) - UPDATED 8 RESULTS FOR 4D/3D
  ====================== */
  function generateResults(bbfs) {
    const d = bbfs.split('');

    /* ---- 4D SET (8 RESULTS) ---- */
    const set4d = [];
    while (set4d.length < 8) {
      const n = shuffle(d).slice(0,4).join('');
      if (!set4d.includes(n)) set4d.push(n);
    }

    /* ---- 3D JAGA (8 RESULTS) ---- */
    const set3d = [];
    while (set3d.length < 8) {
      const n = shuffle(d).slice(0,3).join('');
      if (!set3d.includes(n)) set3d.push(n);
    }

    /* ---- 2D JAGA (5 RESULTS) ---- */
    const set2d = [];
    while (set2d.length < 5) {
      const n = shuffle(d).slice(0,2).join('');
      if (n.length === 2 && !set2d.includes(n)) set2d.push(n);
    }

    /* ---- COLOK ---- */
    // 1D
    const cb1d = [...new Set(d)].slice(0,3);

    // 2D follow cb1d
    const cb2d = [];
    for (let i = 0; i < cb1d.length; i++) {
      for (let j = i + 1; j < cb1d.length; j++) {
        const a = cb1d[i];
        const b = cb1d[j];
        if (a && b) cb2d.push(a + b);
      }
    }

    // 3D follow cb2d + bbfs
    const cb3d = [];
    let idx = 0;
    cb2d.forEach(pair => {
      if (pair.length === 2) {
        cb3d.push(pair + d[idx % d.length]);
        idx++;
      }
    });

    return {
      set4d,
      set3d,
      set2d,
      cb1d,
      cb2d,
      cb3d
    };
  }

  /* =====================
     MAIN GENERATION FUNCTION
  ====================== */
  function generateBBFSAndResults() {
    // Generate BBFS 7D
    userData.bbfs = generateBBFS7D(userData.feeling);
    
    // Generate BBFS Ladder (6D, 5D)
    userData.ladder = generateBBFSLadder(userData.bbfs);
    
    // Generate Results (4D/3D/2D/Colok)
    userData.results = generateResults(userData.bbfs);
    
    // Run Processing Animation
    runProcessing();
  }

  /* =====================
     FAKE PROCESSING - REALISTIC VERSION
  ====================== */
  function runProcessing() {
    showPage('page-processing');
    
    const fill = qs('.progress-fill');
    const text = qs('.progress-text');
    const logContainer = qs('.process-log') || (() => {
      const div = document.createElement('div');
      div.className = 'process-log';
      qs('.progress-section').appendChild(div);
      return div;
    })();
    
    logContainer.innerHTML = '';
    
    const steps = [
      {percent: 25, text: "Feeling nomor user diterima", 
       log: `✓ FEELING DITERIMA: ${userData.feeling.split('').join(' ')}`},
      
      {percent: 50, text: "Menganalisa data number dari sistem", 
       log: `⏳ MENGAKSES DATABASE: 5,247 hasil sebelumnya<br>✓ DATA TERLOAD 100%`},
      
      {percent: 75, text: "Menganalisa pola bandar dari hasil sebelumnya", 
       log: `⏳ MENDETEKSI POLA BANDAR: 7 hari terakhir<br>${userData.history.length > 0 ? '✓ POLA HISTORY TERANALISA' : '✓ TANPA HISTORY, GUNAKAN DATA SISTEM'}`},
      
      {percent: 90, text: "Menghitung probabilitas untuk hari ini", 
       log: `⏳ MENGHITUNG PROBABILITAS...<br>✓ BBFS GENERATED: ${userData.bbfs.split('').join(' ')}`},
      
      {percent: 100, text: "Nomor prediksi sudah selesai !", 
       log: `✅ NOMOR PREDIKSI SUDAH SELESAI!`}
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        fill.style.width = step.percent + '%';
        text.textContent = step.text;
        
        const logLine = document.createElement('div');
        logLine.innerHTML = step.log;
        logLine.style.marginBottom = '10px';
        logContainer.appendChild(logLine);
        
        logContainer.scrollTop = logContainer.scrollHeight;
        
        currentStep++;
      } else {
        clearInterval(interval);
        
        setTimeout(() => {
          renderResult();
          showPage('page-result');
        }, 500);
      }
    }, 1500);
  }

  /* =====================
     RENDER RESULT PAGE
  ====================== */
  function renderResult() {
    // Render BBFS 7D
    const bbfsBox = qs('#bbfsBox');
    if (bbfsBox) {
      bbfsBox.innerHTML = '';
      userData.bbfs.split('').forEach((d, index) => {
        const span = document.createElement('span');
        span.className = 'bbfs-digit';
        span.textContent = d;
        span.style.animationDelay = `${index * 0.1}s`;
        bbfsBox.appendChild(span);
      });
    }
    
    // Render BBFS 6D
    const bbfs6dBox = qs('#bbfs6dBox');
    if (bbfs6dBox) {
      bbfs6dBox.innerHTML = '';
      userData.ladder.bbfs6d.forEach(num => {
        const div = document.createElement('div');
        div.className = 'bbfs-ladder-item';
        div.textContent = num;
        bbfs6dBox.appendChild(div);
      });
    }
    
    // Render BBFS 5D
    const bbfs5dBox = qs('#bbfs5dBox');
    if (bbfs5dBox) {
      bbfs5dBox.innerHTML = '';
      userData.ladder.bbfs5d.forEach(num => {
        const div = document.createElement('div');
        div.className = 'bbfs-ladder-item';
        div.textContent = num;
        bbfs5dBox.appendChild(div);
      });
    }
    
    // Setup result sections
    qs('#resMain').classList.add('hidden');
    qs('#resColok').classList.add('hidden');
    qs('#shareSection').classList.add('hidden');
    
    // Button untuk Main Set
    qs('#btnMainSet').onclick = () => {
      qs('#btnMainSet').classList.add('active');
      qs('#btnColokSet').classList.remove('active');
      qs('#resColok').classList.add('hidden');
      const el = qs('#resMain');
      el.classList.remove('hidden');
      
      userData.currentView = 'main';
      
      let html = '<div class="result-title">🎯 PREDIKSI UTAMA</div>';
      
      // 4D SET (8 results, 2 columns)
      html += '<div style="margin-bottom: 25px;">';
      html += '<div style="color: #7b3ff2; font-size: 14px; margin-bottom: 10px; font-weight: 600;">4D PREDIKSI JITU SET</div>';
      html += '<div class="result-grid">';
      userData.results.set4d.forEach(num => {
        html += `<div class="result-number">${num}</div>`;
      });
      html += '</div></div>';
      
      // 3D SET (8 results, 2 columns)
      html += '<div style="margin-bottom: 25px;">';
      html += '<div style="color: #7b3ff2; font-size: 14px; margin-bottom: 10px; font-weight: 600;">3D ANGKA JAGA</div>';
      html += '<div class="result-grid">';
      userData.results.set3d.forEach(num => {
        html += `<div class="result-number">${num}</div>`;
      });
      html += '</div></div>';
      
      // 2D SET (5 results, 2 columns with last centered)
      html += '<div>';
      html += '<div style="color: #7b3ff2; font-size: 14px; margin-bottom: 10px; font-weight: 600;">2D ANGKA JAGA</div>';
      html += '<div class="result-grid-2d">';
      userData.results.set2d.forEach(num => {
        html += `<div class="result-number">${num}</div>`;
      });
      html += '</div></div>';
      
      el.innerHTML = html;
      
      // Show share section
      qs('#shareSection').classList.remove('hidden');
    };

    // Button untuk Colok Set
    qs('#btnColokSet').onclick = () => {
      qs('#btnColokSet').classList.add('active');
      qs('#btnMainSet').classList.remove('active');
      qs('#resMain').classList.add('hidden');
      const el = qs('#resColok');
      el.classList.remove('hidden');
      
      userData.currentView = 'colok';
      
      let html = '<div class="result-title">🔄 COLOK BEBAS</div>';
      
      html += '<div style="margin-bottom: 25px;">';
      html += '<div style="color: #00d4ff; font-size: 14px; margin-bottom: 10px; font-weight: 600;">COLOK 1D</div>';
      html += '<div class="result-grid">';
      userData.results.cb1d.forEach(num => {
        html += `<div class="result-number">${num}</div>`;
      });
      html += '</div></div>';
      
      html += '<div style="margin-bottom: 25px;">';
      html += '<div style="color: #00d4ff; font-size: 14px; margin-bottom: 10px; font-weight: 600;">COLOK 2D</div>';
      html += '<div class="result-grid">';
      userData.results.cb2d.forEach(num => {
        html += `<div class="result-number">${num}</div>`;
      });
      html += '</div></div>';
      
      html += '<div>';
      html += '<div style="color: #00d4ff; font-size: 14px; margin-bottom: 10px; font-weight: 600;">COLOK 3D</div>';
      html += '<div class="result-grid">';
      userData.results.cb3d.forEach(num => {
        html += `<div class="result-number">${num}</div>`;
      });
      html += '</div></div>';
      
      el.innerHTML = html;
      
      // Show share section
      qs('#shareSection').classList.remove('hidden');
    };

    // Default show main set
    qs('#btnMainSet').click();
  }

  /* =====================
     SHARE FUNCTIONALITY
  ====================== */
  function generateShareText() {
    const date = getTodayDate();
    const country = userData.country;
    
    let text = `🤖 AI PREDIKSI TOGEL 4D\n\n`;
    text += `📅 ${date}\n`;
    text += `🎯 Pasar: ${country}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n`;
    text += `7D BBFS: ${userData.bbfs.split('').join(' ')}\n`;
    text += `6D BBFS: ${userData.ladder.bbfs6d.join(' | ')}\n`;
    text += `5D BBFS: ${userData.ladder.bbfs5d.join(' | ')}\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (userData.currentView === 'main') {
      text += `4D PREDIKSI JITU SET:\n`;
      for (let i = 0; i < userData.results.set4d.length; i += 2) {
        text += `${userData.results.set4d[i]} ${userData.results.set4d[i+1] || ''}\n`;
      }
      
      text += `\n3D ANGKA JAGA:\n`;
      for (let i = 0; i < userData.results.set3d.length; i += 2) {
        text += `${userData.results.set3d[i]} ${userData.results.set3d[i+1] || ''}\n`;
      }
      
      text += `\n2D ANGKA JAGA:\n`;
      text += `${userData.results.set2d.join(' | ')}\n`;
    } else {
      text += `COLOK 1D: ${userData.results.cb1d.join(' ')}\n`;
      text += `COLOK 2D: ${userData.results.cb2d.join(' ')}\n`;
      text += `COLOK 3D: ${userData.results.cb3d.join(' ')}\n`;
    }
    
    text += `\n━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ Coba prediksi sendiri:\n`;
    text += `${window.location.href}\n\n`;
    text += `⚠️ Main dengan bijak & tanggung jawab sendiri`;
    
    return text;
  }

  // WhatsApp Share
  qs('#btnShareWhatsApp').onclick = () => {
    const text = generateShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Telegram Share
  qs('#btnShareTelegram').onclick = () => {
    const text = generateShareText();
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Copy Text
  qs('#btnCopyText').onclick = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Prediksi berhasil dicopy ke clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Prediksi berhasil dicopy ke clipboard!');
    });
  };

  /* =====================
     INIT
  ====================== */
  showPage('page-intro');

});
