import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, Bot, Globe } from 'lucide-react';
import { CLOUDFLARE_WORKER_API } from '../api';

interface CodeSnippetsProps {
  email: string;
}

export const CodeSnippets: React.FC<CodeSnippetsProps> = ({ email }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'curl' | 'playwright' | 'selenium'>('python');
  const [copied, setCopied] = useState(false);

  const baseUrl = CLOUDFLARE_WORKER_API;

  const snippets = {
    python: `# Python (requests) - Instant Smart OTP & Magic Link Fetcher
import requests
import time

EMAIL = "${email}"
print(f"⚡ [Kilat Mail] Listening for OTP & Magic Link on {EMAIL}...")

for attempt in range(20):  # poll up to 60s
    try:
        # Endpoint khusus AI Agent & Bot Automation
        res = requests.get(f"${baseUrl}/api/otp?email={EMAIL}", timeout=5).json()
        if res.get("success") and (res.get("data", {}).get("has_otp") or res.get("data", {}).get("has_magic_link")):
            data = res["data"]
            if data.get("has_otp"):
                print(f"🔑 Received OTP Code: {data['latest_otp']}")
            if data.get("has_magic_link"):
                print(f"🔗 Received Magic Link: {data['magic_link']}")
            break
    except Exception as e:
        print(f"Polling error: {e}")
    time.sleep(3)
`,
    javascript: `// Node.js / Browser (Fetch API) - Poll OTP / Magic Link
async function waitForVerification(email = "${email}", maxSeconds = 60) {
  const endpoint = \`${baseUrl}/api/otp?email=\${encodeURIComponent(email)}\`;
  console.log(\`⚡ [Kilat Mail] Polling \${email}...\`);

  const start = Date.now();
  while (Date.now() - start < maxSeconds * 1000) {
    const res = await fetch(endpoint);
    const json = await res.json();

    if (json.success && (json.data?.has_otp || json.data?.has_magic_link)) {
      console.log("🔑 OTP Code:", json.data.latest_otp);
      console.log("🔗 Magic Link:", json.data.magic_link);
      return json.data;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Verification timeout");
}

waitForVerification();
`,
    curl: `# cURL Command Line (Ultra-fast direct JSON output for Shell/Bash scripts)
curl -s "${baseUrl}/api/otp?email=${email}" | jq .

# Ambil string kode OTP saja secara langsung:
curl -s "${baseUrl}/api/otp?email=${email}" | jq -r '.data.latest_otp'
`,
    playwright: `// Playwright Automation - Read Email & OTP from DOM or API
import { test, expect } from '@playwright/test';

test('automated signup with Kilat Mail', async ({ page, request }) => {
  const EMAIL = "${email}";

  // Skenario A: Langsung fetch ke Kilat Mail REST API tanpa buka UI
  console.log('Using temp email:', EMAIL);
  // ... isi form pendaftaran di web target Anda ...

  // Tunggu OTP dengan polling API cepat (Sub-second / lightweight)
  await expect.poll(async () => {
    const res = await request.get(\`${baseUrl}/api/otp?email=\${EMAIL}\`);
    const json = await res.json();
    return json.data?.latest_otp;
  }, { timeout: 30000, intervals: [2000] }).toBeTruthy();

  // Ambil OTP hasil verifikasi
  const res = await request.get(\`${baseUrl}/api/otp?email=\${EMAIL}\`);
  const { data } = await res.json();
  console.log('⚡ Extracted OTP:', data.latest_otp);
});
`,
    selenium: `# Python Selenium Webdriver Example
from selenium import webdriver
import requests
import time

EMAIL = "${email}"
driver = webdriver.Chrome()

try:
    # 1. Buka halaman registrasi target
    driver.get("https://example.com/signup")
    # driver.find_element("id", "email").send_keys(EMAIL)
    # driver.find_element("id", "submit").click()

    # 2. Ambil kode OTP otomatis dari Kilat Mail API
    print(f"Waiting for OTP on {EMAIL}...")
    otp_code = None
    for _ in range(15):
        time.sleep(3)
        res = requests.get(f"${baseUrl}/api/otp?email={EMAIL}").json()
        if res.get("success") and res.get("data", {}).get("has_otp"):
            otp_code = res["data"]["latest_otp"]
            break

    print(f"⚡ Entering OTP: {otp_code}")
    # driver.find_element("id", "otp_input").send_keys(otp_code)
finally:
    driver.quit()
`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-100">
            Bot, Scraper, & AI Agent Ready (API Snippets)
          </h3>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('python')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'python' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab('javascript')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'javascript' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setActiveTab('playwright')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'playwright' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Playwright
          </button>
          <button
            onClick={() => setActiveTab('selenium')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'selenium' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Selenium
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'curl' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            cURL
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
        Gunakan endpoint 1-baris <code className="text-emerald-400 bg-zinc-950 px-1.5 py-0.5 rounded font-mono">/api/otp?email={email}</code> untuk langsung mengekstrak OTP dan link aktivasi secara instan tanpa perlu parsing HTML manual di script Anda.
      </p>

      {/* Code Viewer */}
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 font-mono text-zinc-400">script.{activeTab === 'python' || activeTab === 'selenium' ? 'py' : activeTab === 'javascript' || activeTab === 'playwright' ? 'js' : 'sh'}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>
        <pre className="p-4 text-zinc-300 overflow-x-auto leading-relaxed">
          {snippets[activeTab]}
        </pre>
      </div>
    </div>
  );
};
