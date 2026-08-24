import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface CodeSnippetsProps {
  email: string;
}

export const CodeSnippets: React.FC<CodeSnippetsProps> = ({ email }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'curl' | 'playwright'>('python');
  const [copied, setCopied] = useState(false);

  const snippets = {
    python: `# Python (requests) - Fetch OTP Instantly
import requests
import time

email = "${email}"
print(f"Waiting for OTP on {email}...")

for _ in range(12):  # poll up to 60s
    # Direct OTP API Endpoint
    res = requests.get(f"https://kilat-mail-worker.zzdree.workers.dev/api/otp?email={email}").json()
    if res.get("success") and res.get("data", {}).get("has_otp"):
        otp_code = res["data"]["latest_otp"]
        print(f"⚡ Received OTP Code: {otp_code}")
        break
    time.sleep(5)
`,
    javascript: `// Node.js / Browser (Fetch API) - Get Latest OTP
async function getLatestOtp(email = "${email}") {
  const url = \`https://kilat-mail-worker.zzdree.workers.dev/api/otp?email=\${encodeURIComponent(email)}\`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.success && json.data?.has_otp) {
    console.log("⚡ OTP Code:", json.data.latest_otp);
    return json.data.latest_otp;
  }
  return null;
}
getLatestOtp();
`,
    curl: `# cURL Command Line (Direct OTP Extraction)
curl -s "https://kilat-mail-worker.zzdree.workers.dev/api/otp?email=${email}" | jq .
`,
    playwright: `// Playwright Automation - Read Email & OTP from DOM
import { test, expect } from '@playwright/test';

test('register with Kilat Mail', async ({ page }) => {
  await page.goto('https://kilat-mail.pages.dev');

  // 1. Get active temporary email directly from DOM attribute
  const email = await page.locator('#kilat-hub').getAttribute('data-email');
  console.log('Using email:', email);

  // 2. Perform registration on target website in another tab/page...

  // 3. Wait for OTP to arrive in Kilat Mail tab
  await page.waitForFunction(() => {
    const hub = document.querySelector('#kilat-hub');
    return hub && hub.getAttribute('data-latest-otp') !== '';
  }, { timeout: 30000 });

  const otp = await page.locator('#kilat-hub').getAttribute('data-latest-otp');
  console.log('⚡ Extracted OTP:', otp);
});
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
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-100">
            Bot & Automation Code Snippets (Instant OTP)
          </h3>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'python' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab('javascript')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'javascript' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Node.js
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'curl' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            cURL
          </button>
          <button
            onClick={() => setActiveTab('playwright')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'playwright' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Playwright
          </button>
        </div>
      </div>

      {/* Code box */}
      <div className="relative group">
        <pre className="p-4 bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed max-h-72">
          <code>{snippets[activeTab]}</code>
        </pre>

        <button
          onClick={handleCopyCode}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700/60 shadow-sm transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
        </button>
      </div>
    </div>
  );
};
