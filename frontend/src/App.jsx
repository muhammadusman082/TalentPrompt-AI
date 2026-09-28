import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowDown, BrainCircuit, Check, Clipboard, Database, FileQuestion, LoaderCircle, RefreshCw, Search, Sparkles as SparklesIcon, UsersRound, XCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const fallbackRoles = ['ML Intern', 'Backend Intern', 'Frontend Intern']
const sphericalPoint = (lat, lon, r = 2.75) => {
  const la = lat * Math.PI / 180; const lo = lon * Math.PI / 180
  return new THREE.Vector3(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), r * Math.cos(la) * Math.sin(lo))
}
const normalizeQuestionCount = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return String(Number.isFinite(parsed) ? Math.max(1, Math.min(20, parsed)) : fallback)
}

function CustomCursor() {
  const pointerX = useMotionValue(-100)
  const pointerY = useMotionValue(-100)
  const ringX = useSpring(pointerX, { damping: 24, stiffness: 420, mass: .28 })
  const ringY = useSpring(pointerY, { damping: 24, stiffness: 420, mass: .28 })
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches)
    update(); finePointer.addEventListener('change', update); reducedMotion.addEventListener('change', update)
    return () => { finePointer.removeEventListener('change', update); reducedMotion.removeEventListener('change', update) }
  }, [])
  useEffect(() => {
    document.body.classList.toggle('has-custom-cursor', enabled)
    return () => document.body.classList.remove('has-custom-cursor')
  }, [enabled])
  useEffect(() => {
    if (!enabled) return
    const isInteractive = (target) => Boolean(target.closest('a, button, input, select, textarea, [role="button"], [data-cursor-interactive]'))
    const move = (event) => { pointerX.set(event.clientX); pointerY.set(event.clientY); setVisible(true); setInteractive(isInteractive(event.target)) }
    const leave = () => setVisible(false)
    const click = (event) => {
      const id = `${event.clientX}-${event.clientY}-${Date.now()}`
      setRipples((current) => [...current, { id, x: event.clientX, y: event.clientY }])
      window.setTimeout(() => setRipples((current) => current.filter((ripple) => ripple.id !== id)), 480)
    }
    window.addEventListener('pointermove', move); document.documentElement.addEventListener('mouseleave', leave); window.addEventListener('click', click)
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('mouseleave', leave); window.removeEventListener('click', click) }
  }, [enabled, pointerX, pointerY])
  if (!enabled) return null
  return <div className="custom-cursor" aria-hidden="true">
    <motion.div className="cursor-dot" style={{ x: pointerX, y: pointerY }} animate={{ opacity: visible ? 1 : 0 }} />
    <motion.div className="cursor-ring" style={{ x: ringX, y: ringY }} animate={{ opacity: visible ? (interactive ? .95 : .55) : 0, scale: interactive ? 1.5 : 1 }} transition={{ type: 'spring', damping: 22, stiffness: 340 }} />
    <AnimatePresence>{ripples.map((ripple) => <motion.div key={ripple.id} className="cursor-ripple" initial={{ x: ripple.x, y: ripple.y, scale: .15, opacity: .8 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: .45, ease: 'easeOut' }} />)}</AnimatePresence>
  </div>
}

function AuroraBackground() {
  return <div className="aurora-background" aria-hidden="true"><span className="aurora aurora-cyan" /><span className="aurora aurora-violet" /><span className="aurora aurora-teal" /><span className="aurora aurora-blue" /></div>
}

function Globe() {
  const globe = useRef(); const [reduce, setReduce] = useState(false)
  const nodes = useMemo(() => Array.from({ length: 320 }, (_, i) => {
    const y = 1 - i / 319 * 2; const radius = Math.sqrt(1 - y * y); const theta = Math.PI * (3 - Math.sqrt(5)) * i
    return [2.77 * Math.cos(theta) * radius, 2.77 * y, 2.77 * Math.sin(theta) * radius]
  }), [])
  const arcs = useMemo(() => [
    [[35, -105], [51, 2], '#45e8f7'], [[19, -72], [35, 139], '#c36cf7'], [[-23, -43], [40, -74], '#47e5ef'],
    [[1, 104], [37, 127], '#df74ee'], [[52, 13], [-34, 18], '#55dce7'], [[-6, 107], [28, 77], '#a970ef'],
  ].map(([start, end, color]) => {
    const a = sphericalPoint(...start); const b = sphericalPoint(...end)
    const middle = a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(3.55)
    return { color, points: new THREE.CatmullRomCurve3([a, middle, b]).getPoints(36) }
  }), [])
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduce(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useFrame((_, delta) => { if (globe.current && !reduce) globe.current.rotation.y += delta * .025 })
  return <group ref={globe} rotation={[.18, -.72, -.05]}>
    <mesh><sphereGeometry args={[2.75, 40, 24]} /><meshBasicMaterial color="#35d9ed" wireframe transparent opacity={.27} /></mesh>
    <mesh scale={[-1, 1, 1]}><sphereGeometry args={[2.79, 40, 24]} /><meshBasicMaterial color="#a855f7" wireframe transparent opacity={.1} /></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array(nodes.flat()), 3]} /></bufferGeometry><pointsMaterial color="#72eaf7" size={.026} sizeAttenuation transparent opacity={.9} /></points>
    {arcs.map((arc, i) => <Line key={i} points={arc.points} color={arc.color} transparent opacity={.7} lineWidth={1} />)}
    {arcs.flatMap((arc, i) => [arc.points[0], arc.points.at(-1)].map((p, j) => <mesh key={`${i}-${j}`} position={p}><sphereGeometry args={[.05, 10, 10]} /><meshBasicMaterial color={arc.color} /></mesh>))}
  </group>
}
function HeroScene() { return <Canvas camera={{ position: [0, .05, 7], fov: 44 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}><Globe /><Sparkles count={95} scale={[10, 6, 4]} size={1.35} speed={.08} color="#8bdcfb" /><Sparkles count={32} scale={[8, 5, 3]} size={1.7} speed={.05} color="#e47cff" /></Canvas> }
function Hero() { return <section className="hero relative isolate min-h-[690px] overflow-hidden px-5 pb-40 pt-24 text-center sm:px-8 lg:min-h-[760px]"><div className="canvas-wrap absolute inset-0 z-[-2]"><HeroScene /></div><div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_50%_42%,rgba(4,12,27,.04)_0%,rgba(3,7,18,.2)_44%,#05060a_96%)]" /><div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05060a] to-transparent" /><div className="mx-auto flex max-w-5xl flex-col items-center pt-8 sm:pt-14"><div className="hero-pill"><SparklesIcon size={15} />AI-assisted interview preparation</div><h1 className="hero-title mt-7">Better questions.<br />Better interviews.</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-300 sm:text-base">Build a focused interview set in moments, tailored to the skills and role that matter most.</p><a href="#workspace" className="glow-button mt-8">Generate questions <ArrowDown size={17} /></a></div></section> }
function GlassPanel({ children, className = '' }) {
  const hasWorkspaceRays = className.includes('workspace-card')
  return <div className={`glass-panel ${className}`}>{hasWorkspaceRays && <div className="workspace-rays" aria-hidden="true">{['one', 'two', 'three', 'four'].map((ray) => <div key={ray} className={`workspace-ray ray-${ray}`} />)}</div>}{children}</div>
}
function LoadingQuestions() { return <div className="grid gap-5 lg:grid-cols-2">{[0, 1].map((i) => <GlassPanel key={i} className="p-5"><div className="skeleton h-8 w-40" />{[0, 1, 2].map((j) => <div key={j} className="skeleton mt-5 h-16 w-full" />)}</GlassPanel>)}</div> }
function QuestionList({ title, questions = [], technical }) { const Icon = technical ? BrainCircuit : UsersRound; return <GlassPanel className="overflow-hidden"><div className={`flex items-center gap-3 border-b px-5 py-4 ${technical ? 'border-cyan-300/15 bg-cyan-300/[.05]' : 'border-fuchsia-300/15 bg-fuchsia-300/[.05]'}`}><span className={technical ? 'section-icon cyan' : 'section-icon violet'}><Icon size={18} /></span><div><h3 className="font-display text-lg font-bold text-white">{title}</h3><p className="text-xs text-slate-400">{questions.length} question{questions.length === 1 ? '' : 's'}</p></div></div><ol className="divide-y divide-white/[.07]">{questions.map((item, index) => { const question = technical ? item.question : item; return <li key={`${question}-${index}`} className="question-reveal flex gap-4 px-5 py-4" style={{ animationDelay: `${index * 70}ms` }}><span className="mt-0.5 text-xs font-bold tracking-wider text-slate-500">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0"><p className="text-sm leading-6 text-slate-200">{question}</p>{technical && item.skill && <span className="skill-tag mt-2">{item.skill.replaceAll('_', ' ')}</span>}</div></li> })}</ol></GlassPanel> }
function ErrorMessage({ children, onRetry }) { return <GlassPanel className="mt-6 flex items-start gap-3 border-rose-400/25 bg-rose-500/[.08] p-4 text-sm text-rose-100"><XCircle className="mt-.5 shrink-0 text-rose-300" size={18} /><div>{children}{onRetry && <button onClick={onRetry} className="ml-2 font-semibold text-rose-200 underline underline-offset-2">Try again</button>}</div></GlassPanel> }

function App() {
  const [roles, setRoles] = useState(fallbackRoles), [role, setRole] = useState(fallbackRoles[0]), [technical, setTechnical] = useState('3'), [behavioral, setBehavioral] = useState('2')
  const [result, setResult] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState(''), [bank, setBank] = useState(null), [bankError, setBankError] = useState(''), [search, setSearch] = useState(''), [copied, setCopied] = useState(false)
  useEffect(() => { fetch(`${API_URL}/roles`).then(r => r.ok ? r.json() : Promise.reject()).then(items => { if (Array.isArray(items) && items.length) { setRoles(items); setRole(current => items.includes(current) ? current : items[0]) } }).catch(() => {}) }, [])
  const loadBank = async () => { try { setBankError(''); const response = await fetch(`${API_URL}/question-bank`); if (!response.ok) throw new Error(); setBank(await response.json()) } catch { setBankError('Unable to reach the question bank. Start the Python API at http://localhost:5000.') } }
  useEffect(() => { loadBank() }, [])
  useEffect(() => {
    const countInputs = () => Array.from(document.querySelectorAll('#workspace .workspace-card input[type="number"]'))
    const setRange = () => countInputs().forEach((input) => { input.min = '1'; input.max = '20' })
    const handleBlur = (event) => {
      const inputs = countInputs()
      const index = inputs.indexOf(event.target)
      if (index === 0) setTechnical(normalizeQuestionCount(event.target.value, 3))
      if (index === 1) setBehavioral(normalizeQuestionCount(event.target.value, 2))
    }
    setRange(); document.addEventListener('focusout', handleBlur)
    return () => document.removeEventListener('focusout', handleBlur)
  }, [])
  const generate = async () => { const validTechnical = normalizeQuestionCount(technical, 3); const validBehavioral = normalizeQuestionCount(behavioral, 2); setTechnical(validTechnical); setBehavioral(validBehavioral); setLoading(true); setError(''); try { const response = await fetch(`${API_URL}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, num_technical: Number(validTechnical), num_behavioral: Number(validBehavioral) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to generate questions.'); setResult(data) } catch (err) { setError(err.message === 'Failed to fetch' ? 'Unable to reach the API. Confirm the Python backend is running at http://localhost:5000.' : err.message) } finally { setLoading(false) } }
  const copyAll = async () => { if (!result) return; const text = `${result.role} Interview Questions\n\n${result.summary}\n\nTECHNICAL QUESTIONS\n${(result.technical_questions || []).map((q, i) => `${i + 1}. [${q.skill}] ${q.question}`).join('\n')}\n\nBEHAVIORAL QUESTIONS\n${(result.behavioral_questions || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}`; try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setError('Could not copy the questions. Please try again.') } }
  const entries = bank ? Object.entries(bank).filter(([skill, groups]) => `${skill} ${Object.values(groups).flat().join(' ')}`.toLowerCase().includes(search.toLowerCase())) : []
  const clamp = (value) => value
  return <div className="app-shell"><Hero /><main id="workspace" className="relative z-10 mx-auto -mt-28 max-w-6xl px-5 pb-20 sm:px-8"><div className="ambient-orb ambient-one" /><div className="ambient-orb ambient-two" /><GlassPanel className="workspace-card p-5 sm:p-7"><div className="mb-7"><p className="eyebrow">Question workspace</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">Build an interview set</h2><p className="mt-2 text-sm text-slate-300">Choose a role, set your mix, and receive an interview-ready question list.</p></div><div className="grid gap-5 md:grid-cols-3"><label><span className="field-label">Candidate role</span><select className="input" value={role} onChange={e => setRole(e.target.value)}>{roles.map(value => <option key={value}>{value}</option>)}</select></label><label><span className="field-label">Technical questions</span><input className="input" type="number" min="1" max="10" value={technical} onChange={e => setTechnical(clamp(e.target.value))} /></label><label><span className="field-label">Behavioral questions</span><input className="input" type="number" min="1" max="10" value={behavioral} onChange={e => setBehavioral(clamp(e.target.value))} /></label></div><button onClick={generate} disabled={loading} className="glow-button mt-6 w-full justify-center sm:w-auto">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <BrainCircuit size={18} />}{loading ? 'Generating your questions…' : 'Generate questions'}</button></GlassPanel>{error && <ErrorMessage>{error}</ErrorMessage>}<section className="mt-8" aria-live="polite">{loading && <LoadingQuestions />}{result && !loading && <><GlassPanel className="mb-5 flex flex-col justify-between gap-4 border-cyan-300/15 p-5 sm:flex-row sm:items-center"><div><p className="eyebrow text-cyan-300">{result.role}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">{result.summary}</p></div><div className="flex shrink-0 gap-2"><button onClick={copyAll} className="secondary-button">{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? 'Copied' : 'Copy all as text'}</button><button onClick={generate} className="secondary-button accent"><RefreshCw size={16} />Regenerate</button></div></GlassPanel><div className="grid gap-5 lg:grid-cols-2"><QuestionList title="Technical" questions={result.technical_questions} technical /><QuestionList title="Behavioral" questions={result.behavioral_questions} /></div></>}</section><section className="mt-16 border-t border-white/[.1] pt-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Reference library</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">Question bank</h2><p className="mt-2 text-sm text-slate-300">Browse the existing questions by skill.</p></div><label className="relative w-full sm:w-80"><Search className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions or skills" /></label></div>{bankError ? <ErrorMessage onRetry={loadBank}>{bankError}</ErrorMessage> : !bank ? <GlassPanel className="mt-6 p-5"><div className="skeleton h-5 w-48" /><div className="skeleton mt-5 h-20 w-full" /></GlassPanel> : <div className="mt-6 grid gap-4 md:grid-cols-2">{entries.map(([skill, groups]) => <GlassPanel key={skill} className="p-5"><div className="mb-4 flex items-center gap-3"><span className="section-icon cyan"><FileQuestion size={17} /></span><h3 className="font-display font-bold capitalize text-white">{skill.replaceAll('_', ' ')}</h3></div>{Object.entries(groups).map(([kind, questions]) => <div key={kind} className="mb-4 last:mb-0"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">{kind}</p><ul className="space-y-2">{questions.map(question => <li key={question} className="flex gap-2 text-sm leading-5 text-slate-300"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />{question}</li>)}</ul></div>)}</GlassPanel>)}</div>}{bank && !entries.length && <GlassPanel className="mt-6 p-6 text-sm text-slate-400"><Database className="mb-3 text-cyan-300" size={22} />No questions match “{search}”.</GlassPanel>}</section></main><footer className="border-t border-white/[.08] px-5 py-7 text-center text-sm text-slate-500">TalentPrompt AI · Interview preparation made focused.</footer></div>
}
function AppWithEnhancements() {
  return <><AuroraBackground /><CustomCursor /><App /></>
}

export default AppWithEnhancements
