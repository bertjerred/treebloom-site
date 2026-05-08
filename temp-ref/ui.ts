export function renderLayout(title: string, mainContent: string, user: any) {
  const sidebarContent = user ?
    `
  <div class="user-profile">
      <img src="${user.image || ''}" alt="Avatar">
      <div class="user-details">
          <strong>${user.name}</strong>
      </div>
  </div>
  <hr>
  ${user.role === 'admin' ?
      `
  <a href="/api/admin/dashboard" class="admin-link">Admin</a>
  <hr>
  ` : ''}
  <a href="/lab" style="color: var(--secondary); font-weight: bold;">Lab</a>
  <hr>
  <a href="/">Home</a>
  <a href="/privacy">Privacy Policy</a>
  <a href="/tos">Terms of Service</a>
  <hr>
  <a href="/auth/signout" class="logout-link">Sign Out</a>
  ` :
    `
  <a href="/auth/signin" class="login-link">Log in or create account</a>
  <hr>
  <a href="/">Home</a>
  <a href="/privacy">Privacy Policy</a>
  <a href="/tos">Terms of Service</a>
  `;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
      <style>
          :root {
              --bg: #ffffff;
              --primary: #e88c45;
              --secondary: #a6e47a;
              --text: #2b221d;
          }
          body {
              font-family: 'Roboto', sans-serif;
              background: var(--bg);
              color: var(--text);
              max-width: 800px;
              margin: 0 auto;
              padding: 5vw;
              line-height: 1.5;
              overflow-x: hidden;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
          }
          header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid var(--primary);
              padding-bottom: 20px;
              margin-bottom: 40px;
          }
         .brand {
              display: flex;
              align-items: center;
              gap: 15px;
              text-decoration: none;
              color: inherit;
          }
         .brand img {
              width: 70px;
              height: 70px;
              border-radius: 4px;
              flex-shrink: 0;
          }
         .brand-text {
              display: flex;
              flex-direction: column;
              justify-content: center;
          }
         .brand-text h1 {
              margin: 0;
              font-weight: 700;
              letter-spacing: -1px;
              line-height: 1;
          }
         .brand-text p {
              margin: 5px 0 0 0;
              font-size: 0.95rem;
              color: #555;
          }
         .menu-btn {
              background: transparent;
              border: 2px solid var(--primary);
              color: var(--primary);
              padding: 8px 16px;
              font-family: inherit;
              font-weight: bold;
              cursor: pointer;
              border-radius: 4px;
              transition: 0.2s;
              white-space: nowrap;
          }
         .menu-btn:hover {
              background: var(--primary);
              color: white;
          }
         .sidebar {
              position: fixed;
              top: 0;
              right: -350px;
              width: 300px;
              height: 100vh;
              background: #faf9d6;
              border-left: 2px solid var(--primary);
              transition: right 0.3s ease;
              z-index: 1000;
              display: flex;
              flex-direction: column;
              box-shadow: -5px 0 15px rgba(0,0,0,0.1);
          }
         .sidebar.open {
              right: 0;
          }
         .sidebar-header {
              padding: 20px;
              display: flex;
              justify-content: flex-end;
          }
         .close-btn {
              background: none;
              border: none;
              font-size: 2rem;
              color: var(--primary);
              cursor: pointer;
              line-height: 1;
          }
         .sidebar-content {
              padding: 20px;
              display: flex;
              flex-direction: column;
              gap: 15px;
          }
         .sidebar-content a {
              text-decoration: none;
              color: var(--text);
              font-weight: bold;
              font-size: 1.1rem;
              transition: color 0.2s;
          }
         .sidebar-content a:hover {
              color: var(--primary);
          }
         .user-profile {
              display: flex;
              align-items: center;
              gap: 15px;
          }
         .user-profile img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
          }
         .overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0,0,0,0.4);
              opacity: 0;
              pointer-events: none;
              transition: 0.3s;
              z-index: 999;
          }
         .overlay.open {
              opacity: 1;
              pointer-events: auto;
          }
          @media (max-width: 650px) {
              header {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 20px;
              }
             .menu-btn {
                  align-self: flex-end;
              }
             .sidebar {
                  width: 85vw;
                  right: -90vw;
              }
          }
      </style>
  </head>
  <body>
      <header>
          <a href="/" class="brand">
              <img src="/media/muzoink-logo-transparent.png" alt="m">
              <div class="brand-text">
                  <h1>muzoink</h1>
                  <p>Software and Media Publishing</p>
              </div>
          </a>
          <button class="menu-btn" onclick="toggleMenu()">MENU &#9776;</button>
      </header>
      <div id="overlay" class="overlay" onclick="toggleMenu()"></div>
      <div id="sidebar" class="sidebar">
          <div class="sidebar-header"><button class="close-btn" onclick="toggleMenu()">&times;</button></div>
          <div class="sidebar-content">${sidebarContent}</div>
      </div>
      <main>${mainContent}</main>
      
      <footer style="text-align: center; padding: 40px 20px 20px; margin-top: auto; font-size: 0.85rem; color: #888; border-top: 1px solid #eaeaea;">
          &copy; ${new Date().getFullYear()} Bert Jerred. All rights reserved.
      </footer>

      <script>
          function toggleMenu() {
              document.getElementById('sidebar').classList.toggle('open');
              document.getElementById('overlay').classList.toggle('open');
          }
      </script>
  </body>
  </html>`;
}

export const StaticPages = {
  privacy: `
  <h2 style="letter-spacing: -1px; margin-top: 0;">Privacy Policy</h2>
  <p>Muzoink.com is a digital playground and showcase of Bert Jerred's projects.</p>
  <ul>
      <li><strong>Data Collection:</strong> We store your Google email and name to facilitate secure access for users.</li>
      <li><strong>Cookies:</strong> We use cookies for session authentication.</li>
      <li><strong>Third Parties:</strong> We do not sell or share your data with anyone.</li>
  </ul>
  `,
  tos: `
  <h2 style="letter-spacing: -1px; margin-top: 0;">Terms of Service</h2>
  <p>Experimental media assets are for personal exploration unless otherwise stated.</p>
  `,
  dramasticPlasticPrivacy: `
    <h2 style="letter-spacing: -1px; margin-top: 0;">Privacy Policy & Terms</h2>
    <p style="color: #666; font-size: 0.9rem;">Last Updated: April 28, 2026</p>
    <p><strong>Dramastic Plastic</strong> is a dual-oscillator virtual synthesizer. It is built with a strict privacy-by-default architecture.</p>
    
    <h3>1. Data Collection & Transmission</h3>
    <p>Dramastic Plastic collects zero data from its users. It contains no tracking software, analytics SDKs, or crash reporters, and does not communicate with external servers. All operations are performed entirely on your local hardware. The app does not log or store any user information.</p>

    <h3>Terms & Disclaimer</h3>
    <p><strong>As-Is Software:</strong> Dramastic Plastic is provided "as is," without warranty of any kind.</p>
    <p><strong>Purpose:</strong> This tool is for musical and creative purposes.</p>
  `
};

export const dramasticPlasticHtml = `<!DOCTYPE html><html lang="en" data-astro-cid-37fxchfa> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dramastic Plastic | Bert Jerred</title><style>:root{--bg: #fafafa;--text: #1a1a1a;--accent: #3b82f6}body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);max-width:800px;margin:0 auto;padding:2rem;line-height:1.6}h1[data-astro-cid-37fxchfa],h2[data-astro-cid-37fxchfa],h3[data-astro-cid-37fxchfa]{color:#000}a[data-astro-cid-37fxchfa]{color:var(--accent);text-decoration:none}a[data-astro-cid-37fxchfa]:hover{text-decoration:underline}nav[data-astro-cid-37fxchfa]{font-size:1.2rem;margin-top:.5rem}nav[data-astro-cid-37fxchfa] a[data-astro-cid-37fxchfa]{margin-right:1.5rem;font-weight:500}hr[data-astro-cid-37fxchfa]{border:0;border-top:1px solid #ddd;margin:2rem 0} .button-container[data-astro-cid-vlerxlvz]{display:flex;gap:1rem;margin-top:1.5rem;margin-bottom:2rem;flex-wrap:wrap}.app-button[data-astro-cid-vlerxlvz]{display:inline-block;padding:.8rem 1.5rem;background-color:var(--accent);color:#fff;text-decoration:none;border-radius:5px;font-weight:700;transition:background-color .3s ease;white-space:nowrap}.app-button[data-astro-cid-vlerxlvz]:hover{background-color:var(--accent-dark);text-decoration:none}.video-container[data-astro-cid-vlerxlvz]{position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;margin-bottom:2rem;background-color:#000}.video-container[data-astro-cid-vlerxlvz] iframe[data-astro-cid-vlerxlvz]{position:absolute;top:0;left:0;width:100%;height:100%;border:0} </style></head> <body data-astro-cid-37fxchfa> 
 <main data-astro-cid-37fxchfa> 
   <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 2rem;" data-astro-cid-vlerxlvz>
     <img src="/dplastic-logo-300.png" alt="Dramastic Plastic product logo featuring clean, stylized typography." style="max-width: 300px; width: 100%; height: auto;" aria-label="Dramastic Plastic Logo" data-astro-cid-vlerxlvz />
     <script type="module" src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"></script>
     <ms-store-badge
       productid="9NJN01KMLMS0"
       window-mode="full"
       theme="auto"
       size="large"
       language="en-us"
       animation="on">
     </ms-store-badge>
   </div>
   <h2 data-astro-cid-vlerxlvz>Dramastic Plastic</h2> 
   <p data-astro-cid-vlerxlvz>A 2-oscillator software synthesizer</p> 
   <h3 data-astro-cid-vlerxlvz>App Overview</h3> 
   <div class="video-container" data-astro-cid-vlerxlvz> 
     <iframe width="560" height="315" src="https://www.youtube.com/embed/jAf3ZPJVWcU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen data-astro-cid-vlerxlvz></iframe> 
   </div> 
   
   <h3 data-astro-cid-vlerxlvz>Technical Details</h3>
   <p data-astro-cid-vlerxlvz>Dramastic Plastic is a desktop audio synthesizer designed for high-fidelity, real-time performance. It is built using a fast Rust audio engine paired with a web-based interface powered by Tauri. To guarantee lag-free audio and eliminate performance stutters, the core engine follows strict real-time coding standards—pre-allocating sound memory and passing internal state instantly through safe, lock-free communication channels.</p>
   <p data-astro-cid-vlerxlvz>The app keeps user inputs, background calculations, and raw digital signal processing strictly separated. It features high-quality, band-limited oscillators for rich vintage tones, alongside an intelligent voice-stealing system that manages polyphonic playing effortlessly.</p>
   <p data-astro-cid-vlerxlvz>Visually, the instrument integrates a custom particle simulation built in p5.js. Rather than relying on standard frequency analysis, this visualizer pulls knob configurations (such as LFO rates and filter cutoffs) directly from the backend to animate the flocking behaviors in real-time. Two overlapping, color-coded particle swarms adapt continuously to mirror the combined interactions of the dual oscillators.</p>

   <h3 data-astro-cid-vlerxlvz>About Presets</h3>
   <p data-astro-cid-vlerxlvz>Customizing and managing sounds is central to the Dramastic Plastic experience. Understanding how presets are processed and saved helps you back up, trade, or manually tweak specific values.</p>

   <h4 data-astro-cid-vlerxlvz>How to Save a Preset</h4>
   <p data-astro-cid-vlerxlvz>Capturing a unique configuration takes just a click. Once you adjust variables across both oscillators, assign a unique name via the dashboard presets console to anchor the patch directly inside standard libraries.</p>

   <div style="margin: 1.5rem 0; text-align: center;" data-astro-cid-vlerxlvz>
     <video controls style="max-width: 100%; width: 560px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" data-astro-cid-vlerxlvz>
       <source src="/preset.mp4" type="video/mp4">
       Your browser does not support the video tag.
     </video>
   </div>

   <h4 data-astro-cid-vlerxlvz>Where are Presets Saved?</h4>
   <p data-astro-cid-vlerxlvz>On native Windows platforms, state exports reside safely inside your persistent local profile. These files are aggregated in the following directory path:</p>
   
   <div style="display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; background: #eee; padding: 0.5rem 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin: 1rem 0; color: #333;" aria-label="File explorer path breadcrumbs" data-astro-cid-vlerxlvz>
     <span style="background: #ddd; padding: 0.2rem 0.5rem; border-radius: 4px;" data-astro-cid-vlerxlvz>AppData</span>
     <span style="color: #888;" aria-hidden="true" data-astro-cid-vlerxlvz>&rsaquo;</span>
     <span style="background: #ddd; padding: 0.2rem 0.5rem; border-radius: 4px;" data-astro-cid-vlerxlvz>Roaming</span>
     <span style="color: #888;" aria-hidden="true" data-astro-cid-vlerxlvz>&rsaquo;</span>
     <span style="background: #ddd; padding: 0.2rem 0.5rem; border-radius: 4px;" data-astro-cid-vlerxlvz>com.bertjerred.dramastic-plastic</span>
     <span style="color: #888;" aria-hidden="true" data-astro-cid-vlerxlvz>&rsaquo;</span>
     <span style="background: var(--accent); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold;" data-astro-cid-vlerxlvz>presets</span>
   </div>
   
   <div role="region" aria-label="Visual guide detailing location paths for stored synthesizer files" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin: 1.5rem 0;" data-astro-cid-vlerxlvz>
     <img src="/dramastic-folder1.png" alt="Screenshot of the core Windows AppData directory for com.bertjerred.dramastic-plastic." style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" data-astro-cid-vlerxlvz />
     <span style="font-size: 1.5rem; color: var(--accent); font-weight: bold;" aria-hidden="true" data-astro-cid-vlerxlvz>&darr;</span>
     <img src="/dramastic-folder2.png" alt="Close-up of internal folders demonstrating presets routing structure." style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" data-astro-cid-vlerxlvz />
     <span style="font-size: 1.5rem; color: var(--accent); font-weight: bold;" aria-hidden="true" data-astro-cid-vlerxlvz>&darr;</span>
     <img src="/dramastic-preset-files.png" alt="Resulting .dplastic modular preset payloads nested cleanly." style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" data-astro-cid-vlerxlvz />
   </div>

   <p data-astro-cid-vlerxlvz>These modular files can be inspected securely using default utilities like Notepad.</p>

   <h4 data-astro-cid-vlerxlvz>What is a .dplastic file?</h4>
   <p data-astro-cid-vlerxlvz>A <code>.dplastic</code> container formats data points using traditional, structured JSON syntax. It exposes precise operational properties (envelopes, attack speeds, wave vectors) making edits straightforward even outside the synthesizer software.</p>
   
   <div style="position: relative; background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; margin: 1.5rem 0; font-family: monospace; font-size: 0.9rem;" data-astro-cid-vlerxlvz>
     <button onclick="navigator.clipboard.writeText(document.getElementById('preset-json').innerText); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000);" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" data-astro-cid-vlerxlvz>Copy</button>
     <pre id="preset-json" style="margin: 0; overflow-x: auto;" data-astro-cid-vlerxlvz><code>{
  "version": 2,
  "metadata": {
    "preset_name": "Dream State",
    "author": "Bert Jerred"
  },
  "osc1_settings": {
    "waveform": "Saw",
    "level": 0.538756,
    "adsr": {
      "attack": 2.752341311134235,
      "decay": 5.0,
      "sustain": 0.6463815789473685,
      "release": 1.009391790014653
    },
    "filter_cutoff": 112.94061886660609,
    "resonance": 0.35,
    "lfo": {
      "rate": 0.2567930935641735,
      "depth": 0.38,
      "shape": "Square"
    }
  },
  "osc2_settings": {
    "waveform": "Square",
    "level": 0.27040000000000003,
    "adsr": {
      "attack": 0.2897805212620027,
      "decay": 1.4,
      "sustain": 0.59375,
      "release": 2.100480109739369
    },
    "filter_cutoff": 318.424548476437,
    "resonance": 0.52,
    "lfo": {
      "rate": 0.4338956626347423,
      "depth": 0.21,
      "shape": "Triangle"
    }
  },
  "scope_settings": {
    "scale": 1.0,
    "offset": 0.0
  }
}</code></pre>
   </div>

   <p data-astro-cid-vlerxlvz><a href="/apps/dramastic-plastic/privacy" data-astro-cid-vlerxlvz>Read the Privacy Policy</a>.</p> 
 </main> 
 <footer data-astro-cid-37fxchfa> 
   <hr data-astro-cid-37fxchfa> 
   <p data-astro-cid-37fxchfa>© 2026 Bert Jerred. All rights reserved.</p> 
 </footer> 
 </body></html>`;

export function renderLabTemplate(beepers: any[]): string {
  // Serialize the D1 data to feed into the client-side terminal memory
  const serializedBeepers = JSON.stringify(beepers.map(b => {
    let vocab = [];
    try { vocab = JSON.parse(b.vocabulary); } catch (e) { }
    return { ...b, parsedVocab: vocab };
  }));

  return `
    <style>
      /* Tightly Scoped Terminal Styles */
      #muzoink-terminal-wrapper {
          background-color: #050505;
          color: #a2e876;
          font-family: 'Courier New', Courier, monospace;
          height: 600px; /* Fixed height for the embedded console */
          width: 100%;
          border-radius: 6px;
          border: 2px solid #222;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin-top: 20px;
      }

      /* Scanline Overlay scoped only to the wrapper */
      #muzoink-terminal-wrapper::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
          z-index: 100;
      }

      #term-output {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
          text-shadow: 0 0 5px rgba(51, 255, 51, 0.4);
          line-height: 1.4;
      }

      .term-input-line {
          display: flex;
          align-items: center;
          padding: 0 20px 20px 20px;
          font-weight: bold;
      }

      .term-prompt { margin-right: 10px; }

      #term-input {
          background: transparent;
          border: none;
          color: #a2e876;
          font-family: inherit;
          font-size: 1rem;
          flex-grow: 1;
          outline: none;
          text-shadow: 0 0 5px rgba(51, 255, 51, 0.4);
          font-weight: bold;
      }

      /* Nano-style footer */
      #term-footer {
          background-color: #a2e876;
          color: #050505;
          padding: 8px 15px;
          display: flex;
          flex-wrap: wrap;
          font-weight: bold;
          font-size: 0.85rem;
          justify-content: flex-start;
          gap: 15px;
          z-index: 10;
      }
      .term-hotkey { background: #050505; color: #a2e876; padding: 2px 6px; border-radius: 2px;}

      .sys-msg { color: #1a661a; }
      .err-msg { color: #ff3333; text-shadow: 0 0 5px rgba(255, 51, 51, 0.5); }
    </style>

    <div>
        <h1 style="margin-top: 0;">The Muzoink Lab</h1>
        <h2 style="margin-top: 10px; font-size: 1.2rem; color: #e88c45;">The Little Beepers Command Console</h2>
        <p>Type <strong>start</strong> in the console to boot the audio subsystem and initialize the equipment.</p>
        
        <div id="muzoink-terminal-wrapper">
            <div id="term-output">BeeperOS
OS v1.3.0 (Muzoink)

SYSTEM STATUS: OFFLINE
Awaiting authorization...</div>
            <div class="term-input-line">
                <span class="term-prompt">MUZOINK&gt;</span>
                <input type="text" id="term-input" autocomplete="off" spellcheck="false">
            </div>
            
            <div id="term-footer">
                <div><span class="term-hotkey">help</span> Manual</div>
                <div><span class="term-hotkey">start</span> Power On</div>
                <div><span class="term-hotkey">exit</span> Power Off</div>
            </div>
        </div>
    </div>

    <script type="module">
      import { playBeeperWord } from '/js/beeper_synth.js';

      window.BEEPERS = ${serializedBeepers};
      
      let isBooted = false;
      let releaseTarget = null; 

      const outputEl = document.getElementById('term-output');
      const inputEl = document.getElementById('term-input');
      const terminalContainer = document.getElementById('term-output'); // Scroll target

      // Optional: click inside terminal focuses input
      document.getElementById('muzoink-terminal-wrapper').addEventListener('click', () => inputEl.focus());

      function print(text, className = '', isHtml = false) {
          const span = document.createElement('span');
          span.className = className;
          if (isHtml) span.innerHTML = text + '\\n';
          else span.innerText = text + '\\n';
          outputEl.appendChild(span);
          terminalContainer.scrollTop = terminalContainer.scrollHeight;
      }

      async function bootSystem() {
          inputEl.disabled = true;
          print("\\nINITIALIZING AUDIO SUBSYSTEM...");
          
          const text = "LITTLE";
          const notes = ['do', 're', 'mi', 'fa', 'sol', 'la'];
          
          let bootStr = "";
          for (let i = 0; i < text.length; i++) {
              await new Promise(r => setTimeout(r, 300));
              bootStr += text[i];
              outputEl.lastChild.innerText = bootStr + '\\n';
              playBeeperWord([notes[i]]);
          }
          
          await new Promise(r => setTimeout(r, 300));
          playBeeperWord(['ti']);
          
          await new Promise(r => setTimeout(r, 300));
          bootStr += " BEEPERS";
          outputEl.lastChild.innerText = bootStr + '\\n';
          try { playBeeperWord(['high_do']); } catch(e) { playBeeperWord(['ti']); }

          const urlParams = new URLSearchParams(window.location.search);
          const transmission = urlParams.get('transmission');
          if (transmission) {
              print("\\n[!] INCOMING TRANSMISSION DETECTED", "sys-msg");
              const syllables = transmission.split(','); 
              await new Promise(r => setTimeout(r, 800));
              playBeeperWord(syllables);
              print("DECODED: [ " + syllables.join(' - ').toUpperCase() + " ]");
          }

          print("\\nSYSTEM READY. Type 'list' to view inventory.");
          isBooted = true;
          inputEl.disabled = false;
          inputEl.focus();
      }

      function findBeeper(nameArg) {
          return window.BEEPERS.find(b => b.name.toLowerCase() === nameArg.toLowerCase());
      }

      async function syncState() {
          try {
              const res = await fetch('/api/lab/beepers');
              if (res.ok) {
                  const updatedBeepers = await res.json();
                  window.BEEPERS = updatedBeepers.map(b => {
                      let vocab = [];
                      try { vocab = JSON.parse(b.vocabulary); } catch (e) { }
                      return { ...b, parsedVocab: vocab };
                  });
              }
          } catch (e) {
              print("Warning: Failed to sync database matrix.", "err-msg");
          }
      }

      async function handleCommand(cmdRaw) {
          const cmdStr = cmdRaw.trim();
          if (!cmdStr) return;

          print("MUZOINK> " + cmdStr);
          const parts = cmdStr.split(' ');
          const command = parts[0].toLowerCase();
          const arg = parts.slice(1).join(' ');

          if (releaseTarget) {
              if (cmdStr === 'confirm') {
                  print("\\nCONFIRMED. Releasing " + releaseTarget.name + "...");
                  playBeeperWord(["sol", "mi", "do"]);
                  inputEl.disabled = true;
                  await new Promise(r => setTimeout(r, 1500));
                  
                  try {
                      const res = await fetch('/api/lab/beepers/release', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ beeperId: releaseTarget.id })
                      });
                      if (res.ok) {
                          print("Unit released successfully.");
                          await syncState();
                          releaseTarget = null;
                      }
                  } catch(e) { print("NETWORK ERROR.", "err-msg"); }
                  inputEl.disabled = false;
                  inputEl.focus();
              } else if (cmdStr === 'cancel') {
                  print("Release aborted.");
                  releaseTarget = null;
              } else {
                  print("Invalid command. Type 'confirm' to say goodbye, or 'cancel' to abort.", "err-msg");
              }
              return;
          }

          if (!isBooted && command !== 'start') {
              print("Command rejected. System offline. Type 'start'.", "err-msg");
              return;
          }

          switch(command) {
              case 'help':
                  print("\\n--- AVAILABLE COMMANDS ---");
                  print("help            - Displays this manual");
                  print("start           - Boots the audio subsystem");
                  print("list            - Displays active beeper inventory");
                  print("new <name>      - Creates a new unit");
                  print("play <name>     - Auditions the unit's vocabulary");
                  print("share <name>    - Toggles faraway social discovery");
                  print("release <name>  - Initiates permanent release protocol");
                  print("clear           - Clears the terminal screen");
                  print("exit            - Powers down the equipment");
                  print("----------------------------");
                  break;

              case 'start':
                  if (isBooted) print("System already online.");
                  else await bootSystem();
                  break;
              
              case 'list':
                  print("\\n--- ACTIVE INVENTORY ---");
                  if (window.BEEPERS.length === 0) print("No units found.");
                  window.BEEPERS.forEach(b => {
                      const ageDiff = (Date.now() / 1000 - b.birth_date);
                      const ageDays = Math.floor(ageDiff / 86400);
                      const ageHours = Math.floor((ageDiff % 86400) / 3600);
                      const ageStr = ageDays > 0 ? (ageDays + "d " + ageHours + "h") : (ageHours + "h");
                      
                      const sharedStatus = b.allow_faraway_social ? 'ON' : 'OFF';
                      print("[" + b.name + "] (Age: " + ageStr + ") | Vocab: " + b.parsedVocab.join(', ') + " | Faraway: " + sharedStatus);
                      
                      const encounters = b.encounters || [];
                      if (encounters.length > 0) {
                          const encounterStr = encounters.map(e => '[' + e.name + '] (' + e.time + ')').join(', ');
                          print("  ↳ Encounters: " + encounterStr);
                      } else {
                          print("  ↳ Encounters: NONE");
                      }
                  });
                  print("------------------------");
                  break;

              case 'new':
                  if (!arg) { print("Syntax: new <DesignationCode>", "err-msg"); break; }
                  inputEl.disabled = true;
                  print("Initializing unit '" + arg + "'...");
                  try {
                      const res = await fetch('/api/lab/beepers/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: arg })
                      });
                      if (res.ok) {
                          print("Initialization successful.");
                          print("\\nIf you have more than one Little Beeper, they will visit each other and learn from each other.");
                          print("\\nNew Little Beepers must be approved before they can visit 'faraway friends.'");
                          print("To speed up the approval process visit <a href='https://forms.gle/k8CsV3TwXNMhYnDL8' target='_blank' style='color: #a2e876; text-decoration: underline;'>this site</a>", "", true);
                          print("\\nType 'help' to see available Little Beeper commands.");
                          await syncState();
                      } else {
                          print("Initialization failed.", "err-msg");
                      }
                  } catch(e) { print("Network Error.", "err-msg"); }
                  inputEl.disabled = false;
                  inputEl.focus();
                  break;

              case 'play':
                  if (!arg) { print("Syntax: play <name>", "err-msg"); break; }
                  const beeperToPlay = findBeeper(arg);
                  if (!beeperToPlay) { print("Unit not found.", "err-msg"); break; }
                  print("Auditioning " + beeperToPlay.name + "...");
                  playBeeperWord(beeperToPlay.parsedVocab);
                  break;

              case 'soc':
              case 'social':
                  print("Manual socialization is deprecated. Beepers now meet autonomously in the background.", "err-msg");
                  break;

              case 'share':
                  if (!arg) { print("Syntax: share <name>", "err-msg"); break; }
                  const beeperToShare = findBeeper(arg);
                  if (!beeperToShare) { print("Unit not found.", "err-msg"); break; }
                  inputEl.disabled = true;
                  const newShareState = beeperToShare.allow_faraway_social ? 0 : 1;
                  try {
                      const res = await fetch('/api/lab/beepers/toggle-faraway', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ beeperId: beeperToShare.id, allowFaraway: newShareState })
                      });
                      if (res.ok) {
                          if (newShareState === 1) {
                              print("Once approved by Muzoink Lab, " + beeperToShare.name + " will visit faraway friends. To expedite the approval process, visit <a href='https://forms.gle/k8CsV3TwXNMhYnDL8' target='_blank' style='color: #a2e876; text-decoration: underline;'>this site</a>", "", true);
                          } else {
                              print(beeperToShare.name + " will now only visit nearby friends.");
                          }
                          await syncState();
                      } else {
                          print("Toggle failed.", "err-msg");
                      }
                  } catch(e) { print("Network Error.", "err-msg"); }
                  inputEl.disabled = false;
                  inputEl.focus();
                  break;

              case 'release':
                  if (!arg) { print("Syntax: release <name>", "err-msg"); break; }
                  const beeperToRelease = findBeeper(arg);
                  if (!beeperToRelease) { print("Unit not found.", "err-msg"); break; }
                  
                  releaseTarget = beeperToRelease;
                  print("\\nInitiating Release Protocol for [" + releaseTarget.name + "]...");
                  print(releaseTarget.name + " has enjoyed its time in the Muzoink Lab. It is excited to explore the vastness of the Beeperverse and become a Big Beeper.");
                  print("This action is final. " + releaseTarget.name + " will leave the lab forever.");
                  print("Type 'confirm' to say goodbye, or 'cancel' to abort.");
                  break;

              case 'sudo':
                  if (parts[1] === 'approve') {
                      if (parts.length < 4) { print("Syntax: sudo approve <name> <passphrase>", "err-msg"); break; }
                      const targetName = parts[2];
                      const pass = parts[3];
                      inputEl.disabled = true;
                      print("Authenticating administrative override for [" + targetName + "]...");
                      try {
                          const res = await fetch('/api/lab/beepers/approve', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ beeperName: targetName, passphrase: pass })
                          });
                          if (res.ok) {
                              print("Authentication successful. Unit '" + targetName + "' has been cleared for global socialization.");
                              await syncState();
                          } else {
                              const errText = await res.text();
                              print("Authorization failed: " + errText, "err-msg");
                          }
                      } catch(e) { print("Network Error.", "err-msg"); }
                      inputEl.disabled = false;
                      inputEl.focus();
                  } else {
                      print("Invalid sudo operation.", "err-msg");
                  }
                  break;

              case 'exit':
                  inputEl.disabled = true;
                  print("\\nPOWERING DOWN TERMINAL...");
                  setTimeout(() => {
                      print("\\nSESSION TERMINATED. Connection closed.", "sys-msg");
                      print("Refresh browser page to re-initialize.", "sys-msg");
                      isBooted = false;
                  }, 1200);
                  break;

              case 'clear':
                  outputEl.innerHTML = '';
                  break;

              default:
                  print("Unknown command: " + command + ". Check footer for syntax.", "err-msg");
          }
      }

      inputEl.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter') {
              const val = inputEl.value;
              inputEl.value = '';
              await handleCommand(val);
          }
      });
    </script>
  `;
}

export function renderAdminDashboard(epList: string, visitorList: string, moderatedBeepers: any[]): string {
  return `
    <h2 style="letter-spacing: -1px; margin-top: 0;">Upload Minutiae</h2>
    <form id="minutiae-form" class="admin-form" action="/api/admin/upload" method="POST" enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 15px; max-width: 500px; background: #f9f9f9; padding: 20px; border-radius: 6px; border: 1px solid #ddd;">
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-weight: bold; font-size: 0.9rem;">Title</label>
            <input type="text" name="title" placeholder="Title" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-weight: bold; font-size: 0.9rem;">Description / Minutiae</label>
            <textarea name="description" placeholder="Description..." rows="3" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-weight: bold; font-size: 0.9rem;">Audio File (Required)</label>
            <input type="file" name="mupod_file" id="mupod_file" accept=".mp3,.wav,.m4a,.aac,.ogg, audio/mpeg, audio/wav, audio/mp4, audio/aac, audio/ogg" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-weight: bold; font-size: 0.9rem;">Cover Art Source (Required)</label>
            <input type="file" id="raw_image" accept="image/*" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: bold; font-size: 0.9rem;">Episode Type</label>
                <select name="episode_type" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="full">Full</option>
                    <option value="trailer">Trailer</option>
                    <option value="bonus">Bonus</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px; justify-content: flex-end;">
                <label style="font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" name="is_explicit" value="1" style="transform: scale(1.2);"> Explicit Content
                </label>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: bold; font-size: 0.9rem;">Season</label>
                <input type="number" name="season" placeholder="e.g. 1" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-weight: bold; font-size: 0.9rem;">Episode Number</label>
                <input type="number" name="episode_number" placeholder="e.g. 12" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
            </div>
        </div>
        
        <div id="crop-station" style="display: none; flex-direction: column; align-items: center; gap: 15px; padding: 20px; background: #faf9d6; border-radius: 4px; border: 2px dashed #e88c45;">
            <p style="margin: 0; font-weight: bold; color: #2b221d;">Design Cover</p>
            <canvas id="cover-canvas" width="300" height="300" style="background: transparent;"></canvas>
            <div style="display: flex; flex-direction: column; width: 100%; gap: 10px;">
                <label style="font-size: 0.9rem;">Zoom <input type="range" id="zoom" min="0.1" max="3" step="0.01" value="1" style="width: 100%;"></label>
                <label style="font-size: 0.9rem;">X-Pan <input type="range" id="panX" min="-500" max="500" value="0" style="width: 100%;"></label>
                <label style="font-size: 0.9rem;">Y-Pan <input type="range" id="panY" min="-500" max="500" value="0" style="width: 100%;"></label>
            </div>
        </div>
        
        <button type="submit" id="submit-btn" style="background: var(--secondary, #333); color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 5px;">Publish</button>
    </form>
    
    <hr style="margin: 60px 0 30px 0; border: none; border-top: 1px solid #eee;">
    
    <h2 style="letter-spacing: -1px; margin-top: 40px; color: #d9534f;">Beeper Moderation Log</h2>
    <div style="overflow-x: auto; border: 1px solid #eee; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
            <tr style="background-color: #fcfcfc; border-bottom: 2px solid #eee;">
                <th style="padding: 15px;">Unit</th>
                <th style="padding: 15px;">Creator</th>
                <th style="padding: 15px; width: 100px;">Status</th>
                <th style="padding: 15px; width: 80px; text-align: center;">Approved</th>
                <th style="padding: 15px; text-align: right;">Operations</th>
            </tr>
            ${moderatedBeepers.map(mb => `
                <tr style="border-bottom: 1px solid #f5f5f5; transition: background 0.2s;" onmouseover="this.style.background='#fdfdfd'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px; color: #d9534f; font-weight: 700; font-family: monospace;">${mb.beeper_name}</td>
                    <td style="padding: 15px; font-weight: 500;">${mb.owner_name}</td>
                    <td style="padding: 15px;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; background: ${mb.is_released ? '#f0f0f0' : '#e3fcef'}; color: ${mb.is_released ? '#666' : '#006644'};">
                            ${mb.is_released ? 'RELEASED' : 'ACTIVE'}
                        </span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <input type="checkbox" ${mb.is_approved ? 'checked' : ''} onchange="toggleApproval('${mb.beeper_id}', this.checked)" style="transform: scale(1.3); cursor: pointer;">
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <button onclick="deleteBeeper('${mb.beeper_id}', '${mb.beeper_name}')" style="background: none; color: #d9534f; border: 1px solid #d9534f; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.85rem; transition: all 0.2s;" onmouseover="this.style.background='#d9534f'; this.style.color='white'" onmouseout="this.style.background='none'; this.style.color='#d9534f'">Delete</button>
                        <button onclick="banUser('${mb.user_id}', '${mb.owner_email}')" style="background: #2b221d; color: white; border: none; padding: 7px 13px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.85rem; margin-left: 8px;">Ban User</button>
                    </td>
                </tr>
            `).join('')}
        </table>
    </div>

    <hr style="margin: 60px 0 30px 0; border: none; border-top: 1px solid #eee;">
    <h2 style="letter-spacing: -1px; margin-top: 0;">Manage Transmissions</h2>
    <ul style="list-style: none; padding: 0; margin: 0; margin-bottom: 40px;">
        ${epList || "<p>No minutiae discovered yet.</p>"}
    </ul>
    <h2 style="letter-spacing: -1px; margin-top: 0;">Lab Visitors</h2>
    <ul style="list-style: none; padding: 0; margin: 0;">
        ${visitorList || "<p>The lab is empty.</p>"}
    </ul>
    <script>
        const form = document.getElementById('minutiae-form');
        const rawImageInput = document.getElementById('raw_image');
        const cropStation = document.getElementById('crop-station');
        const canvas = document.getElementById('cover-canvas');
        const ctx = canvas.getContext('2d');
        const submitBtn = document.getElementById('submit-btn');
        const zoomSlider = document.getElementById('zoom');
        const panXSlider = document.getElementById('panX');
        const panYSlider = document.getElementById('panY');
        
        let rawImg = new Image();
        let logoImg = new Image();
        logoImg.src = '/media/muzoink-logo-transparent.png';
        
        function drawCover() {
            ctx.clearRect(0, 0, 300, 300);
            ctx.save();
            ctx.beginPath();
            ctx.arc(150, 150, 150, 0, Math.PI * 2);
            ctx.clip();
            if (rawImg.src) {
                const zoom = parseFloat(zoomSlider.value);
                const w = rawImg.width * zoom;
                const h = rawImg.height * zoom;
                const x = (300 - w) / 2 + parseInt(panXSlider.value);
                const y = (300 - h) / 2 + parseInt(panYSlider.value);
                ctx.drawImage(rawImg, x, y, w, h);
            }
            if(logoImg.complete) ctx.drawImage(logoImg, 90, 90, 120, 120);
            ctx.restore();
        }
        
        zoomSlider.addEventListener('input', drawCover);
        panXSlider.addEventListener('input', drawCover);
        panYSlider.addEventListener('input', drawCover);
        
        rawImageInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                rawImg.src = event.target.result;
                rawImg.onload = () => {
                    cropStation.style.display = 'flex';
                    zoomSlider.value = 1;
                    panXSlider.value = 0;
                    panYSlider.value = 0;
                    drawCover();
                };
            };
            reader.readAsDataURL(files[0]);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!rawImg.src) { alert("Please design your cover art."); return; }
            submitBtn.innerText = "Transmitting...";
            submitBtn.disabled = true;
            canvas.toBlob((blob) => {
                const formData = new FormData(form);
                formData.append('cover_file', blob, 'cover.png');
                fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                })
               .then(r => window.location.href = r.redirected? r.url : '/?success=true')
               .catch(err => {
                    console.error(err);
                    submitBtn.innerText = "Publish";
                    submitBtn.disabled = false;
                });
            }, 'image/png');
        });

        window.deleteBeeper = async (id, name) => {
            if (!confirm("Are you sure you want to permanently delete the beeper '" + name + "'? This bypasses the release protocol.")) return;
            try {
                const res = await fetch('/api/admin/delete-beeper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ beeperId: id })
                });
                if (res.ok) window.location.reload();
                else alert("Failed to delete beeper.");
            } catch(e) { console.error(e); }
        };

        window.banUser = async (id, email) => {
            if (!confirm("Are you sure you want to ban the user '" + email + "'?")) return;
            try {
                const res = await fetch('/api/admin/ban-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id })
                });
                if (res.ok) window.location.reload();
                else alert("Failed to ban user.");
            } catch(e) { console.error(e); }
        };

        window.toggleApproval = async (id, isApproved) => {
            try {
                const res = await fetch('/api/admin/beepers/toggle-approval', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ beeperId: id, isApproved })
                });
                if (!res.ok) {
                    alert("Failed to update approval status.");
                    window.location.reload();
                }
            } catch(e) { 
                console.error(e); 
                alert("Network error.");
                window.location.reload();
            }
        };
    </script>
  `;
}