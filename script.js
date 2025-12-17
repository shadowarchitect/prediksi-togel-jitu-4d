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

  /* =====================
     STATE
  ====================== */
  const userData = {
    feeling: '',
    history: [],
    bbfs: '',
    results: {}
  };

  /* =====================
     BUTTON FLOW - UPDATED
  ====================== */
  qs('#btnMulai').onclick = () => showPage('page-input');
  qs('#btnBack').onclick  = () => showPage('page-country');
  qs('#btnStartIntro').onclick = () => showPage('page-country');

  qs('#btnNextFeeling').onclick = () => {
    const v = qs('#feelingInput').value.trim();
    if (v.length !== 4 || !onlyDigits(v)) {
      alert('Isi 4 angka');
      return;
    }
    userData.feeling = v;
    // Tampilkan page pilihan history
    showPage('page-history-choice');
  };

  // Tombol History Choice
  qs('#btnWithHistory').onclick = () => showPage('page-history');
  qs('#btnSkipHistory').onclick = () => {
    userData.history = [];
    generateBBFSAndResults();
  };

  qs('#btnFeeling').onclick  = () => showPage('page-history-choice');
  qs('#btnBocoran').onclick = () => showPage('page-education');

  qs('#btnEduNext').onclick = () => {
    qs('#feelingInput').value = '';
    showPage('page-input');
  };

  // LOGIC HISTORY - OPTIONAL (tidak wajib)
  qs('#btnHistoryNext').onclick = () => {
    const history = [...qsa('.history')].map(i => i.value.trim());

    // Filter hanya yang diisi
    const filledHistory = history.filter(h => h.length > 0);
    
    // Tidak ada history? Valid (skip history)
    if (filledHistory.length === 0) {
      userData.history = [];
      generateBBFSAndResults();
      return;
    }

    // Validasi format untuk yang diisi
    if (filledHistory.some(h => h.length !== 4 || !onlyDigits(h))) {
      alert('History harus 4 digit');
      return;
    }

    // Validasi duplikat antar history
    const uniqueHistory = [...new Set(filledHistory)];
    if (uniqueHistory.length !== filledHistory.length) {
      alert('History tidak boleh ada yang sama');
      return;
    }

    if (filledHistory.includes(userData.feeling)) {
      alert('History tidak boleh sama dengan feeling');
      return;
    }

    userData.history = filledHistory;
    generateBBFSAndResults();
  };

  /* =====================
     GENERATE BBFS 7D (FEELING + 3 RANDOM, MAX 2 DUPS)
  ====================== */
  function generateBBFS7D(feeling) {
    let digits = feeling.split('');
    
    // Tambah 3 digit random
    for(let i = 0; i < 3; i++) {
      digits.push(randDigit());
    }
    
    // Validasi: tidak ada digit muncul 3x
    let valid = false;
    while(!valid) {
      const digitCount = {};
      digits.forEach(d => {
        digitCount[d] = (digitCount[d] || 0) + 1;
      });
      
      // Cek apakah ada digit muncul 3x atau lebih
      const hasTriple = Object.values(digitCount).some(count => count >= 3);
      
      if(hasTriple) {
        // Ganti random digit terakhir
        digits[digits.length - 1] = randDigit();
      } else {
        valid = true;
      }
    }
    
    // Shuffle final
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
      (digits[0] + digits[2] + digits[3] + digits[5] + digits[6]).join('')
    ];
    
    return { bbfs6d, bbfs5d };
  }

  /* =====================
     GENERATE RESULTS (4D/3D/2D/COLOK) - UPDATED 8 RESULTS
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

    /* ---- 2D JAGA (5 + BB = 10) ---- */
    const main2d = [];
    while (main2d.length < 5) {
      const n = shuffle(d).slice(0,2).join('');
      if (n.length === 2 && !main2d.includes(n)) main2d.push(n);
    }

    const set2d = [];
    main2d.forEach(n => {
      if (n.length === 2) {
        set2d.push(n);
        set2d.push(n[1] + n[0]);
      }
    });

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
      div.style.cssText = 'margin-top:20px;font-size:14px;color:#666;text-align:left;max-width:400px;margin:20px auto;font-family:monospace;';
      qs('.progress-container').parentNode.appendChild(div);
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
        
        // Add log with typewriter effect
        const logLine = document.createElement('div');
        logLine.innerHTML = step.log;
        logContainer.appendChild(logLine);
        
        // Scroll log to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
        
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Short delay before showing results
        setTimeout(() => {
          renderResult();
          showPage('page-result');
        }, 500);
      }
    }, 1500); // 1.5 detik per step
  }

  /* =====================
     RENDER RESULT PAGE
  ====================== */
  function renderResult() {
    // Render BBFS 7D
    const bbfsBox = qs('#bbfsBox');
    if (bbfsBox) {
      bbfsBox.innerHTML = '';
      userData.bbfs.split('').forEach(d => {
        const s = document.createElement('span');
        s.textContent = d;
        bbfsBox.appendChild(s);
      });
    }
    
    // Setup result sections
    qs('#resMain').classList.add('hidden');
    qs('#resColok').classList.add('hidden');
    qs('#resBBFS').classList.add('hidden');
    
    // Button untuk BBFS Ladder (NEW)
    qs('#btnBbfsSet').onclick = () => {
      qs('#resMain').classList.add('hidden');
      qs('#resColok').classList.add('hidden');
      const el = qs('#resBBFS');
      el.classList.remove('hidden');
      el.innerHTML = 
        'BBFS 7 DIGIT<br>' + userData.bbfs + '<br><br>' +
        'BBFS 6 DIGIT<br>' + userData.ladder.bbfs6d.join(' ') + '<br><br>' +
        'BBFS 5 DIGIT<br>' + userData.ladder.bbfs5d.join(' ');
    };
    
    // Button untuk Main Set (EXISTING)
    qs('#btnMainSet').onclick = () => {
      qs('#resColok').classList.add('hidden');
      qs('#resBBFS').classList.add('hidden');
      const el = qs('#resMain');
      el.classList.remove('hidden');
      el.innerHTML =
        '4D PREDIKSI JITU SET<br>' + userData.results.set4d.join(' ') + '<br><br>' +
        '3D ANGKA JAGA<br>' + userData.results.set3d.join(' ') + '<br><br>' +
        '2D ANGKA JAGA<br>' + userData.results.set2d.join(' ');
    };
    
    // Button untuk Colok Set (EXISTING)
    qs('#btnColokSet').onclick = () => {
      qs('#resMain').classList.add('hidden');
      qs('#resBBFS').classList.add('hidden');
      const el = qs('#resColok');
      el.classList.remove('hidden');
      el.innerHTML =
        'COLOK 1D<br>' + userData.results.cb1d.join(' ') + '<br><br>' +
        'COLOK 2D<br>' + userData.results.cb2d.join(' ') + '<br><br>' +
        'COLOK 3D<br>' + userData.results.cb3d.join(' ');
    };
  }

  // Initialize
  showPage('page-intro');

});
