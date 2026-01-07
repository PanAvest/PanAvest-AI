import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'

/* ------------------------------- THEME & CSS ------------------------------- */
const STYLES = `
:root {
  --bg: #fff;
  --surface: #f0f4f9;
  --surface-hover: #e9eef6;
  --primary: #b65437;
  --primary-bg: rgba(182, 84, 55, 0.1);
  --text-main: #1f1f1f;
  --text-sub: #444746;
  --border: #e3e3e3;
  --user-bubble: #e8f0fe;
  --bot-bubble: transparent;
  --card-bg: #ffffff;
  --shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* Base */
body { margin: 0; font-family: "Google Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text-main); height: 100vh; overflow: hidden; }
#root { height: 100%; display: flex; flex-direction: column; }

/* Layout */
.app-container { display: flex; flex-direction: column; height: 100%; max-width: 100%; position: relative; }
.chat-window { flex: 1; overflow-y: auto; padding: 20px 0 140px; scroll-behavior: smooth; display: flex; flex-direction: column; align-items: center; }
.width-constraint { width: 100%; max-width: 850px; padding: 0 20px; box-sizing: border-box; }

/* Header */
.header { padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); z-index: 50; border-bottom: 1px solid transparent; }
.header.scrolled { border-color: var(--border); }
.brand { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 18px; color: var(--text-sub); }
.brand span { color: var(--primary); font-weight: 700; }

.header-controls { display: flex; gap: 12px; align-items: center; }

.settings-btn { background: none; border: none; cursor: pointer; color: var(--text-sub); display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500; padding: 6px 12px; border-radius: 8px; transition: background 0.2s; background: var(--surface); }
.settings-btn:hover { background: var(--surface-hover); }

.db-status { font-size: 12px; display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: var(--surface); border-radius: 99px; font-weight: 500; cursor: pointer; transition: background 0.2s; border: 1px solid var(--border); }
.db-status:hover { background: var(--surface-hover); }
.indicator { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
.indicator.ready { background: #14ae5c; box-shadow: 0 0 0 2px rgba(20, 174, 92, 0.2); }
.indicator.error { background: #d93025; }

/* Settings Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.modal { background: #fff; width: 100%; max-width: 480px; border-radius: 16px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); animation: pop-up 0.2s ease-out; }
.modal h2 { margin: 0 0 16px; font-size: 20px; }
.modal-row { margin-bottom: 20px; }
.modal-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-sub); margin-bottom: 8px; }
.modal-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.modal-select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #fff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.modal-btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
.modal-btn.secondary { background: var(--surface); color: var(--text-main); }
.modal-btn.primary { background: var(--primary); color: #fff; }
.api-hint { font-size: 12px; color: #666; margin-top: 6px; line-height: 1.4; }

/* Messages */
.message-row { display: flex; width: 100%; margin-bottom: 32px; animation: slide-up 0.3s ease-out; }
.message-row.user { justify-content: flex-end; }
.message-row.bot { justify-content: flex-start; }

.avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0; font-size: 14px; }
.avatar.bot { background: linear-gradient(135deg, #b65437, #d97757); color: white; margin-right: 16px; box-shadow: 0 2px 6px rgba(182, 84, 55, 0.3); }
.avatar.user { display: none; }

.bubble { max-width: 100%; line-height: 1.6; font-size: 16px; position: relative; }
.user .bubble { background: var(--user-bubble); padding: 12px 20px; border-radius: 20px 20px 4px 20px; color: var(--text-main); }
.bot .bubble { background: var(--bot-bubble); padding: 0; width: 100%; }

/* --- RICH CARD STYLE --- */
.smart-card {
  background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px;
  padding: 20px; box-shadow: var(--shadow); margin-top: 8px; max-width: 680px;
  transition: all 0.2s ease;
}
.term-header { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.term-title { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; }
.term-pos { font-size: 12px; font-weight: 600; color: var(--primary); background: var(--primary-bg); padding: 2px 8px; border-radius: 99px; text-transform: uppercase; }
.term-pron { font-family: monospace; color: var(--text-sub); font-size: 14px; }
.term-def { font-size: 16px; color: #333; margin-bottom: 16px; line-height: 1.6; }

/* Card Actions */
.action-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.action-btn {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: var(--surface); border: 1px solid transparent; border-radius: 8px;
  font-size: 13px; font-weight: 500; color: var(--text-sub); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: var(--surface-hover); border-color: var(--border); color: var(--text-main); }
.action-btn.active { background: var(--primary-bg); color: var(--primary); border-color: rgba(182,84,55,0.2); }
.action-icon { width: 16px; height: 16px; opacity: 0.8; }

/* Voice Meter */
.voice-meter { display: flex; align-items: flex-end; gap: 2px; height: 12px; margin-left: 4px; }
.bar { width: 3px; background: var(--primary); border-radius: 2px; animation: bounce-bar 0s infinite; }
.action-btn:not(.active) .bar { display: none; }

/* Expanded Details */
.details-panel {
  background: var(--surface); border-radius: 12px; padding: 16px; font-size: 14px;
  animation: slide-down 0.2s ease-out; border: 1px solid var(--border);
}
.detail-row { margin-bottom: 8px; display: flex; gap: 8px; }
.detail-label { font-weight: 600; color: var(--text-sub); min-width: 80px; }
.detail-val { color: var(--text-main); flex: 1; }

.ai-box { background: #fff; border: 1px solid #c3eec9; padding: 12px; border-radius: 8px; margin-top: 12px; position: relative; }
.ai-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ai-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #14ae5c; text-transform: uppercase; }
.mini-read-btn { background: none; border: none; color: #14ae5c; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; }
.mini-read-btn:hover { background: #f0fdf4; }

/* Input Area */
.input-area { position: fixed; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, var(--bg) 85%, transparent); padding: 0 20px 30px; display: flex; flex-direction: column; align-items: center; z-index: 20; pointer-events: none; }
.input-container { width: 100%; max-width: 850px; position: relative; pointer-events: auto; }

/* Predictive Suggestions */
.predictive-list {
  position: absolute; bottom: 100%; left: 20px; right: 20px; margin-bottom: 10px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-height: 220px; overflow-y: auto;
  display: flex; flex-direction: column; z-index: 30; transform-origin: bottom; animation: pop-up 0.15s ease-out;
}
.predictive-item { padding: 12px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--surface); }
.predictive-item:last-child { border-bottom: none; }
.predictive-item:hover, .predictive-item.selected { background: var(--surface-hover); }
.p-term { font-weight: 500; color: var(--text-main); }
.p-def { font-size: 12px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }

/* Input Bar */
.input-wrapper { background: var(--surface); border-radius: 28px; display: flex; align-items: center; border: 1px solid transparent; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
.input-wrapper:focus-within { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: var(--border); }
.chat-input { flex: 1; background: transparent; border: none; padding: 16px 24px; font-size: 16px; outline: none; color: var(--text-main); font-family: inherit; }
.send-btn { background: transparent; border: none; cursor: pointer; padding: 12px; margin-right: 6px; color: var(--text-sub); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.send-btn.active { color: #fff; background: var(--primary); }

/* Welcome */
.welcome-screen { text-align: center; padding-top: 60px; opacity: 0; animation: fade-in 0.6s forwards; }
.w-title { font-size: 36px; font-weight: 600; margin-bottom: 10px; color: var(--text-main); }
.w-sub { color: var(--text-sub); margin-bottom: 30px; font-size: 16px; }

/* Utilities */
@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pop-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes slide-down { from { opacity: 0; height: 0; } to { opacity: 1; height: auto; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes bounce-bar { 0%, 100% { height: 4px; } 50% { height: 100%; } }
mark { background: rgba(182, 84, 55, 0.2); color: inherit; padding: 0 2px; border-radius: 2px; }
`

/* ------------------------------- TYPES & UTILS ------------------------------- */

type Entry = {
  id?: string
  term: string
  definition: string
  synonyms?: string
  tags?: string
  pronunciation?: string
  pos?: string
  examples?: string
  [key: string]: any
}

type Message = {
  id: string
  role: 'user' | 'bot'
  content?: string
  entry?: Entry
  related?: Entry[]
  timestamp?: number
}

const uuid = () => Math.random().toString(36).substring(2, 9)

/* ------------------------------- LOGIC HOOKS ------------------------------- */

// 1. DATA HOOK
function useData() {
  const [data, setData] = useState<Entry[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'empty'>('loading')
  const papaRef = useRef<any>(null)
  const fuseLibRef = useRef<any>(null)
  const fuseRef = useRef<any>(null)

  const processCSV = useCallback((csv: string) => {
    if (!papaRef.current) return
    try {
      const res = papaRef.current.parse(csv, { header: true, skipEmptyLines: true })
      const entries = res.data
        .map((r: any) => ({
          term: (r.term || r.Term || '').trim(),
          definition: (r.definition || r.Definition || '').trim(),
          synonyms: r.synonyms || r.Synonyms || '',
          tags: r.tags || r.Tags || '',
          pos: r.pos || r.Pos || '',
          pronunciation: r.pronunciation || r.Pronunciation || '',
          examples: r.examples || r.Examples || '',
        }))
        .filter((e: Entry) => e.term && e.definition)

      if (entries.length) {
        setData(entries)
        if (fuseLibRef.current) {
          fuseRef.current = new fuseLibRef.current(entries, {
            keys: [
              { name: 'term', weight: 0.7 },
              { name: 'definition', weight: 0.3 },
              { name: 'tags', weight: 0.1 },
            ],
            threshold: 0.3,
            includeScore: true,
          })
        }
        setStatus('ready')
      } else {
        setStatus('empty')
      }
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const load = (src: string, g: string) =>
      new Promise((res) => {
        if ((window as any)[g]) return res((window as any)[g])
        const s = document.createElement('script')
        s.src = src
        s.onload = () => res((window as any)[g])
        document.head.appendChild(s)
      })

    Promise.all([
      load('https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.basic.min.js', 'Fuse'),
      load('https://cdn.jsdelivr.net/npm/papaparse@5.3.0/papaparse.min.js', 'Papa'),
    ]).then(([F, P]) => {
      fuseLibRef.current = F
      papaRef.current = P
      fetch('/scmpedia_full.csv')
        .then((r) => (r.ok ? r.text() : Promise.reject()))
        .then(processCSV)
        .catch(() => setStatus('empty'))
    })
  }, [processCSV])

  return { data, status, processCSV, fuseRef }
}

// 2. TTS HOOK (Enhanced for Custom Voice Selection)
function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const synth = useRef(window.speechSynthesis)

  useEffect(() => {
    const load = () => {
      const v = synth.current.getVoices().sort((a, b) => a.name.localeCompare(b.name))
      setVoices(v)
      if (!selectedVoiceURI) {
        const best =
          v.find((x) => (x.name.includes('Google') || x.name.includes('Natural')) && x.lang.startsWith('en')) ||
          v.find((x) => x.lang.startsWith('en'))
        if (best) setSelectedVoiceURI(best.voiceURI)
      }
    }

    load()
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = load
    }
  }, [selectedVoiceURI])

  const speak = (id: string, text: string) => {
    if (speakingId === id) {
      synth.current.cancel()
      setSpeakingId(null)
      return
    }
    synth.current.cancel()
    setSpeakingId(id)

    const u = new SpeechSynthesisUtterance(text)
    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI)
    if (voice) u.voice = voice

    u.rate = 1.0
    u.pitch = 1.0
    u.onend = () => setSpeakingId(null)
    synth.current.speak(u)
  }

  return { speak, speakingId, voices, selectedVoiceURI, setSelectedVoiceURI }
}

// 3. AI EXPLANATION GENERATOR (Heuristic + Real Gemini)
async function synthesizeExplanation(anchor: Entry, allData: Entry[], apiKey?: string) {
  if (apiKey) {
    try {
      const prompt = `Explain the supply chain term "${anchor.term}" concisely (max 80 words). Provide a definition and one real-world example. Context tags: ${anchor.tags || 'General'}. Return HTML format with bold tags <b>.`
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch (e) {
      console.error('Gemini API Error', e)
      return (
        '<i>Error connecting to Gemini API. Falling back to internal knowledge base.</i><br/><br/>' +
        heuristicExplanation(anchor, allData)
      )
    }
  }

  return heuristicExplanation(anchor, allData)
}

function heuristicExplanation(anchor: Entry, allData: Entry[]) {
  const tags = (anchor.tags || '').toLowerCase().split(/,\s*/).filter(Boolean)
  const def = anchor.definition.toLowerCase()
  const related = allData
    .filter((d) => d.term !== anchor.term)
    .map((d) => {
      let score = 0
      const dTags = (d.tags || '').toLowerCase().split(/,\s*/)
      if (tags.some((t) => dTags.includes(t))) score += 2
      if (def.includes(d.term.toLowerCase())) score += 5
      return { ...d, score }
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const intro = `Here is a deeper look at **${anchor.term}**.`
  const context = tags.length ? `It is primarily used in the context of: ${tags.join(', ')}.` : ''
  const relText = related.length
    ? `\n\n**Related Concepts:**\n${related
        .map((r) => `• ${r.term}: ${r.definition.slice(0, 80)}...`)
        .join('\n')}`
    : ''
  return `${intro} ${context} ${relText}`
}

/* ------------------------------- UI COMPONENTS ------------------------------- */

const SettingsDialog = ({
  open,
  onClose,
  apiKey,
  setApiKey,
  tts,
}: {
  open: boolean
  onClose: () => void
  apiKey: string
  setApiKey: (k: string) => void
  tts: any
}) => {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <div className="modal-row">
          <label className="modal-label">Gemini API Key (Optional)</label>
          <input
            className="modal-input"
            placeholder="Paste key to enable Real AI..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
          />
          <div className="api-hint">
            Get a free key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
              Google AI Studio
            </a>
            . Without a key, the app uses smart keyword matching.
          </div>
        </div>

        <div className="modal-row">
          <label className="modal-label">Voice Selection</label>
          <select
            className="modal-select"
            value={tts.selectedVoiceURI}
            onChange={(e) => tts.setSelectedVoiceURI(e.target.value)}
          >
            {tts.voices
              .filter((v: any) => v.lang.startsWith('en'))
              .map((v: any) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
          </select>
          <div className="api-hint">Tip: "Google US English" or "Microsoft Natural" sound most human-like.</div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

const SmartCard = ({
  entry,
  allData,
  tts,
  apiKey,
}: {
  entry: Entry
  allData: Entry[]
  tts: any
  apiKey: string
}) => {
  const [expanded, setExpanded] = useState<'details' | 'ai' | null>(null)
  const [aiText, setAiText] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

  const handleAi = async () => {
    if (expanded === 'ai') {
      setExpanded(null)
      return
    }
    setExpanded('ai')
    if (!aiText) {
      setLoadingAi(true)
      const txt = await synthesizeExplanation(entry, allData, apiKey)
      setAiText(txt)
      setLoadingAi(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${entry.term}: ${entry.definition}`)
  }

  const isSpeakingDef = tts.speakingId === `def-${entry.term}`
  const isSpeakingAi = tts.speakingId === `ai-${entry.term}`

  return (
    <div className="smart-card">
      <div className="term-header">
        <h2 className="term-title">{entry.term}</h2>
        {entry.pos && <span className="term-pos">{entry.pos}</span>}
        {entry.pronunciation && <span className="term-pron">/{entry.pronunciation}/</span>}
      </div>
      <div className="term-def">{entry.definition}</div>

      <div className="action-bar">
        <button
          className={`action-btn ${isSpeakingDef ? 'active' : ''}`}
          onClick={() => tts.speak(`def-${entry.term}`, `${entry.term}. ${entry.definition}`)}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          {isSpeakingDef ? 'Reading' : 'Read'}
          <div className="voice-meter">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bar"
                style={{ height: isSpeakingDef ? '100%' : '4px', animationDuration: `${0.4 + i * 0.1}s` }}
              />
            ))}
          </div>
        </button>

        <button className={`action-btn ${expanded === 'ai' ? 'active' : ''}`} onClick={handleAi}>
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2zm0-4H7V7h10v2z" />
          </svg>
          {apiKey ? 'Explain (Gemini)' : 'Smart Context'}
        </button>

        <button
          className={`action-btn ${expanded === 'details' ? 'active' : ''}`}
          onClick={() => setExpanded(expanded === 'details' ? null : 'details')}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          Details
        </button>

        <button className="action-btn" onClick={handleCopy}>
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
          Copy
        </button>
      </div>

      {expanded === 'details' && (
        <div className="details-panel">
          {entry.synonyms && (
            <div className="detail-row">
              <div className="detail-label">Synonyms</div>
              <div className="detail-val">{entry.synonyms}</div>
            </div>
          )}
          {entry.tags && (
            <div className="detail-row">
              <div className="detail-label">Tags</div>
              <div className="detail-val">{entry.tags}</div>
            </div>
          )}
          {entry.examples && (
            <div className="detail-row">
              <div className="detail-label">Example</div>
              <div className="detail-val">{entry.examples}</div>
            </div>
          )}
          {!entry.synonyms && !entry.tags && !entry.examples && (
            <div style={{ color: '#888', fontStyle: 'italic' }}>No additional details available.</div>
          )}
        </div>
      )}

      {expanded === 'ai' && (
        <div className="details-panel ai-box">
          <div className="ai-header">
            <div className="ai-badge">✨ {apiKey ? 'Gemini 1.5 Flash' : 'Smart Insight'}</div>
            <button
              className="mini-read-btn"
              onClick={() => tts.speak(`ai-${entry.term}`, aiText.replace(/<[^>]*>/g, ''))}
            >
              {isSpeakingAi ? 'Stop Reading' : 'Read Insight'}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </button>
          </div>
          {loadingAi ? (
            <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>Generating explanation...</div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------- MAIN APP ------------------------------- */

export default function App() {
  const { data, status, processCSV, fuseRef } = useData()
  const tts = useTTS()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Entry[]>([])
  const [selectedSug, setSelectedSug] = useState(-1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === 'undefined') return import.meta.env.VITE_GEMINI_API_KEY || ''
    return localStorage.getItem('gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  })
  const stopWords = useMemo(
    () => /^(what is|what's|define|explain|describe|meaning of|tell me about|search for|look up|do you know)\s+/i,
    []
  )

  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_key', apiKey)
    }
  }, [apiKey])

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  useEffect(() => {
    if (!input.trim() || !fuseRef.current) {
      setSuggestions([])
      return
    }
    const hits = fuseRef.current.search(input).slice(0, 5).map((h: any) => h.item)
    setSuggestions(hits)
  }, [input, fuseRef])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSug((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSug((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSug >= 0 && suggestions[selectedSug]) {
        handleSubmit(suggestions[selectedSug].term)
      } else {
        handleSubmit(input)
      }
    }
  }

  const handleSubmit = (text: string) => {
    if (!text.trim()) return
    const originalQuery = text.trim()
    setInput('')
    setSuggestions([])
    setSelectedSug(-1)

    setMessages((prev) => [
      ...prev,
      { id: uuid(), role: 'user', content: originalQuery, timestamp: Date.now() },
    ])

    setTimeout(() => {
      if (status !== 'ready') {
        setMessages((p) => [...p, { id: uuid(), role: 'bot', content: 'Please load the database file first.' }])
        return
      }

      const cleanQuery = originalQuery.replace(stopWords, '').replace(/[?]/g, '').trim()

      let match = data.find((d) => d.term.toLowerCase() === cleanQuery.toLowerCase())

      if (!match && fuseRef.current) {
        const res = fuseRef.current.search(cleanQuery)
        if (res.length > 0) match = res[0].item
      }

      if (!match && cleanQuery !== originalQuery && fuseRef.current) {
        const exactOrig = data.find((d) => d.term.toLowerCase() === originalQuery.toLowerCase())
        if (exactOrig) {
          match = exactOrig
        } else {
          const res = fuseRef.current.search(originalQuery)
          if (res.length > 0) match = res[0].item
        }
      }

      if (match) {
        setMessages((p) => [...p, { id: uuid(), role: 'bot', entry: match, timestamp: Date.now() }])
      } else {
        setMessages((p) => [
          ...p,
          { id: uuid(), role: 'bot', content: `I couldn't find a match for "${cleanQuery}". Try a different term.` },
        ])
      }
    }, 500)
  }

  const handleFile = (file: File) => {
    const r = new FileReader()
    r.onload = (ev) => processCSV(ev.target?.result as string)
    r.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-container" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          apiKey={apiKey}
          setApiKey={setApiKey}
          tts={tts}
        />

        <div className={`header ${messages.length > 0 ? 'scrolled' : ''}`}>
          <div className="brand">
            <span>EIS</span> Smart Search
          </div>

          <div className="header-controls">
            <button className="settings-btn" onClick={() => setSettingsOpen(true)}>
              <span>⚙️</span> Settings
            </button>

            <div className="db-status" onClick={() => fileInputRef.current?.click()} title="Load CSV">
              <div className={`indicator ${status === 'ready' ? 'ready' : 'error'}`} />
              {status === 'ready' ? 'Database Active' : 'Load Database'}
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            accept=".csv"
          />
        </div>

        <div className="chat-window">
          {messages.length === 0 ? (
            <div className="welcome-screen width-constraint">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <h1 className="w-title">How can I help?</h1>
              <p className="w-sub">Search for definitions, acronyms, or concepts.</p>
              {status === 'empty' && (
                <div style={{ color: '#d93025', fontWeight: 500 }}>Please drag & drop scmpedia_full.csv here</div>
              )}
            </div>
          ) : (
            <div className="width-constraint">
              {messages.map((m) => (
                <div key={m.id} className={`message-row ${m.role}`}>
                  {m.role === 'bot' && <div className="avatar bot">AI</div>}
                  <div className="bubble">
                    {m.content && <div style={{ padding: m.role === 'bot' ? '12px 0' : undefined }}>{m.content}</div>}
                    {m.entry && <SmartCard entry={m.entry} allData={data} tts={tts} apiKey={apiKey} />}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="input-area">
          <div className="input-container">
            {suggestions.length > 0 && (
              <div className="predictive-list">
                {suggestions.map((s, i) => (
                  <div
                    key={s.term}
                    className={`predictive-item ${i === selectedSug ? 'selected' : ''}`}
                    onClick={() => handleSubmit(s.term)}
                  >
                    <span className="p-term">{s.term}</span>
                    <span className="p-def">{s.definition}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="input-wrapper">
              <input
                className="chat-input"
                placeholder={status === 'ready' ? 'Ask about a concept...' : 'Load database to start...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== 'ready'}
              />
              <button className={`send-btn ${input.trim() ? 'active' : ''}`} onClick={() => handleSubmit(input)}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '12px' }}>
              Powered by PanAvest International & Partners • Prof. Douglas Boateng
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
