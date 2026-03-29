/**
 * DevTools Bridge — runs in PAGE context (not isolated extension world)
 * This makes RangeKeeperDebug accessible from Chrome DevTools console
 * Communicates with content script via window.postMessage
 */

window.RangeKeeperDebug = {
  help: () => {
    console.log(`
🎯 RangeKeeper Debug Console v0.2.0
─────────────────────────────────────────────────
RangeKeeperDebug.help()        → Show this help
RangeKeeperDebug.page()        → What page am I on?
RangeKeeperDebug.run()         → Run scraper now
RangeKeeperDebug.grades()      → Test grades scraper
RangeKeeperDebug.activity()    → Test activity stream grades
RangeKeeperDebug.messages()    → Test messages landing
RangeKeeperDebug.thread()      → Test course message list
RangeKeeperDebug.feedback()    → Test feedback scraper
RangeKeeperDebug.showDB()      → Show IndexedDB contents
RangeKeeperDebug.backend()     → Test backend connection
─────────────────────────────────────────────────`);
  },

  _send: (action) => {
    return new Promise((resolve) => {
      const id = `rk_${Date.now()}`;
      window.postMessage({ source: 'rk-devtools', action, id }, '*');
      const handler = (e) => {
        if (e.data?.source === 'rk-content' && e.data?.id === id) {
          window.removeEventListener('message', handler);
          resolve(e.data.result);
        }
      };
      window.addEventListener('message', handler);
      setTimeout(() => { window.removeEventListener('message', handler); resolve(null); }, 5000);
    });
  },

  page: async function() {
    const r = await this._send('PAGE');
    console.log('[RangeKeeper] Page:', r);
    return r;
  },
  run: async function() {
    const r = await this._send('RUN');
    console.log('[RangeKeeper] Scrape result:', r);
    return r;
  },
  grades: async function() {
    const r = await this._send('GRADES');
    console.log('[RangeKeeper] Grades:', r?.length, r);
    return r;
  },
  activity: async function() {
    const r = await this._send('ACTIVITY');
    console.log('[RangeKeeper] Activity grades:', r?.length, r);
    return r;
  },
  messages: async function() {
    const r = await this._send('MESSAGES');
    console.log('[RangeKeeper] Messages:', r?.length, r);
    return r;
  },
  thread: async function() {
    const r = await this._send('THREAD');
    console.log('[RangeKeeper] Thread messages:', r?.length, r);
    return r;
  },
  feedback: async function() {
    const r = await this._send('FEEDBACK');
    console.log('[RangeKeeper] Feedback:', r);
    return r;
  },
  showDB: async function() {
    const r = await this._send('SHOWDB');
    console.log('[RangeKeeper] DB contents:', r);
    return r;
  },
  backend: async function() {
    try {
      const r = await fetch('http://localhost:3000/health');
      const d = await r.json();
      console.log('[RangeKeeper] ✅ Backend healthy:', d);
      return d;
    } catch(e) {
      console.error('[RangeKeeper] ❌ Backend not running on localhost:3000');
      console.log('[RangeKeeper] Start it: cd rangekeeper-v2/backend && npm start');
    }
  }
};

console.log('[RangeKeeper] 🎯 Debug ready! Type RangeKeeperDebug.help() for commands');
