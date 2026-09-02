import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  Play, Pause, Info, ChevronLeft, ChevronRight, Search, Bell, ChevronDown,
  X, Plus, ThumbsUp, Calculator, FlaskConical,
  Landmark, BookOpen, Leaf, Palette, Dumbbell, Atom, Check,
  Rewind, FastForward, Volume2, VolumeX, Sun, Maximize, Minimize,
  Trash2, Pencil, BarChart3, Users, LayoutDashboard, Lock, ArrowLeft, Loader2, Eye
} from "lucide-react";

/* ============================================================
   DATA — esto es lo que vas a ir reemplazando con tus clases
   reales. Cada "materia" es una fila, cada "clase" es un video.
   videoUrl: null  -> todavía no cargaste el video (muestra aviso)
   videoUrl: "https://..." -> se reproduce en el modal
   ============================================================ */

/* ============================================================
   ÍCONOS DISPONIBLES — el admin elige uno de estos al crear una materia.
   Se guardan como texto (iconKey) porque localStorage no puede
   guardar componentes de React directamente.
   ============================================================ */
const ICONS = { Calculator, Atom, FlaskConical, Landmark, BookOpen, Leaf, Palette, Dumbbell };
const ICON_OPTIONS = Object.keys(ICONS);

const SEED_SUBJECTS = [
  {
    id: "mate",
    name: "Matemática",
    color: "#2E86FF",
    iconKey: "Calculator",
    classes: [
      { id: "m1", title: "Ecuaciones lineales", prof: "Prof. García", duration: "38 min", desc: "Resolución de ecuaciones de primer grado con una incógnita, con ejercicios guiados paso a paso.", videoUrl: "https://youtu.be/h3_GcxDq5h4", thumbnail: null, ciclo: "basico" },
      { id: "m2", title: "Sistemas de ecuaciones", prof: "Prof. García", duration: "45 min", desc: "Métodos de sustitución, igualación y suma-resta para resolver sistemas 2x2.", videoUrl: "https://youtu.be/_IWs9s3XdOA", thumbnail: null, ciclo: "superior" },
      { id: "m3", title: "Razones trigonométricas", prof: "Prof. García", duration: "41 min", desc: "Qué son el seno, coseno y tangente, y cómo se calculan en un triángulo rectángulo.", videoUrl: "https://youtu.be/7pUi5lvLf7c", thumbnail: null, ciclo: "basico" },
      { id: "m4", title: "Teorema de Pitágoras", prof: "Prof. Ibáñez", duration: "35 min", desc: "Demostración clásica y aplicación en triángulos rectángulos.", videoUrl: "https://youtu.be/_IWs9s3XdOA", thumbnail: null, ciclo: "superior" },
      { id: "m5", title: "Probabilidad básica", prof: "Prof. Ibáñez", duration: "29 min", desc: "Espacio muestral, sucesos y cálculo de probabilidades simples.", videoUrl: "https://youtu.be/LWRcpMfUCUE", thumbnail: null, ciclo: "basico" },
      { id: "m6", title: "Introducción a derivadas", prof: "Prof. García", duration: "50 min", desc: "Concepto de límite y tasa de cambio como puerta de entrada al cálculo.", videoUrl: null, thumbnail: null, ciclo: "superior" },
    ],
  },
  {
    id: "fisica",
    name: "Física",
    color: "#FF6B35",
    iconKey: "Atom",
    classes: [
      { id: "f1", title: "Leyes de Newton", prof: "Prof. Álvarez", duration: "47 min", desc: "Las tres leyes fundamentales de la dinámica, con ejemplos cotidianos y experimentos simples.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "f2", title: "Cinemática: MRU y MRUV", prof: "Prof. Álvarez", duration: "44 min", desc: "Movimiento rectilíneo uniforme y uniformemente variado, gráficos posición-tiempo.", videoUrl: null, thumbnail: null, ciclo: "superior" },
      { id: "f3", title: "Energía cinética y potencial", prof: "Prof. Rossi", duration: "39 min", desc: "Conservación de la energía mecánica en sistemas simples.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "f4", title: "Ondas y sonido", prof: "Prof. Rossi", duration: "33 min", desc: "Propiedades de las ondas, frecuencia, amplitud y propagación del sonido.", videoUrl: null, thumbnail: null, ciclo: "superior" },
      { id: "f5", title: "Electricidad básica", prof: "Prof. Álvarez", duration: "42 min", desc: "Circuitos simples, corriente, voltaje y resistencia.", videoUrl: null, thumbnail: null, ciclo: "basico" },
    ],
  },
  {
    id: "quimica",
    name: "Química",
    color: "#22C55E",
    iconKey: "FlaskConical",
    classes: [
      { id: "q1", title: "Tabla periódica", prof: "Prof. Funes", duration: "36 min", desc: "Organización de los elementos, grupos, períodos y propiedades periódicas.", videoUrl: "https://youtu.be/9B3UHUVziIE", thumbnail: null, ciclo: "superior" },
      { id: "q2", title: "Enlace químico", prof: "Prof. Funes", duration: "40 min", desc: "Enlace iónico, covalente y metálico explicados con modelos moleculares.", videoUrl: "https://youtu.be/t_kbksviWx8", thumbnail: null, ciclo: "basico" },
      { id: "q3", title: "Reacciones químicas", prof: "Prof. Domínguez", duration: "37 min", desc: "Tipos de reacciones y balanceo de ecuaciones químicas.", videoUrl: "https://youtu.be/4B_719zRWL8", thumbnail: null, ciclo: "superior" },
      { id: "q4", title: "Ácidos y bases", prof: "Prof. Domínguez", duration: "31 min", desc: "Escala de pH y reacciones de neutralización con ejemplos de laboratorio.", videoUrl: "https://youtu.be/jIbnc0j_ihk", thumbnail: null, ciclo: "basico" },
    ],
  },
  {
    id: "historia",
    name: "Historia",
    color: "#C9A227",
    iconKey: "Landmark",
    classes: [
      { id: "h1", title: "Historia de las civilizaciones", prof: "Prof. Castro", duration: "48 min", desc: "Documental recorriendo la historia humana: Edad Antigua, Edad Media y Edad Moderna.", videoUrl: "https://youtu.be/99I8tt5ZwKE", thumbnail: null, ciclo: "superior" },
      { id: "h2", title: "El planeta Tierra en 20 minutos", prof: "Prof. Castro", duration: "46 min", desc: "Documental que repasa la formación y las características principales del planeta Tierra.", videoUrl: "https://youtu.be/kQWWCI_Wd_8", thumbnail: null, ciclo: "basico" },
      { id: "h3", title: "Primera Guerra Mundial", prof: "Prof. Núñez", duration: "52 min", desc: "Causas, alianzas y consecuencias del conflicto de 1914-1918.", videoUrl: "https://youtu.be/S8QavHAduhA", thumbnail: null, ciclo: "superior" },
      { id: "h4", title: "Revolución Industrial", prof: "Prof. Núñez", duration: "44 min", desc: "Transformaciones económicas y sociales entre los siglos XVIII y XIX.", videoUrl: "https://youtu.be/1Li2W2XjV6I", thumbnail: null, ciclo: "basico" },
    ],
  },
  {
    id: "lengua",
    name: "Lengua y Literatura",
    color: "#E11D48",
    iconKey: "BookOpen",
    classes: [
      { id: "l1", title: "El género narrativo", prof: "Prof. Medina", duration: "34 min", desc: "Narrador, personajes, tiempo y espacio en el relato literario.", videoUrl: null, thumbnail: null, ciclo: "superior" },
      { id: "l2", title: "Análisis de 'Martín Fierro'", prof: "Prof. Medina", duration: "50 min", desc: "Contexto histórico y análisis de la obra cumbre del gauchesco.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "l3", title: "Recursos literarios", prof: "Prof. Salas", duration: "30 min", desc: "Metáfora, símil, hipérbole y otras figuras retóricas con ejemplos.", videoUrl: null, thumbnail: null, ciclo: "superior" },
    ],
  },
  {
    id: "biologia",
    name: "Biología",
    color: "#16A34A",
    iconKey: "Leaf",
    classes: [
      { id: "b1", title: "La célula", prof: "Prof. Ortiz", duration: "39 min", desc: "Estructura y función de la célula eucariota y procariota.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "b2", title: "Fotosíntesis", prof: "Prof. Ortiz", duration: "35 min", desc: "Proceso de conversión de luz solar en energía química en las plantas.", videoUrl: null, thumbnail: null, ciclo: "superior" },
      { id: "b3", title: "Sistema circulatorio", prof: "Prof. Bravo", duration: "41 min", desc: "Recorrido de la sangre, corazón y vasos sanguíneos.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "b4", title: "Genética mendeliana", prof: "Prof. Bravo", duration: "43 min", desc: "Leyes de Mendel y cruzamientos básicos con ejemplos de dominancia.", videoUrl: null, thumbnail: null, ciclo: "superior" },
    ],
  },
  {
    id: "arte",
    name: "Arte",
    color: "#A855F7",
    iconKey: "Palette",
    classes: [
      { id: "a1", title: "Historia del arte: Renacimiento", prof: "Prof. Lima", duration: "37 min", desc: "Principales artistas y obras del Renacimiento italiano.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "a2", title: "Teoría del color", prof: "Prof. Lima", duration: "28 min", desc: "Colores primarios, secundarios, complementarios y armonías.", videoUrl: null, thumbnail: null, ciclo: "superior" },
    ],
  },
  {
    id: "edfisica",
    name: "Educación Física",
    color: "#F97316",
    iconKey: "Dumbbell",
    classes: [
      { id: "e1", title: "Reglas del vóley", prof: "Prof. Sosa", duration: "22 min", desc: "Reglamento básico, posiciones y sistema de puntos.", videoUrl: null, thumbnail: null, ciclo: "basico" },
      { id: "e2", title: "Calentamiento y elongación", prof: "Prof. Sosa", duration: "18 min", desc: "Rutina de entrada en calor previa a la actividad física.", videoUrl: null, thumbnail: null, ciclo: "superior" },
    ],
  },
];

/* ============================================================
   PERSISTENCIA DE MATERIAS Y CLASES — ahora en Supabase.
   Si la tabla "subjects" está vacía (primera vez que se conecta
   la base), la sembramos automáticamente con SEED_SUBJECTS.
   ============================================================ */
function dbClassToApp(row) {
  return {
    id: row.id, subjectId: row.subject_id, ciclo: row.ciclo, title: row.title, prof: row.prof,
    desc: row.description, videoUrl: row.video_url, thumbnail: row.thumbnail, duration: row.duration,
    views: row.views || 0,
  };
}
function appClassToDb(cls, subjectId) {
  return {
    id: cls.id, subject_id: subjectId ?? cls.subjectId, ciclo: cls.ciclo, title: cls.title, prof: cls.prof,
    description: cls.desc, video_url: cls.videoUrl || null, thumbnail: cls.thumbnail || null, duration: cls.duration || null,
  };
}

async function seedDatabaseIfEmpty() {
  const subjectRows = SEED_SUBJECTS.map((s) => ({ id: s.id, name: s.name, color: s.color, icon_key: s.iconKey }));
  const classRows = SEED_SUBJECTS.flatMap((s) => s.classes.map((c) => appClassToDb(c, s.id)));
  await supabase.from("subjects").insert(subjectRows);
  await supabase.from("classes").insert(classRows);
}

async function fetchSubjects() {
  let { data: subjectRows, error: subErr } = await supabase.from("subjects").select("*").order("created_at");
  if (subErr) throw subErr;

  if (subjectRows.length === 0) {
    await seedDatabaseIfEmpty();
    ({ data: subjectRows, error: subErr } = await supabase.from("subjects").select("*").order("created_at"));
    if (subErr) throw subErr;
  }

  const { data: classRows, error: classErr } = await supabase.from("classes").select("*").order("created_at");
  if (classErr) throw classErr;

  return subjectRows.map((s) => ({
    id: s.id, name: s.name, color: s.color, iconKey: s.icon_key, icon: ICONS[s.icon_key] || Calculator,
    classes: classRows.filter((c) => c.subject_id === s.id).map(dbClassToApp),
  }));
}

async function dbAddSubject(subj) {
  const { error } = await supabase.from("subjects").insert({ id: subj.id, name: subj.name, color: subj.color, icon_key: subj.iconKey });
  if (error) throw error;
}
async function dbUpdateSubject(id, patch) {
  const payload = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.color !== undefined) payload.color = patch.color;
  if (patch.iconKey !== undefined) payload.icon_key = patch.iconKey;
  const { error } = await supabase.from("subjects").update(payload).eq("id", id);
  if (error) throw error;
}
async function dbDeleteSubject(id) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}
async function dbAddClass(subjectId, cls) {
  const { error } = await supabase.from("classes").insert(appClassToDb(cls, subjectId));
  if (error) throw error;
}
async function dbUpdateClass(subjectId, classId, patch) {
  const { error } = await supabase.from("classes").update(appClassToDb({ id: classId, ...patch }, subjectId)).eq("id", classId);
  if (error) throw error;
}
async function dbDeleteClass(classId) {
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) throw error;
}
async function dbIncrementView(classId) {
  const { data } = await supabase.from("classes").select("views").eq("id", classId).single();
  const current = data?.views || 0;
  await supabase.from("classes").update({ views: current + 1 }).eq("id", classId);
}

// Devuelve todas las clases de todas las materias en una sola lista plana,
// usada para "Mi lista", "Seguir viendo", el buscador y el panel de admin.
function getAllClasses(subjects) {
  const all = [];
  subjects.forEach((s) => {
    s.classes.forEach((c) => all.push({ ...c, color: s.color, icon: s.icon, subjectName: s.name, subjectId: s.id, subject: s }));
  });
  return all;
}

// --- Cargar la API de YouTube y calcular la duración real de un video ---
let ytApiPromise = null;
function ensureYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
  });
  return ytApiPromise;
}
function formatDurationFromSeconds(totalSeconds) {
  const totalMin = Math.round(totalSeconds / 60);
  if (totalMin < 1) return "<1 min";
  const h = Math.floor(totalMin / 60), rem = totalMin % 60;
  return h > 0 ? `${h}h ${rem}min` : `${totalMin} min`;
}
async function fetchYouTubeDuration(ytId) {
  await ensureYouTubeAPI();
  return new Promise((resolve) => {
    const hidden = document.createElement("div");
    hidden.style.position = "fixed";
    hidden.style.left = "-9999px";
    document.body.appendChild(hidden);
    let done = false;
    const finish = (val) => { if (done) return; done = true; resolve(val); try { player.destroy(); } catch {} hidden.remove(); };
    const player = new window.YT.Player(hidden, {
      videoId: ytId,
      events: {
        onReady: (e) => finish(e.target.getDuration()),
        onError: () => finish(null),
      },
    });
    setTimeout(() => finish(null), 8000); // por si el video no responde
  });
}

/* ============================================================
   CICLOS — cada clase pertenece a uno de los dos ciclos, y cada
   alumno queda asignado a uno al registrarse.
   ============================================================ */
const CYCLES = {
  basico: { key: "basico", label: "Ciclo Básico", sublabel: "1° a 3° año" },
  superior: { key: "superior", label: "Ciclo Superior", sublabel: "4° a 7° año" },
};
const CYCLE_LIST = Object.values(CYCLES);

/* ============================================================
   UI TOKENS
   ============================================================ */
const BG = "#141414";              // negro Netflix oficial
const BG_NAV_SOLID = "#141414";
const CARD_BG = "#181818";         // gris tarjeta Netflix
const CARD_HOVER_BG = "#2F2F2F";   // gris hover Netflix
const TEXT_MUTED = "#808080";      // gris texto secundario Netflix
const RED = "#E50914";             // rojo Netflix oficial
const GUTTER = "clamp(20px, 4vw, 60px)"; // margen lateral consistente
const MAX_WIDTH = 1800;            // ancho máx. de contenido, centrado
const LOGO_FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif"; // tipografía tipo logo Netflix (bold, condensada, en bloque)

// Extrae el ID de video de cualquier link de YouTube (youtube.com/watch?v=, youtu.be/, shorts, embed)
// Cuando pegues tus links reales en "videoUrl", esto se encarga solo de detectarlos.
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

function Thumb({ classItem, color, Icon, tall }) {
  const ytId = getYouTubeId(classItem.videoUrl);
  const autoThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const ytThumb = classItem.thumbnail || autoThumb;

  return (
    <div
      style={{
        width: "100%",
        height: tall ? 220 : "100%",
        position: "relative",
        overflow: "hidden",
        background: ytThumb ? "#000" : `linear-gradient(150deg, ${color}CC 0%, ${color}55 45%, ${BG} 100%)`,
      }}
    >
      {ytThumb ? (
        <img src={ytThumb} alt={classItem.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 14px)" }} />
          <Icon size={84} color="rgba(255,255,255,0.22)" style={{ position: "absolute", top: 16, right: 16 }} />
        </>
      )}

      {/* ícono de play que aparece al pasar el mouse por la tarjeta, igual que Netflix */}
      <div className="thumb-play" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 200ms ease", background: "rgba(0,0,0,0.25)" }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={20} fill="#000" color="#000" style={{ marginLeft: 3 }} />
        </div>
      </div>
    </div>
  );
}

function Row({ title, items, onOpen }) {
  const scrollerRef = useRef(null);
  const scrollBy = (dir) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: dir * 620, behavior: "smooth" });
    }
  };

  return (
    <div style={{ marginBottom: 40, position: "relative" }}>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 12px 4px", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
        {title}
      </h2>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => scrollBy(-1)}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 10, width: 44,
            background: "linear-gradient(to right, rgba(20,20,20,0.9), transparent)",
            border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ChevronLeft size={30} />
        </button>
        <div
          ref={scrollerRef}
          style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", padding: "4px 4px" }}
          className="no-scrollbar"
        >
          {items.map((c) => (
            <div
              key={c.id}
              onClick={() => onOpen(c)}
              className="card-item"
              style={{
                flex: "0 0 auto", width: 280, cursor: "pointer", borderRadius: 4, overflow: "hidden",
                background: CARD_BG, transition: "transform 220ms ease, box-shadow 220ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.75)"; e.currentTarget.style.zIndex = 5; e.currentTarget.style.backgroundColor = CARD_HOVER_BG; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.zIndex = 0; e.currentTarget.style.backgroundColor = CARD_BG; }}
            >
              <Thumb classItem={c} color={c.color || c.subjectColor} Icon={c.icon || Calculator} tall />
              {c.progress != null && (
                <div style={{ height: 3, background: "#4d4d4d", width: "100%" }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: RED }} />
                </div>
              )}
              <div style={{ padding: "10px 12px 14px" }}>
                {c.videoUrl && (
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                )}
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{c.prof}</div>
                <div style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 2 }}>{c.duration}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollBy(1)}
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 10, width: 44,
            background: "linear-gradient(to left, rgba(20,20,20,0.9), transparent)",
            border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
}

// Carga la API de YouTube una sola vez (la reutiliza si ya está cargada)
function useYouTubeAPI() {
  const [ready, setReady] = useState(!!(window.YT && window.YT.Player));
  useEffect(() => {
    if (window.YT && window.YT.Player) { setReady(true); return; }
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); setReady(true); };
  }, []);
  return ready;
}

function fmtTime(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const iconBtnStyle = { background: "transparent", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", padding: 4 };

/* ============================================================
   REPRODUCTOR PROPIO — controles estilo Netflix
   Funciona tanto con videos de YouTube (usa la API oficial y
   oculta los controles nativos de YouTube) como con un link de
   video directo (usa la etiqueta <video> normal de HTML).
   ============================================================ */
function ClassPlayer({ ytId, rawUrl, title }) {
  const apiReady = useYouTubeAPI();
  const ytContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const hideTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const playerLoadedRef = useRef(false);

  // --- inicialización del player de YouTube ---
  useEffect(() => {
    if (!ytId || !apiReady || !ytContainerRef.current) return;
    ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
      width: "100%",
      height: "100%",
      videoId: ytId,
      playerVars: { controls: 0, disablekb: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, playsinline: 1, mute: 1, autoplay: 1 },
      events: {
        onReady: (e) => {
          playerLoadedRef.current = true;
          setDuration(e.target.getDuration());
          // arranca silenciado para esquivar el bloqueo de autoplay de los navegadores;
          // el botón de volumen deja reactivar el sonido en cualquier momento
          e.target.mute();
          setMuted(true);
          e.target.playVideo();
        },
        onStateChange: (e) => setIsPlaying(e.data === window.YT.PlayerState.PLAYING),
        onError: (e) => {
          // 101/150 = el dueño del video desactivó la reproducción embebida
          // 100 = el video fue eliminado o es privado
          setPlayerError(e.data === 101 || e.data === 150 ? "embed" : "unavailable");
        },
      },
    });
    return () => { ytPlayerRef.current?.destroy?.(); };
  }, [ytId, apiReady]);

  // si a los 7s no cargó nada y tampoco avisó un error puntual, mostramos igual el aviso
  useEffect(() => {
    if (!ytId) return;
    const t = setTimeout(() => { if (!playerLoadedRef.current) setPlayerError((prev) => prev || "timeout"); }, 7000);
    return () => clearTimeout(t);
  }, [ytId]);

  // --- progreso: YouTube no avisa el tiempo solo, hay que consultarlo ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (ytId && ytPlayerRef.current?.getCurrentTime) {
        setCurrent(ytPlayerRef.current.getCurrentTime());
        const d = ytPlayerRef.current.getDuration();
        if (d) setDuration(d);
      } else if (!ytId && videoRef.current) {
        setCurrent(videoRef.current.currentTime);
        setDuration(videoRef.current.duration || 0);
      }
    }, 350);
    return () => clearInterval(interval);
  }, [ytId]);

  const togglePlay = () => {
    if (ytId) {
      if (!ytPlayerRef.current) return;
      isPlaying ? ytPlayerRef.current.pauseVideo() : ytPlayerRef.current.playVideo();
    } else if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (secs) => {
    const target = Math.max(0, Math.min(current + secs, duration || current + secs));
    if (ytId) ytPlayerRef.current?.seekTo(target, true);
    else if (videoRef.current) videoRef.current.currentTime = target;
    setCurrent(target);
  };

  const handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const target = pct * duration;
    if (ytId) ytPlayerRef.current?.seekTo(target, true);
    else if (videoRef.current) videoRef.current.currentTime = target;
    setCurrent(target);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (ytId) next ? ytPlayerRef.current?.mute() : ytPlayerRef.current?.unMute();
    else if (videoRef.current) videoRef.current.muted = next;
  };

  const handleVolume = (v) => {
    setVolume(v);
    const shouldMute = v === 0;
    setMuted(shouldMute);
    if (ytId) { ytPlayerRef.current?.setVolume(v); shouldMute ? ytPlayerRef.current?.mute() : ytPlayerRef.current?.unMute(); }
    else if (videoRef.current) { videoRef.current.volume = v / 100; videoRef.current.muted = shouldMute; }
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) { wrapperRef.current.requestFullscreen?.(); setIsFullscreen(true); }
    else { document.exitFullscreen?.(); setIsFullscreen(false); }
  };

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };
  useEffect(() => { resetHideTimer(); return () => clearTimeout(hideTimer.current); }, []);

  // mantiene el estado sincronizado si el usuario sale de pantalla completa con ESC
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const progressPct = duration ? (current / duration) * 100 : 0;

  // en pantalla completa los controles se agrandan para que no se vean diminutos
  const iconSize = isFullscreen ? 28 : 18;
  const bigIconSize = isFullscreen ? 20 : 20;
  const centralPlaySize = isFullscreen ? 100 : 60;
  const centralPlayIcon = isFullscreen ? 40 : 26;
  const barPadding = isFullscreen ? "18px 34px 28px" : "8px 16px 12px";
  const sliderWidth = isFullscreen ? 120 : 70;
  const timeFontSize = isFullscreen ? 16 : 12;
  const progressBarHeight = isFullscreen ? 7 : 5;
  const controlsGap = isFullscreen ? 22 : 12;

  // si el video no se puede reproducir acá adentro, avisamos claro en vez de dejar la pantalla negra
  if (playerError) {
    const messages = {
      embed: "El dueño de este video desactivó la reproducción embebida (fuera de YouTube). No hay forma de esquivar eso desde acá.",
      unavailable: "Este video ya no está disponible o es privado.",
      timeout: "El video está tardando demasiado en cargar. Puede que la reproducción embebida esté bloqueada.",
    };
    return (
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
          <div style={{ color: "#ddd", fontSize: 13, maxWidth: 380 }}>⚠️ {messages[playerError] || messages.unavailable}</div>
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            style={{ background: RED, color: "#fff", padding: "10px 22px", borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          >
            Ver en YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onMouseMove={resetHideTimer}
      style={
        isFullscreen
          ? { position: "fixed", inset: 0, width: "100vw", height: "100vh", background: "#000", overflow: "hidden", zIndex: 9999 }
          : { position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", overflow: "hidden" }
      }
    >
      {ytId ? (
        <div ref={ytContainerRef} className="yt-fill" style={{ position: "absolute", inset: 0, filter: `brightness(${brightness})` }} />
      ) : (
        <video
          ref={videoRef}
          src={rawUrl}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: `brightness(${brightness})` }}
        />
      )}

      {/* capa clickeable sobre el video para togglear play/pausa */}
      <div onClick={togglePlay} style={{ position: "absolute", inset: 0, cursor: "pointer" }} />

      {/* botón grande de play cuando está pausado */}
      {!isPlaying && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: centralPlaySize, height: centralPlaySize, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play size={centralPlayIcon} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
          </div>
        </div>
      )}

      {/* barra de controles inferior */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, padding: barPadding,
          background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
          opacity: showControls ? 1 : 0, transition: "opacity 250ms ease",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        <div onClick={handleSeekClick} style={{ height: progressBarHeight, background: "rgba(255,255,255,0.3)", borderRadius: 3, cursor: "pointer", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: RED, borderRadius: 3, position: "relative" }}>
            <div style={{ position: "absolute", right: -5, top: (progressBarHeight - 12) / 2, width: 12, height: 12, borderRadius: "50%", background: RED }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: controlsGap, flexWrap: "wrap" }}>
          <button onClick={togglePlay} style={iconBtnStyle} aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <Pause size={iconSize} fill="#fff" /> : <Play size={iconSize} fill="#fff" />}
          </button>
          <button onClick={() => skip(-10)} style={iconBtnStyle} aria-label="Retroceder 10 segundos">
            <Rewind size={iconSize} />
          </button>
          <button onClick={() => skip(10)} style={iconBtnStyle} aria-label="Adelantar 10 segundos">
            <FastForward size={iconSize} />
          </button>
          <button onClick={toggleMute} style={iconBtnStyle} aria-label={muted ? "Activar sonido" : "Silenciar"}>
            {muted || volume === 0 ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
          </button>
          <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={(e) => handleVolume(Number(e.target.value))} className="player-range" style={{ width: sliderWidth }} />

          <span style={{ color: "#ddd", fontSize: timeFontSize, minWidth: sliderWidth + 22 }}>{fmtTime(current)} / {fmtTime(duration)}</span>

          <div style={{ flex: 1, minWidth: 8 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sun size={iconSize} />
            <input type="range" min="0.3" max="1" step="0.05" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="player-range" style={{ width: sliderWidth }} title="Brillo" />
          </div>

          <button onClick={toggleFullscreen} style={iconBtnStyle} aria-label="Pantalla completa">
            {isFullscreen ? <Minimize size={iconSize} /> : <Maximize size={iconSize} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// "Mi lista" y "Me gusta" ahora viven en Supabase, ligadas a la cuenta del alumno
// (antes eran globales por navegador; ahora son de verdad por alumno).
async function dbFetchIdList(table, accountId) {
  if (!accountId) return [];
  const { data, error } = await supabase.from(table).select("class_id").eq("account_id", accountId);
  if (error) { console.error(error); return []; }
  return data.map((r) => r.class_id);
}
async function dbAddToList(table, accountId, classId) {
  if (!accountId) return;
  await supabase.from(table).insert({ account_id: accountId, class_id: classId });
}
async function dbRemoveFromList(table, accountId, classId) {
  if (!accountId) return;
  await supabase.from(table).delete().eq("account_id", accountId).eq("class_id", classId);
}

// Muestra la portada real de un video de YouTube. Si la versión de alta
// resolución no existe para ese video, cae automáticamente a una más chica.
function YtCover({ ytId, style, alt }) {
  const [src, setSrc] = useState(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`);
  const [fallenBack, setFallenBack] = useState(false);
  return (
    <img
      src={src}
      alt={alt || ""}
      style={style}
      onError={() => { if (!fallenBack) { setFallenBack(true); setSrc(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`); } }}
    />
  );
}

function Modal({ item, color, Icon, onClose, autoPlay, accountId }) {
  const [myList, setMyList] = useState([]);
  const [liked, setLiked] = useState([]);
  const [wantsPlay, setWantsPlay] = useState(autoPlay);
  useEffect(() => { setWantsPlay(autoPlay); }, [item?.id, autoPlay]);
  useEffect(() => {
    if (!accountId) { setMyList([]); setLiked([]); return; }
    dbFetchIdList("my_list", accountId).then(setMyList);
    dbFetchIdList("liked", accountId).then(setLiked);
  }, [accountId]);
  if (!item) return null;
  const ytId = getYouTubeId(item.videoUrl);

  const inMyList = myList.includes(item.id);
  const isLiked = liked.includes(item.id);
  const toggleMyList = () => {
    const next = inMyList ? myList.filter((id) => id !== item.id) : [...myList, item.id];
    setMyList(next);
    if (inMyList) dbRemoveFromList("my_list", accountId, item.id); else dbAddToList("my_list", accountId, item.id);
  };
  const toggleLiked = () => {
    const next = isLiked ? liked.filter((id) => id !== item.id) : [...liked, item.id];
    setLiked(next);
    if (isLiked) dbRemoveFromList("liked", accountId, item.id); else dbAddToList("liked", accountId, item.id);
  };

  const pillBtn = { background: "rgba(120,120,120,0.4)", border: "2px solid rgba(255,255,255,0.5)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#181818", width: "min(760px, 100%)", borderRadius: 8, overflow: "hidden", maxHeight: "88vh", overflowY: "auto" }}
      >
        {/* CABECERA: reproductor real (si el usuario tocó "Reproducir"), vista previa (si tocó "Más información"), o aviso si no hay video */}
        <div style={{ position: "relative" }}>
          {item.videoUrl && wantsPlay && (
            <ClassPlayer key={item.id} ytId={ytId} rawUrl={item.videoUrl} title={item.title} />
          )}
          {item.videoUrl && !wantsPlay && (
            <div style={{ position: "relative", height: 320, background: "#000" }}>
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : ytId && (
                <YtCover ytId={ytId} alt={item.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 55%, transparent 75%)" }} />
              <button
                onClick={() => setWantsPlay(true)}
                style={{ position: "absolute", inset: 0, margin: "auto", width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                aria-label="Reproducir"
              >
                <Play size={26} fill="#000" color="#000" style={{ marginLeft: 3 }} />
              </button>
              <div style={{ position: "absolute", bottom: 24, left: 32, right: 32 }}>
                <div style={{ fontFamily: "Helvetica Neue, Arial, sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: "-0.5px" }}>{item.title}</div>
              </div>
            </div>
          )}
          {!item.videoUrl && (
            <div style={{ position: "relative", height: 320, background: `linear-gradient(160deg, ${color}CC, ${BG})` }}>
              <Icon size={140} color="rgba(255,255,255,0.15)" style={{ position: "absolute", right: 20, top: 20 }} />
              <div style={{ position: "absolute", bottom: 24, left: 32, right: 32 }}>
                <div style={{ fontFamily: "Helvetica Neue, Arial, sans-serif", fontWeight: 800, fontSize: 34, color: "#fff", letterSpacing: "-0.5px" }}>{item.title}</div>
                <div style={{ marginTop: 8, color: "#ffd166", fontSize: 13, fontWeight: 600 }}>📹 Video próximamente</div>
              </div>
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, zIndex: 5, background: "#181818", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        <div style={{ padding: "20px 32px 0" }}>
          {item.videoUrl && wantsPlay && (
            <div style={{ fontFamily: "Helvetica Neue, Arial, sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.5px" }}>{item.title}</div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: item.videoUrl && wantsPlay ? 14 : 0, marginBottom: 6 }}>
            <button onClick={toggleMyList} style={pillBtn} aria-label={inMyList ? "Quitar de mi lista" : "Agregar a mi lista"} title={inMyList ? "En tu lista" : "Agregar a mi lista"}>
              {inMyList ? <Check size={18} color="#4ADE80" /> : <Plus size={18} color="#fff" />}
            </button>
            <button onClick={toggleLiked} style={pillBtn} aria-label={isLiked ? "Quitar me gusta" : "Me gusta"} title="Me gusta">
              <ThumbsUp size={16} color={isLiked ? RED : "#fff"} fill={isLiked ? RED : "none"} />
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 32px 32px", display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 10, color: TEXT_MUTED, fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: "#4ADE80", fontWeight: 700 }}>{item.subjectName || "Materia"}</span>
              <span>·</span>
              <span>{item.duration}</span>
            </div>
            <p style={{ color: "#d2d2d2", fontSize: 15, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
          </div>
          <div style={{ width: 180, fontSize: 13, color: TEXT_MUTED }}>
            <div style={{ marginBottom: 6 }}><span style={{ color: "#777" }}>Profesor/a: </span><span style={{ color: "#fff" }}>{item.prof}</span></div>
          </div>
        </div>

        {!item.videoUrl && (
          <div style={{ margin: "0 32px 28px", padding: 16, border: "1px dashed #444", borderRadius: 6, color: TEXT_MUTED, fontSize: 13 }}>
            📹 Todavía no cargaste el video de esta clase. Cuando lo subas, agregá la URL en el campo <code style={{ color: "#eee" }}>videoUrl</code> de este item y acá se va a reproducir automáticamente.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   INTRO ANIMADA — homenaje a la animación de arranque de Netflix,
   con el logo de Chacaflix. Se muestra una vez al abrir la página.
   ============================================================ */
function IntroAnimation({ onDone }) {
  // C aparece primero → el resto de las letras se expande desde ahí en cascada →
  // se sostiene el logo 1 segundo completo → fundido a negro → entra solo.
  const CASCADE_START = 380;
  const CASCADE_STAGGER = 70;
  const CASCADE_DURATION = 420;
  const otherLettersCount = 8; // "HACAFLIX"
  const cascadeEnd = CASCADE_START + (otherLettersCount - 1) * CASCADE_STAGGER + CASCADE_DURATION;
  const holdEnd = cascadeEnd + 1000; // 1 segundo de pausa una vez armado el logo completo
  const fadeDuration = 500;
  const totalDuration = holdEnd + fadeDuration;

  useEffect(() => {
    const t = setTimeout(onDone, totalDuration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);

  const letters = "CHACAFLIX".split("");

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#000", zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`
        @keyframes introC {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes introFromC {
          0% { opacity: 0; max-width: 0; }
          100% { opacity: 1; max-width: 1.3em; }
        }
        @keyframes introOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .intro-wrap { animation: introOut ${fadeDuration}ms ease ${holdEnd}ms forwards; }
        .intro-letter-c { display: inline-block; animation: introC 400ms ease forwards; }
        .intro-letter {
          display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: bottom;
          opacity: 0; max-width: 0;
          animation: introFromC ${CASCADE_DURATION}ms ease forwards;
        }
      `}</style>

      <div className="intro-wrap" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "0 8vw", boxSizing: "border-box" }}>
        <div style={{ fontFamily: LOGO_FONT, fontWeight: 900, fontSize: "clamp(32px, 7vw, 96px)", color: RED, letterSpacing: "-0.03em", textTransform: "uppercase", whiteSpace: "nowrap", transform: "scaleY(1.14)", textShadow: "3px 4px 0px #7A0D12, 0 10px 24px rgba(0,0,0,0.6)" }}>
          {letters.map((l, i) =>
            i === 0 ? (
              <span key={i} className="intro-letter-c">{l}</span>
            ) : (
              <span key={i} className="intro-letter" style={{ animationDelay: `${CASCADE_START + (i - 1) * CASCADE_STAGGER}ms` }}>{l}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DIÁLOGO DE CONFIRMACIÓN — reemplaza los confirm() feos del
   navegador por algo con la estética del sitio.
   ============================================================ */
function ConfirmDialog({ title = "¿Estás seguro?", message, confirmLabel = "Confirmar", onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#181818", width: "min(400px, 100%)", borderRadius: 8, padding: 28, border: "1px solid #2a2a2a", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}
      >
        <h3 style={{ color: "#fff", fontSize: 19, fontWeight: 700, margin: "0 0 12px" }}>{title}</h3>
        <p style={{ color: "#d2d2d2", fontSize: 14, lineHeight: 1.5, margin: "0 0 26px" }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ background: "transparent", border: "1px solid #555", color: "#fff", padding: "10px 20px", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ background: RED, border: "none", color: "#fff", padding: "10px 20px", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CUENTAS DE ALUMNO — usuario, contraseña y ciclo asignado.
   NOTA DE SEGURIDAD: no hay un backend propio con lógica de servidor,
   así que las contraseñas quedan en la base tal cual (no hay forma de
   "hashear" nada de manera segura solo desde el navegador). Sirve para
   separar el contenido por ciclo, no para datos sensibles de verdad.
   ============================================================ */
async function dbFindAccount(username) {
  const { data, error } = await supabase.from("accounts").select("*").ilike("username", username).maybeSingle();
  if (error) throw error;
  return data;
}
async function dbCreateAccount(account) {
  const { data, error } = await supabase.from("accounts").insert(account).select().single();
  if (error) throw error;
  return data;
}
async function dbFetchAccounts() {
  const { data, error } = await supabase.from("accounts").select("*").order("created_at");
  if (error) throw error;
  return data;
}
async function dbDeleteAccount(id) {
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
}
const ACCOUNT_COLORS = ["#E50914", "#2E86FF", "#22C55E", "#F97316", "#A855F7", "#EAB308"];

function AuthGate({ onAuthenticated, onAdminRequest }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ciclo, setCiclo] = useState("basico");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => { setMode(m); setError(""); setPassword(""); setConfirmPassword(""); };

  const submit = async () => {
    const u = username.trim();
    if (!u || !password) { setError("Completá usuario y contraseña."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const found = await dbFindAccount(u);
        if (!found || found.password !== password) { setError("Usuario o contraseña incorrectos."); setLoading(false); return; }
        onAuthenticated(found);
      } else {
        const existing = await dbFindAccount(u);
        if (existing) { setError("Ese nombre de usuario ya está registrado."); setLoading(false); return; }
        if (password.length < 4) { setError("La contraseña tiene que tener al menos 4 caracteres."); setLoading(false); return; }
        if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); setLoading(false); return; }
        const account = await dbCreateAccount({
          username: u, password, ciclo,
          color: ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)],
        });
        onAuthenticated(account);
      }
    } catch (e) {
      setError("No se pudo conectar con la base de datos. Probá de nuevo en un rato.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, zIndex: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", overflowY: "auto" }}>
      <div style={{ color: RED, fontFamily: LOGO_FONT, fontWeight: 900, fontSize: 30, letterSpacing: "-1px", textTransform: "uppercase", marginBottom: 30, textShadow: "2px 3px 0px #7A0D12, 0 6px 14px rgba(0,0,0,0.6)" }}>
        Chacaflix
      </div>

      <div style={{ width: "min(360px, 90vw)", background: "#000000cc", border: "1px solid #262626", borderRadius: 8, padding: 32 }}>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 22 }}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        <input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          style={{ width: "100%", background: "#333", border: "1px solid #666", borderRadius: 4, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && mode === "login") submit(); }}
          placeholder="Contraseña"
          style={{ width: "100%", background: "#333", border: "1px solid #666", borderRadius: 4, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />

        {mode === "register" && (
          <>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetir contraseña"
              style={{ width: "100%", background: "#333", border: "1px solid #666", borderRadius: 4, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />
            <label style={{ display: "block", color: TEXT_MUTED, fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              ¿En qué ciclo estás?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {CYCLE_LIST.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCiclo(c.key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left",
                    background: ciclo === c.key ? "#3a1013" : "#2a2a2a", border: ciclo === c.key ? `1px solid ${RED}` : "1px solid #444",
                    borderRadius: 6, padding: "10px 14px", cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{c.label}</span>
                  <span style={{ color: TEXT_MUTED, fontSize: 12 }}>{c.sublabel}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {error && <div style={{ color: RED, fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button disabled={loading} onClick={submit} style={{ width: "100%", background: loading ? "#7a0d12" : RED, border: "none", borderRadius: 4, padding: "12px 0", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "default" : "pointer", marginBottom: 14 }}>
          {loading ? "Un momento..." : mode === "login" ? "Iniciar sesión" : "Registrarme"}
        </button>

        <div style={{ color: TEXT_MUTED, fontSize: 13 }}>
          {mode === "login" ? (
            <>¿Todavía no tenés cuenta? <span onClick={() => switchMode("register")} style={{ color: "#fff", cursor: "pointer", fontWeight: 600 }}>Registrate</span></>
          ) : (
            <>¿Ya tenés cuenta? <span onClick={() => switchMode("login")} style={{ color: "#fff", cursor: "pointer", fontWeight: 600 }}>Iniciá sesión</span></>
          )}
        </div>
      </div>

      <button
        onClick={onAdminRequest}
        style={{ marginTop: 24, background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}
      >
        Acceso administrador
      </button>
    </div>
  );
}

/* ============================================================
   GRILLA GENÉRICA — para las páginas de Materias, Seguir viendo y Mi lista
   ============================================================ */
function CardGrid({ items, onOpen, emptyMessage }) {
  if (items.length === 0) {
    return <div style={{ color: TEXT_MUTED, fontSize: 15, padding: "40px 0" }}>{emptyMessage}</div>;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
      {items.map((c) => (
        <div
          key={c.id}
          onClick={() => onOpen(c)}
          className="card-item"
          style={{ cursor: "pointer", borderRadius: 4, overflow: "hidden", background: CARD_BG, transition: "transform 220ms ease, box-shadow 220ms ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.75)"; e.currentTarget.style.zIndex = 5; e.currentTarget.style.backgroundColor = CARD_HOVER_BG; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.zIndex = 0; e.currentTarget.style.backgroundColor = CARD_BG; }}
        >
          <Thumb classItem={c} color={c.color || c.subjectColor} Icon={c.icon || Calculator} tall />
          <div style={{ padding: "10px 12px 14px" }}>
            {c.videoUrl && <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>}
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{c.prof}</div>
            <div style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 2 }}>{c.duration}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BrowseApp({ profile, onSwitchProfile, subjects: allSubjects, onOpenAdmin }) {
  // el alumno solo tiene que ver las materias y clases de su propio ciclo;
  // filtramos acá una sola vez y el resto del componente ya usa "subjects" filtrado.
  const subjects = allSubjects.map((s) => ({ ...s, classes: s.classes.filter((c) => c.ciclo === profile?.ciclo) }));
  const [scrolled, setScrolled] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalColor, setModalColor] = useState(RED);
  const [modalIcon, setModalIcon] = useState(() => Calculator);
  const [modalAutoPlay, setModalAutoPlay] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [view, setView] = useState("home"); // "home" | "materias" | "materia:<id>" | "seguir" | "milista" | "buscar"
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const allClassesForFeatured = getAllClasses(subjects).filter((c) => c.videoUrl);
  const featuredPool = allClassesForFeatured.length > 0 ? allClassesForFeatured.slice(0, 5) : [];
  const continueWatching = allClassesForFeatured.slice(0, 4);
  const featured = featuredPool.length ? featuredPool[featuredIndex % featuredPool.length] : null;
  const featuredYtId = featured ? getYouTubeId(featured.videoUrl) : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (heroPaused || featuredPool.length === 0) return;
    const timer = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % featuredPool.length);
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroPaused, featuredPool.length]);

  const [myListIds, setMyListIds] = useState([]);

  useEffect(() => {
    if (!profile?.id) { setMyListIds([]); return; }
    dbFetchIdList("my_list", profile.id).then(setMyListIds);
    // se vuelve a pedir cada vez que se abre/cierra el modal, por si el
    // alumno agregó o sacó algo de "Mi lista" mientras estaba mirando una clase
  }, [profile?.id, modalItem]);

  const openModal = (item, subject, mode = "play") => {
    setModalItem(item);
    setModalColor(subject ? subject.color : (item.subjectColor || RED));
    setModalIcon(() => (subject ? subject.icon : Atom));
    setModalAutoPlay(mode === "play");
    if (mode === "play" && item.videoUrl) dbIncrementView(item.id);
  };

  const goTo = (v) => {
    setView(v);
    setSearchOpen(false);
    setNotifOpen(false);
    setAccountOpen(false);
  };

  // datos derivados según la vista activa (se recalculan solos cuando cambia algo)
  const allClasses = getAllClasses(subjects);
  const searchResults = searchQuery.trim()
    ? allClasses.filter((c) => c.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) || c.subjectName.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];
  const myListClasses = allClasses.filter((c) => myListIds.includes(c.id));
  const activeSubjectId = view.startsWith("materia:") ? view.split(":")[1] : null;
  const activeSubject = activeSubjectId ? subjects.find((s) => s.id === activeSubjectId) : null;

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .card-item:hover .thumb-play { opacity: 1 !important; }
        @keyframes heroFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .hero-fade { animation: heroFade 800ms ease; }
        @media (prefers-reduced-motion: reduce) { .hero-fade { animation: none; } }
        .player-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.3); outline: none; cursor: pointer; }
        .player-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; cursor: pointer; }
        .player-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: none; cursor: pointer; }
        .yt-fill, .yt-fill iframe { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; border: 0 !important; }
      `}</style>

      {/* NAVBAR */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: (scrolled || view !== "home") ? BG_NAV_SOLID : "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
          transition: "background 300ms ease",
        }}
      >
        <div style={{
          maxWidth: MAX_WIDTH, margin: "0 auto", padding: `16px ${GUTTER}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <button onClick={() => goTo("home")} style={{ background: "transparent", border: "none", cursor: "pointer", color: RED, fontFamily: LOGO_FONT, fontWeight: 900, fontSize: 28, letterSpacing: "-1px", textTransform: "uppercase", padding: 0, textShadow: "2px 3px 0px #7A0D12, 0 6px 14px rgba(0,0,0,0.6)" }}>
              Chacaflix
            </button>
            <nav style={{ display: "flex", gap: 20, fontSize: 14 }}>
              {[
                { key: "home", label: "Inicio" },
                { key: "materias", label: "Materias" },
                { key: "seguir", label: "Seguir viendo" },
                { key: "milista", label: "Mi lista" },
              ].map((n) => (
                <button
                  key={n.key}
                  onClick={() => goTo(n.key)}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer", padding: 0,
                    color: view === n.key ? "#fff" : "#e5e5e5", fontWeight: view === n.key ? 700 : 400, fontSize: 14,
                  }}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#fff", position: "relative" }}>
            {/* BUSCADOR */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {searchOpen && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setView("buscar"); }}
                  onBlur={() => { if (!searchQuery.trim()) setSearchOpen(false); }}
                  placeholder="Títulos, materias..."
                  style={{ background: "rgba(0,0,0,0.7)", border: "1px solid #666", borderRadius: 4, padding: "6px 10px", color: "#fff", fontSize: 13, width: 180, marginRight: 8, outline: "none" }}
                />
              )}
              <Search
                size={19}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (searchOpen && searchQuery.trim()) { setSearchQuery(""); setSearchOpen(false); if (view === "buscar") goTo("home"); }
                  else setSearchOpen(true);
                }}
              />
            </div>

            {/* NOTIFICACIONES */}
            <div style={{ position: "relative" }}>
              <Bell size={19} style={{ cursor: "pointer" }} onClick={() => { setNotifOpen((v) => !v); setAccountOpen(false); }} />
              {notifOpen && (
                <div style={{ position: "absolute", top: 32, right: -10, width: 300, background: "#181818", border: "1px solid #333", borderRadius: 4, boxShadow: "0 12px 30px rgba(0,0,0,0.6)", padding: 8, zIndex: 60 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 8px" }}>Notificaciones</div>
                  {[
                    "📚 Nueva clase de Física disponible: Leyes de Newton",
                    "🎬 Se agregaron 4 clases nuevas de Historia",
                    "⏰ Te falta poco para terminar Razones trigonométricas",
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "10px 8px", fontSize: 13, color: "#ddd", borderTop: i > 0 ? "1px solid #2a2a2a" : "none" }}>{n}</div>
                  ))}
                </div>
              )}
            </div>

            {/* CUENTA */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => { setAccountOpen((v) => !v); setNotifOpen(false); }}>
                <div style={{ width: 30, height: 30, borderRadius: 6, background: profile?.color || RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                  {profile?.username?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <ChevronDown size={14} style={{ transform: accountOpen ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />
              </div>
              {accountOpen && (
                <div style={{ position: "absolute", top: 40, right: 0, width: 220, background: "#181818", border: "1px solid #333", borderRadius: 4, boxShadow: "0 12px 30px rgba(0,0,0,0.6)", padding: 8, zIndex: 60 }}>
                  <div style={{ padding: "8px 10px", color: TEXT_MUTED, fontSize: 12 }}>
                    Conectado como <strong style={{ color: "#fff" }}>{profile?.username}</strong>
                    <div style={{ marginTop: 2 }}>{CYCLES[profile?.ciclo]?.label}</div>
                  </div>
                  {onOpenAdmin && (
                    <button onClick={() => { setAccountOpen(false); onOpenAdmin(); }} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#fff", padding: "10px", fontSize: 13, cursor: "pointer", borderTop: "1px solid #2a2a2a" }}>
                      Panel de administrador
                    </button>
                  )}
                  <button onClick={() => { setAccountOpen(false); onSwitchProfile(); }} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#fff", padding: "10px", fontSize: 13, cursor: "pointer", borderTop: "1px solid #2a2a2a" }}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {view === "home" && (
      <>
      {/* HERO */}
      {!featured ? (
        <div style={{ position: "relative", height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MUTED, fontSize: 15, paddingTop: 60 }}>
          Todavía no hay ninguna clase con video cargada.
        </div>
      ) : (
      <div
        style={{ position: "relative", height: "78vh", minHeight: 480 }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div key={`bg-${featuredIndex}`} className="hero-fade" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {featured.thumbnail ? (
            <img src={featured.thumbnail} alt={featured.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : featuredYtId ? (
            <YtCover ytId={featuredYtId} alt={featured.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${featured.subjectColor}77 0%, ${BG} 75%)` }} />
          )}
          {/* tinte de color de la materia, para mantener identidad visual sobre la foto */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, ${BG}F5 0%, ${BG}B0 28%, transparent 62%)` }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${BG} 2%, transparent 55%)` }} />
        {!featuredYtId && !featured.thumbnail && <Atom size={340} color="rgba(255,255,255,0.06)" style={{ position: "absolute", right: 60, top: 40 }} />}

        {/* contenedor centrado, mismo ancho máx. y margen que el navbar y las filas */}
        <div style={{
          position: "relative", height: "100%", maxWidth: MAX_WIDTH, margin: "0 auto",
          padding: `0 ${GUTTER}`, display: "flex", alignItems: "flex-end",
        }}>
          <div key={`content-${featuredIndex}`} className="hero-fade" style={{ maxWidth: 620, paddingBottom: 70 }}>
            <div style={{ color: "#4ADE80", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Clase destacada · {featured.subjectName}</div>
            <div style={{ fontFamily: "Helvetica Neue, Arial, sans-serif", fontWeight: 800, fontSize: 56, color: "#fff", lineHeight: 1.02, letterSpacing: "-0.5px" }}>
              {featured.title}
            </div>
            <div style={{ color: "#d2d2d2", fontSize: 15, margin: "18px 0", lineHeight: 1.5 }}>
              {featured.desc}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              <button
                onClick={() => openModal(featured, featured.subject, "play")}
                style={{ background: "#fff", border: "none", borderRadius: 4, padding: "12px 26px", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <Play size={20} fill="#000" /> Reproducir
              </button>
              <button
                onClick={() => openModal(featured, featured.subject, "info")}
                style={{ background: "rgba(109,109,110,0.5)", color: "#fff", border: "none", borderRadius: 4, padding: "12px 26px", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <Info size={20} /> Más información
              </button>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              {featuredPool.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIndex(i)}
                  aria-label={`Mostrar clase destacada ${i + 1}`}
                  style={{
                    width: i === featuredIndex ? 20 : 7, height: 7, borderRadius: 4, border: "none", cursor: "pointer",
                    background: i === featuredIndex ? RED : "rgba(255,255,255,0.35)", transition: "all 300ms ease", padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ROWS — mismo contenedor centrado y mismo margen que navbar y hero */}
      <div style={{
        position: "relative", zIndex: 2, maxWidth: MAX_WIDTH, margin: "0 auto",
        padding: `0 ${GUTTER} 60px`, marginTop: -40,
      }}>
        {continueWatching.length > 0 && (
          <Row title="Seguir viendo" items={continueWatching} onOpen={(item) => openModal(item, { color: item.subjectColor, icon: item.icon })} />
        )}
        {subjects.filter((s) => s.classes.length > 0).map((s) => (
          <Row
            key={s.id}
            title={s.name}
            items={s.classes.map((c) => ({ ...c, color: s.color, icon: s.icon, subjectName: s.name }))}
            onOpen={(item) => openModal(item, s)}
          />
        ))}
      </div>
      </>
      )}

      {/* PÁGINA: MATERIAS — grilla de materias, o las clases de una materia si se eligió una */}
      {view === "materias" && !activeSubject && (
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: `120px ${GUTTER} 60px` }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Materias</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 }}>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => goTo(`materia:${s.id}`)}
                style={{
                  background: `linear-gradient(150deg, ${s.color}CC 0%, ${s.color}55 45%, ${BG} 100%)`,
                  border: "none", borderRadius: 6, height: 120, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <s.icon size={30} color="#fff" />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, textAlign: "center", padding: "0 8px" }}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "materias" && activeSubject && (
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: `120px ${GUTTER} 60px` }}>
          <button onClick={() => goTo("materias")} style={{ background: "transparent", border: "none", color: TEXT_MUTED, fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0 }}>
            ← Todas las materias
          </button>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <activeSubject.icon size={28} color={activeSubject.color} /> {activeSubject.name}
          </h1>
          <CardGrid
            items={activeSubject.classes.map((c) => ({ ...c, color: activeSubject.color, icon: activeSubject.icon, subjectName: activeSubject.name }))}
            onOpen={(item) => openModal(item, activeSubject)}
            emptyMessage="Todavía no hay clases en esta materia."
          />
        </div>
      )}

      {/* PÁGINA: SEGUIR VIENDO */}
      {view === "seguir" && (
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: `120px ${GUTTER} 60px` }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Seguir viendo</h1>
          <CardGrid
            items={continueWatching}
            onOpen={(item) => openModal(item, { color: item.subjectColor, icon: item.icon })}
            emptyMessage="No tenés clases empezadas todavía."
          />
        </div>
      )}

      {/* PÁGINA: MI LISTA */}
      {view === "milista" && (
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: `120px ${GUTTER} 60px` }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Mi lista</h1>
          <CardGrid
            items={myListClasses}
            onOpen={(item) => openModal(item, item.subject)}
            emptyMessage="Todavía no agregaste ninguna clase a tu lista. Tocá el + en cualquier clase para guardarla acá."
          />
        </div>
      )}

      {/* PÁGINA: BUSCAR */}
      {view === "buscar" && (
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: `120px ${GUTTER} 60px` }}>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
            Resultados para "{searchQuery}"
          </h1>
          <CardGrid
            items={searchResults}
            onOpen={(item) => openModal(item, item.subject)}
            emptyMessage="No encontramos ninguna clase con ese nombre."
          />
        </div>
      )}

      <Modal item={modalItem} color={modalColor} Icon={modalIcon} onClose={() => setModalItem(null)} autoPlay={modalAutoPlay} accountId={profile?.id} />
    </div>
  );
}

/* ============================================================
   LOGIN DE ADMINISTRADOR — simple, con contraseña fija.
   Cambiá ADMIN_PASSWORD acá abajo por la contraseña real.
   ============================================================ */
const ADMIN_PASSWORD = "chacaflix2026";

function AdminLogin({ onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (password === ADMIN_PASSWORD) onSuccess();
    else { setError(true); setPassword(""); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, zIndex: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <Lock size={36} color={RED} style={{ marginBottom: 18 }} />
      <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Acceso administrador</h1>
      <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 24 }}>Ingresá la contraseña para gestionar materias y videos.</p>
      <div style={{ width: "min(320px, 90vw)", display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Contraseña"
          style={{ background: "#333", border: `1px solid ${error ? RED : "#666"}`, borderRadius: 4, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none" }}
        />
        {error && <div style={{ color: RED, fontSize: 12 }}>Contraseña incorrecta.</div>}
        <button onClick={submit} style={{ background: "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Ingresar
        </button>
        <button onClick={onCancel} style={{ background: "transparent", border: "none", color: TEXT_MUTED, fontSize: 13, cursor: "pointer", padding: "6px 0" }}>
          Volver
        </button>
      </div>
    </div>
  );
}

const SUBJECT_COLOR_OPTIONS = ["#2E86FF", "#FF6B35", "#22C55E", "#C9A227", "#E11D48", "#16A34A", "#A855F7", "#F97316", "#EAB308", "#E50914", "#06B6D4", "#84CC16"];

const adminInputStyle = { width: "100%", background: "#2a2a2a", border: "1px solid #444", borderRadius: 4, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const adminLabelStyle = { display: "block", color: TEXT_MUTED, fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: "0.03em" };

/* ============================================================
   PANEL DE ADMINISTRADOR — subir/editar/borrar videos y materias,
   estadísticas y lista de alumnos registrados.
   ============================================================ */
function AdminDashboard({ subjects, onAddClass, onUpdateClass, onDeleteClass, onAddSubject, onUpdateSubject, onDeleteSubject, onExit }) {
  const [tab, setTab] = useState("resumen"); // resumen | videos | materias | alumnos
  const [classForm, setClassForm] = useState(null); // null = cerrado, {} = nuevo, {...} = editando
  const [subjectForm, setSubjectForm] = useState(null);
  const [infoItem, setInfoItem] = useState(null); // para ver el detalle de un video desde el top 5
  const [confirmState, setConfirmState] = useState(null); // {title, message, confirmLabel, onConfirm}
  const [materiaDetailId, setMateriaDetailId] = useState(null); // materia abierta en detalle, con sus dos ciclos
  const [materiaCiclo, setMateriaCiclo] = useState("basico"); // pestaña de ciclo activa dentro del detalle

  const allClasses = getAllClasses(subjects);
  const [students, setStudents] = useState([]);
  useEffect(() => { dbFetchAccounts().then(setStudents).catch(() => setStudents([])); }, []);
  const deleteAccount = async (id) => {
    await dbDeleteAccount(id);
    setStudents((prev) => prev.filter((a) => a.id !== id));
  };
  const materiaDetail = materiaDetailId ? subjects.find((s) => s.id === materiaDetailId) : null;

  const top5 = [...allClasses]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const askConfirm = (opts) => setConfirmState(opts);

  const openNewClass = (subjectId, ciclo) => setClassForm({ id: null, subjectId: subjectId || subjects[0]?.id || "", ciclo: ciclo || "basico", title: "", prof: "", desc: "", videoUrl: "", thumbnail: "", duration: "" });
  const openEditClass = (c) => setClassForm({ id: c.id, subjectId: c.subjectId, ciclo: c.ciclo || "basico", title: c.title, prof: c.prof, desc: c.desc, videoUrl: c.videoUrl || "", thumbnail: c.thumbnail || "", duration: c.duration || "" });

  const openNewSubject = () => setSubjectForm({ id: null, name: "", color: SUBJECT_COLOR_OPTIONS[subjects.length % SUBJECT_COLOR_OPTIONS.length], iconKey: ICON_OPTIONS[0] });
  const openEditSubject = (s) => setSubjectForm({ id: s.id, name: s.name, color: s.color, iconKey: s.iconKey });

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, zIndex: 800, overflowY: "auto", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, background: "#0c0c0c", borderBottom: "1px solid #262626", zIndex: 5 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ color: RED, fontFamily: LOGO_FONT, fontWeight: 900, fontSize: 22, letterSpacing: "-1px", textTransform: "uppercase", textShadow: "1.5px 2px 0px #7A0D12" }}>Chacaflix</div>
            <span style={{ color: TEXT_MUTED, fontSize: 13 }}>· Panel de administrador</span>
          </div>
          <button onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #444", color: "#fff", padding: "8px 14px", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>
            <ArrowLeft size={15} /> Volver a la app
          </button>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {[
            { key: "resumen", label: "Resumen", icon: BarChart3 },
            { key: "videos", label: "Videos", icon: LayoutDashboard },
            { key: "materias", label: "Materias", icon: Pencil },
            { key: "alumnos", label: "Alumnos", icon: Users },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer",
                padding: "12px 14px", fontSize: 14, color: tab === t.key ? "#fff" : TEXT_MUTED,
                borderBottom: tab === t.key ? `2px solid ${RED}` : "2px solid transparent", fontWeight: tab === t.key ? 700 : 400,
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* ===== RESUMEN ===== */}
        {tab === "resumen" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Alumnos registrados", value: students.length },
                { label: "Materias", value: subjects.length },
                { label: "Videos totales", value: allClasses.filter((c) => c.videoUrl).length },
                { label: "Clases sin video", value: allClasses.filter((c) => !c.videoUrl).length },
              ].map((stat) => (
                <div key={stat.label} style={{ background: CARD_BG, borderRadius: 6, padding: 18 }}>
                  <div style={{ color: "#fff", fontSize: 30, fontWeight: 800 }}>{stat.value}</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Videos por materia</h3>
            <div style={{ background: CARD_BG, borderRadius: 6, marginBottom: 32, overflow: "hidden" }}>
              {subjects.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: i > 0 ? "1px solid #262626" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 14 }}>
                    <s.icon size={16} color={s.color} /> {s.name}
                  </div>
                  <div style={{ color: TEXT_MUTED, fontSize: 13 }}>
                    {s.classes.filter((c) => c.videoUrl).length} / {s.classes.length} con video
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Top 5 más vistos</h3>
            <div style={{ background: CARD_BG, borderRadius: 6, overflow: "hidden" }}>
              {top5.length === 0 && <div style={{ padding: 16, color: TEXT_MUTED, fontSize: 13 }}>Todavía no hay vistas registradas.</div>}
              {top5.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setInfoItem(c)}
                  style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                    borderTop: i > 0 ? "1px solid #262626" : "none", background: "transparent", border: "none", cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: TEXT_MUTED, width: 24 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{c.subjectName}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_MUTED, fontSize: 13 }}>
                    <Eye size={14} /> {c.views}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== VIDEOS ===== */}
        {tab === "videos" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Todos los videos ({allClasses.length})</h3>
              <button onClick={() => openNewClass()} style={{ display: "flex", alignItems: "center", gap: 6, background: RED, border: "none", color: "#fff", padding: "10px 16px", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={16} /> Agregar clase
              </button>
            </div>
            <div style={{ background: CARD_BG, borderRadius: 6, overflow: "hidden" }}>
              {allClasses.map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderTop: i > 0 ? "1px solid #262626" : "none" }}>
                  <div style={{ width: 70, height: 42, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    <Thumb classItem={c} color={c.color} Icon={c.icon} tall={false} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{c.subjectName} · {c.prof} · {c.duration}{!c.videoUrl && " · sin video"}</div>
                  </div>
                  <button onClick={() => openEditClass(c)} style={{ background: "transparent", border: "1px solid #444", color: "#fff", padding: 8, borderRadius: 4, cursor: "pointer" }} aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => askConfirm({
                      title: "Borrar clase",
                      message: `¿Seguro que querés borrar "${c.title}"? Esta acción no se puede deshacer.`,
                      confirmLabel: "Borrar",
                      onConfirm: () => { onDeleteClass(c.subjectId, c.id); setConfirmState(null); },
                    })}
                    style={{ background: "transparent", border: "1px solid #444", color: RED, padding: 8, borderRadius: 4, cursor: "pointer" }}
                    aria-label="Borrar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MATERIAS ===== */}
        {tab === "materias" && !materiaDetail && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Materias ({subjects.length})</h3>
              <button onClick={openNewSubject} style={{ display: "flex", alignItems: "center", gap: 6, background: RED, border: "none", color: "#fff", padding: "10px 16px", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={16} /> Agregar materia
              </button>
            </div>
            <div style={{ background: CARD_BG, borderRadius: 6, overflow: "hidden" }}>
              {subjects.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => { setMateriaDetailId(s.id); setMateriaCiclo("basico"); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderTop: i > 0 ? "1px solid #262626" : "none", cursor: "pointer" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <s.icon size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{s.classes.length} clases</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditSubject(s); }}
                    style={{ background: "transparent", border: "1px solid #444", color: "#fff", padding: 8, borderRadius: 4, cursor: "pointer" }}
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      askConfirm({
                        title: "Borrar materia",
                        message: `¿Seguro que querés borrar la materia "${s.name}" y sus ${s.classes.length} clases? Esta acción no se puede deshacer.`,
                        confirmLabel: "Borrar",
                        onConfirm: () => { onDeleteSubject(s.id); setConfirmState(null); },
                      });
                    }}
                    style={{ background: "transparent", border: "1px solid #444", color: RED, padding: 8, borderRadius: 4, cursor: "pointer" }}
                    aria-label="Borrar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== DETALLE DE UNA MATERIA — separado por ciclo ===== */}
        {tab === "materias" && materiaDetail && (
          <div>
            <button onClick={() => setMateriaDetailId(null)} style={{ background: "transparent", border: "none", color: TEXT_MUTED, fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowLeft size={14} /> Todas las materias
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: materiaDetail.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <materiaDetail.icon size={20} color="#fff" />
              </div>
              <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>{materiaDetail.name}</h3>
            </div>

            {/* pestañas de ciclo — misma materia, contenido separado por año */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {CYCLE_LIST.map((c) => {
                const count = materiaDetail.classes.filter((cl) => cl.ciclo === c.key).length;
                return (
                  <button
                    key={c.key}
                    onClick={() => setMateriaCiclo(c.key)}
                    style={{
                      flex: 1, textAlign: "left", padding: "12px 16px", borderRadius: 6, cursor: "pointer",
                      background: materiaCiclo === c.key ? "#3a1013" : CARD_BG,
                      border: materiaCiclo === c.key ? `1px solid ${RED}` : "1px solid transparent",
                    }}
                  >
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{c.label}</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{c.sublabel} · {count} clase{count !== 1 ? "s" : ""}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>Clases de {CYCLES[materiaCiclo].label.toLowerCase()}</h4>
              <button
                onClick={() => openNewClass(materiaDetail.id, materiaCiclo)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: RED, border: "none", color: "#fff", padding: "10px 16px", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                <Plus size={16} /> Agregar clase acá
              </button>
            </div>

            <div style={{ background: CARD_BG, borderRadius: 6, overflow: "hidden" }}>
              {materiaDetail.classes.filter((c) => c.ciclo === materiaCiclo).length === 0 && (
                <div style={{ padding: 16, color: TEXT_MUTED, fontSize: 13 }}>Todavía no hay clases de {materiaDetail.name} en este ciclo.</div>
              )}
              {materiaDetail.classes.filter((c) => c.ciclo === materiaCiclo).map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderTop: i > 0 ? "1px solid #262626" : "none" }}>
                  <div style={{ width: 70, height: 42, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    <Thumb classItem={c} color={materiaDetail.color} Icon={materiaDetail.icon} tall={false} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{c.prof} · {c.duration}{!c.videoUrl && " · sin video"}</div>
                  </div>
                  <button onClick={() => openEditClass({ ...c, subjectId: materiaDetail.id })} style={{ background: "transparent", border: "1px solid #444", color: "#fff", padding: 8, borderRadius: 4, cursor: "pointer" }} aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => askConfirm({
                      title: "Borrar clase",
                      message: `¿Seguro que querés borrar "${c.title}"? Esta acción no se puede deshacer.`,
                      confirmLabel: "Borrar",
                      onConfirm: () => { onDeleteClass(materiaDetail.id, c.id); setConfirmState(null); },
                    })}
                    style={{ background: "transparent", border: "1px solid #444", color: RED, padding: 8, borderRadius: 4, cursor: "pointer" }}
                    aria-label="Borrar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ALUMNOS ===== */}
        {tab === "alumnos" && (
          <div>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Alumnos registrados ({students.length})</h3>
            <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 16 }}>Cuentas creadas en este navegador.</p>
            <div style={{ background: CARD_BG, borderRadius: 6, overflow: "hidden" }}>
              {students.length === 0 && <div style={{ padding: 16, color: TEXT_MUTED, fontSize: 13 }}>Todavía no se registró ningún alumno.</div>}
              {students.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid #262626" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, color: "#fff", fontSize: 14 }}>{p.username}</div>
                  <div style={{ background: "#2a2a2a", color: TEXT_MUTED, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 4, textTransform: "uppercase" }}>
                    {CYCLES[p.ciclo]?.label || p.ciclo}
                  </div>
                  <button
                    onClick={() => askConfirm({
                      title: "Borrar alumno",
                      message: `¿Seguro que querés borrar la cuenta de "${p.username}"? Va a perder el acceso y su lista guardada. Esta acción no se puede deshacer.`,
                      confirmLabel: "Borrar",
                      onConfirm: () => { deleteAccount(p.id); setConfirmState(null); },
                    })}
                    style={{ background: "transparent", border: "1px solid #444", color: RED, padding: 8, borderRadius: 4, cursor: "pointer" }}
                    aria-label="Borrar alumno"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FORM: agregar/editar clase */}
      {classForm && (
        <ClassFormModal
          form={classForm}
          subjects={subjects}
          onClose={() => setClassForm(null)}
          onSave={(data) => {
            if (classForm.id) {
              if (data.subjectId !== classForm.subjectId) {
                onDeleteClass(classForm.subjectId, classForm.id);
                onAddClass(data.subjectId, { ...data, id: classForm.id });
              } else {
                onUpdateClass(data.subjectId, classForm.id, data);
              }
            } else {
              onAddClass(data.subjectId, { ...data, id: `cls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` });
            }
            setClassForm(null);
          }}
        />
      )}

      {/* FORM: agregar/editar materia */}
      {subjectForm && (
        <SubjectFormModal
          form={subjectForm}
          subjects={subjects}
          onClose={() => setSubjectForm(null)}
          onSave={(data) => {
            if (subjectForm.id) onUpdateSubject(subjectForm.id, data);
            else onAddSubject({ ...data, id: `subj_${Date.now()}` });
            setSubjectForm(null);
          }}
        />
      )}

      {/* INFO de un video desde el Top 5 */}
      {infoItem && (
        <Modal
          item={infoItem}
          color={infoItem.color}
          Icon={infoItem.icon}
          onClose={() => setInfoItem(null)}
          autoPlay={false}
        />
      )}

      {/* CONFIRMACIÓN estilo Netflix para borrar clases/materias */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}

function ClassFormModal({ form, subjects, onClose, onSave }) {
  const [data, setData] = useState(form);
  const [calculating, setCalculating] = useState(false);

  const calcDuration = async () => {
    const ytId = getYouTubeId(data.videoUrl);
    if (!ytId) return;
    setCalculating(true);
    const seconds = await fetchYouTubeDuration(ytId);
    setCalculating(false);
    setData((d) => ({ ...d, duration: seconds ? formatDurationFromSeconds(seconds) : d.duration || "—" }));
  };

  const valid = data.subjectId && data.ciclo && data.title.trim() && data.prof.trim() && data.desc.trim() && data.videoUrl.trim();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#181818", width: "min(520px, 100%)", borderRadius: 8, padding: 24, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>{form.id ? "Editar clase" : "Agregar clase"}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <label style={adminLabelStyle}>Materia *</label>
        <select value={data.subjectId} onChange={(e) => setData({ ...data, subjectId: e.target.value })} style={adminInputStyle}>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <label style={adminLabelStyle}>Ciclo *</label>
        <div style={{ display: "flex", gap: 8 }}>
          {CYCLE_LIST.map((c) => (
            <button
              key={c.key}
              onClick={() => setData({ ...data, ciclo: c.key })}
              style={{
                flex: 1, textAlign: "left", background: data.ciclo === c.key ? "#3a1013" : "#2a2a2a",
                border: data.ciclo === c.key ? `1px solid ${RED}` : "1px solid #444", borderRadius: 6, padding: "8px 12px", cursor: "pointer",
              }}
            >
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{c.label}</div>
              <div style={{ color: TEXT_MUTED, fontSize: 11 }}>{c.sublabel}</div>
            </button>
          ))}
        </div>

        <label style={adminLabelStyle}>Título de la clase *</label>
        <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} style={adminInputStyle} placeholder="Ej: Ecuaciones lineales" />

        <label style={adminLabelStyle}>Nombre del profesor *</label>
        <input value={data.prof} onChange={(e) => setData({ ...data, prof: e.target.value })} style={adminInputStyle} placeholder="Ej: Prof. García" />

        <label style={adminLabelStyle}>Información breve del video *</label>
        <textarea value={data.desc} onChange={(e) => setData({ ...data, desc: e.target.value })} style={{ ...adminInputStyle, minHeight: 70, resize: "vertical", fontFamily: "inherit" }} placeholder="De qué trata la clase" />

        <label style={adminLabelStyle}>Link de YouTube *</label>
        <input
          value={data.videoUrl}
          onChange={(e) => setData({ ...data, videoUrl: e.target.value })}
          onBlur={calcDuration}
          style={adminInputStyle}
          placeholder="https://youtu.be/..."
        />
        <div style={{ marginTop: 8, fontSize: 13, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 6 }}>
          {calculating ? (<><Loader2 size={14} className="spin" /> Calculando duración...</>) : (<>Duración: <strong style={{ color: "#fff" }}>{data.duration || "se calcula sola al pegar el link"}</strong></>)}
        </div>

        <label style={adminLabelStyle}>Miniatura personalizada (opcional)</label>
        <input value={data.thumbnail} onChange={(e) => setData({ ...data, thumbnail: e.target.value })} style={adminInputStyle} placeholder="URL de imagen — si la dejás vacía, se usa la del video" />

        <button
          disabled={!valid}
          onClick={() => onSave(data)}
          style={{ marginTop: 20, width: "100%", background: valid ? RED : "#555", border: "none", color: "#fff", padding: "12px 0", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: valid ? "pointer" : "default" }}
        >
          {form.id ? "Guardar cambios" : "Subir clase"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    </div>
  );
}

function SubjectFormModal({ form, subjects, onClose, onSave }) {
  const [data, setData] = useState(form);
  const trimmedName = data.name.trim();
  const isDuplicate = trimmedName.length > 0 && subjects.some(
    (s) => s.id !== data.id && s.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  const valid = trimmedName && !isDuplicate;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#181818", width: "min(420px, 100%)", borderRadius: 8, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>{form.id ? "Editar materia" : "Agregar materia"}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <label style={adminLabelStyle}>Nombre *</label>
        <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} style={adminInputStyle} placeholder="Ej: Geografía" />
        {isDuplicate && (
          <div style={{ color: RED, fontSize: 12, marginTop: 6 }}>Ya existe una materia con ese nombre.</div>
        )}

        <label style={adminLabelStyle}>Color</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUBJECT_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setData({ ...data, color: c })}
              style={{ width: 30, height: 30, borderRadius: 6, background: c, border: data.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }}
            />
          ))}
        </div>

        <label style={adminLabelStyle}>Ícono</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ICON_OPTIONS.map((key) => {
            const IconComp = ICONS[key];
            return (
              <button
                key={key}
                onClick={() => setData({ ...data, iconKey: key })}
                style={{ width: 40, height: 40, borderRadius: 6, background: data.iconKey === key ? data.color : "#2a2a2a", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <IconComp size={18} color="#fff" />
              </button>
            );
          })}
        </div>

        <button
          disabled={!valid}
          onClick={() => onSave(data)}
          style={{ marginTop: 20, width: "100%", background: valid ? RED : "#555", border: "none", color: "#fff", padding: "12px 0", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: valid ? "pointer" : "default" }}
        >
          {form.id ? "Guardar cambios" : "Crear materia"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   RAÍZ DE LA APP — intro animada → login/registro → app
   ============================================================ */
export default function ChacaFlix() {
  const [stage, setStage] = useState("intro"); // "intro" | "auth" | "adminLogin" | "admin" | "app"
  const [account, setAccount] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  const reloadSubjects = async () => {
    try {
      setSubjectsError(null);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (e) {
      console.error(e);
      setSubjectsError(e.message || "Ocurrió un error desconocido.");
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => { reloadSubjects(); }, []);

  const addClass = async (subjectId, cls) => { await dbAddClass(subjectId, cls); await reloadSubjects(); };
  const updateClass = async (subjectId, classId, patch) => { await dbUpdateClass(subjectId, classId, patch); await reloadSubjects(); };
  const deleteClass = async (subjectId, classId) => { await dbDeleteClass(classId); await reloadSubjects(); };
  const addSubject = async (subj) => { await dbAddSubject(subj); await reloadSubjects(); };
  const updateSubject = async (id, patch) => { await dbUpdateSubject(id, patch); await reloadSubjects(); };
  const deleteSubject = async (id) => { await dbDeleteSubject(id); await reloadSubjects(); };

  const handleIntroDone = () => setStage("auth");
  const handleAuthenticated = (acc) => {
    setAccount(acc);
    setStage("app");
  };
  const handleLogout = () => {
    setAccount(null);
    setStage("auth");
  };

  if (stage === "intro") return <IntroAnimation onDone={handleIntroDone} />;

  // pantallas que necesitan las materias ya cargadas desde la base
  if (stage === "app" || stage === "admin") {
    if (subjectsLoading) {
      return (
        <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
          <Loader2 size={32} color={RED} className="spin" />
          <div style={{ color: TEXT_MUTED, fontSize: 14 }}>Conectando con la base de datos...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
      );
    }
    if (subjectsError) {
      return (
        <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
          <div style={{ color: RED, fontSize: 16, fontWeight: 700 }}>No se pudo conectar con la base de datos</div>
          <div style={{ color: TEXT_MUTED, fontSize: 13, maxWidth: 420 }}>{subjectsError}</div>
          <div style={{ color: TEXT_MUTED, fontSize: 13, maxWidth: 420 }}>Revisá que ya hayas corrido el script SQL en Supabase y que las credenciales en <code style={{ color: "#eee" }}>supabaseClient.js</code> sean correctas.</div>
          <button onClick={reloadSubjects} style={{ marginTop: 8, background: RED, border: "none", color: "#fff", padding: "10px 22px", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      );
    }
  }

  if (stage === "auth") return <AuthGate onAuthenticated={handleAuthenticated} onAdminRequest={() => setStage("adminLogin")} />;
  if (stage === "adminLogin") return <AdminLogin onSuccess={() => setStage("admin")} onCancel={() => setStage("auth")} />;
  if (stage === "admin") {
    return (
      <AdminDashboard
        subjects={subjects}
        onAddClass={addClass}
        onUpdateClass={updateClass}
        onDeleteClass={deleteClass}
        onAddSubject={addSubject}
        onUpdateSubject={updateSubject}
        onDeleteSubject={deleteSubject}
        onExit={() => setStage(account ? "app" : "auth")}
      />
    );
  }
  return (
    <BrowseApp
      profile={account}
      onSwitchProfile={handleLogout}
      subjects={subjects}
      onOpenAdmin={() => setStage("adminLogin")}
    />
  );
}
