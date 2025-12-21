document.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded');

  /* =====================
     SHORTCUT
  ====================== */
  const qs  = s => document.querySelector(s);
  const qsa = s => document.querySelectorAll(s);

  /* =====================
     PAGE NAV - FIXED
  ====================== */
  const showPage = id => {
    // Hide semua section/page
    qsa('.section, .page').forEach(p => p.classList.add('hidden'));
    const el = qs('#' + id);
    if (el) {
      el.classList.remove('hidden');
      console.log('Showing page:', id);
    } else {
      console.error('Page not found:', id);
    }
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
    ladder: {},
    results: {}
  };

 /* =====================
     BUTTON FLOW - MINIMAL FIX
  ====================== */
  // Intro -> Country
  qs('#btnStartIntro').onclick = () => {
    console.log('btnStartIntro clicked');
    showPage('page-country');
  };

  // Country -> Input
  qs('#btnMulai').onclick = () => {
    console.log('btnMulai clicked');
    showPage('page-input');
  };

  // Back button
  qs('#btnBack').onclick = () => {
    console.log('Back clicked');
    showPage('page-country');
  };

  // Input -> Questionnaire (CHANGED: was page-history-choice)
  qs('#btnNextFeeling').onclick = () => {
    const v = qs('#feelingInput').value.trim();
    console.log('Feeling input:', v);
    
    if (v.length !== 4 || !onlyDigits(v)) {
      alert('Isi 4 angka');
      return;
    }
    
    userData.feeling = v;
    console.log('User feeling set:', userData.feeling);
    showPage('page-question'); // ← ONLY CHANGE HERE
  };

  // Questionnaire -> History Input (jika pilih FEELING)
  qs('#btnFeeling').onclick = () => {
    console.log('Feeling clicked');
    qs('#btnFeeling').classList.add('active');
    qs('#btnBocoran').classList.remove('active');
    setTimeout(() => showPage('page-history'), 300);
  };

  // Questionnaire -> Education (jika pilih BOCORAN) 
  qs('#btnBocoran').onclick = () => {
    console.log('Bocoran clicked');
    qs('#btnBocoran').classList.add('active');
    qs('#btnFeeling').classList.remove('active');
    setTimeout(() => showPage('page-education'), 300);
  };

  // Education -> Back to Input Feeling
  qs('#btnEduNext').onclick = () => {
    console.log('Education next');
    qs('#feelingInput').value = '';
    showPage('page-input');
  };

  // SKIP HISTORY (tetap sama)
  qs('#btnSkipHistory').onclick = () => {
    console.log('Skip history clicked');
    userData.history = [];
    console.log('Generating BBFS...');
    generateBBFSAndResults();
  };

  // History Input -> Generate (tetap sama)
  qs('#btnHistoryNext').onclick = () => {
    console.log('History next clicked');
    const history = [...qsa('.history')].map(i => i.value.trim());
    const filledHistory = history.filter(h => h.length > 0);
    
    console.log('Filled history:', filledHistory);
    
    if (filledHistory.length > 0) {
      if (filledHistory.some(h => h.length !== 4 || !onlyDigits(h))) {
        alert('History harus 4 digit angka');
        return;
      }

      const uniqueHistory = [...new Set(filledHistory)];
      if (uniqueHistory.length !== filledHistory.length) {
        alert('History tidak boleh ada angka yang sama');
        return;
      }

      if (filledHistory.includes(userData.feeling)) {
        alert('History tidak boleh sama dengan feeling');
        return;
      }
    }
    
    userData.history = filledHistory;
    console.log('Generating BBFS with history...');
    generateBBFSAndResults();
  };

  // Other buttons (tetap sama)
  qs('#btnHome').onclick = () => showPage('page-intro');
  qs('#btnDonate').onclick = () => showPage('page-donation');
  qs('#btnBackHome').onclick = () => showPage('page-intro');

  /* =====================
     BBFS GENERATION - FIXED (SHUFFLED LADDER)
  ====================== */
  function generateBBFS7D(feeling) {
    console.log('Generating BBFS from feeling:', feeling);
    
    let digits = feeling.split('');
    console.log('Initial digits:', digits);
    
    // Add 3 random digits
    for(let i = 0; i < 3; i++) {
      digits.push(randDigit());
    }
    console.log('After adding random:', digits);
    
    // Validate: no digit appears 3x
    let valid = false;
    let attempts = 0;
    
    while(!valid && attempts < 20) {
      const digitCount = {};
      digits.forEach(d => {
        digitCount[d] = (digitCount[d] || 0) + 1;
      });
      
      console.log('Digit count:', digitCount);
      
      const hasTriple = Object.values(digitCount).some(count => count >= 3);
      
      if(hasTriple) {
        console.log('Has triple, regenerating...');
        digits[4 + (attempts % 3)] = randDigit();
        attempts++;
      } else {
        valid = true;
      }
    }
    
    const result = shuffle(digits).join('');
    console.log('Final BBFS 7D:', result);
    return result;
  }

  function generateBBFSLadder(bbfs7d) {
    console.log('Generating shuffled ladder from:', bbfs7d);
    const digits = bbfs7d.split('');
    
    // BBFS 6D - shuffled (not sequential)
    const bbfs6d = [];
    while (bbfs6d.length < 2) {
      const shuffled = shuffle([...digits]);
      const num = shuffled.slice(0, 6).join('');
      if (!bbfs6d.includes(num)) bbfs6d.push(num);
    }
    
    // BBFS 5D - shuffled (not sequential)
    const bbfs5d = [];
    while (bbfs5d.length < 4) {
      const shuffled = shuffle([...digits]);
      const num = shuffled.slice(0, 5).join('');
      if (!bbfs5d.includes(num)) bbfs5d.push(num);
    }
    
    console.log('BBFS 6D (shuffled):', bbfs6d);
    console.log('BBFS 5D (shuffled):', bbfs5d);
    
    return { bbfs6d, bbfs5d };
  }

  function generateResults(bbfs) {
    console.log('Generating results from BBFS:', bbfs);
    const d = bbfs.split('');

    // 4D SET - 8 results
    const set4d = [];
    while (set4d.length < 8) {
      const n = shuffle(d).slice(0,4).join('');
      if (!set4d.includes(n)) set4d.push(n);
    }

    // 3D JAGA - 8 results
    const set3d = [];
    while (set3d.length < 8) {
      const n = shuffle(d).slice(0,3).join('');
      if (!set3d.includes(n)) set3d.push(n);
    }

    // 2D JAGA - 5 + mirror = 10 results
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

    // COLOK
    const cb1d = [...new Set(d)].slice(0,3);

    const cb2d = [];
    for (let i = 0; i < cb1d.length; i++) {
      for (let j = i + 1; j < cb1d.length; j++) {
        cb2d.push(cb1d[i] + cb1d[j]);
      }
    }

    const cb3d = [];
    let idx = 0;
    cb2d.forEach(pair => {
      if (pair.length === 2) {
        cb3d.push(pair + d[idx % d.length]);
        idx++;
      }
    });

    const results = { set4d, set3d, set2d, cb1d, cb2d, cb3d };
    console.log('Generated results:', results);
    return results;
  }

  function generateBBFSAndResults() {
    console.log('=== START GENERATION ===');
    console.log('User data:', userData);
    
    try {
      // 1. Generate BBFS 7D
      userData.bbfs = generateBBFS7D(userData.feeling);
      
      // 2. Generate shuffled ladder
      userData.ladder = generateBBFSLadder(userData.bbfs);
      
      // 3. Generate results
      userData.results = generateResults(userData.bbfs);
      
      console.log('Generation successful!');
      console.log('Final userData:', userData);
      
      // 4. Run processing
      runProcessing();
      
    } catch (error) {
      console.error('ERROR in generateBBFSAndResults:', error);
      alert('Terjadi error: ' + error.message);
    }
  }

  /* =====================
     PROCESSING ANIMATION - SIMPLIFIED
  ====================== */
  function runProcessing() {
    console.log('Running processing...');
    showPage('page-processing');
    
    const fill = qs('#progressFill');
    const text = qs('#progressText');
    
    let progress = 0;
    const steps = [
      'Membaca data feeling...',
      'Menganalisa pola...',
      'Menghitung probabilitas...',
      'Menyusun prediksi...'
    ];
    
    let step = 0;
    
    const interval = setInterval(() => {
      progress += 25;
      if (progress > 100) progress = 100;
      
      fill.style.width = progress + '%';
      
      if (step < steps.length) {
        text.textContent = steps[step];
        step++;
      }
      
      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          console.log('Processing complete, showing result...');
          renderResult();
          showPage('page-result');
        }, 800);
      }
    }, 800);
  }

  /* =====================
     RENDER RESULT - FOR NEW UI (BBFS VISIBLE FIRST)
  ====================== */
  function renderResult() {
    console.log('Render Result - Clean UI');
    
    // 1. BBFS 7D - KOTAK TERPISAH (SUDAH BAGUS)
    const bbfs7dBox = qs('#bbfs7dBox');
    if (bbfs7dBox) {
        bbfs7dBox.innerHTML = '';
        userData.bbfs.split('').forEach((d, index) => {
            const span = document.createElement('span');
            span.className = 'bbfs-digit';  // PAKAI CLASS CSS
            span.textContent = d;
            span.style.animationDelay = `${index * 0.1}s`;
            bbfs7dBox.appendChild(span);
        });
    }

    // 2. BBFS 6D - KOTAK TERPISAH JUGA
    const bbfs6dBox = qs('#bbfs6dBox');
    if (bbfs6dBox) {
        bbfs6dBox.innerHTML = '';
        
        // Untuk tiap 6-digit number
        userData.ladder.bbfs6d.forEach((num, rowIndex) => {
            // Buat baris baru
            const rowDiv = document.createElement('div');
            rowDiv.className = 'bbfs-row'; // CSS nanti kita buat
            
            // Split jadi per digit
            const digits = num.split('');
            digits.forEach((digit, digitIndex) => {
                const span = document.createElement('span');
                span.className = 'bbfs-digit-small'; // Class khusus 6D/5D
                span.textContent = digit;
                rowDiv.appendChild(span);
            });
            
            bbfs6dBox.appendChild(rowDiv);
        });
    }

    // 3. BBFS 5D - KOTAK TERPISAH JUGA
    const bbfs5dBox = qs('#bbfs5dBox');
    if (bbfs5dBox) {
        bbfs5dBox.innerHTML = '';
        
        // Untuk tiap 5-digit number
        userData.ladder.bbfs5d.forEach((num, rowIndex) => {
            // Buat baris baru
            const rowDiv = document.createElement('div');
            rowDiv.className = 'bbfs-row';
            
            // Split jadi per digit
            const digits = num.split('');
            digits.forEach((digit, digitIndex) => {
                const span = document.createElement('span');
                span.className = 'bbfs-digit-small';
                span.textContent = digit;
                rowDiv.appendChild(span);
            });
            
            bbfs5dBox.appendChild(rowDiv);
        });
    }

    // Setup tabs for 4D3D2D and Colok
    qs('#resMain').classList.add('hidden');
    qs('#resColok').classList.add('hidden');

    // Button for Main Set (4D/3D/2D)
    qs('#btnMainSet').onclick = () => {
      qs('#resColok').classList.add('hidden');
      const el = qs('#resMain');
      el.classList.remove('hidden');
      
      // Render 4D
      const set4dEl = qs('#set4d');
      if(set4dEl) {
        set4dEl.innerHTML = '';
        userData.results.set4d.forEach(num => {
          const div = document.createElement('div');
          div.textContent = num;
          div.style.textAlign = 'center';
          div.style.padding = '8px';
          div.style.margin = '4px';
          div.style.border = '1px solid #00d4ff';
          div.style.borderRadius = '6px';
          div.style.backgroundColor = '#e6f7ff';
          set4dEl.appendChild(div);
        });
      }
      
      // Render 3D
      const set3dEl = qs('#set3d');
      if(set3dEl) {
        set3dEl.innerHTML = '';
        userData.results.set3d.forEach(num => {
          const div = document.createElement('div');
          div.textContent = num;
          div.style.textAlign = 'center';
          div.style.padding = '8px';
          div.style.margin = '4px';
          div.style.border = '1px solid #00d4ff';
          div.style.borderRadius = '6px';
          div.style.backgroundColor = '#e6f7ff';
          set3dEl.appendChild(div);
        });
      }
      
      // Render 2D
      const set2dEl = qs('#set2d');
      if(set2dEl) {
        set2dEl.innerHTML = '';
        userData.results.set2d.forEach(num => {
          const div = document.createElement('div');
          div.textContent = num;
          div.style.textAlign = 'center';
          div.style.padding = '8px';
          div.style.margin = '4px';
          div.style.border = '1px solid #00d4ff';
          div.style.borderRadius = '6px';
          div.style.backgroundColor = '#e6f7ff';
          set2dEl.appendChild(div);
        });
      }
    };

    // Button for Colok
    qs('#btnColokSet').onclick = () => {
      qs('#resMain').classList.add('hidden');
      const el = qs('#resColok');
      el.classList.remove('hidden');
      
      // Render Colok 1D
      const cb1dEl = qs('#cb1d');
      if(cb1dEl) {
        cb1dEl.innerHTML = '';
        userData.results.cb1d.forEach(num => {
          const div = document.createElement('div');
          div.textContent = num;
          div.style.textAlign = 'center';
          div.style.padding = '8px';
          div.style.margin = '4px';
          div.style.border = '1px solid #ff6b9d';
          div.style.borderRadius = '6px';
          div.style.backgroundColor = '#ffe6f0';
          cb1dEl.appendChild(div);
        });
      }
      
      // Render Colok 2D
      const cb2dEl = qs('#cb2d');
      if(cb2dEl) {
        cb2dEl.innerHTML = '';
        userData.results.cb2d.forEach(num => {
          const div = document.createElement('div');
          div.textContent = num;
          div.style.textAlign = 'center';
          div.style.padding = '8px';
          div.style.margin = '4px';
          div.style.border = '1px solid #ff6b9d';
          div.style.borderRadius = '6px';
          div.style.backgroundColor = '#ffe6f0';
          cb2dEl.appendChild(div);
        });
      }
      
      // Render Colok 3D
      const cb3dEl = qs('#cb3d');
      if(cb3dEl) {
        cb3dEl.innerHTML = '';
        userData.results.cb3d.forEach(num => {
          const div = document.createElement('div');
          div.textContent = num;
          div.style.textAlign = 'center';
          div.style.padding = '8px';
          div.style.margin = '4px';
          div.style.border = '1px solid #ff6b9d';
          div.style.borderRadius = '6px';
          div.style.backgroundColor = '#ffe6f0';
          cb3dEl.appendChild(div);
        });
      }
    };

    // Auto-show Main Set by default
    qs('#btnMainSet').click();
  }

  /* =====================
     INIT
  ====================== */
  console.log('Initializing...');
  showPage('page-intro');
});

