import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  User,
  Dog,
  Cat, // NUEVO
  Bone, // NUEVO
  Mail,
  Phone,
  Calendar,
  PawPrint,
  Trash2,
  Edit,
  X,
  Info,
  ExternalLink,
  Archive,
  Search,
  ArrowLeft,
  PackageSearch,
  ShoppingCart,
  DollarSign,
  ReceiptText,
  PlusCircle,
  TrendingUp,
  Wallet,
  Lock,
  Key,
  LogOut,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Printer,
  AlertTriangle,
  Clipboard,
  Clock,
  Bell,
  Stethoscope,
  Pill,
  Syringe,
  Scissors,
  Tag,
  Users,
  Package,
  ShoppingBag,
} from "lucide-react";

// =====================================================================
// 🩺 IDENTIDAD VISUAL: "consultorio cálido"
// =====================================================================

// Papel tapiz de consultorio: huellitas y cruces médicas muy suaves sobre menta.
// (Reemplaza las manchas borrosas, que además gastaban mucha batería en tablets.)
const PATRON_CONSULTORIO = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g fill='#0d9488' fill-opacity='0.075' transform='translate(32 34) rotate(-18)'><ellipse cx='0' cy='8' rx='9' ry='7.5'/><circle cx='-9' cy='-4' r='3.6'/><circle cx='-3.2' cy='-9.5' r='3.6'/><circle cx='3.2' cy='-9.5' r='3.6'/><circle cx='9' cy='-4' r='3.6'/></g><g fill='#f43f5e' fill-opacity='0.06' transform='translate(116 48)'><rect x='-2.5' y='-8' width='5' height='16' rx='1.6'/><rect x='-8' y='-2.5' width='16' height='5' rx='1.6'/></g><g fill='#0d9488' fill-opacity='0.055' transform='translate(112 122) rotate(24) scale(0.8)'><ellipse cx='0' cy='8' rx='9' ry='7.5'/><circle cx='-9' cy='-4' r='3.6'/><circle cx='-3.2' cy='-9.5' r='3.6'/><circle cx='3.2' cy='-9.5' r='3.6'/><circle cx='9' cy='-4' r='3.6'/></g><g fill='#0d9488' fill-opacity='0.05' transform='translate(38 118) scale(0.75)'><rect x='-2.5' y='-8' width='5' height='16' rx='1.6'/><rect x='-8' y='-2.5' width='16' height='5' rx='1.6'/></g></svg>",
)}")`;

const ClinicBackdrop = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 -z-10 pointer-events-none bg-[#eef8f6]"
    style={{ backgroundImage: PATRON_CONSULTORIO, backgroundSize: "160px 160px" }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-teal-50/70" />
  </div>
);

// El detalle distintivo: una línea de latido (electrocardiograma) que termina en huellita.
const HeartbeatPaw = ({ className = "" }) => (
  <svg viewBox="0 0 230 30" className={className} fill="none" aria-hidden="true">
    <path
      className="latido-trazo"
      pathLength="1"
      d="M2 17 H72 L80 17 L86 7 L94 27 L102 3 L110 23 L116 17 H190"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* posición y animación en grupos separados (la animación CSS pisaría el translate) */}
    <g transform="translate(208 16)">
      <g className="latido-huella" fill="currentColor">
        <ellipse cx="0" cy="4" rx="5.6" ry="4.6" />
        <circle cx="-5.6" cy="-3" r="2.3" />
        <circle cx="-2" cy="-6.6" r="2.3" />
        <circle cx="2" cy="-6.6" r="2.3" />
        <circle cx="5.6" cy="-3" r="2.3" />
      </g>
    </g>
  </svg>
);

// Cada categoría del almacén con su ícono y color (información, no decoración)
const CATEGORIAS_ESTILO = {
  Medicamento: { Icon: Pill, cls: "bg-sky-50 text-sky-700 border-sky-200" },
  Vacuna: { Icon: Syringe, cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  Alimento: { Icon: Bone, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  Accesorios: { Icon: Tag, cls: "bg-rose-50 text-rose-700 border-rose-200" },
  Servicio: { Icon: Scissors, cls: "bg-teal-50 text-teal-700 border-teal-200" },
};

const CategoryBadge = ({ category }) => {
  const { Icon, cls } = CATEGORIAS_ESTILO[category] || {
    Icon: Package,
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cls}`}>
      <Icon size={14} />
      {category}
    </span>
  );
};

// Áreas de negocio de la clínica (punto 1 de la lista de Maru)
const AREAS = {
  medico: { label: "Médico", Icon: Stethoscope, cls: "text-sky-700 bg-sky-50 border-sky-200" },
  estetica: { label: "Estética", Icon: Scissors, cls: "text-teal-700 bg-teal-50 border-teal-200" },
  tienda: { label: "Tienda", Icon: ShoppingBag, cls: "text-amber-700 bg-amber-50 border-amber-200" },
};
// Si el producto no tiene área elegida, se deduce de su categoría
const areaDe = (p) =>
  p?.area && AREAS[p.area]
    ? p.area
    : ["Medicamento", "Vacuna"].includes(p?.category)
      ? "medico"
      : p?.category === "Servicio"
        ? "estetica"
        : "tienda";

// ===== Cartilla: vacunas y desparasitación (punto 9) =====
const SUGERENCIAS_PREVENTIVO = [
  "Parvovirus (cachorro)",
  "Séxtuple / Múltiple canina",
  "Rabia",
  "Bordetella (tos de las perreras)",
  "Leptospirosis",
  "Triple felina",
  "Leucemia felina",
  "Desparasitante interno",
  "Desparasitante externo (pulgas y garrapatas)",
];
const TIPOS_PREVENTIVO = {
  vacuna: { label: "Vacuna", Icon: Syringe },
  desparasitacion: { label: "Desparasitación", Icon: Pill },
  otro: { label: "Otro tratamiento", Icon: FileText },
};
const INTERVALOS = [
  ["none", "No se repite"],
  ["15d", "En 15 días"],
  ["1m", "En 1 mes"],
  ["3m", "En 3 meses"],
  ["6m", "En 6 meses"],
  ["1y", "En 1 año"],
  ["custom", "Elegir fecha…"],
];
const hoyLocalISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Suma un intervalo ("15d", "1m", "3m", "6m", "1y") a una fecha AAAA-MM-DD
const sumarIntervalo = (iso, intervalo) => {
  if (!iso || !intervalo || ["none", "custom"].includes(intervalo)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  if (intervalo.endsWith("d")) f.setDate(f.getDate() + parseInt(intervalo));
  else {
    const meses = intervalo === "1y" ? 12 : parseInt(intervalo);
    const dia = f.getDate();
    f.setDate(1);
    f.setMonth(f.getMonth() + meses);
    f.setDate(Math.min(dia, new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate()));
  }
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
};
// Estado de una próxima dosis: vencida / próxima (30 días) / al día / sin refuerzo
const estadoDosis = (proxima) => {
  if (!proxima) return { key: "sin", label: "Sin refuerzo", cls: "bg-slate-100 text-slate-500" };
  const hoy = hoyLocalISO();
  const dias = Math.round((new Date(`${proxima}T12:00:00`) - new Date(`${hoy}T12:00:00`)) / 86400000);
  if (dias < 0) return { key: "vencida", dias, label: `Vencida hace ${-dias} día${dias === -1 ? "" : "s"}`, cls: "bg-rose-100 text-rose-700" };
  if (dias === 0) return { key: "proxima", dias, label: "Toca hoy", cls: "bg-amber-100 text-amber-800" };
  if (dias <= 30) return { key: "proxima", dias, label: `En ${dias} día${dias === 1 ? "" : "s"}`, cls: "bg-amber-100 text-amber-800" };
  return { key: "al-dia", dias, label: "Al día", cls: "bg-teal-100 text-teal-700" };
};

// ===== Notificaciones al teléfono (Web Push) =====
const urlBase64ToUint8Array = (b64) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};
const esIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const esAppInstalada = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
const pushSoportado = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// Abre WhatsApp con el mensaje ya escrito (en el celular abre la app de WhatsApp)
const abrirWhatsApp = (telefono, mensaje) => {
  // api.whatsapp.com directo (wa.me redirige y en el salto se dañan algunos caracteres)
  const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
  const ventana = window.open(url, "_blank");
  if (!ventana) window.location.href = url;
};

// Círculo con la especie del paciente (perrito, gatito u otro)
const SpeciesAvatar = ({ species, size = 44 }) => {
  const s = (species || "").toLowerCase();
  const esGato = s.includes("gat");
  const Icon = esGato ? Cat : s.includes("perr") ? Dog : PawPrint;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl border-2 shrink-0 ${esGato ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-teal-50 text-teal-600 border-teal-100"}`}
      style={{ width: size, height: size }}
      title={species || "Especie no indicada"}
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
};

// 🛡️ SEGURIDAD: escapa texto antes de meterlo en el HTML de las impresiones
// (receta, expediente, consentimiento). Así, si alguien escribe código en un
// nombre desde la Sala de Espera pública, se imprime como texto y no se ejecuta.
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

// ✨ COMPONENTE: CAMPO DE FECHA INTELIGENTE (HÍBRIDO PARA TABLETS/MÓVILES)
const SmartDateInput = ({ value, onChange, className, required }) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value && value.includes("-")) {
      // Solo la parte de la fecha (por si llega "AAAA-MM-DDT00:00:00")
      const [y, m, d] = value.slice(0, 10).split("-");
      setDisplayValue(`${d}/${m}/${y}`);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleTextChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Borramos letras, solo números
    if (val.length > 8) val = val.slice(0, 8);
    
    // Auto-formato con diagonales
    let formatted = val;
    if (val.length > 4) formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    else if (val.length > 2) formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
    setDisplayValue(formatted);

    // Si ya completó los 8 dígitos, se lo pasamos a la base de datos
    if (val.length === 8) {
      onChange(`${val.slice(4, 8)}-${val.slice(2, 4)}-${val.slice(0, 2)}`);
    } else {
      onChange(""); 
    }
  };

  return (
    <div className="relative w-full flex items-center group">
      <input
        type="tel" // Abre el teclado numérico en iPad/Celular
        required={required}
        value={displayValue}
        onChange={handleTextChange}
        placeholder="DD/MM/AAAA"
        className={`${className} pr-12`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl cursor-pointer hover:bg-slate-200/50 transition-colors">
        <Calendar className="text-teal-600 absolute pointer-events-none" size={20} />
        <input
          type="date"
          value={value ? value.slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            try {
              e.target.showPicker();
            } catch (err) {}
          }}
          className="opacity-0 absolute inset-0 cursor-pointer w-[200%] h-[200%] -top-1/2 -left-1/2"
        />
      </div>
    </div>
  );
};

// ==========================================
// --- SALA DE ESPERA INTELIGENTE (CLIENTES) ---
// ==========================================
const RegistroPublico = ({ API_BASE }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // ✨ NUEVO ESTADO PARA SABER SI YA ES CLIENTE
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

  const [owner, setOwner] = useState({ name: "", phone: "", address: "" });
  const [folio, setFolio] = useState("");
  const [pet, setPet] = useState({
    name: "",
    species: "Perro",
    breed: "",
    sex: "Macho (M)",
    color: "",
    birth_date: "",
  });

  const submitForm = async () => {
    setLoading(true);
    try {
      // Ruta pública: registra dueño + mascota y NO devuelve datos de nadie
      const res = await axios.post(`${API_BASE}/public/registro`, {
        owner: { name: owner.name, phone: owner.phone, address: owner.address },
        pet,
      });
      setFolio(res.data.folio);
      setStep(3);
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire(
        "No se pudo registrar",
        typeof detail === "string"
          ? detail
          : "Revisa tus datos (teléfono de 10 dígitos) o avisa en recepción.",
        "error",
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 relative flex justify-center items-center p-6 z-0">
      <ClinicBackdrop />

      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/50 w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-4">
          <img
            src="/Dogs_&_Cats.jpeg"
            alt="Dogs & Cats Logo"
            className="w-24 h-24 rounded-2xl shadow-md border-2 border-white object-contain bg-white"
          />
        </div>
        <h2 className="text-3xl font-black text-center text-slate-800 mb-1">
          {step === 3 ? "¡Registro exitoso!" : "¡Bienvenidos a Dogs & Cats!"}
        </h2>
        {step !== 3 && (
          <>
            <p className="text-slate-500 text-center font-semibold text-sm mb-5">
              Registra a tu mascota mientras esperas tu turno.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6" aria-label={`Paso ${step} de 2`}>
              {[
                { n: 1, label: "Tus datos" },
                { n: 2, label: "Tu mascota" },
              ].map(({ n, label }, idx) => (
                <div key={n} className="flex items-center gap-4">
                  {idx > 0 && (
                    <span className={`h-0.5 w-8 rounded-full ${step >= n ? "bg-teal-400" : "bg-slate-200"}`} />
                  )}
                  <span
                    className={`flex items-center gap-1.5 text-sm font-bold ${step >= n ? "text-teal-600" : "text-slate-300"}`}
                  >
                    <PawPrint size={18} /> {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PASO 1: DATOS DEL DUEÑO */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="flex flex-col gap-4"
          >
            {/* ✨ INTERRUPTOR ELEGANTE: NUEVO VS RECURRENTE */}
            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl mb-2">
              <button
                type="button"
                onClick={() => setIsReturningCustomer(false)}
                className={`w-1/2 py-2.5 rounded-lg font-black text-sm transition-all ${!isReturningCustomer ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Nuevo Registro
              </button>
              <button
                type="button"
                onClick={() => setIsReturningCustomer(true)}
                className={`w-1/2 py-2.5 rounded-lg font-black text-sm transition-all ${isReturningCustomer ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Ya soy cliente
              </button>
            </div>

            <input
              type="text"
              placeholder="Tu Nombre Completo"
              required
              value={owner.name}
              onChange={(e) => setOwner({ ...owner, name: e.target.value })}
              className="w-full p-4 rounded-xl bg-white/60 border border-slate-200 outline-none focus:border-teal-500 font-bold shadow-inner"
            />
            <input
              type="tel"
              placeholder="Teléfono celular (10 dígitos)"
              required
              value={owner.phone}
              onChange={(e) => setOwner({ ...owner, phone: e.target.value })}
              className="w-full p-4 rounded-xl bg-white/60 border border-slate-200 outline-none focus:border-teal-500 font-bold shadow-inner"
            />

            {/* ✨ MAGIA: Si NO es cliente recurrente, le pedimos el domicilio. Si ya lo es, lo ocultamos. */}
            {!isReturningCustomer && (
              <input
                type="text"
                placeholder="Domicilio (Opcional)"
                value={owner.address}
                onChange={(e) =>
                  setOwner({ ...owner, address: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-white/60 border border-slate-200 outline-none focus:border-teal-500 font-bold shadow-inner animate-in fade-in slide-in-from-top-2"
              />
            )}

            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-black py-4 rounded-xl shadow-lg hover:from-teal-400 hover:to-teal-500 transition-all active:scale-95"
            >
              Siguiente Paso 🐾
            </button>
          </form>
        )}

        {/* PASO 2: DATOS DE LA MASCOTA */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Nombre de la Mascota"
              required
              value={pet.name}
              onChange={(e) => setPet({ ...pet, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/60 border border-slate-200 font-bold shadow-inner"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={pet.species}
                onChange={(e) => setPet({ ...pet, species: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/60 border border-slate-200 font-bold text-slate-600 shadow-inner"
              >
                <option>Perro</option>
                <option>Gato</option>
                <option>Otro</option>
              </select>
              <select
                value={pet.sex}
                onChange={(e) => setPet({ ...pet, sex: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/60 border border-slate-200 font-bold text-slate-600 shadow-inner"
              >
                <option>Macho (M)</option>
                <option>Hembra (H)</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Raza"
              required
              value={pet.breed}
              onChange={(e) => setPet({ ...pet, breed: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/60 border border-slate-200 font-bold shadow-inner"
            />
            <input
              type="text"
              placeholder="Color"
              required
              value={pet.color}
              onChange={(e) => setPet({ ...pet, color: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/60 border border-slate-200 font-bold shadow-inner"
            />
            <div>
              <label className="text-xs font-bold text-slate-500 ml-2">
                Fecha de Nacimiento (Aprox)
              </label>
              <SmartDateInput
                required
                value={pet.birth_date}
                onChange={(val) => setPet({ ...pet, birth_date: val })}
                className="w-full p-3 rounded-xl bg-white/60 border border-slate-200 font-bold text-slate-600 shadow-inner"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-200 text-slate-700 font-black py-4 rounded-xl hover:bg-slate-300 transition-all active:scale-95"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-black py-4 rounded-xl shadow-lg hover:from-teal-400 hover:to-teal-500 transition-all active:scale-95"
              >
                {loading ? "Guardando..." : "Finalizar Registro 🚀"}
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: PANTALLA DE ÉXITO */}
        {step === 3 && (
          <div className="text-center py-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
              <span className="text-5xl">✅</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              ¡Todo Listo!
            </h3>
            <p className="text-slate-600 font-medium mb-8">
              Tus datos y los de <strong>{pet.name}</strong> ya están seguros en
              nuestro sistema.
            </p>
            {folio && (
              <p className="text-teal-700 font-black text-lg mb-6 -mt-4">
                Folio: {folio}
              </p>
            )}
            <button
              onClick={() => {
                setStep(1);
                setFolio("");
                setOwner({ name: "", phone: "", address: "" });
                setPet({
                  name: "",
                  species: "Perro",
                  breed: "",
                  sex: "Macho (M)",
                  color: "",
                  birth_date: "",
                });
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
            >
              Registrar otra mascota
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// En local (npm run dev) se toma de .env.development; en Render (build) usa producción.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://dogs-and-cats-api.onrender.com";

// La Sala de Espera (/registro) es una pantalla aparte. Se decide AQUÍ, antes de
// cualquier "hook" de React: así las reglas de React se cumplen siempre.
function App() {
  if (window.location.pathname === "/registro") {
    return <RegistroPublico API_BASE={API_BASE_URL} />;
  }
  return <SistemaClinica />;
}

function SistemaClinica() {
  const API_BASE = API_BASE_URL;

  // --- ESTADOS DE SEGURIDAD ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // --- ADMINISTRACIÓN DE USUARIOS (solo Maru) ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const emptyUserForm = { username: "", password: "", confirm: "", admin_password: "" };
  const [newUserForm, setNewUserForm] = useState(emptyUserForm);
  const [authData, setAuthData] = useState({ username: "", password: "" });

  // --- ESTADOS GENERALES ---
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newOwner, setNewOwner] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    birth_date: "",
    sex: "",
    color: "",
    owner_id: "",
  });

  const [newAppt, setNewAppt] = useState({
    date: "",
    time: "",
    reason: "",
    status: "Pendiente",
    pet_id: "",
    prescription_text: "",
  });

  const [editingOwner, setEditingOwner] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("home");
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventorySearch, setInventorySearch] = useState("");

  const [newProduct, setNewProduct] = useState({
    category: "Medicamento",
    name: "",
    quantity: "",
    unit: "piezas",
    price: "",
    application_price: "",
    area: "",
    min_stock: "",
    expiration_date: "",
  });

  const [editingGroupItems, setEditingGroupItems] = useState(null);

  const [newSale, setNewSale] = useState({
    product_key: "",
    quantity: "",
    payment_method: "Efectivo",
  });
  const [cart, setCart] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false); // evita doble clic al cobrar
  const [posArea, setPosArea] = useState("todas"); // pestaña de área en Caja
  // Pestaña Recetas
  const [recetaSearch, setRecetaSearch] = useState("");
  const [recetaPetId, setRecetaPetId] = useState("");
  // Ventana para agregar o corregir un lote del almacén
  const emptyLotModal = { open: false, mode: "add", group: null, lot: null, quantity: "", expiration: "" };
  const [lotModal, setLotModal] = useState(emptyLotModal);

  // --- TRANFORMADOR DE FOLIOS ---
  const formatExpediente = (id) => `DC-${String(id).padStart(4, "0")}`;

  // ==========================================
  // --- DESCARGA DE REPORTES EXCEL ---
  // Se descargan con axios (y no con window.open) para que viajen con el
  // token de sesión cuando el backend empiece a pedirlo.
  // ==========================================
  const toISODate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const downloadExcel = async (path, params, filename) => {
    try {
      const res = await axios.get(`${API_BASE}${path}`, {
        params,
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      let msg = "No se pudo generar el reporte. Revisa tu conexión.";
      try {
        const detail = JSON.parse(await err.response.data.text()).detail;
        if (detail) msg = detail;
      } catch {
        // la respuesta no traía un mensaje legible; usamos el genérico
      }
      Swal.fire("Error", msg, "error");
    }
  };

  // --- LOTES: un lote está caducado si su fecha ya pasó (hoy todavía se puede usar)
  const hoyISO = toISODate(new Date());
  const isExpiredLot = (p) =>
    p.category !== "Servicio" && !!p.expiration_date && p.expiration_date < hoyISO;
  const fmtFecha = (iso) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");

  // Calcula el rango de fechas según el periodo elegido (hora local de la clínica)
  const getReportRange = () => {
    const today = new Date();
    if (reportPeriod === "week") {
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      return [toISODate(monday), toISODate(today)];
    }
    if (reportPeriod === "month") {
      return [toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), toISODate(today)];
    }
    if (reportPeriod === "lastMonth") {
      return [
        toISODate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        toISODate(new Date(today.getFullYear(), today.getMonth(), 0)),
      ];
    }
    return [reportStart, reportEnd];
  };

  const handleDownloadSalesReport = () => {
    const [inicio, fin] = getReportRange();
    if (!inicio || !fin) {
      Swal.fire("Faltan fechas", "Elige la fecha inicial y la fecha final.", "warning");
      return;
    }
    if (fin < inicio) {
      Swal.fire("Fechas invertidas", "La fecha final no puede ser anterior a la inicial.", "warning");
      return;
    }
    downloadExcel("/reports/sales/", { inicio, fin }, `Ventas_${inicio}_al_${fin}.xlsx`);
  };

  // --- ESTADOS PARA MODALES EXTRAS ---
  const [prescriptionModal, setPrescriptionModal] = useState({
    isOpen: false,
    pet: null,
    appt: null,
    text: "",
  });
  const [prescriptionHistoryModal, setPrescriptionHistoryModal] = useState({
    isOpen: false,
    pet: null,
  });
  const [showTodayAppts, setShowTodayAppts] = useState(false);
  // Centro de avisos (campanita) + notificaciones al teléfono
  const [showAvisos, setShowAvisos] = useState(false);
  // Cartilla (vacunas / desparasitación)
  const emptyPreventivo = { open: false, pet: null, record: null, tipo: "vacuna", nombre: "", aplicada: "", intervalo: "1y", proxima: "", notas: "" };
  const [preventivoModal, setPreventivoModal] = useState(emptyPreventivo);
  const [proximosPreventivos, setProximosPreventivos] = useState([]);
  // En Caja: a qué paciente se aplicó la vacuna/medicamento
  const [salePetId, setSalePetId] = useState("");
  const [saleIntervalo, setSaleIntervalo] = useState("1y");
  const [avisos, setAvisos] = useState([]);
  const [pushEstado, setPushEstado] = useState("revisando");
  const [vapidKey, setVapidKey] = useState("");
  // --- ESTADOS PARA VENTA POR DOSIS/FRACCIÓN ---
  const [isFractionalSale, setIsFractionalSale] = useState(false);
  const [fractionCapacity, setFractionCapacity] = useState("");
  const [fractionAmount, setFractionAmount] = useState("");
  const [targetMoney, setTargetMoney] = useState("");
  // Vacunas/medicamentos: descontar la dosis usada pero cobrar el precio por aplicación
  const [chargeByApplication, setChargeByApplication] = useState(true);

  // --- ESTADOS PARA LA LLAMADA DE LOS HORARIOS ---
  const [bookedTimes, setBookedTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // ---ESTADOS PARA EXTRAS Y CAMBIO EN CAJA---
  const [isExtraCharge, setIsExtraCharge] = useState(false);
  const [extraDetails, setExtraDetails] = useState({
    description: "",
    amount: "",
  });
  const [amountPaid, setAmountPaid] = useState("");

  // --- ESTADOS DEL REPORTE DE VENTAS (CONTADOR) ---
  const [reportPeriod, setReportPeriod] = useState("week");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");

  // --- CONFIGURACIÓN DE SWEETALERT (TEMA MASCOTAS Y TEAL) ---
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    iconColor: "#0d9488", // Color Verde Teal de tu logo
    customClass: {
      popup: "rounded-2xl border-2 border-teal-100",
    },
  });

  // --- GENERADOR DE HORARIOS ESTABLECIDOS ---
  const generateAllTimeSlots = () => {
    const slots = [];
    for (let h = 11; h <= 19; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }
    slots.push("20:00");
    return slots;
  };

  const allTimeSlots = generateAllTimeSlots();

  // ==========================================
  // --- COMUNICADOR ENTRE PESTAÑAS ---
  // ==========================================
  const triggerSync = () => {
    localStorage.setItem("vet_sync_trigger", Date.now().toString());
  };

  // ==========================================
  // --- FUNCIONES DEL INVENTARIO Y VENTAS ---
  // ==========================================
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error al cargar inventario", err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sales/`);
      setSales(res.data);
    } catch (err) {
      console.error("Error al cargar ventas", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const resOwners = await axios.get(`${API_BASE}/owners/`);
      setOwners(resOwners.data);
    } catch (err) {
      console.error("Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("vet_token");
    const savedUser = localStorage.getItem("vet_user");

    if (savedToken && savedUser) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
      fetchMe();
      fetchData();
      fetchProducts();
      fetchSales();
      fetchAvisos();
      fetchPreventivos();
      // Si se abrió desde una notificación (…/?avisos=1), mostrar el Centro de avisos
      if (new URLSearchParams(window.location.search).has("avisos")) {
        abrirCentroAvisos();
        window.history.replaceState(null, "", "/");
      }
    }
    const handleStorageChange = (e) => {
      if (e.key === "vet_sync_trigger" && isAuthenticated) {
        fetchData();
        fetchProducts();
        fetchSales();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isAuthenticated]);

  useEffect(() => {
    if (newAppt.date) {
      axios
        .get(`${API_BASE}/appointments/booked-times/${newAppt.date}`)
        .then(({ data }) => {
          if (Array.isArray(data)) {
            setBookedTimes(data);
          } else {
            setBookedTimes([]);
          }
        })
        .catch((err) => {
          console.error("Error cargando horarios:", err);
          setBookedTimes([]);
        });
    } else {
      setBookedTimes([]);
    }
  }, [newAppt.date]);

  const safeBookedTimes = Array.isArray(bookedTimes) ? bookedTimes : [];

  // 1. Obtenemos el día y la hora de este preciso instante
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const availableTimeSlots = allTimeSlots.filter((time) => {
    // 2. ¿Alguien más ya agendó esta hora?
    const isBooked = safeBookedTimes.some((booked) => booked.startsWith(time));

    // 3. ¿La hora ya pasó? (Solo aplica si están agendando para HOY)
    let isPast = false;
    if (newAppt.date === todayStr) {
      const [slotHour, slotMinute] = time.split(":").map(Number);
      // Si la hora del bloque es menor a la hora actual, o es la misma hora pero con menos minutos = ya pasó
      if (
        slotHour < currentHour ||
        (slotHour === currentHour && slotMinute <= currentMinute)
      ) {
        isPast = true;
      }
    }

    // 4. Mostramos la hora solo si: (No está ocupada Y No ha pasado) O (Es la hora de una cita que estamos editando)
    return (!isBooked && !isPast) || time === newAppt.time;
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Limpiamos espacios y pasamos a minúsculas DESDE AQUÍ
      const cleanUsername = authData.username.toLowerCase().trim();

      const params = new URLSearchParams();
      params.append("username", cleanUsername);
      params.append("password", authData.password.trim());

      const res = await axios.post(`${API_BASE}/login/`, params);
      const token = res.data.access_token;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 2. MAGIA PARA RECONOCER A MARU PEÑA
      let displayUser = cleanUsername;
      if (cleanUsername === "maru peña" || cleanUsername === "maru pena") {
        displayUser = "Maru Peña"; // Se verá siempre elegante en el menú
      } else {
        displayUser =
          cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      }

      setCurrentUser(displayUser);
      setIsAuthenticated(true);
      setAuthData({ username: "", password: "" });

      localStorage.setItem("vet_token", token);
      localStorage.setItem("vet_user", displayUser);

      Toast.fire({ icon: "success", title: `¡Bienvenida, ${displayUser}!` });

      fetchMe();
      fetchData();
      fetchProducts();
      fetchSales();
      fetchAvisos();
      fetchPreventivos();
    } catch (err) {
      const codigo = err.response?.status;
      Swal.fire({
        icon: "error",
        title: "Error de acceso",
        text:
          codigo === 429
            ? err.response?.data?.detail ||
              "Demasiados intentos fallidos. Espera 15 minutos."
            : codigo
              ? "Usuario o contraseña incorrectos."
              : "No se pudo conectar con el servidor. Revisa tu internet e intenta de nuevo.",
      });
    }
  };

  // ¿La sesión actual es de la administradora? (lo decide el backend, no la pantalla)
  const fetchMe = async () => {
    try {
      const res = await axios.get(`${API_BASE}/me/`);
      setIsAdmin(!!res.data.is_admin);
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/`);
      setUsersList(res.data);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.detail || "No se pudo cargar la lista de usuarios.", "error");
    }
  };

  const openUsersModal = () => {
    setNewUserForm(emptyUserForm);
    setShowUsersModal(true);
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const username = newUserForm.username.toLowerCase().trim();
    if (newUserForm.password.length < 6) {
      Swal.fire("Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres.", "warning");
      return;
    }
    if (newUserForm.password !== newUserForm.confirm) {
      Swal.fire("No coinciden", "La contraseña y su confirmación no son iguales.", "warning");
      return;
    }
    try {
      await axios.post(`${API_BASE}/register/`, {
        username,
        password: newUserForm.password,
        admin_password: newUserForm.admin_password,
      });
      setNewUserForm(emptyUserForm);
      fetchUsers();
      Toast.fire({ icon: "success", title: `Usuario "${username}" creado` });
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire(
        "No se pudo crear",
        typeof detail === "string" ? detail : "Revisa los datos (usuario de 3+ letras, contraseña de 6+).",
        "error",
      );
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: `¿Eliminar al usuario "${user.username}"?`,
      text: "Ya no podrá entrar al sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE}/users/${user.id}`);
      fetchUsers();
      Toast.fire({ icon: "success", title: "Usuario eliminado" });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.detail || "No se pudo eliminar.", "error");
    }
  };

  // ==========================================
  // --- CENTRO DE AVISOS (WhatsApp a dueños) ---
  // ==========================================
  const fetchAvisos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/avisos/`);
      setAvisos(res.data.pendientes || []);
    } catch {
      // sin conexión: se reintenta en el próximo refresco
    }
  };

  const marcarAvisoEnviado = async (aviso) => {
    try {
      if (aviso.tipo === "preventivo")
        await axios.post(`${API_BASE}/avisos/preventivo/${aviso.record_id}/enviado`);
      else await axios.post(`${API_BASE}/avisos/${aviso.appt_id}/enviado`, { tipo: aviso.tipo });
      fetchAvisos();
      fetchPreventivos();
    } catch {
      Swal.fire("Error", "No se pudo marcar el aviso. Intenta de nuevo.", "error");
    }
  };

  const enviarAvisoWhatsApp = (aviso) => {
    abrirWhatsApp(aviso.telefono, aviso.mensaje); // primero abrir (mismo toque)
    marcarAvisoEnviado(aviso);
    Toast.fire({ icon: "success", title: "Aviso marcado como enviado" });
  };

  // ==========================================
  // --- CARTILLA: vacunas y desparasitación ---
  // ==========================================
  const fetchPreventivos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/preventivos/proximos`, { params: { dias: 30 } });
      setProximosPreventivos(res.data);
    } catch {
      // se reintenta en el próximo refresco
    }
  };

  // Recarga dueños y, si hay un expediente abierto, lo actualiza con los datos nuevos
  const recargarExpediente = async () => {
    try {
      const res = await axios.get(`${API_BASE}/owners/`);
      setOwners(res.data);
      setSelectedOwner((prev) => (prev ? res.data.find((o) => o.id === prev.id) || null : prev));
    } catch {
      // sin conexión
    }
    fetchPreventivos();
    fetchAvisos();
  };

  const abrirPreventivo = (pet, record = null) =>
    setPreventivoModal({
      ...emptyPreventivo,
      open: true,
      pet,
      record,
      tipo: record?.tipo || "vacuna",
      nombre: record?.nombre || "",
      aplicada: record?.applied_date || hoyLocalISO(),
      intervalo: record ? (record.next_due_date ? "custom" : "none") : "1y",
      proxima: record?.next_due_date || "",
      notas: record?.notes || "",
    });

  const guardarPreventivo = async (e) => {
    e.preventDefault();
    const m = preventivoModal;
    if (!m.aplicada) {
      Swal.fire("Falta la fecha", "Escribe la fecha en que se aplicó.", "warning");
      return;
    }
    const proxima = m.intervalo === "custom" ? m.proxima || null : sumarIntervalo(m.aplicada, m.intervalo);
    if (proxima && proxima <= m.aplicada) {
      Swal.fire("Revisa la fecha", "La próxima dosis debe ser después de la aplicación.", "warning");
      return;
    }
    const datos = { tipo: m.tipo, nombre: m.nombre.trim(), applied_date: m.aplicada, next_due_date: proxima, notes: m.notas.trim() || null };
    try {
      if (m.record) await axios.put(`${API_BASE}/preventivos/${m.record.id}`, datos);
      else await axios.post(`${API_BASE}/preventivos/`, { ...datos, pet_id: m.pet.id });
      Toast.fire({ icon: "success", title: m.record ? "Registro actualizado" : "Anotado en la cartilla 💉" });
      setPreventivoModal(emptyPreventivo);
      recargarExpediente();
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire("No se pudo guardar", typeof detail === "string" ? detail : "Revisa los datos.", "error");
    }
  };

  const borrarPreventivo = async (record) => {
    const r = await Swal.fire({
      title: "¿Borrar este registro de la cartilla?",
      text: `${record.nombre} · aplicada ${fmtFecha(record.applied_date)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE}/preventivos/${record.id}`);
      Toast.fire({ icon: "success", title: "Registro borrado" });
      recargarExpediente();
    } catch {
      Swal.fire("Error", "No se pudo borrar.", "error");
    }
  };

  // ==========================================
  // --- NOTIFICACIONES AL TELÉFONO (push) ---
  // ==========================================
  const revisarPush = async () => {
    if (!pushSoportado()) {
      setPushEstado(esIOS() && !esAppInstalada() ? "instalar-ios" : "no-soportado");
      return;
    }
    if (Notification.permission === "denied") {
      setPushEstado("bloqueado");
      return;
    }
    try {
      const { data } = await axios.get(`${API_BASE}/push/clave-publica`);
      setVapidKey(data.publicKey);
      if (!data.disponible) {
        setPushEstado("no-configurado");
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg && (await reg.pushManager.getSubscription());
      if (sub && Notification.permission === "granted") {
        setPushEstado("activado");
        // re-registrar por si el servidor no lo tenía (ej. otro usuario en el mismo teléfono)
        axios
          .post(`${API_BASE}/push/suscribir`, { ...sub.toJSON(), user_agent: navigator.userAgent })
          .catch(() => {});
      } else {
        setPushEstado("apagado");
      }
    } catch {
      setPushEstado("apagado");
    }
  };

  const activarPush = async () => {
    // Pedir permiso PRIMERO, en el mismo toque (iPhone lo exige así)
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") {
      setPushEstado(permiso === "denied" ? "bloqueado" : "apagado");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }
      await axios.post(`${API_BASE}/push/suscribir`, {
        ...sub.toJSON(),
        user_agent: navigator.userAgent,
      });
      setPushEstado("activado");
      Toast.fire({ icon: "success", title: "Notificaciones activadas en este dispositivo" });
    } catch (err) {
      console.error("No se pudo activar push", err);
      Swal.fire("No se pudieron activar", "Revisa tu conexión e intenta de nuevo.", "error");
    }
  };

  const desactivarPush = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg && (await reg.pushManager.getSubscription());
      if (sub) {
        await axios.post(`${API_BASE}/push/desuscribir`, { endpoint: sub.endpoint }).catch(() => {});
        await sub.unsubscribe();
      }
    } finally {
      setPushEstado("apagado");
    }
  };

  const probarPush = async () => {
    try {
      await axios.post(`${API_BASE}/push/prueba`);
      Toast.fire({ icon: "success", title: "Notificación de prueba enviada" });
    } catch (err) {
      Swal.fire("No se pudo enviar", err.response?.data?.detail || "Intenta de nuevo.", "error");
    }
  };

  const abrirCentroAvisos = () => {
    setShowAvisos(true);
    fetchAvisos();
    revisarPush();
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("vet_token");
    localStorage.removeItem("vet_user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setShowUsersModal(false);
    setShowAvisos(false);
    setAvisos([]);
    setActiveTab("home");
  };

  // 🔄 Mantener los datos al día entre dispositivos (tablet, PC, celular):
  // se refresca cada 30 s mientras la pantalla está visible y al volver a ella.
  // (Antes, si se vendía en un dispositivo, el otro seguía mostrando el stock viejo
  //  hasta recargar la página y parecía que "no bajaba".)
  useEffect(() => {
    if (!isAuthenticated) return;
    const refrescar = () => {
      if (document.visibilityState !== "visible") return;
      fetchData();
      fetchProducts();
      fetchSales();
      fetchAvisos();
      fetchPreventivos();
      if (new URLSearchParams(window.location.search).has("avisos")) {
        abrirCentroAvisos(); // la app ya estaba abierta y se tocó una notificación
        window.history.replaceState(null, "", "/");
      }
    };
    const intervalo = setInterval(refrescar, 30000);
    document.addEventListener("visibilitychange", refrescar);
    window.addEventListener("focus", refrescar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", refrescar);
      window.removeEventListener("focus", refrescar);
    };
  }, [isAuthenticated]);

  // Cuando llega una notificación con la app abierta, actualizar al instante
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const alRecibir = (e) => {
      if (e.data?.tipo !== "push") return;
      window.__ultimoPush = e.data; // (útil para diagnóstico)
      fetchData();
      fetchAvisos();
      fetchPreventivos();
    };
    navigator.serviceWorker.addEventListener("message", alRecibir);
    return () => navigator.serviceWorker.removeEventListener("message", alRecibir);
  }, []);

  // Numerito en el ícono de la app instalada (iPhone y Android) = avisos pendientes
  useEffect(() => {
    try {
      if (avisos.length > 0) navigator.setAppBadge?.(avisos.length);
      else navigator.clearAppBadge?.();
    } catch {
      // el dispositivo no soporta el numerito: no pasa nada
    }
  }, [avisos.length]);

  // 🔒 Si el backend rechaza la sesión (token vencido o inválido), salimos y avisamos
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const esLogin = error.config?.url?.endsWith("/login/");
        if (error.response?.status === 401 && !esLogin && localStorage.getItem("vet_token")) {
          handleLogout();
          Swal.fire({
            icon: "info",
            title: "Sesión expirada",
            text: "Por seguridad, vuelve a iniciar sesión.",
            confirmButtonColor: "#0d9488",
          });
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isAuthenticated) {
          handleLogout();
          Swal.fire({
            icon: "info",
            title: "Sesión Expirada",
            text: "Tu sesión se ha cerrado automáticamente por seguridad tras 15 minutos de inactividad.",
            confirmButtonColor: "#0d9488", // Teal
          });
        }
      }, 900000);
    };

    if (isAuthenticated) {
      resetTimer();
      const events = [
        "mousemove",
        "keydown",
        "mousedown",
        "touchstart",
        "scroll",
      ];
      events.forEach((event) => window.addEventListener(event, resetTimer));
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        events.forEach((event) =>
          window.removeEventListener(event, resetTimer),
        );
      };
    }
  }, [isAuthenticated]);

  // --- AGRUPACIÓN INTELIGENTE DE PRODUCTOS ---
  const filteredProducts = products.filter((product) => {
    const searchLower = inventorySearch.toLowerCase();
    const baseName = product.name.split("_@@_")[0].toLowerCase();
    return (
      baseName.includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  });

  const inventoryGroupedMap = new Map();
  filteredProducts.forEach((p) => {
    const baseName = p.name.split("_@@_")[0].trim();
    const key = baseName.toLowerCase();

    const caducado = isExpiredLot(p);
    if (!inventoryGroupedMap.has(key)) {
      inventoryGroupedMap.set(key, {
        ...p,
        name: baseName,
        totalQuantity: p.category === "Servicio" ? 999999 : p.quantity,
        availableQuantity: p.category === "Servicio" ? 999999 : caducado ? 0 : p.quantity,
        expiredQuantity: caducado ? p.quantity : 0,
        allDates:
          p.expiration_date && p.quantity > 0 ? [p.expiration_date] : [],
        subItems: [p],
      });
    } else {
      const group = inventoryGroupedMap.get(key);
      if (p.category !== "Servicio") {
        group.totalQuantity += p.quantity;
        if (caducado) group.expiredQuantity += p.quantity;
        else group.availableQuantity += p.quantity;
      }
      // el precio por aplicación es del artículo: si algún lote lo tiene, aplica al grupo
      if (group.application_price == null && p.application_price != null)
        group.application_price = p.application_price;
      if (
        p.expiration_date &&
        p.quantity > 0 &&
        !group.allDates.includes(p.expiration_date)
      ) {
        group.allDates.push(p.expiration_date);
      }
      group.subItems.push(p);
    }
  });
  const groupedInventory = Array.from(inventoryGroupedMap.values()).map(group => ({
    ...group,
    totalQuantity: group.category === "Servicio" ? 999999 : parseFloat(Number(group.totalQuantity).toFixed(2)),
    availableQuantity: group.category === "Servicio" ? 999999 : parseFloat(Number(group.availableQuantity).toFixed(2)),
    expiredQuantity: parseFloat(Number(group.expiredQuantity).toFixed(2)),
    // lotes ordenados: primero el que caduca antes (los sin fecha al final)
    subItems: [...group.subItems].sort((a, b) =>
      (a.expiration_date || "9999-12-31").localeCompare(b.expiration_date || "9999-12-31"),
    ),
  })).sort(
    (a, b) => a.name.localeCompare(b.name),
  );

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      let qty =
        newProduct.category === "Servicio"
          ? 999999
          : parseFloat(newProduct.quantity || 0);
      let minStock =
        newProduct.category === "Servicio"
          ? 0
          : parseFloat(newProduct.min_stock);
      let expDate =
        newProduct.category === "Servicio"
          ? null
          : newProduct.expiration_date || null;
      let unit =
        newProduct.category === "Servicio" ? "servicio" : newProduct.unit;
      // Precio por aplicación: opcional, solo para vacunas y medicamentos
      const applicationPrice =
        ["Vacuna", "Medicamento"].includes(newProduct.category) &&
        newProduct.application_price !== "" &&
        newProduct.application_price != null
          ? parseFloat(newProduct.application_price)
          : null;

      if (editingGroupItems) {
        for (let item of editingGroupItems) {
          await axios.put(`${API_BASE}/products/${item.id}`, {
            ...item,
            category: newProduct.category,
            price: parseFloat(newProduct.price),
            application_price: applicationPrice,
            area: newProduct.area || null,
            unit: unit,
            min_stock: minStock,
          });
        }
        if (qty > 0) {
          // "Sumar stock" SIEMPRE crea un lote nuevo con su propia caducidad.
          // (Antes se sumaba al lote viejo y le cambiaba la fecha.)
          const baseName = newProduct.name.trim();
          await axios.post(`${API_BASE}/products/`, {
            category: newProduct.category,
            name: `${baseName}_@@_${Math.random().toString(36).substr(2, 5)}`,
            quantity: qty,
            unit: unit,
            price: parseFloat(newProduct.price),
            application_price: applicationPrice,
            area: newProduct.area || null,
            min_stock: minStock,
            expiration_date: expDate,
          });
        }
        Toast.fire({ icon: "success", title: "Artículo actualizado" });
      } else {
        const baseName = newProduct.name.trim();
        const exists = products.some(
          (p) =>
            p.name.split("_@@_")[0].trim().toLowerCase() ===
            baseName.toLowerCase(),
        );
        const finalName = exists
          ? `${baseName}_@@_${Math.random().toString(36).substr(2, 5)}`
          : baseName;

        await axios.post(`${API_BASE}/products/`, {
          category: newProduct.category,
          name: finalName,
          quantity: qty,
          unit: unit,
          price: parseFloat(newProduct.price),
          application_price: applicationPrice,
          area: newProduct.area || null,
          min_stock: minStock,
          expiration_date: expDate,
        });
        Toast.fire({ icon: "success", title: "Inventario Guardado" });
      }

      setNewProduct({
        category: "Medicamento",
        name: "",
        quantity: "",
        unit: "piezas",
        price: "",
        application_price: "",
        area: "",
        min_stock: "",
        expiration_date: "",
      });
      setEditingGroupItems(null);
      fetchProducts();
      triggerSync();
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar el registro", "error");
    }
  };

  const handleEditGroupClick = (group) => {
    setEditingGroupItems(group.subItems);
    setNewProduct({
      category: group.category,
      name: group.name,
      quantity: "",
      unit: group.unit,
      price: group.price,
      application_price: group.application_price ?? "",
      area: group.area || "",
      min_stock: group.min_stock,
      expiration_date: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteGroup = async (group) => {
    const result = await Swal.fire({
      title: "¿Borrar todo el artículo?",
      text: "Se eliminarán todos sus lotes del sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488", // Teal
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        for (let item of group.subItems) {
          await axios.delete(`${API_BASE}/products/${item.id}`);
        }
        fetchProducts();
        triggerSync();
        Toast.fire({ icon: "success", title: "Artículo eliminado" });
      } catch (err) {
        const mensajeBackend =
          err.response?.data?.detail ||
          "No se pudo eliminar el artículo debido a un error de conexión.";

        Swal.fire({
          icon: "error",
          title: "Acción Denegada",
          text: mensajeBackend,
          confirmButtonColor: "#0d9488",
        });
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const productGroup = groupedInventory.find(
      (p) => p.name.toLowerCase() === newSale.product_key,
    );
    if (!productGroup) return;

    let qtyToDeduct = 0;
    let displayQuantity = 0;
    let desc = productGroup.name;
    let displayUnit = productGroup.unit;

    // ✨ MAGIA: Cálculo de fracción a granel
    if (isFractionalSale && fractionCapacity && fractionAmount) {
      displayQuantity = parseFloat(fractionAmount);
      qtyToDeduct = displayQuantity / parseFloat(fractionCapacity); // Ej: 500g / 1000 = 0.5 kg a descontar de BD
      if (["kg", "L"].includes(productGroup.unit)) {
        displayUnit = productGroup.unit === "kg" ? "g" : "ml";
      } else {
        displayUnit = "dosis/pzas";
      }
      desc = `${productGroup.name} (Venta a Granel)`;
    } else {
      qtyToDeduct = parseFloat(newSale.quantity);
      displayQuantity = qtyToDeduct;
    }

    // Blindaje: nunca agregar cantidades en cero, negativas o inválidas
    if (!(qtyToDeduct > 0)) {
      Swal.fire("Cantidad inválida", "La cantidad debe ser mayor a 0.", "warning");
      return;
    }
    if (isExtraCharge && !(parseFloat(extraDetails.amount) > 0)) {
      Swal.fire("Cargo extra inválido", "El costo extra debe ser mayor a 0.", "warning");
      return;
    }

    const currentQtyInCart = cart
      .filter((item) => item.product_key === productGroup.name.toLowerCase())
      .reduce((sum, item) => sum + item.quantityToDeduct, 0); // Revisamos la cantidad real en kg

    // Solo cuenta el stock NO caducado
    if (
      productGroup.category !== "Servicio" &&
      currentQtyInCart + qtyToDeduct > productGroup.availableQuantity + 1e-9
    ) {
      Swal.fire(
        "Stock Insuficiente",
        `Solo hay ${productGroup.availableQuantity} ${productGroup.unit} disponibles en el almacén.` +
          (productGroup.expiredQuantity > 0
            ? ` (Además hay ${productGroup.expiredQuantity} ${productGroup.unit} CADUCADOS que no se pueden vender.)`
            : ""),
        "warning",
      );
      return;
    }

    const itemsToAdd = [];
    let itemTotal = productGroup.price * qtyToDeduct; // Ej: $115 * 0.5kg = $57.50

    // 💉 Aplicación: se descuenta la fracción usada, pero se cobra el precio fijo por aplicación
    const esAplicacion =
      isFractionalSale && chargeByApplication && productGroup.application_price != null;
    if (esAplicacion) {
      itemTotal = productGroup.application_price;
      desc = `${productGroup.name} (Aplicación: ${fractionAmount} de ${fractionCapacity})`;
      displayQuantity = 1;
      displayUnit = "aplicación";
    }

    itemsToAdd.push({
      cart_id: Math.random().toString(36).substr(2, 9),
      product_key: productGroup.name.toLowerCase(),
      name: desc,
      category: productGroup.category,
      unit: displayUnit, // Se verá como "500 g" en el ticket
      price: productGroup.price,
      quantity: displayQuantity, // Los 500 visuales
      quantityToDeduct: qtyToDeduct, // El 0.5 interno para la BD
      total: itemTotal,
      payment_method: newSale.payment_method,
      // 💉 Cartilla: si se eligió paciente, se anota al cobrar
      ...(salePetId && ["Vacuna", "Medicamento"].includes(productGroup.category)
        ? {
            pet_id: parseInt(salePetId),
            tipo_preventivo:
              productGroup.category === "Vacuna"
                ? "vacuna"
                : /desparas/i.test(productGroup.name)
                  ? "desparasitacion"
                  : "otro",
            next_due_date: sumarIntervalo(hoyLocalISO(), saleIntervalo),
            petName: owners.flatMap((o) => o.pets || []).find((x) => String(x.id) === String(salePetId))?.name,
          }
        : {}),
    });

    if (isExtraCharge) {
      const amt = parseFloat(extraDetails.amount);
      // Un "cargo extra" interno por área, para que el contador lo vea en el área correcta
      const areaExtra = areaDe(productGroup);
      const nombreExtra = `Cargo Extra (${AREAS[areaExtra].label})`;
      let extraProd = products.find((p) => p.name === nombreExtra);
      if (!extraProd) {
        try {
          const res = await axios.post(`${API_BASE}/products/`, {
            category: "Servicio",
            name: nombreExtra,
            quantity: 999999,
            unit: "servicio",
            price: 1,
            min_stock: 0,
            expiration_date: null,
            area: areaExtra,
          });
          extraProd = res.data;
          fetchProducts();
        } catch (err) {
          return;
        }
      }
      itemsToAdd.push({
        cart_id: Math.random().toString(36).substr(2, 9),
        product_key: extraProd.name.toLowerCase(),
        name: `EXTRA: ${extraDetails.description} (Aplicado a ${desc})`,
        category: "Servicio",
        unit: "N/A",
        price: amt,
        quantity: 1,
        quantityToDeduct: 1,
        total: amt,
        payment_method: newSale.payment_method,
      });
    }

    setCart((prevCart) => [...prevCart, ...itemsToAdd]);
    setNewSale({ ...newSale, product_key: "", quantity: "" });
    setSalePetId("");
    setIsFractionalSale(false);
    setChargeByApplication(true);
    setFractionCapacity("");
    setFractionAmount("");
    setTargetMoney("");
    setExtraDetails({ description: "", amount: "" });
    setIsExtraCharge(false);
    Toast.fire({ icon: "success", title: "Agregado al ticket" });
  };

  const removeFromCart = (cart_id) => {
    setCart(cart.filter((item) => item.cart_id !== cart_id));
  };

  // ==========================================
  // --- LOTES: agregar, corregir y borrar ---
  // ==========================================
  const openAddLot = (group) =>
    setLotModal({ ...emptyLotModal, open: true, mode: "add", group });
  const openEditLot = (group, lot) =>
    setLotModal({
      ...emptyLotModal,
      open: true,
      mode: "edit",
      group,
      lot,
      quantity: String(parseFloat(Number(lot.quantity).toFixed(4))),
      expiration: lot.expiration_date || "",
    });

  const handleSaveLot = async (e) => {
    e.preventDefault();
    const qty = parseFloat(lotModal.quantity);
    if (!(qty >= 0) || (lotModal.mode === "add" && !(qty > 0))) {
      Swal.fire("Cantidad inválida", "Escribe una cantidad mayor a 0.", "warning");
      return;
    }
    try {
      if (lotModal.mode === "add") {
        const g = lotModal.group;
        await axios.post(`${API_BASE}/products/`, {
          category: g.category,
          name: `${g.name}_@@_${Math.random().toString(36).substr(2, 5)}`, // lote nuevo del mismo artículo
          quantity: qty,
          unit: g.unit,
          price: g.price,
          application_price: g.application_price ?? null,
          area: g.area || null,
          min_stock: g.min_stock,
          expiration_date: lotModal.expiration || null,
        });
        Toast.fire({ icon: "success", title: `Lote agregado a ${g.name}` });
      } else {
        await axios.patch(`${API_BASE}/products/${lotModal.lot.id}/lote`, {
          quantity: qty,
          expiration_date: lotModal.expiration || null,
        });
        Toast.fire({ icon: "success", title: "Lote corregido" });
      }
      setLotModal(emptyLotModal);
      fetchProducts();
      triggerSync();
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire("No se pudo guardar", typeof detail === "string" ? detail : "Revisa los datos.", "error");
    }
  };

  const handleDeleteLot = async (lot) => {
    const result = await Swal.fire({
      title: "¿Borrar este lote?",
      text: `${parseFloat(Number(lot.quantity).toFixed(2))} ${lot.unit}${lot.expiration_date ? ` · vence ${fmtFecha(lot.expiration_date)}` : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar lote",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE}/products/${lot.id}`);
      Toast.fire({ icon: "success", title: "Lote borrado" });
      fetchProducts();
      triggerSync();
    } catch (err) {
      // Si el lote ya tiene ventas, no se borra (seguridad contable): se sugiere ponerlo en 0
      const detail = err.response?.data?.detail;
      Swal.fire({
        icon: "info",
        title: "Este lote tiene ventas registradas",
        text:
          (typeof detail === "string" ? detail + " " : "") +
          "Usa el lápiz del lote para corregir su cantidad (por ejemplo, a 0).",
        confirmButtonColor: "#0d9488",
      });
    }
  };

  // ==========================================
  // --- CANCELAR UNA VENTA (solo administradora) ---
  // ==========================================
  const handleCancelTicket = async (ticket) => {
    const { isConfirmed, value } = await Swal.fire({
      title: "¿Cancelar esta venta?",
      html: `Se regresará el stock al almacén y la venta quedará marcada como cancelada.<br><b>Total: $${ticket.total.toFixed(2)}</b>`,
      input: "text",
      inputPlaceholder: "Motivo (opcional), ej. se cobró dos veces",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, cancelar venta",
      cancelButtonText: "No",
    });
    if (!isConfirmed) return;
    try {
      const url = ticket.ticketId
        ? `${API_BASE}/sales/tickets/${ticket.ticketId}/cancel`
        : `${API_BASE}/sales/${ticket.rows[0].id}/cancel`;
      await axios.post(url, { reason: value || null });
      Toast.fire({ icon: "success", title: "Venta cancelada y stock regresado" });
      fetchSales();
      fetchProducts();
      triggerSync();
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire("No se pudo cancelar", typeof detail === "string" ? detail : "Intenta de nuevo.", "error");
    }
  };

  // Cobra TODO el ticket en una sola petición: el backend lo guarda completo o nada.
  // (Antes se mandaba una petición por artículo y, si fallaba a la mitad,
  //  quedaba una venta a medias y al reintentar se cobraba doble.)
  const handleCheckoutCart = async () => {
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      await axios.post(`${API_BASE}/sales/checkout/`, {
        items: cart.map((item) => ({
          product_key: item.product_key,
          quantity: item.quantityToDeduct,
          total: Math.round(item.total * 100) / 100,
          payment_method: item.payment_method,
          pet_id: item.pet_id || null,
          tipo_preventivo: item.tipo_preventivo || null,
          next_due_date: item.next_due_date || null,
        })),
      });
      Swal.fire({
        icon: "success",
        title: "¡Venta finalizada! 🐾",
        showConfirmButton: false,
        timer: 1500,
      });
      setCart([]);
      setAmountPaid("");
      fetchProducts();
      fetchSales();
      triggerSync();
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire({
        icon: "error",
        title: "No se registró la venta",
        text:
          (typeof detail === "string" ? detail + ". " : "Hubo un fallo de conexión. ") +
          "No se guardó nada del ticket; puedes revisar e intentar de nuevo.",
        confirmButtonColor: "#0d9488",
      });
      fetchProducts(); // refrescamos stock por si cambió mientras tanto
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ==========================================
  // --- FUNCIONES DUEÑOS Y MASCOTAS ---
  // ==========================================
  const validateOwnerData = (owner) => {
    if (!owner.address || owner.address.trim() === "") {
      Swal.fire("Error", "La direccion es obligatorio.", "error");
      return false;
    }
    if (owner.phone && owner.phone.length !== 10) {
      Swal.fire(
        "Error",
        "El número de teléfono debe tener exactamente 10 dígitos.",
        "error",
      );
      return false;
    }
    return true;
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    if (!validateOwnerData(newOwner)) return;
    try {
      await axios.post(`${API_BASE}/owners/`, newOwner);
      setNewOwner({ name: "", address: "", phone: "" });
      fetchData();
      triggerSync();
      Toast.fire({ icon: "success", title: "¡Guau! Cliente registrado 🐶" });
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar al dueño", "error");
    }
  };

  const handleUpdateOwner = async (e) => {
    e.preventDefault();
    if (!validateOwnerData(editingOwner)) return;
    try {
      await axios.put(`${API_BASE}/owners/${editingOwner.id}`, editingOwner);
      setEditingOwner(null);
      fetchData();
      triggerSync();
      Toast.fire({ icon: "success", title: "Cliente actualizado" });
    } catch (err) {
      Swal.fire("Error", "Error al actualizar dueño", "error");
    }
  };

  const handleDeleteOwner = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: "Se borrarán también todas sus mascotas y citas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488", // Teal
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/owners/${id}/delete`);
        setOwners(owners.filter((owner) => owner.id !== id));
        await fetchData();
        triggerSync();
        Toast.fire({ icon: "success", title: "Cliente eliminado" });
      } catch (err) {
        Swal.fire("Error", "Error al eliminar dueño", "error");
      }
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/pets/`, {
        ...newPet,
        owner_id: parseInt(newPet.owner_id),
      });
      setNewPet({
        name: "",
        species: "",
        breed: "",
        birth_date: "",
        sex: "",
        color: "",
        owner_id: "",
      });
      fetchData();
      triggerSync();
      Toast.fire({ icon: "success", title: "¡Miau! Paciente registrado 🐱" });
    } catch (err) {
      Swal.fire("Error", "Error al registrar mascota", "error");
    }
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/pets/${editingPet.id}`, {
        ...editingPet,
        owner_id: parseInt(editingPet.owner_id),
      });
      setEditingPet(null);
      fetchData();
      triggerSync();
      Toast.fire({ icon: "success", title: "Paciente actualizado" });
    } catch (err) {
      Swal.fire("Error", "Error al actualizar mascota", "error");
    }
  };

  const handleDeletePet = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar paciente?",
      text: "Se borrará su información y su historial.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/pets/${id}/delete`);
        fetchData();
        triggerSync();
        Toast.fire({ icon: "success", title: "Paciente eliminado" });
      } catch (err) {
        Swal.fire("Error", "Error al eliminar mascota", "error");
      }
    }
  };

  const handleAddOrUpdateAppt = async (e) => {
    e.preventDefault();
    try {
      if (newAppt.id) {
        await axios.put(`${API_BASE}/appointments/${newAppt.id}`, {
          ...newAppt,
          pet_id: parseInt(newAppt.pet_id),
        });
        Toast.fire({ icon: "success", title: "Cita actualizada" });
      } else {
        const petIdParaBuscar = parseInt(newAppt.pet_id);
        const resCita = await axios.post(`${API_BASE}/appointments/`, {
          ...newAppt,
          pet_id: petIdParaBuscar,
        });

        const todasLasMascotas = owners.flatMap((o) => o.pets || []);
        const selectedPet = todasLasMascotas.find(
          (p) => p.id == petIdParaBuscar,
        );
        const ownerOfPet = owners.find((o) => o.id == selectedPet?.owner_id);

        if (ownerOfPet && ownerOfPet.phone) {
          Swal.fire({
            title: "¡Cita Registrada! 🐾",
            text: `¿Quieres enviarle la confirmación a ${ownerOfPet.name} por WhatsApp?`,
            icon: "success",
            showCancelButton: true,
            confirmButtonColor: "#25D366",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, enviar mensaje",
            cancelButtonText: "Después (queda en la campanita)",
          }).then(async (result) => {
            // Mismo mensaje que el Centro de avisos (lo arma el backend)
            const { data } = await axios.get(`${API_BASE}/avisos/`).catch(() => ({ data: {} }));
            const aviso = (data.pendientes || []).find(
              (a) => a.appt_id === resCita.data.id && a.tipo === "confirmacion",
            );
            if (result.isConfirmed && aviso?.telefono) {
              enviarAvisoWhatsApp(aviso);
            } else {
              setAvisos(data.pendientes || []);
              if (!result.isConfirmed)
                Toast.fire({ icon: "info", title: "La confirmación quedó pendiente en la campanita 🔔" });
            }
          });
        } else {
          Toast.fire({ icon: "success", title: "Cita agendada" });
        }
      }

      setNewAppt({
        date: "",
        time: "",
        reason: "",
        status: "Pendiente",
        pet_id: "",
        prescription_text: "",
      });
      fetchData();
      triggerSync();
    } catch (err) {
      const detail = err.response?.data?.detail;
      Swal.fire(
        err.response?.status === 409 ? "Horario ocupado" : "Error",
        typeof detail === "string" ? detail : "No se pudo procesar la cita",
        err.response?.status === 409 ? "warning" : "error",
      );
      // refrescamos los horarios ocupados de ese día para que ya no aparezca
      if (newAppt.date) {
        axios
          .get(`${API_BASE}/appointments/booked-times/${newAppt.date}`)
          .then(({ data }) => setBookedTimes(Array.isArray(data) ? data : []))
          .catch(() => {});
      }
    }
  };

  const handleDeleteAppt = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar este registro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/appointments/${id}`);
        fetchData();
        triggerSync();
        setSelectedOwner(null);
        Toast.fire({ icon: "success", title: "Registro eliminado" });
      } catch (err) {
        Swal.fire("Error", "Error al eliminar cita", "error");
      }
    }
  };

  // ==========================================
  // --- IMPRESIÓN DE LA RECETA ---
  // ==========================================
  const printPrescription = async () => {
    const { pet, appt, text } = prescriptionModal;
    if (!appt) {
      try {
        const today = new Date();
        const d = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const t = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
        await axios.post(`${API_BASE}/appointments/`, {
          date: d,
          time: t,
          reason: "Emisión de Receta (Visita Rápida)",
          status: "Realizada",
          pet_id: pet.id,
          prescription_text: text,
        });
      } catch (err) {
        console.error("Error guardando receta rápida", err);
      }
    } else {
      try {
        await axios.put(`${API_BASE}/appointments/${appt.id}`, {
          ...appt,
          pet_id: appt.pet_id,
          prescription_text: text,
        });
      } catch (err) {
        console.error("Error guardando receta en cita", err);
      }
    }

    fetchData();
    triggerSync();
    if (selectedOwner) {
      const resOwners = await axios.get(`${API_BASE}/owners/`);
      setSelectedOwner(resOwners.data.find((o) => o.id === selectedOwner.id));
    }

    const printWindow = window.open("", "_blank");
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Receta Médica - ${escapeHtml(pet.name)}</title>
          <style>
              @page { size: letter; margin: 1cm; }
              
              body { font-family: 'Arial', sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 10px; font-size: 13px; }
              .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 15px; border-bottom: 3px solid #0d9488; padding-bottom: 10px;}
              .logo { width: 140px; flex-shrink: 0; }
              .header-content { flex-grow: 1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center;}
              .title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 5px; color: #0f172a; }
              .doctor-info { text-align: center; font-size: 14px; font-weight: bold; color: #475569;}
              .cedula-area { text-align: right; font-size: 12px; color: #475569; display: flex; flex-direction: column; align-items: flex-end; margin-top: 5px;}
              
              .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 13px; background-color: #f0fdfa; padding: 15px; border-radius: 10px; border: 1px solid #ccfbf1; }
              .info-item { border-bottom: 1px dashed #99f6e4; padding-bottom: 3px; }
              .info-label { font-weight: bold; color: #0d9488; display: inline-block; width: 130px;}
              
              .prescription-body { min-height: 350px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 20px; white-space: pre-wrap; font-size: 15px; line-height: 1.5; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px; }
              
              .firma-area { text-align: right; margin-bottom: 20px; padding-right: 40px; }
              .firma-line { border-top: 1px solid #1e293b; width: 200px; display: inline-block; text-align: center; padding-top: 5px; font-weight: bold; font-size: 14px;}
              
              .footer { display: flex; justify-content: space-between; font-size: 11px; border-top: 3px solid #ccfbf1; padding-top: 10px; color: #0f172a; }
              .footer-box { display: flex; gap: 10px; align-items: flex-start;}
              .footer-icon { font-size: 16px; }
          </style>
      </head>
      <body>
          <div class="header">
              <img src="/Dogs_&_Cats.jpeg" alt="Dogs and Cats Logo" class="logo" />
              <div class="header-content">
                  <div class="title">RECETA MÉDICA</div>
                  <div class="doctor-info">M.V.Z. MARÍA EUGENIA PEÑA ACOSTA</div>
                  <div class="cedula-area"><span>Cédula Profesional</span><span style="font-size: 14px; font-weight: bold;">6992889</span></div>
              </div>
          </div>

          <div class="patient-info">
              <div class="info-item"><span class="info-label">Nombre de la Mascota:</span> ${escapeHtml(pet.name)}</div>
              <div class="info-item"><span class="info-label">No. Expediente:</span> <strong style="color:#0d9488;">${escapeHtml(formatExpediente(pet.id))}</strong></div>
              <div class="info-item"><span class="info-label">Fecha:</span> ${escapeHtml(new Date().toLocaleDateString())}</div>
              <div class="info-item"><span class="info-label">Raza:</span> ${escapeHtml(pet.breed || "N/E")}</div>
              <div class="info-item"><span class="info-label">Sexo:</span> ${escapeHtml(pet.sex || "N/E")}</div>
              <div class="info-item"><span class="info-label">Color:</span> ${escapeHtml(pet.color || "N/E")}</div>
              <div class="info-item"><span class="info-label">Diagnóstico:</span> ${escapeHtml(appt ? appt.reason : "Consulta General")}</div>
          </div>

          <div class="prescription-body">℞<br><br>${escapeHtml(text)}</div>

          <div class="firma-area">
              <div class="firma-line">FIRMA</div>
          </div>

          <div class="footer">
              <div class="footer-box"><div class="footer-icon">📍</div><div>Calle: Catarroja Esq. Medina celli No. 39<br>Col.: Cerro de la Estrella<br>Alcaldía Iztapalapa, CDMX</div></div>
              <div class="footer-box"><div class="footer-icon">📞</div><div>Previa Cita:<br><strong>55 5443 8436 / <br>55 7869 6274</strong></div></div>
              <div class="footer-box"><div class="footer-icon">⏰</div><div>Horario:<br>Lunes a Viernes 11:00 A.M. a 8:00 P.M.<br>Sábado 11:00 A.M. a 7:00 P.M.</div></div>
          </div>
          <script>
              setTimeout(() => { window.print(); }, 500);
          </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlTemplate);
    printWindow.document.close();
    // Cerrar el editor: así no se puede guardar dos veces la misma receta por accidente
    setPrescriptionModal({ isOpen: false, pet: null, appt: null, text: "" });
  };

  const printExpediente = () => {
    if (!selectedOwner) return;
    const printWindow = window.open("", "_blank");

    let petsHtml = "";
    if (selectedOwner.pets && selectedOwner.pets.length > 0) {
      selectedOwner.pets.forEach((p) => {
        petsHtml += `
          <div class="pet-section">
            <div class="pet-header" style="display: flex; justify-content: space-between;">
              <span>🐾 Paciente: ${escapeHtml(p.name)}</span>
              <span>Folio: ${escapeHtml(formatExpediente(p.id))}</span>
            </div>
            <div class="pet-info">
              <span><b>Especie:</b> ${escapeHtml(p.species)}</span>
              <span><b>Raza:</b> ${escapeHtml(p.breed || "N/E")}</span>
              <span><b>Sexo:</b> ${escapeHtml(p.sex || "N/E")}</span>
              <span><b>Color:</b> ${escapeHtml(p.color || "N/E")}</span>
              <span><b>Nacimiento:</b> ${escapeHtml(p.birth_date ? p.birth_date.slice(0, 10).split("-").reverse().join("/") : "N/E")}</span>
            </div>
            <table class="history-table">
              <thead><tr><th>Fecha</th><th>Motivo / Diagnóstico</th><th>Estado</th></tr></thead>
              <tbody>
        `;
        if (p.appointments && p.appointments.length > 0) {
          const sortedAppts = [...p.appointments].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          );
          sortedAppts.forEach((a) => {
            petsHtml += `<tr><td style="width: 15%;">${escapeHtml(a.date)}</td><td>${escapeHtml(a.reason)}</td><td style="width: 15%; font-weight: bold;">${escapeHtml(a.status)}</td></tr>`;
          });
        } else {
          petsHtml += `<tr><td colspan="3" style="text-align: center; font-style: italic; color: #94a3b8;">Sin historial médico ni citas registradas.</td></tr>`;
        }
        petsHtml += `</tbody></table></div>`;
      });
    } else {
      petsHtml = `<div style="padding: 20px; text-align: center; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 10px;">Este cliente no tiene mascotas registradas.</div>`;
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Expediente Clínico - ${escapeHtml(selectedOwner.name)}</title>
          <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5;}
              .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 4px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px; }
              .logo { width: 150px; flex-shrink: 0; }
              .title-area { text-align: right; display: flex; flex-direction: column; justify-content: center; }
              .doc-title { font-size: 24px; font-weight: black; color: #1e293b; text-transform: uppercase; letter-spacing: 2px;}
              .date-print { font-size: 12px; color: #64748b; margin-top: 8px;}

              .owner-info { display: flex; justify-content: space-between; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);}
              .owner-info div { display: flex; flex-direction: column; gap: 5px; }
              .info-label { font-weight: bold; color: #0d9488; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;}
              .info-data { font-size: 16px; font-weight: bold; color: #1e293b;}

              .pet-section { margin-bottom: 40px; page-break-inside: avoid;}
              .pet-header { background-color: #0d9488; color: white; padding: 12px 20px; font-size: 18px; font-weight: bold; border-radius: 10px 10px 0 0; }
              .pet-info { display: flex; justify-content: space-between; padding: 15px 20px; background-color: #f0fdfa; border-left: 2px solid #0d9488; border-right: 2px solid #0d9488; font-size: 14px; color: #115e59;}
              
              .history-table { width: 100%; border-collapse: collapse; font-size: 14px; border: 2px solid #e2e8f0; border-top: none;}
              .history-table th { background-color: #f1f5f9; color: #475569; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 12px;}
              .history-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;}
              .history-table tr:nth-child(even) { background-color: #f8fafc; }
              
              .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
      </head>
      <body>
          <div class="header">
              <img src="/Dogs_&_Cats.jpeg" alt="Dogs and Cats Logo" class="logo" />
              <div class="title-area">
                  <div class="doc-title">Expediente Clínico</div>
                  <div class="date-print">Fecha de Impresión: ${escapeHtml(new Date().toLocaleDateString())} a las ${escapeHtml(new Date().toLocaleTimeString())}</div>
              </div>
          </div>

          <div class="owner-info">
              <div><span class="info-label">Cliente / Propietario</span><span class="info-data">${escapeHtml(selectedOwner.name)}</span></div>
              <div><span class="info-label">Teléfono de Contacto</span><span class="info-data">${escapeHtml(selectedOwner.phone || "No registrado")}</span></div>
              <div><span class="info-label">Dirección Completa</span><span class="info-data">${escapeHtml(selectedOwner.address || "No registrado")}</span></div>
          </div>

          ${petsHtml}

          <div class="footer">
              <strong>Dogs & Cats - Sistema de Gestión Veterinaria</strong><br>
              Calle: Catarroja Esq. Medina celli No. 39, Col.: Cerro de la Estrella, Alcaldía Iztapalapa, CDMX • Tel: 55 5443 8436
          </div>
          <script>
              setTimeout(() => { window.print(); }, 500);
          </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlTemplate);
    printWindow.document.close();
  };

  // 💉 Cartilla de vacunación imprimible
  const printCartilla = (pet, owner) => {
    const filas = [...(pet.preventivos || [])]
      .sort((a, b) => a.applied_date.localeCompare(b.applied_date))
      .map(
        (r) => `<tr>
          <td>${escapeHtml(fmtFecha(r.applied_date))}</td>
          <td>${escapeHtml((TIPOS_PREVENTIVO[r.tipo] || TIPOS_PREVENTIVO.otro).label)}</td>
          <td><b>${escapeHtml(r.nombre)}</b>${r.notes ? `<br><small>${escapeHtml(r.notes)}</small>` : ""}</td>
          <td>${r.next_due_date ? escapeHtml(fmtFecha(r.next_due_date)) : "—"}</td>
          <td class="firma"></td>
        </tr>`,
      )
      .join("");
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Cartilla - ${escapeHtml(pet.name)}</title>
      <style>
        @page { size: letter; margin: 1.2cm; }
        body { font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; }
        .header { display: flex; align-items: center; gap: 20px; border-bottom: 4px solid #0d9488; padding-bottom: 12px; margin-bottom: 18px; }
        .logo { width: 110px; } h1 { margin: 0; font-size: 24px; } .sub { color: #475569; font-weight: bold; font-size: 13px; }
        .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px; }
        .datos b { color: #0d9488; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #0d9488; color: #fff; text-align: left; padding: 8px; font-size: 12px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 9px 8px; vertical-align: top; }
        td.firma { width: 110px; } tr:nth-child(even) td { background: #f8fafc; }
        .pie { margin-top: 24px; font-size: 11px; color: #64748b; text-align: center; }
      </style></head><body>
      <div class="header"><img src="/Dogs_&_Cats.jpeg" class="logo" alt="Dogs & Cats">
        <div><h1>Cartilla de Vacunación y Desparasitación</h1>
        <div class="sub">M.V.Z. María Eugenia Peña Acosta · Céd. Prof. 6992889</div></div></div>
      <div class="datos">
        <div><b>Paciente:</b> ${escapeHtml(pet.name)}</div><div><b>Expediente:</b> ${escapeHtml(formatExpediente(pet.id))}</div>
        <div><b>Especie / Raza:</b> ${escapeHtml(pet.species || "N/E")} · ${escapeHtml(pet.breed || "N/E")}</div>
        <div><b>Sexo / Color:</b> ${escapeHtml(pet.sex || "N/E")} · ${escapeHtml(pet.color || "N/E")}</div>
        <div><b>Nacimiento:</b> ${escapeHtml(pet.birth_date ? fmtFecha(pet.birth_date) : "N/E")}</div>
        <div><b>Propietario:</b> ${escapeHtml(owner?.name || "")} · ${escapeHtml(owner?.phone || "")}</div>
      </div>
      <table><thead><tr><th>Fecha</th><th>Tipo</th><th>Vacuna / tratamiento</th><th>Próxima dosis</th><th>Firma / sello</th></tr></thead>
      <tbody>${filas}</tbody></table>
      <div class="pie">Dogs & Cats · Calle Catarroja Esq. Medina Celli No. 39, Col. Cerro de la Estrella, Iztapalapa, CDMX · 55 5443 8436</div>
      <script>setTimeout(() => window.print(), 500);</script></body></html>`);
    w.document.close();
  };

  const printSurgeryAuth = (pet, owner) => {
    const printWindow = window.open("", "_blank");
    const today = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Usamos nuestra función transformadora para el folio
    const folio = `DC-${String(pet.id).padStart(4, "0")}`;

    // Calculamos la edad aproximada si hay fecha de nacimiento
    let edad = "N/E";
    if (pet.birth_date) {
      const birthYear = new Date(pet.birth_date).getFullYear();
      const currentYear = new Date().getFullYear();
      edad = currentYear - birthYear + " años";
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Ficha y Consentimiento - ${escapeHtml(pet.name)}</title>
          <style>
              /* Forzamos a que sea tamaño carta y ajustamos los márgenes al límite */
              @page { size: letter; margin: 1cm; }
              
              /* Redujimos la letra a 10px para que el texto original quepa perfecto */
              body { font-family: 'Arial', sans-serif; color: #000; max-width: 800px; margin: 0 auto; line-height: 1.2; font-size: 14px; text-align: justify; }
              
              .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
              .logo { width: 120px; flex-shrink: 0; }
              .header-content { flex-grow: 1; padding-left: 15px; display: flex; flex-direction: column; justify-content: center;}
              .main-title { text-align: center; font-size: 15px; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; }
              .doctor-info { text-align: center; font-size: 11px; margin-bottom: 8px; font-weight: bold; color: #333; }
              .date-row { display: flex; justify-content: space-between; font-size: 11px; margin-top: 8px; font-weight: bold;}

              /* --- ESTILOS DE LA FICHA CLÍNICA --- */
              .ficha-container { border: 2px solid #000; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
              .form-row { display: flex; margin-bottom: 6px; align-items: flex-end; }
              .form-label { font-weight: bold; white-space: nowrap; margin-right: 10px; font-size: 11px; }
              .form-line { border-bottom: 1px solid #000; flex-grow: 1; padding-bottom: 1px; padding-left: 5px; font-size: 11px; color: #1e293b; }
              .form-col-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 6px;}

              /* --- ESTILOS DEL CONSENTIMIENTO --- */
              .sub-title { text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 8px; text-decoration: underline;}
              .content-text { margin-bottom: 6px; }
              ul { margin-top: 4px; margin-bottom: 6px; padding-left: 25px; }
              li { margin-bottom: 3px; }
              
              /* --- ESTILOS FINANCIEROS Y FIRMAS --- */
              .financial-box { display: flex; justify-content: space-around; margin: 15px 0; padding: 8px; border: 1px dashed #000; font-weight: bold; font-size: 12px; background-color: #f8fafc;}
              .finance-line { display: inline-block; border-bottom: 1px solid #000; width: 70px; }

              .signatures { display: flex; justify-content: space-between; margin-top: 30px; text-align: center; }
              .sign-box { width: 40%; }
              .sign-line { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
              .footer-quote { text-align: center; margin-top: 15px; font-style: italic; font-weight: bold; font-size: 9px; }
          </style>
      </head>
      <body>
          <div class="header">
              <img src="/Dogs_&_Cats.jpeg" alt="Dogs and Cats Logo" class="logo" />
              <div class="header-content">
                  <div class="main-title">FICHA CLÍNICA Y AUTORIZACIÓN DE PROCEDIMIENTO</div>
                  <div class="doctor-info">M.V.Z. MARÍA EUGENIA PEÑA ACOSTA | CED. PROFESIONAL. 6992889</div>
                  <div class="date-row">
                      <div>Expediente: <span style="text-decoration: underline;">${escapeHtml(folio)}</span></div>
                      <div>Fecha: <span style="text-decoration: underline;">${escapeHtml(today)}</span></div>
                  </div>
              </div>
          </div>

          <div class="ficha-container">
              <div class="form-row">
                  <div class="form-label">Nombre del Propietario</div>
                  <div class="form-line">${escapeHtml(owner.name)}</div>
              </div>
              <div class="form-row">
                  <div class="form-label">Domicilio</div>
                  <div class="form-line">${escapeHtml(owner.address || "_________________________________________")}</div>
              </div>
              <div class="form-row">
                  <div class="form-label">Teléfono</div>
                  <div class="form-line">${escapeHtml(owner.phone || "_________________________________________")}</div>
              </div>
              
              <div class="form-col-2" style="margin-top: 10px;">
                  <div class="form-row" style="margin-bottom:0;">
                      <div class="form-label">Nombre de la mascota</div>
                      <div class="form-line">${escapeHtml(pet.name)}</div>
                  </div>
                  <div class="form-row" style="margin-bottom:0;">
                      <div class="form-label">Especie</div>
                      <div class="form-line">${escapeHtml(pet.species)}</div>
                  </div>
              </div>

              <div class="form-col-2">
                  <div class="form-row" style="margin-bottom:0;">
                      <div class="form-label">Raza</div>
                      <div class="form-line">${escapeHtml(pet.breed || "________________")}</div>
                  </div>
                  <div class="form-row" style="margin-bottom:0;">
                      <div class="form-label">Color</div>
                      <div class="form-line">${escapeHtml(pet.color || "________________")}</div>
                  </div>
              </div>

              <div class="form-col-2">
                  <div class="form-row" style="margin-bottom:0;">
                      <div class="form-label">Sexo</div>
                      <div class="form-line">${escapeHtml(pet.sex || "________________")}</div>
                  </div>
                  <div class="form-row" style="margin-bottom:0;">
                      <div class="form-label">Edad (aprox)</div>
                      <div class="form-line">${escapeHtml(edad)}</div>
                  </div>
              </div>
          </div>

          <div class="sub-title">CONSENTIMIENTO INFORMADO</div>

          <div class="content-text">
              Yo, <strong>${escapeHtml(owner.name)}</strong>, propietario(a) de la mascota <strong>${escapeHtml(pet.name)}</strong> autorizo de manera libre y consciente la realización del procedimiento quirúrgico y la aplicación de anestésicos, medicamentos y materiales necesarios para la atención de mi mascota, en las instalaciones del Consultorio Veterinario Dogs & Cats.
          </div>

          <div class="content-text">
              He sido informado(a) de manera clara y completa sobre los riesgos inherentes a toda intervención quirúrgica y al uso de anestesia, los cuales pueden variar según la edad, especie, raza, sexo, condición física, estado de salud general y tipo de procedimiento que se realizará.
          </div>

          <div class="content-text">
              Se me ha explicado que, aunque el personal médico tomará todas las medidas necesarias para reducir los riesgos, existen complicaciones posibles tales como:
          </div>

          <ul>
              <li>Reacciones adversas o alérgicas a medicamentos o anestésicos.</li>
              <li>Paro cardiorrespiratorio durante o después del procedimiento.</li>
              <li>Hemorragias, hipotermia o alteraciones metabólicas.</li>
              <li>Fallas orgánicas relacionadas con la edad o enfermedades preexistentes.</li>
              <li>Retraso en la recuperación o complicaciones postoperatorias (infecciones, inflamación, dolor, dehiscencia de suturas, etc.).</li>
          </ul>

          <div class="content-text">
              También entiendo que el riesgo aumenta cuando no se realizan estudios prequirúrgicos (química sanguínea, biometría hemática, urianálisis, etc.) que permiten conocer el estado de salud del paciente antes del procedimiento.
          </div>

          <div class="content-text">
              En caso de haberse realizado dichos estudios, acepto que sus resultados fueron revisados y comprendidos; si decidí no realizarlos, asumo la total responsabilidad por los posibles riesgos y consecuencias derivadas.
          </div>

          <div class="content-text">
              Autorizo el uso de medicamentos anestésicos, sedantes, analgésicos y antibióticos que el Médico Veterinario considere necesarios antes, durante y después del procedimiento, según el criterio clínico correspondiente. Comprendo que ningún procedimiento médico o quirúrgico garantiza resultados absolutos, ya que cada organismo puede reaccionar de manera distinta.
          </div>

          <div class="content-text">
              Declaro haber recibido toda la información necesaria, haber resuelto mis dudas y otorgo mi consentimiento informado para proceder con la cirugía:
          </div>

          <div class="content-text" style="font-weight: bold;">
              Asumo plena responsabilidad de las decisiones tomadas y libero de toda responsabilidad al Consultorio Veterinario Dogs & Cats, a su personal médico y técnico, por cualquier complicación o desenlace no favorable derivado del procedimiento o de condiciones médicas no detectadas previamente.
          </div>

          <div class="financial-box">
              <div>Total: $<span class="finance-line"></span></div>
              <div>A cuenta: $<span class="finance-line"></span></div>
              <div>Restan: $<span class="finance-line"></span></div>
          </div>

          <div class="signatures">
              <div class="sign-box"><div class="sign-line">Firma del Propietario</div></div>
              <div class="sign-box"><div class="sign-line">Firma del Médico Veterinario</div></div>
          </div>

          <div class="footer-quote">
              "En Dogs & Cats trabajamos con profesionalismo, respeto y amor por cada vida animal."
          </div>

          <script>
              setTimeout(() => { window.print(); }, 500);
          </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlTemplate);
    printWindow.document.close();
  };

  // --- RECETAS: todas las recetas de todos los pacientes, la más reciente primero ---
  const todasLasRecetas = owners
    .flatMap((o) =>
      (o.pets || []).flatMap((pet) =>
        (pet.appointments || [])
          .filter((a) => a.prescription_text)
          .map((appt) => ({ appt, pet, owner: o })),
      ),
    )
    .sort((a, b) => (b.appt.date || "").localeCompare(a.appt.date || "") || b.appt.id - a.appt.id);
  const recetasFiltradas = todasLasRecetas.filter(({ appt, pet, owner }) => {
    const q = recetaSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      pet.name.toLowerCase().includes(q) ||
      owner.name.toLowerCase().includes(q) ||
      formatExpediente(pet.id).toLowerCase().includes(q) ||
      (appt.reason || "").toLowerCase().includes(q) ||
      (appt.prescription_text || "").toLowerCase().includes(q)
    );
  });

  // --- LÓGICA DE CÁLCULO Y ALERTAS DE INVENTARIO ---
  const totalOwners = owners?.length || 0;
  const totalPets =
    owners?.reduce(
      (sum, owner) => sum + (owner.pets ? owner.pets.length : 0),
      0,
    ) || 0;
  const todayObj = new Date();
  const formattedTodayDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

  const todayAppointmentsList =
    owners
      ?.flatMap((owner) =>
        (owner.pets || []).flatMap((pet) =>
          (pet.appointments || [])
            .filter(
              (a) => a.date === formattedTodayDate && a.status === "Pendiente",
            )
            .map((a) => ({
              ...a,
              petName: pet.name,
              ownerName: owner.name,
              owner,
            })),
        ),
      )
      .sort((a, b) => a.time.localeCompare(b.time)) || [];

  const todayAppointments = todayAppointmentsList.length;

  // Saludo según la hora y fecha larga en español (ej. "martes, 3 de noviembre")
  const horaActual = new Date().getHours();
  const saludoDelDia =
    horaActual < 12 ? "Buenos días" : horaActual < 19 ? "Buenas tardes" : "Buenas noches";
  const fechaLarga = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayDateString = new Date().toLocaleDateString();
  const todaySalesAll = sales.filter(
    (s) => new Date(s.sale_date).toLocaleDateString() === todayDateString,
  );
  const todaySales = todaySalesAll.filter((s) => !s.cancelled_at); // las canceladas no suman
  const ventasHoyPorArea = todaySales.reduce((acc, s) => {
    const k = areaDe(products.find((x) => x.id === s.product_id));
    acc[k] = (acc[k] || 0) + s.total_price;
    return acc;
  }, {});

  // Ventas de hoy agrupadas por ticket (un cobro = un ticket)
  const nombreDeProducto = (id) => {
    const p = products.find((x) => x.id === id);
    return p ? p.name.split("_@@_")[0].trim() : "Artículo eliminado";
  };
  const todayTickets = Object.values(
    todaySalesAll.reduce((acc, s) => {
      const key = s.ticket_id || `venta-${s.id}`;
      if (!acc[key]) acc[key] = { key, ticketId: s.ticket_id, rows: [], total: 0, date: s.sale_date };
      acc[key].rows.push(s);
      acc[key].total += s.total_price;
      return acc;
    }, {}),
  )
    .map((t) => ({
      ...t,
      cancelled: t.rows.every((r) => r.cancelled_at),
      methods: [...new Set(t.rows.map((r) => r.payment_method))].join(" + "),
      items: Object.entries(
        t.rows.reduce((acc, r) => {
          const n = nombreDeProducto(r.product_id);
          acc[n] = (acc[n] || 0) + r.quantity;
          return acc;
        }, {}),
      ).map(([n, q]) => `${n} (${parseFloat(q.toFixed(3))})`),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const todayTotalRevenue = todaySales.reduce(
    (sum, s) => sum + s.total_price,
    0,
  );

  const filteredOwners = owners
    .filter((owner) => {
      const searchLower = searchTerm.toLowerCase();

      // 1. Revisa si coincide con el nombre, teléfono o dirección del dueño
      const matchDueño =
        owner.name.toLowerCase().includes(searchLower) ||
        (owner.address && owner.address.toLowerCase().includes(searchLower)) ||
        (owner.phone && owner.phone.includes(searchLower));

      // 2. Revisa si coincide con el nombre de ALGUNA de sus mascotas
      const matchMascota =
        owner.pets &&
        owner.pets.some(
          (pet) =>
            pet.name.toLowerCase().includes(searchLower) ||
            formatExpediente(pet.id).toLowerCase().includes(searchLower),
        );

      return matchDueño || matchMascota;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const lowStockProducts = groupedInventory.filter(
    (p) => p.availableQuantity <= p.min_stock && p.category !== "Servicio",
  );
  const expiringProducts = products
    .filter((p) => {
      if (!p.expiration_date || p.category === "Servicio" || p.quantity <= 0)
        return false;
      const expDate = new Date(p.expiration_date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    })
    .map((p) => ({ ...p, cleanName: p.name.split("_@@_")[0].trim(), caducado: isExpiredLot(p) }));

  // --- CÁLCULOS DE PRECIO Y TOTAL ---
  const selectedProductGroup = groupedInventory.find(
    (p) => p.name.toLowerCase() === newSale.product_key,
  );

  let currentItemTotal = "0.00";
  if (selectedProductGroup) {
    const unitPrice = selectedProductGroup.price;
    let totalCalc = 0;
    if (
      isFractionalSale && chargeByApplication && selectedProductGroup.application_price != null
    ) {
      totalCalc = selectedProductGroup.application_price; // precio fijo por aplicación
    } else if (isFractionalSale && fractionCapacity && fractionAmount) {
      totalCalc = unitPrice * (parseFloat(fractionAmount) / parseFloat(fractionCapacity || 1));
    } else if (!isFractionalSale && newSale.quantity) {
      totalCalc = unitPrice * parseFloat(newSale.quantity);
    }
    currentItemTotal = totalCalc.toFixed(2);
  }

  const cartGrandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // ==========================================
  // --- PANTALLA DE LOGIN (MODERNA) ---
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-sans text-slate-900 selection:bg-teal-100 relative flex justify-center items-center p-6 z-0">
        <ClinicBackdrop />

        {/* TARJETA DE LOGIN CRISTAL */}
        <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white/50 w-full max-w-md animate-in zoom-in-95 duration-700">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-white flex items-center justify-center p-1 relative">
              <img
                src="/Dogs_&_Cats.jpeg"
                alt="Dogs & Cats Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="text-4xl font-black text-slate-800 text-center tracking-tight">
            Dogs <span className="text-rose-500">&</span> Cats
          </h2>
          <HeartbeatPaw className="w-56 mx-auto text-teal-500 mt-1 mb-2" />
          <p className="text-slate-500 text-center mb-8 font-semibold text-sm">
            Consultorio veterinario · Acceso del personal
          </p>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-5"
          >
            <div className="group relative">
              <User
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Usuario"
                value={authData.username}
                onChange={(e) =>
                  setAuthData({ ...authData, username: e.target.value })
                }
                required
                className="w-full pl-14 pr-5 py-4 bg-white/60 border border-white/50 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none text-slate-800 font-bold placeholder:text-slate-400 transition-all shadow-inner"
              />
            </div>
            <div className="group relative">
              <Key
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={authData.password}
                onChange={(e) =>
                  setAuthData({ ...authData, password: e.target.value })
                }
                required
                className="w-full pl-14 pr-5 py-4 bg-white/60 border border-white/50 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none text-slate-800 font-bold placeholder:text-slate-400 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-teal-500/30 text-lg flex justify-center items-center gap-2"
            >
              <Lock size={20} /> Entrar
            </button>
          </form>

          {/* Crear usuarios NO es público: solo la administradora, desde su sesión. */}
        </div>
      </div>
    );
  }

  // ==========================================
  // --- SISTEMA PRINCIPAL  ---
  // ==========================================
  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-teal-100 relative z-0">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        <ClinicBackdrop />

        {/* HEADER BRANDING (EFECTO CRISTAL) */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border-b-4 border-rose-400 border-x border-t border-white/50 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-teal-100 bg-white flex items-center justify-center p-1 relative group">
              <img
                src="/Dogs_&_Cats.jpeg"
                alt="Dogs & Cats Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                DOGS <span className="text-rose-500">AND</span> CATS
              </h1>
              <HeartbeatPaw className="w-44 text-teal-500 -mt-0.5" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-teal-600" />
                  <p className="text-teal-800 text-sm font-bold">
                    Consultorio veterinario · {currentUser}
                  </p>
                </div>
                
                {/* ✨ LA CAMPANITA DE NOTIFICACIONES ✨ */}
                <button
                  onClick={abrirCentroAvisos}
                  className={`relative p-2 rounded-full transition-all ${avisos.length > 0 ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"}`}
                  title="Centro de avisos: WhatsApp a dueños y notificaciones"
                >
                  <Bell size={20} />
                  {avisos.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                      {avisos.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <nav className="flex bg-white/50 p-1.5 rounded-2xl gap-1 overflow-x-auto border border-white/60">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "home" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <Stethoscope size={18} /> Clínica
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "inventory" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <Pill size={18} /> Almacén
            </button>
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "pos" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <ShoppingCart size={18} /> Caja
            </button>
            <button
              onClick={() => setActiveTab("recetas")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "recetas" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <FileText size={18} /> Recetas
            </button>
          </nav>

          <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={openUsersModal}
              className="flex items-center gap-2 bg-indigo-50/80 text-indigo-600 hover:bg-indigo-500 hover:text-white px-5 py-3 rounded-2xl font-bold transition-all border border-indigo-100"
              title="Administrar usuarios (solo administradora)"
            >
              <Key size={20} /> Usuarios
            </button>
          )}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 bg-rose-50/80 text-rose-600 hover:bg-rose-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all border border-rose-100"
          >
            <LogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Salir
          </button>
          </div>
        </header>

        {/* --- PANTALLA INICIO (CLÍNICA) --- */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SALUDO DEL DÍA */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 px-2">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                  {saludoDelDia}, {(currentUser || "").split(" ")[0]}
                </h2>
                <p className="text-slate-500 font-semibold first-letter:uppercase">{fechaLarga}</p>
              </div>
              <p className="flex items-center gap-2 text-teal-800 font-bold">
                <Stethoscope size={18} className="text-teal-600" />
                {todayAppointments === 0
                  ? "Sin citas pendientes para hoy"
                  : todayAppointments === 1
                    ? "Hoy hay 1 cita pendiente"
                    : `Hoy hay ${todayAppointments} citas pendientes`}
              </p>
            </div>
            {/* BRANDED DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Tarjeta Azul Marino Profundo */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute right-[-10px] bottom-[-20px] opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Users size={140} />
                </div>
                <h3 className="text-slate-300 font-bold uppercase tracking-widest text-xs mb-2">
                  Familias Registradas
                </h3>
                <p className="text-5xl font-black">{totalOwners}</p>
              </div>

              {/* Tarjeta Rojo Coral */}
              <div className="bg-gradient-to-br from-rose-400 to-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-100 relative overflow-hidden group">
                <div className="absolute right-[-10px] bottom-[-20px] opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                  <Cat size={140} />
                </div>
                <h3 className="text-rose-100 font-bold uppercase tracking-widest text-xs mb-2">
                  Pacientes Peludos 🐾
                </h3>
                <p className="text-5xl font-black">{totalPets}</p>
              </div>

              {/* Tarjeta Verde Teal */}
              <div
                onClick={() => setShowTodayAppts(true)}
                className="bg-gradient-to-br from-teal-400 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-teal-100 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                title="Haga clic para ver la agenda del día"
              >
                <div className="absolute right-[-10px] bottom-[-20px] opacity-20 group-hover:scale-110 transition-all duration-500">
                  <Calendar size={140} />
                </div>
                <h3 className="text-teal-50 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                  Citas de Hoy{" "}
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px]">
                    Ver agenda
                  </span>
                </h3>
                <p className="text-5xl font-black">{todayAppointments}</p>
              </div>
            </div>

            {/* 💉 VACUNAS Y DESPARASITACIONES POR VENCER (30 días) */}
            {proximosPreventivos.length > 0 && (
              <section className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-sm p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-5">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Syringe className="text-indigo-500" /> Vacunas y desparasitaciones por vencer
                  </h3>
                  <p className="text-sm font-semibold text-slate-500">
                    Próximos 30 días y vencidas. Los avisos de WhatsApp aparecen en la campanita 7 días antes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proximosPreventivos.map((v) => {
                    const est = estadoDosis(v.proxima);
                    return (
                      <div key={v.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <SpeciesAvatar species={v.especie} size={40} />
                          <div className="min-w-0">
                            <p className="font-black text-slate-800 truncate">
                              {v.mascota} <span className="font-semibold text-slate-500 text-sm">· {v["dueño"]}</span>
                            </p>
                            <p className="text-sm font-semibold text-slate-600 truncate">
                              {v.nombre} · {fmtFecha(v.proxima)}
                              {v.aviso_enviado && <span className="text-teal-600"> · avisado ✓</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${est.cls}`}>{est.label}</span>
                          <button
                            onClick={() => setSelectedOwner(owners.find((o) => o.id === v.owner_id) || null)}
                            className="p-2 bg-white text-teal-600 hover:bg-teal-600 hover:text-white rounded-xl border border-slate-200"
                            title="Abrir expediente"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* FORMULARIOS DUEÑOS Y BUSCADOR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <section
                className={`p-8 rounded-[2.5rem] border shadow-sm transition-all ${editingOwner ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}
              >
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <User
                    className={
                      editingOwner ? "text-amber-500" : "text-teal-600"
                    }
                  />{" "}
                  {editingOwner ? "Actualizar Cliente" : "Registrar Cliente"}
                </h3>
                <form
                  onSubmit={editingOwner ? handleUpdateOwner : handleAddOwner}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={editingOwner ? editingOwner.name : newOwner.name}
                    onChange={(e) =>
                      editingOwner
                        ? setEditingOwner({
                            ...editingOwner,
                            name: e.target.value,
                          })
                        : setNewOwner({ ...newOwner, name: e.target.value })
                    }
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                  />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="address"
                      placeholder="Direccion (ej. calle,#,colonia)"
                      value={
                        editingOwner ? editingOwner.address : newOwner.address
                      }
                      onChange={(e) =>
                        editingOwner
                          ? setEditingOwner({
                              ...editingOwner,
                              address: e.target.value,
                            })
                          : setNewOwner({
                              ...newOwner,
                              address: e.target.value,
                            })
                      }
                      className="w-full sm:w-1/2 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Teléfono (10 dígitos)"
                      maxLength="10"
                      value={editingOwner ? editingOwner.phone : newOwner.phone}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                        editingOwner
                          ? setEditingOwner({
                              ...editingOwner,
                              phone: onlyNums,
                            })
                          : setNewOwner({ ...newOwner, phone: onlyNums });
                      }}
                      className="w-full sm:w-1/2 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg ${editingOwner ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-900 hover:bg-teal-600"}`}
                  >
                    {editingOwner ? "Guardar Cambios" : "Agregar Cliente"}
                  </button>
                </form>
              </section>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-6">
                  <Search className="text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por dueño, mascota, teléfono o folio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none w-full font-bold text-slate-700"
                  />
                </div>
                <div className="overflow-y-auto max-h-[300px] pr-2 space-y-3">
                  {filteredOwners.map((owner) => (
                    <div
                      key={owner.id}
                      className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                    >
                      <div>
                        <h4 className="font-black text-slate-800">
                          {owner.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold">
                          {owner.pets.length} mascotas registradas
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingOwner(owner)}
                          className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-amber-500 hover:bg-amber-50 transition-all"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOwner(owner.id)}
                          className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedOwner(owner)}
                          className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all"
                          title="Ver Expediente"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredOwners.length === 0 && (
                    <p className="text-center text-slate-400 font-bold py-4">
                      No hay clientes con ese nombre.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* FORMULARIOS MASCOTAS Y CITAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <section
                className={`p-8 rounded-[2.5rem] shadow-sm border transition-all ${editingPet ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}
              >
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <PawPrint
                    className={editingPet ? "text-amber-500" : "text-teal-600"}
                  />{" "}
                  {editingPet ? "Actualizar Paciente" : "Registrar Paciente"}
                </h3>
                <form
                  onSubmit={editingPet ? handleUpdatePet : handleAddPet}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Nombre de mascota"
                      value={editingPet ? editingPet.name : newPet.name}
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              name: e.target.value,
                            })
                          : setNewPet({ ...newPet, name: e.target.value })
                      }
                      required
                      className="w-full sm:w-2/3 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                    />
                    <select
                      value={editingPet ? editingPet.owner_id : newPet.owner_id}
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              owner_id: e.target.value,
                            })
                          : setNewPet({ ...newPet, owner_id: e.target.value })
                      }
                      required
                      className="w-full sm:w-1/3 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-slate-600"
                    >
                      <option value="">Dueño...</option>
                      {owners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Especie (ej. Perro, Gato)"
                      value={editingPet ? editingPet.species : newPet.species}
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              species: e.target.value,
                            })
                          : setNewPet({ ...newPet, species: e.target.value })
                      }
                      required
                      className="w-full sm:w-1/2 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Raza"
                      value={editingPet ? editingPet.breed : newPet.breed}
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              breed: e.target.value,
                            })
                          : setNewPet({ ...newPet, breed: e.target.value })
                      }
                      className="w-full sm:w-1/2 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={editingPet ? editingPet.sex : newPet.sex}
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              sex: e.target.value,
                            })
                          : setNewPet({ ...newPet, sex: e.target.value })
                      }
                      className="w-full sm:w-1/2 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-slate-600"
                    >
                      <option value="">Sexo...</option>
                      <option value="Macho (M)">Macho (M)</option>
                      <option value="Hembra (H)">Hembra (H)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Color"
                      value={editingPet ? editingPet.color : newPet.color}
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              color: e.target.value,
                            })
                          : setNewPet({ ...newPet, color: e.target.value })
                      }
                      className="w-full sm:w-1/2 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Fecha de Nacimiento
                    </label>
                    <SmartDateInput
                      value={
                        editingPet ? editingPet.birth_date : newPet.birth_date
                      }
                      onChange={(val) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              birth_date: val,
                            })
                          : setNewPet({ ...newPet, birth_date: val })
                      }
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg ${editingPet ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-900 hover:bg-teal-600"}`}
                  >
                    {editingPet ? "Guardar Cambios" : "Registrar Paciente"}
                  </button>
                </form>
              </section>

              <section className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm">
                <h3 className="text-2xl font-black text-rose-900 mb-6 flex items-center gap-3">
                  <Calendar className="text-rose-500" />{" "}
                  {newAppt.id ? "Editar Cita" : "Agendar Cita Médica"}
                </h3>
                <form onSubmit={handleAddOrUpdateAppt} className="space-y-4">
                  <select
                    value={newAppt.pet_id}
                    onChange={(e) =>
                      setNewAppt({ ...newAppt, pet_id: e.target.value })
                    }
                    required
                    className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-600"
                  >
                    <option value="">Seleccionar Paciente...</option>
                    {owners
                      .flatMap((o) => o.pets)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Dueño:{" "}
                          {owners.find((on) => on.id === p.owner_id)?.name})
                        </option>
                      ))}
                  </select>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/2">
                      <label className="block text-xs font-black text-rose-400/70 uppercase tracking-widest mb-2 ml-1">
                        Fecha
                      </label>
                      <SmartDateInput
                        value={newAppt.date}
                        onChange={(val) =>
                          setNewAppt({ ...newAppt, date: val })
                        }
                        required
                        className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-700"
                      />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label className="block text-xs font-black text-rose-400/70 uppercase tracking-widest mb-2 ml-1">
                        Hora
                      </label>
                      <select
                        value={newAppt.time}
                        onChange={(e) =>
                          setNewAppt({ ...newAppt, time: e.target.value })
                        }
                        required
                        disabled={!newAppt.date}
                        className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-600 disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="">
                          {newAppt.date
                            ? "Selecciona una hora..."
                            : "Elige una fecha primero"}
                        </option>
                        {availableTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                    <input
                      type="text"
                      placeholder="Motivo de la consulta"
                      value={newAppt.reason}
                      onChange={(e) =>
                        setNewAppt({ ...newAppt, reason: e.target.value })
                      }
                      required
                      className="w-full sm:w-2/3 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium"
                    />
                    <select
                      value={newAppt.status}
                      onChange={(e) =>
                        setNewAppt({ ...newAppt, status: e.target.value })
                      }
                      className="w-full sm:w-1/3 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-600"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-rose-600 text-white font-black py-4 rounded-2xl hover:bg-rose-700 transition-all shadow-lg"
                    >
                      {newAppt.id ? "Actualizar" : "Agendar Cita"}
                    </button>
                    {newAppt.id && (
                      <button
                        type="button"
                        onClick={() =>
                          setNewAppt({
                            date: "",
                            time: "",
                            reason: "",
                            status: "Pendiente",
                            pet_id: "",
                            prescription_text: "",
                          })
                        }
                        className="px-6 bg-white text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </section>
            </div>
          </div>
        )}

        {/* --- PANTALLA INVENTARIO --- */}
        {activeTab === "inventory" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                <Archive className="text-teal-600" /> Catálogo de Almacén
              </h2>
              <button
                onClick={() =>
                  downloadExcel(
                    "/reports/inventory-status/",
                    {},
                    `Inventario_${toISODate(new Date())}.xlsx`,
                  )
                }
                className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-teal-700 hover:scale-[1.02] transition-all shadow-xl shadow-teal-100"
              >
                <FileSpreadsheet size={20} /> Exportar Excel
              </button>
            </div>

            {/* ALERTAS DE INVENTARIO */}
            {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {lowStockProducts.length > 0 && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-rose-800 font-black flex items-center gap-2 mb-3">
                      <AlertTriangle size={20} /> Alerta de Stock Mínimo
                    </h3>
                    <ul className="text-rose-600 text-sm font-bold space-y-1">
                      {lowStockProducts.map((p) => (
                        <li key={p.name}>
                          • {p.name} (Quedan {p.availableQuantity} {p.unit} vigentes)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {expiringProducts.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-amber-800 font-black flex items-center gap-2 mb-3">
                      <Calendar size={20} /> Caducados y por caducar (30 días)
                    </h3>
                    <ul className="text-amber-600 text-sm font-bold space-y-1">
                      {expiringProducts.map((p) => (
                        <li key={p.id} className={p.caducado ? "text-rose-600" : ""}>
                          • {p.cleanName} — {p.quantity} {p.unit}{" "}
                          {p.caducado
                            ? `(CADUCADO el ${fmtFecha(p.expiration_date)}, no se venderá)`
                            : `(Vence: ${fmtFecha(p.expiration_date)})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN DE AGREGAR PRODUCTO (AHORA VISIBLE PARA TODOS) */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                <Archive className="text-teal-600" />{" "}
                {editingGroupItems
                  ? "Actualizar Artículo General"
                  : "Agregar Stock / Nuevo Artículo"}
              </h3>
              {editingGroupItems && (
                <p className="text-amber-600 font-bold mb-4 text-sm bg-amber-50 p-4 rounded-xl border border-amber-100">
                  Nota: Al editar aquí actualizarás el precio y categoría de{" "}
                  <b>todos los lotes</b> de este producto. Para registrar stock
                  nuevo con otra caducidad, dale a Cancelar y guarda un "Nuevo
                  Artículo" escribiendo el nombre exactamente igual.
                </p>
              )}

              <form
                onSubmit={handleAddOrUpdateProduct}
                className="flex flex-wrap gap-4 items-end"
              >
                <div className="flex-grow min-w-[150px]">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Categoría
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Medicamento">Medicamento</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Vacuna">Vacuna</option>
                    <option value="Servicio">Servicio (Baño, Corte...)</option>
                  </select>
                </div>

                <div className="min-w-[170px]">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Área
                  </label>
                  <select
                    value={newProduct.area}
                    onChange={(e) => setNewProduct({ ...newProduct, area: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600"
                    title="Médico, Estética o Tienda. Si eliges Automática, se toma de la categoría."
                  >
                    <option value="">
                      Automática ({AREAS[areaDe({ category: newProduct.category })].label})
                    </option>
                    <option value="medico">🩺 Médico</option>
                    <option value="estetica">✂️ Estética</option>
                    <option value="tienda">🛍️ Tienda</option>
                  </select>
                </div>

                <div className="flex-grow-[2] min-w-[200px]">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Baño SPA"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    disabled={editingGroupItems !== null}
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
                  />
                </div>

                <div className="w-28">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Precio $
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-center"
                  />
                </div>

                {["Vacuna", "Medicamento"].includes(newProduct.category) && (
                  <div className="w-36">
                    <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-2 ml-1">
                      $ Aplicación
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.application_price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, application_price: e.target.value })
                      }
                      placeholder="Opcional"
                      title="Precio fijo que se cobra por cada aplicación, sin importar la dosis"
                      className="w-full p-4 bg-indigo-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                  </div>
                )}

                {newProduct.category !== "Servicio" && (
                  <>
                    <div className="w-32">
                      <label className="block text-xs font-black uppercase tracking-widest mb-2 ml-1 text-teal-600">
                        {editingGroupItems ? "+ Sumar Stock" : "Cant."}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProduct.quantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            quantity: e.target.value,
                          })
                        }
                        required={!editingGroupItems}
                        placeholder={editingGroupItems ? "Opcional" : "Ej. 10"}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-center"
                      />
                    </div>
                    <div className="w-40">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Caducidad
                      </label>
                      <SmartDateInput
                        value={newProduct.expiration_date}
                        onChange={(val) =>
                          setNewProduct({
                            ...newProduct,
                            expiration_date: val,
                          })
                        }
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-slate-700"
                      />
                    </div>
                  </>
                )}

                {newProduct.category !== "Servicio" && (
                  <>
                    <div className="w-28">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Unidad
                      </label>
                      <select
                        value={newProduct.unit}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            unit: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="piezas">pzas</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Min. Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProduct.min_stock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            min_stock: e.target.value,
                          })
                        }
                        required
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-center"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`px-10 py-4 rounded-2xl font-black transition-all shadow-lg text-white ${editingGroupItems ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-900 hover:bg-teal-600"}`}
                  >
                    {editingGroupItems ? "Actualizar Todo" : "Guardar Stock"}
                  </button>
                  {editingGroupItems && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGroupItems(null);
                        setNewProduct({
                          category: "Medicamento",
                          name: "",
                          quantity: "",
                          unit: "piezas",
                          price: "",
                          application_price: "",
                          area: "",
                          min_stock: "",
                          expiration_date: "",
                        });
                      }}
                      className="px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                <Search size={24} className="text-slate-300" />
                <input
                  type="text"
                  placeholder="Filtrar por nombre o categoría..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-700 text-xl"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                      <th className="p-6">Artículo Agrupado</th>
                      <th className="p-6">Categoría</th>
                      <th className="p-6">Stock Sumado</th>
                      <th className="p-6">Caducidades Lotes</th>
                      <th className="p-6">Precio</th>
                      <th className="p-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {groupedInventory.map((group) => (
                      <tr
                        key={group.name}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-6 font-black text-slate-800">
                          {group.name}
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col items-start gap-1">
                            <CategoryBadge category={group.category} />
                            <span className="text-[11px] font-bold text-slate-400 pl-1">
                              Área: {AREAS[areaDe(group)].label}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`font-black text-lg ${group.totalQuantity <= group.min_stock && group.category !== "Servicio" ? "text-rose-500" : "text-teal-600"}`}
                          >
                            {group.category === "Servicio"
                              ? "∞"
                              : group.availableQuantity}{" "}
                            <span className="text-sm">
                              {group.category !== "Servicio" ? group.unit : ""}
                            </span>
                          </span>
                          {group.expiredQuantity > 0 && (
                            <div className="text-xs font-black text-rose-500 mt-1">
                              + {group.expiredQuantity} {group.unit} caducado
                            </div>
                          )}
                        </td>
                        <td className="p-6 text-slate-500 font-medium text-sm min-w-[240px]">
                          {group.category !== "Servicio" &&
                          group.subItems.some((l) => l.quantity > 0) ? (
                            <div className="flex flex-col gap-1">
                              {group.subItems
                                .filter((l) => l.quantity > 0)
                                .map((l) => {
                                  const caducado = isExpiredLot(l);
                                  return (
                                    <div
                                      key={l.id}
                                      className={`flex items-center justify-between gap-2 pl-2 pr-1 py-0.5 rounded-lg text-xs border font-bold ${caducado ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-600"}`}
                                    >
                                      <span>
                                        {parseFloat(Number(l.quantity).toFixed(2))} {l.unit} ·{" "}
                                        {l.expiration_date
                                          ? `${caducado ? "CADUCÓ" : "vence"} ${fmtFecha(l.expiration_date)}`
                                          : "sin caducidad"}
                                      </span>
                                      <span className="flex">
                                        <button
                                          onClick={() => openEditLot(group, l)}
                                          className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                          title="Corregir este lote (cantidad o caducidad)"
                                        >
                                          <Edit size={13} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLot(l)}
                                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                          title="Borrar este lote"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-6 font-black text-slate-800 text-lg">
                          ${group.price}
                          {group.application_price != null && (
                            <div className="text-xs font-black text-indigo-500">
                              ${group.application_price} por aplicación
                            </div>
                          )}
                        </td>
                        <td className="p-6 text-center flex justify-center gap-2">
                          {group.category !== "Servicio" && (
                            <button
                              onClick={() => openAddLot(group)}
                              className="p-3 text-teal-600 hover:bg-teal-50 rounded-2xl transition-all"
                              title="Agregar lote nuevo (mercancía que acaba de llegar)"
                            >
                              <PlusCircle size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditGroupClick(group)}
                            className="p-3 text-amber-500 hover:bg-amber-50 rounded-2xl transition-all"
                            title="Editar info general"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                            title="Borrar TODOS los lotes de este artículo"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {groupedInventory.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-10 text-center text-slate-500 italic"
                        >
                          No se encontraron artículos en el inventario.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PANTALLA RECETAS (separada del expediente) --- */}
        {activeTab === "recetas" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                  <FileText className="text-teal-600" /> Recetas
                </h2>
                <p className="text-slate-500 font-semibold">
                  {todasLasRecetas.length} receta(s) guardada(s). Busca por paciente, dueño, folio o medicamento.
                </p>
              </div>
              {/* Nueva receta: elegir paciente */}
              <div className="flex flex-wrap items-end gap-2 bg-white p-3 rounded-2xl border border-teal-100 shadow-sm">
                <select
                  value={recetaPetId}
                  onChange={(e) => setRecetaPetId(e.target.value)}
                  className="p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 min-w-[240px]"
                >
                  <option value="">Elegir paciente...</option>
                  {owners
                    .flatMap((o) => (o.pets || []).map((pet) => ({ pet, owner: o })))
                    .sort((a, b) => a.pet.name.localeCompare(b.pet.name))
                    .map(({ pet, owner }) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({formatExpediente(pet.id)}) · {owner.name}
                      </option>
                    ))}
                </select>
                <button
                  disabled={!recetaPetId}
                  onClick={() => {
                    const pet = owners.flatMap((o) => o.pets || []).find((x) => String(x.id) === String(recetaPetId));
                    if (pet) setPrescriptionModal({ isOpen: true, pet, appt: null, text: "" });
                  }}
                  className="bg-teal-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-md disabled:opacity-50"
                >
                  <PlusCircle size={18} /> Nueva receta
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl mb-6 border border-slate-100 shadow-sm">
              <Search className="text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar receta: paciente, dueño, folio (DC-0001), medicamento..."
                value={recetaSearch}
                onChange={(e) => setRecetaSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-bold text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {recetasFiltradas.map(({ appt, pet, owner }) => (
                <div key={appt.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <SpeciesAvatar species={pet.species} size={40} />
                      <div>
                        <p className="font-black text-slate-800 text-lg leading-tight">
                          {pet.name}{" "}
                          <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg">
                            {formatExpediente(pet.id)}
                          </span>
                        </p>
                        <p className="text-sm font-semibold text-slate-500">
                          {owner.name} · {fmtFecha(appt.date)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl text-right">
                      {appt.reason}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-700 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-grow max-h-40 overflow-y-auto">
                    {appt.prescription_text}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setPrescriptionModal({ isOpen: true, pet, appt, text: appt.prescription_text })}
                      className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 flex items-center justify-center gap-2"
                    >
                      <Printer size={16} /> Ver / Re-imprimir
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("home");
                        setSelectedOwner(owner);
                      }}
                      className="px-4 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 flex items-center gap-2"
                      title="Abrir el expediente del paciente"
                    >
                      <ExternalLink size={16} /> Expediente
                    </button>
                  </div>
                </div>
              ))}
              {recetasFiltradas.length === 0 && (
                <div className="lg:col-span-2 text-center py-14 bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-bold">
                    {todasLasRecetas.length === 0
                      ? "Aún no hay recetas. Elige un paciente arriba y crea la primera."
                      : "No hay recetas que coincidan con la búsqueda."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PANTALLA POS (CAJA) --- */}
        {activeTab === "pos" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-4xl font-extrabold text-emerald-900 flex items-center gap-3">
                <ShoppingCart size={36} className="text-emerald-500" /> Punto de
                Venta
              </h2>
              <div className="flex gap-4">
                {currentUser === "Maru Peña" && (
                  <div className="flex flex-wrap items-end gap-3 bg-white/80 p-3 rounded-2xl border border-emerald-100 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 ml-1">
                        Periodo del reporte
                      </label>
                      <select
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                        className="p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                        <option value="lastMonth">Mes anterior</option>
                        <option value="custom">Elegir fechas...</option>
                      </select>
                    </div>
                    {reportPeriod === "custom" && (
                      <>
                        <div className="w-44">
                          <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 ml-1">
                            Desde
                          </label>
                          <SmartDateInput
                            value={reportStart}
                            onChange={setReportStart}
                            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="w-44">
                          <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 ml-1">
                            Hasta
                          </label>
                          <SmartDateInput
                            value={reportEnd}
                            onChange={setReportEnd}
                            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </>
                    )}
                    <button
                      onClick={handleDownloadSalesReport}
                      className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
                    >
                      <FileSpreadsheet size={20} /> Reporte de Ventas (Excel)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                    <PlusCircle className="text-teal-600" /> Nuevo Cargo
                  </h3>
                  <form onSubmit={handleAddToCart} className="space-y-6">
                    {/* Pestañas por área: cada quien ve solo lo de su área */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl" role="tablist">
                      {[["todas", "Todo", null], ...Object.entries(AREAS).map(([k, a]) => [k, a.label, a.Icon])].map(
                        ([key, label, Icon]) => (
                          <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={posArea === key}
                            onClick={() => {
                              setPosArea(key);
                              setNewSale({ ...newSale, product_key: "" });
                              setIsFractionalSale(false);
                            }}
                            className={`py-2 rounded-xl text-xs font-black flex flex-col items-center gap-0.5 transition-all ${posArea === key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                          >
                            {Icon ? <Icon size={16} /> : <PawPrint size={16} />}
                            {label}
                          </button>
                        ),
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        Producto / Servicio
                      </label>
                      <select
                        value={newSale.product_key}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            product_key: e.target.value,
                          })
                        }
                        required
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                      >
                        <option value="">Seleccionar...</option>
                        {groupedInventory
                          .filter((p) => !p.name.startsWith("Cargo Extra")) // productos internos
                          .filter((p) => posArea === "todas" || areaDe(p) === posArea)
                          .map((p) => (
                          <option
                            key={p.name.toLowerCase()}
                            value={p.name.toLowerCase()}
                          >
                            {p.name} - ${p.price} (Stock:{" "}
                            {p.category === "Servicio" ? "∞" : p.availableQuantity}
                            {p.expiredQuantity > 0 ? ` + ${p.expiredQuantity} caducado` : ""})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProductGroup && (
                      <div className="bg-teal-50/50 p-5 rounded-3xl border border-teal-200 flex flex-col gap-4 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer font-black text-teal-900 text-sm">
                          <input
                            type="checkbox"
                            checked={isFractionalSale}
                            onChange={(e) => {
                              setIsFractionalSale(e.target.checked);
                              setChargeByApplication(true);
                              setFractionAmount("");
                              setTargetMoney("");
                              setNewSale({ ...newSale, quantity: "" });
                              if (
                                ["kg", "L"].includes(selectedProductGroup.unit)
                              ) {
                                setFractionCapacity("1000");
                              } else {
                                setFractionCapacity("");
                              }
                            }}
                            className="w-5 h-5 rounded text-teal-600 accent-teal-600"
                          />
                          {selectedProductGroup.application_price != null
                            ? "💉 ¿Aplicar dosis / vender fracción?"
                            : "¿Vender a Granel / Fracción? (Gramos, ml, sueltas)"}
                        </label>

                        {isFractionalSale && (
                          <div className="animate-in fade-in zoom-in-95 duration-200 bg-white p-5 rounded-2xl shadow-sm border border-teal-100 flex flex-col gap-4">
                            {selectedProductGroup.application_price != null && (
                              <label className="flex items-center gap-3 cursor-pointer font-black text-indigo-800 text-sm bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <input
                                  type="checkbox"
                                  checked={chargeByApplication}
                                  onChange={(e) => setChargeByApplication(e.target.checked)}
                                  className="w-5 h-5 accent-indigo-600"
                                />
                                Cobrar precio por aplicación (${selectedProductGroup.application_price})
                              </label>
                            )}
                            {/* CALCULADORA INVERSA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                              <div className={selectedProductGroup.application_price != null && chargeByApplication ? "hidden" : ""}>
                                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 ml-1 block">
                                  ¿El cliente pide por dinero? ($)
                                </label>
                                <input
                                  type="number"
                                  min="0" step="any"
                                  value={targetMoney}
                                  onChange={(e) => {
                                    const money = e.target.value;
                                    setTargetMoney(money);
                                    if (money && fractionCapacity) {
                                      // Cálculo inverso: (Dinero / Precio Unitario) * Capacidad
                                      const calculatedGrams =
                                        (parseFloat(money) /
                                          selectedProductGroup.price) *
                                        parseFloat(fractionCapacity);
                                      setFractionAmount(
                                        calculatedGrams.toFixed(2),
                                      );
                                    }
                                  }}
                                  className="w-full p-3 bg-white border border-emerald-200 rounded-lg font-bold text-emerald-900 outline-none"
                                  placeholder="Ej. 100"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1 ml-1 block">
                                  {selectedProductGroup.application_price != null && chargeByApplication
                                    ? "Contenido del frasco (ej. ml)"
                                    : "Capacidad (Ej. 1kg = 1000g)"}
                                </label>
                                <input
                                  type="number"
                                  min="0.01" step="any"
                                  value={fractionCapacity}
                                  onChange={(e) =>
                                    setFractionCapacity(e.target.value)
                                  }
                                  className="w-full p-3 bg-white border border-teal-200 rounded-lg font-bold text-teal-900 outline-none"
                                />
                              </div>
                            </div>

                            {/* CAMPO DE PESO REAL (LA BÁSCULA) */}
                            <div>
                              <label className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 ml-1 block">
                                {selectedProductGroup.application_price != null && chargeByApplication ? (
                                  "💉 Cantidad aplicada (misma unidad que el contenido)"
                                ) : (
                                  <>
                                    ⚖️ Peso Real en Báscula (
                                    {["kg", "L"].includes(selectedProductGroup.unit)
                                      ? "Gramos/ml"
                                      : "Unidades"}
                                    )
                                  </>
                                )}
                              </label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={fractionAmount}
                                onChange={(e) =>
                                  setFractionAmount(e.target.value)
                                }
                                className="w-full p-4 bg-white border-2 border-teal-500 rounded-xl font-black text-teal-900 text-xl outline-none focus:ring-4 focus:ring-teal-500/20 text-center"
                                placeholder="Ej. 500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 💉 Cartilla: ¿a qué paciente se aplicó? (vacunas y medicamentos) */}
                    {selectedProductGroup &&
                      ["Vacuna", "Medicamento"].includes(selectedProductGroup.category) && (
                        <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-3">
                          <label className="text-xs font-black text-indigo-700 uppercase tracking-widest ml-1 block">
                            💉 Anotar en la cartilla de… (opcional)
                          </label>
                          <select
                            value={salePetId}
                            onChange={(e) => {
                              setSalePetId(e.target.value);
                              setSaleIntervalo(selectedProductGroup.category === "Vacuna" ? "1y" : "3m");
                            }}
                            className="w-full p-3 bg-white rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">No anotar</option>
                            {owners
                              .flatMap((o) => (o.pets || []).map((pet) => ({ pet, owner: o })))
                              .sort((a, b) => a.pet.name.localeCompare(b.pet.name))
                              .map(({ pet, owner }) => (
                                <option key={pet.id} value={pet.id}>
                                  {pet.name} ({formatExpediente(pet.id)}) · {owner.name}
                                </option>
                              ))}
                          </select>
                          {salePetId && (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-indigo-800 whitespace-nowrap">Próxima dosis:</span>
                              <select
                                value={saleIntervalo}
                                onChange={(e) => setSaleIntervalo(e.target.value)}
                                className="flex-1 p-2.5 bg-white rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {INTERVALOS.filter(([k]) => k !== "custom").map(([k, l]) => (
                                  <option key={k} value={k}>{l}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                    <div className="flex gap-4">
                      {/* Ocultamos la cantidad normal si están vendiendo a granel para no confundir */}
                      {!isFractionalSale && (
                        <div className="w-1/2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                            Cant. ({selectedProductGroup?.unit || ""})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={newSale.quantity}
                            onChange={(e) =>
                              setNewSale({
                                ...newSale,
                                quantity: e.target.value,
                              })
                            }
                            required
                            placeholder="Ej. 1"
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl outline-none focus:ring-2 focus:ring-teal-600 transition-all text-center"
                          />
                        </div>
                      )}

                      <div className={isFractionalSale ? "w-full" : "w-1/2"}>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                          Método de Pago
                        </label>
                        <select
                          value={newSale.payment_method}
                          onChange={(e) =>
                            setNewSale({
                              ...newSale,
                              payment_method: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 transition-all"
                        >
                          <option>Efectivo</option>
                          <option>Tarjeta</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 transition-all">
                      <input
                        type="checkbox"
                        id="checkExtra"
                        checked={isExtraCharge}
                        onChange={(e) => setIsExtraCharge(e.target.checked)}
                        className="w-5 h-5 rounded text-amber-600 accent-amber-500 cursor-pointer"
                      />
                      <label
                        htmlFor="checkExtra"
                        className="font-black text-amber-800 cursor-pointer text-sm"
                      >
                        ¿Agregar un cargo extra a este artículo?
                      </label>
                    </div>

                    {isExtraCharge && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col sm:flex-row gap-4 p-5 border-2 border-amber-200 rounded-2xl bg-white shadow-sm">
                        <div className="w-full sm:w-2/3">
                          <label className="text-xs font-black text-amber-600 uppercase tracking-widest ml-1 mb-2 block">
                            Motivo del extra
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Servicio a domicilio..."
                            value={extraDetails.description}
                            onChange={(e) =>
                              setExtraDetails({
                                ...extraDetails,
                                description: e.target.value,
                              })
                            }
                            required
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                          />
                        </div>
                        <div className="w-full sm:w-1/3">
                          <label className="text-xs font-black text-amber-600 uppercase tracking-widest ml-1 mb-2 block">
                            Costo extra $
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={extraDetails.amount}
                            onChange={(e) =>
                              setExtraDetails({
                                ...extraDetails,
                                amount: e.target.value,
                              })
                            }
                            required
                            className="w-full p-3 bg-amber-50/50 border border-amber-100 rounded-xl font-black outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center text-amber-900"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-teal-50 rounded-2xl flex justify-between items-center">
                      <span className="font-bold text-teal-800">
                        Subtotal Cargo:
                      </span>
                      <span className="text-3xl font-black text-teal-900">
                        $
                        {(
                          parseFloat(currentItemTotal || 0) +
                          (isExtraCharge
                            ? parseFloat(extraDetails.amount || 0)
                            : 0)
                        ).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !newSale.product_key ||
                        (isFractionalSale
                          ? !fractionAmount || !fractionCapacity // Si es a granel, exige el peso y la capacidad
                          : !newSale.quantity) || // Si es normal, exige la cantidad entera
                        (isExtraCharge &&
                          (!extraDetails.description || !extraDetails.amount))
                      }
                      className="w-full bg-teal-600 text-white font-black py-4 rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 active:scale-[0.98] disabled:opacity-50"
                    >
                      Agregar al Ticket
                    </button>
                  </form>
                </section>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {currentUser === "Maru Peña" && (
                    <div className="flex-1 bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <Wallet size={80} />
                      </div>
                      <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">
                        Caja de Hoy
                      </h3>
                      <p className="text-3xl font-black">
                        ${todayTotalRevenue.toFixed(2)}
                      </p>
                      <div className="mt-3 space-y-1">
                        {Object.entries(AREAS).map(([k, a]) => (
                          <div key={k} className="flex justify-between text-xs font-bold text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <a.Icon size={12} /> {a.label}
                            </span>
                            <span>${(ventasHoyPorArea[k] || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex-1 p-6 rounded-[2.5rem] flex flex-col justify-center transition-all duration-500 ${amountPaid && parseFloat(amountPaid) > cartGrandTotal ? "bg-emerald-500 border-emerald-600 shadow-2xl shadow-emerald-200 scale-[1.02]" : "bg-white border border-slate-100 shadow-sm"}`}
                  >
                    <h3
                      className={`font-bold uppercase tracking-widest text-xs mb-1 ${amountPaid && parseFloat(amountPaid) > cartGrandTotal ? "text-emerald-100" : "text-slate-400"}`}
                    >
                      Cambio a Devolver
                    </h3>
                    <p
                      className={`text-4xl md:text-5xl font-black tracking-tight transition-colors ${amountPaid && parseFloat(amountPaid) > cartGrandTotal ? "text-white" : "text-slate-200"}`}
                    >
                      $
                      {amountPaid && parseFloat(amountPaid) > cartGrandTotal
                        ? (parseFloat(amountPaid) - cartGrandTotal).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                      <ReceiptText className="text-emerald-500" /> Ticket Actual
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-200 px-4 py-1.5 rounded-xl text-xs font-black uppercase text-slate-600">
                        {cart.length} Artículos
                      </span>
                      {cart.length > 0 && (
                        <button
                          onClick={() => setCart([])}
                          className="text-rose-500 font-bold text-sm hover:underline"
                        >
                          Vaciar
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="space-y-4 mb-8 min-h-[150px]">
                      {cart.map((item) => (
                        <div
                          key={item.cart_id}
                          className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-in slide-in-from-right-2"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-emerald-600">
                              <CheckCircle2 size={20} />
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-lg">
                                {item.name}
                              </p>
                              {item.petName && (
                                <p className="text-xs font-bold text-indigo-600">
                                  💉 Para la cartilla de {item.petName}
                                  {item.next_due_date ? ` · próxima ${fmtFecha(item.next_due_date)}` : ""}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                {item.quantity} {item.unit} •{" "}
                                {item.payment_method}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-2xl font-black text-slate-800">
                              ${item.total.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.cart_id)}
                              className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {cart.length === 0 && (
                        <div className="text-center py-10">
                          <ShoppingCart
                            size={60}
                            className="mx-auto text-slate-200 mb-4"
                          />
                          <p className="text-slate-400 font-bold">
                            No hay artículos cargados
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="bg-emerald-500 p-6 md:p-8 rounded-[2rem] text-white flex flex-col xl:flex-row justify-between items-center gap-6 shadow-xl shadow-emerald-100">
                      <div className="text-center xl:text-left">
                        <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-1">
                          Total a Cobrar
                        </p>
                        <p className="text-5xl md:text-6xl font-black tracking-tight">
                          ${cartGrandTotal.toFixed(2)}
                        </p>
                      </div>
                      {cart.some(
                        (item) => item.payment_method === "Efectivo",
                      ) &&
                        cartGrandTotal > 0 && (
                          <div className="bg-emerald-600 p-4 rounded-2xl flex flex-col gap-2 w-full xl:w-auto">
                            <label className="text-xs font-black uppercase tracking-widest text-emerald-200">
                              Efectivo Recibido
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black">$</span>
                              <input
                                type="number"
                                min={cartGrandTotal}
                                step="0.01"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="0.00"
                                className="w-full xl:w-32 p-3 bg-white text-emerald-900 font-black text-xl rounded-xl outline-none text-center shadow-inner"
                              />
                            </div>
                            {amountPaid &&
                              parseFloat(amountPaid) >= cartGrandTotal && (
                                <div className="mt-2 pt-2 border-t border-emerald-500 flex justify-between items-center">
                                  <span className="font-bold text-emerald-100">
                                    Dar Cambio:
                                  </span>
                                  <span className="text-2xl font-black text-white">
                                    $
                                    {(
                                      parseFloat(amountPaid) - cartGrandTotal
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              )}
                          </div>
                        )}
                      <button
                        onClick={handleCheckoutCart}
                        disabled={
                          isCheckingOut ||
                          cart.length === 0 ||
                          (cart.some((i) => i.payment_method === "Efectivo") &&
                            (!amountPaid ||
                              parseFloat(amountPaid) < cartGrandTotal))
                        }
                        className="w-full xl:w-auto bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] text-xl font-black hover:bg-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-2xl"
                      >
                        {isCheckingOut ? "Registrando..." : "Confirmar Venta"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- VENTAS DE HOY (para revisar y, si hubo un error, cancelar) --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
                      <Clock className="text-teal-600" size={22} /> Ventas de hoy
                    </h3>
                    <span className="text-sm font-bold text-slate-500">
                      {todayTickets.filter((t) => !t.cancelled).length} cobro(s)
                    </span>
                  </div>
                  <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto">
                    {todayTickets.length === 0 && (
                      <p className="text-center text-slate-400 font-bold py-6">
                        Aún no hay ventas hoy.
                      </p>
                    )}
                    {todayTickets.map((t) => (
                      <div
                        key={t.key}
                        className={`flex justify-between items-center gap-4 p-4 rounded-2xl border ${t.cancelled ? "bg-slate-50 border-slate-200 opacity-70" : "bg-white border-slate-100"}`}
                      >
                        <div className="min-w-0">
                          <p className={`font-bold text-slate-700 text-sm ${t.cancelled ? "line-through" : ""}`}>
                            {t.items.join(", ")}
                          </p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {new Date(t.date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}{" "}
                            · {t.methods}
                            {t.cancelled && (
                              <span className="text-rose-600 font-black">
                                {" "}· Cancelada{t.rows[0].cancel_reason ? `: ${t.rows[0].cancel_reason}` : ""}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-lg font-black ${t.cancelled ? "text-slate-400 line-through" : "text-slate-800"}`}>
                            ${t.total.toFixed(2)}
                          </span>
                          {isAdmin && !t.cancelled && (
                            <button
                              onClick={() => handleCancelTicket(t)}
                              className="px-3 py-2 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                              title="Cancelar esta venta y regresar el stock"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE EXPEDIENTE CLINICO */}
      {selectedOwner &&
        activeTab === "home" &&
        !prescriptionModal.isOpen &&
        !prescriptionHistoryModal.isOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            onClick={() => setSelectedOwner(null)}
          >
            <div
              className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md p-8 border-b border-slate-50 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">
                    {selectedOwner.name}
                  </h2>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
                    Expediente Clínico
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={printExpediente}
                    className="flex items-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl transition-all shadow-md text-sm"
                  >
                    <Printer size={18} /> Imprimir Historial
                  </button>
                  <button
                    onClick={() => setSelectedOwner(null)}
                    className="p-3 bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-xs font-black text-slate-400 uppercase mb-1">
                      Direccion
                    </p>
                    <p className="font-bold text-slate-700">
                      {selectedOwner.address}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-xs font-black text-slate-400 uppercase mb-1">
                      Teléfono
                    </p>
                    <p className="font-bold text-slate-700">
                      {selectedOwner.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <PawPrint className="text-teal-600" /> Pacientes Registrados
                </h3>
                <div className="space-y-4">
                  {selectedOwner.pets.map((p) => (
                    <div
                      key={p.id}
                      className="p-6 border-2 border-slate-50 rounded-[2rem] hover:border-teal-100 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                          <SpeciesAvatar species={p.species} />
                          {p.name}
                          <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-xl text-xs font-black tracking-widest border border-teal-200">
                            EXP: {formatExpediente(p.id)}
                          </span>
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPet(p);
                              setSelectedOwner(null);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            title="Editar Paciente"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              handleDeletePet(p.id);
                              setSelectedOwner(null);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar Paciente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase mb-6">
                        <span>{p.species}</span>•
                        <span>{p.breed || "Cruza"}</span>•
                        <span>{p.sex || "Sexo N/E"}</span>•
                        <span>{p.color || "Color N/E"}</span>•
                        <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md text-xs">
                          🗓️ REGISTRO: {p.registration_date || "N/D"}
                        </span>
                      </div>

                      <div className="flex gap-2 border-b border-slate-100 pb-6 mb-6">
                        <button
                          onClick={() => printSurgeryAuth(p, selectedOwner)}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all font-bold text-sm flex items-center gap-1"
                          title="Generar Autorización Quirúrgica"
                        >
                          <Clipboard size={16} /> Auth. Cirugía
                        </button>
                        <button
                          onClick={() =>
                            setPrescriptionModal({
                              isOpen: true,
                              pet: p,
                              appt: null,
                              text: "",
                            })
                          }
                          className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl transition-all font-bold text-sm flex items-center gap-1"
                          title="Emitir receta sin crear cita formal"
                        >
                          <FileText size={16} /> + Receta Rápida
                        </button>
                        <button
                          onClick={() => {
                            setRecetaSearch(formatExpediente(p.id));
                            setSelectedOwner(null);
                            setActiveTab("recetas");
                          }}
                          className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl transition-all font-bold text-sm flex items-center gap-1"
                          title="Ver las recetas de este paciente en la pestaña Recetas"
                        >
                          <Archive size={16} /> 📜 Sus recetas
                        </button>
                      </div>

                      {/* 💉 CARTILLA: vacunas y desparasitación */}
                      {(() => {
                        const registros = p.preventivos || [];
                        const vistos = new Set();
                        const vigentes = new Set(
                          registros
                            .filter((r) => {
                              const k = r.nombre.trim().toLowerCase();
                              if (vistos.has(k)) return false;
                              vistos.add(k);
                              return true;
                            })
                            .map((r) => r.id),
                        );
                        return (
                          <div className="mb-6 bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
                              <h5 className="font-black text-indigo-800 flex items-center gap-2 text-sm">
                                <Syringe size={16} /> Vacunas y desparasitación
                              </h5>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => abrirPreventivo(p)}
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-indigo-700"
                                >
                                  <PlusCircle size={14} /> Registrar
                                </button>
                                {registros.length > 0 && (
                                  <button
                                    onClick={() => printCartilla(p, selectedOwner)}
                                    className="px-3 py-1.5 bg-white text-indigo-700 rounded-xl text-xs font-black flex items-center gap-1 border border-indigo-200 hover:bg-indigo-50"
                                  >
                                    <Printer size={14} /> Cartilla
                                  </button>
                                )}
                              </div>
                            </div>
                            {registros.length === 0 ? (
                              <p className="text-xs text-slate-500 font-semibold italic">
                                Sin registros. Anota aquí cada vacuna o desparasitación con su próxima dosis y el sistema avisará cuando toque.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {registros.map((r) => {
                                  const vigente = vigentes.has(r.id);
                                  const est = estadoDosis(r.next_due_date);
                                  const { Icon } = TIPOS_PREVENTIVO[r.tipo] || TIPOS_PREVENTIVO.otro;
                                  return (
                                    <div
                                      key={r.id}
                                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border ${vigente ? "border-indigo-100" : "border-slate-100 opacity-60"}`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Icon size={16} className="text-indigo-500 shrink-0" />
                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-800 text-sm truncate">{r.nombre}</p>
                                          <p className="text-[11px] font-semibold text-slate-500">
                                            Aplicada {fmtFecha(r.applied_date)}
                                            {r.next_due_date ? ` · Próxima ${fmtFecha(r.next_due_date)}` : ""}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${vigente ? est.cls : "bg-slate-100 text-slate-400"}`}>
                                          {vigente ? est.label : "Historial"}
                                        </span>
                                        <button onClick={() => abrirPreventivo(p, r)} className="p-1.5 text-slate-400 hover:text-amber-600" title="Editar">
                                          <Edit size={14} />
                                        </button>
                                        <button onClick={() => borrarPreventivo(r)} className="p-1.5 text-slate-400 hover:text-rose-600" title="Borrar">
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {p.appointments && p.appointments.length > 0 ? (
                        <div className="space-y-6 mt-6">
                          {p.appointments.filter(
                            (a) => a.status === "Pendiente",
                          ).length > 0 && (
                            <div>
                              <h5 className="text-amber-500 font-black flex items-center gap-2 mb-3 text-xs uppercase tracking-widest">
                                <Calendar size={14} /> Próximas Citas
                              </h5>
                              {p.appointments
                                .filter((a) => a.status === "Pendiente")
                                .map((appt) => (
                                  <div
                                    key={appt.id}
                                    className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex justify-between items-start mb-3"
                                  >
                                    <div>
                                      <p className="font-black text-amber-900">
                                        {appt.date}{" "}
                                        <span className="font-bold text-amber-600 mx-1">
                                          a las
                                        </span>{" "}
                                        {appt.time}
                                      </p>
                                      <p className="text-amber-800 text-sm mt-1">
                                        {appt.reason}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          setPrescriptionModal({
                                            isOpen: true,
                                            pet: p,
                                            appt: appt,
                                            text: appt.prescription_text || "",
                                          })
                                        }
                                        className={`p-2 bg-white ${appt.prescription_text ? "text-teal-500 border-teal-200" : "text-teal-500 border-transparent"} border rounded-xl shadow-sm transition-all hover:bg-teal-50`}
                                        title={
                                          appt.prescription_text
                                            ? "Ver Receta Guardada"
                                            : "Emitir Receta para esta cita"
                                        }
                                      >
                                        <FileText size={16} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setNewAppt({ ...appt, pet_id: p.id });
                                          setSelectedOwner(null);
                                          window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                          });
                                        }}
                                        className="p-2 bg-white text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl shadow-sm transition-all"
                                        title="Editar cita"
                                      >
                                        <Edit size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                          {p.appointments.filter(
                            (a) => a.status !== "Pendiente",
                          ).length > 0 && (
                            <div>
                              <h5 className="text-slate-400 font-black flex items-center gap-2 mb-3 text-xs uppercase tracking-widest">
                                <Info size={14} /> Historial Médico
                              </h5>
                              {p.appointments
                                .filter((a) => a.status !== "Pendiente")
                                .map((appt) => (
                                  <div
                                    key={appt.id}
                                    className={`p-4 rounded-2xl border flex justify-between items-center mb-3 ${appt.status === "Realizada" ? "bg-teal-50 border-teal-100" : "bg-rose-50 border-rose-100"}`}
                                  >
                                    <div>
                                      <p className="text-slate-700 font-bold text-sm">
                                        {appt.date}{" "}
                                        <span className="text-slate-400 mx-1">
                                          -
                                        </span>{" "}
                                        {appt.reason}
                                      </p>
                                      <span
                                        className={`inline-block mt-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${appt.status === "Realizada" ? "bg-teal-200 text-teal-800" : "bg-rose-200 text-rose-800"}`}
                                      >
                                        {appt.status}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          setPrescriptionModal({
                                            isOpen: true,
                                            pet: p,
                                            appt: appt,
                                            text: appt.prescription_text || "",
                                          })
                                        }
                                        className={`p-2 bg-white ${appt.prescription_text ? "text-teal-500 border-teal-200" : "text-teal-500 border-transparent"} border rounded-xl shadow-sm transition-all hover:bg-teal-50`}
                                        title={
                                          appt.prescription_text
                                            ? "Ver Receta Guardada"
                                            : "Emitir Receta para esta cita"
                                        }
                                      >
                                        <FileText size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteAppt(appt.id)
                                        }
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                                        title="Borrar registro"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 mt-4">
                          <p className="text-teal-700 font-bold text-sm italic">
                            Sin historial médico ni citas registradas...
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* --- MODAL HISTORIAL DE RECETAS --- */}
      {prescriptionHistoryModal.isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[70] p-4"
          onClick={() =>
            setPrescriptionHistoryModal({ isOpen: false, pet: null })
          }
        >
          <div
            className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-teal-600 p-8 text-white flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Archive size={28} /> Historial de Recetas
                </h2>
                <p className="text-teal-100 font-bold text-sm mt-1">
                  Paciente: {prescriptionHistoryModal.pet?.name}
                </p>
              </div>
              <button
                onClick={() =>
                  setPrescriptionHistoryModal({ isOpen: false, pet: null })
                }
                className="p-2 bg-white/20 hover:bg-rose-500 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6 bg-slate-50">
              {prescriptionHistoryModal.pet?.appointments?.filter(
                (a) => a.prescription_text,
              ).length > 0 ? (
                prescriptionHistoryModal.pet.appointments
                  .filter((a) => a.prescription_text)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                        <div>
                          <p className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />{" "}
                            {appt.date}
                          </p>
                          <p className="text-sm font-bold text-slate-500 mt-1">
                            Motivo: {appt.reason}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setPrescriptionHistoryModal({
                              isOpen: false,
                              pet: null,
                            });
                            setPrescriptionModal({
                              isOpen: true,
                              pet: prescriptionHistoryModal.pet,
                              appt: appt,
                              text: appt.prescription_text,
                            });
                          }}
                          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 shadow-md flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <Printer size={16} /> Re-imprimir
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap text-slate-700 font-medium text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                        {appt.prescription_text}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10">
                  <FileText size={60} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">
                    Este paciente aún no tiene recetas guardadas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA REDACTAR LA RECETA */}
      {prescriptionModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[80] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col h-[80vh]">
            <div className="bg-teal-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Redactar Receta Médica</h2>
                <p className="text-teal-200 font-bold text-sm">
                  Paciente: {prescriptionModal.pet?.name}
                </p>
              </div>
              <button
                onClick={() =>
                  setPrescriptionModal({
                    isOpen: false,
                    pet: null,
                    appt: null,
                    text: "",
                  })
                }
                className="p-2 bg-white/20 hover:bg-rose-500 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                Indicaciones / Medicamentos
              </label>
              <textarea
                value={prescriptionModal.text}
                onChange={(e) =>
                  setPrescriptionModal({
                    ...prescriptionModal,
                    text: e.target.value,
                  })
                }
                className="w-full flex-grow p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-teal-500 text-lg text-slate-700 resize-none font-medium leading-relaxed"
                placeholder="Ej. Tomar 1 pastilla cada 8 horas..."
              ></textarea>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={printPrescription}
                disabled={!prescriptionModal.text}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-teal-600 shadow-xl disabled:opacity-50 text-lg"
              >
                Guardar e Imprimir Receta (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL AGENDA DEL DÍA --- */}
      {showTodayAppts && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
          onClick={() => setShowTodayAppts(false)}
        >
          <div
            className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-teal-600 p-8 text-white flex justify-between items-center z-10 shadow-md">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Calendar size={28} /> Agenda del Día
                </h2>
                <p className="text-teal-200 font-bold text-sm mt-1">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowTodayAppts(false)}
                className="p-2 bg-white/20 hover:bg-rose-500 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              {todayAppointmentsList.length > 0 ? (
                todayAppointmentsList.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 border-l-4 border-amber-400 bg-amber-50 rounded-2xl flex justify-between items-center shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-black tracking-widest">
                          {appt.time}
                        </span>
                        <span className="font-bold text-slate-700 text-sm">
                          {appt.reason}
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-800">
                        {appt.petName}{" "}
                        <span className="text-sm font-medium text-slate-500 line-clamp-1">
                          Dueño: {appt.ownerName}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowTodayAppts(false);
                        setSelectedOwner(appt.owner);
                      }}
                      className="p-3 bg-white text-teal-600 hover:bg-teal-600 hover:text-white rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs font-bold"
                    >
                      <ExternalLink size={16} /> Ver Expediente
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                    <Calendar size={40} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-bold text-lg">
                    No hay citas pendientes para hoy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CENTRO DE AVISOS (campanita) --- */}
      {showAvisos && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
          onClick={() => setShowAvisos(false)}
        >
          <div
            className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-amber-500 p-7 text-white flex justify-between items-center z-10 shadow-md">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Bell size={26} /> Centro de avisos
                </h2>
                <p className="text-amber-50 font-bold text-sm mt-1">
                  WhatsApp para los dueños y notificaciones en este teléfono.
                </p>
              </div>
              <button
                onClick={() => setShowAvisos(false)}
                className="p-2 bg-white/20 hover:bg-rose-500 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-7 space-y-7">
              {/* --- Notificaciones en este dispositivo --- */}
              <section className="bg-teal-50/60 border border-teal-100 rounded-[2rem] p-5">
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-2">
                  <Phone size={18} className="text-teal-600" /> Notificaciones en este dispositivo
                </h3>
                {pushEstado === "revisando" && <p className="text-sm text-slate-500 font-semibold">Revisando…</p>}
                {pushEstado === "activado" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-bold text-teal-700 flex-1 min-w-[200px]">
                      ✅ Activadas. Aquí te llegarán las citas nuevas, los registros de la Sala de Espera y el resumen de cada mañana.
                    </p>
                    <button onClick={probarPush} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700">
                      Enviar prueba
                    </button>
                    <button onClick={desactivarPush} className="px-4 py-2 bg-white text-slate-600 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-50">
                      Desactivar
                    </button>
                  </div>
                )}
                {pushEstado === "apagado" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-600 flex-1 min-w-[200px]">
                      Recibe en este teléfono un aviso de cada cita nueva y el resumen de la mañana, aunque la app esté cerrada.
                    </p>
                    <button onClick={activarPush} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 shadow-md">
                      🔔 Activar notificaciones
                    </button>
                  </div>
                )}
                {pushEstado === "instalar-ios" && (
                  <div className="text-sm font-semibold text-slate-600 space-y-1">
                    <p className="font-bold text-slate-700">En iPhone/iPad primero hay que instalar la app:</p>
                    <p>1. Abre esta página en <b>Safari</b>.</p>
                    <p>2. Toca el botón <b>Compartir</b> (cuadrito con flecha ⬆️) → <b>Agregar a inicio</b>.</p>
                    <p>3. Abre <b>Dogs & Cats</b> desde el ícono nuevo, inicia sesión y vuelve a esta campanita.</p>
                  </div>
                )}
                {pushEstado === "bloqueado" && (
                  <p className="text-sm font-semibold text-rose-600">
                    Las notificaciones están bloqueadas para esta página. Actívalas en los ajustes del teléfono
                    (iPhone: Ajustes → Notificaciones → Dogs & Cats; Android: mantén presionado el ícono → Información → Notificaciones).
                  </p>
                )}
                {pushEstado === "no-soportado" && (
                  <p className="text-sm font-semibold text-slate-500">
                    Este navegador no permite notificaciones. Usa Chrome (Android/PC) o la app instalada en iPhone.
                  </p>
                )}
                {pushEstado === "no-configurado" && (
                  <p className="text-sm font-semibold text-slate-500">
                    Las notificaciones aún no están configuradas en el servidor.
                  </p>
                )}
              </section>

              {/* --- WhatsApp por mandar --- */}
              <section>
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3">
                  <Clipboard size={18} className="text-amber-500" /> Por avisar a los dueños
                  <span className="text-xs font-bold text-slate-400">({avisos.length})</span>
                </h3>
                {avisos.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-[2rem]">
                    <p className="text-3xl mb-2">🎉</p>
                    <p className="text-slate-500 font-bold">Todo al día: no hay avisos pendientes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {avisos.map((a) => (
                      <div
                        key={`${a.tipo}-${a.appt_id ?? a.record_id}`}
                        className={`p-4 rounded-2xl border-l-4 shadow-sm ${a.tipo === "confirmacion" ? "bg-emerald-50 border-emerald-400" : a.tipo === "preventivo" ? "bg-indigo-50 border-indigo-400" : "bg-amber-50 border-amber-400"}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className={`inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full mb-1 ${a.tipo === "confirmacion" ? "bg-emerald-200 text-emerald-800" : a.tipo === "preventivo" ? "bg-indigo-200 text-indigo-800" : "bg-amber-200 text-amber-800"}`}>
                              {a.tipo === "confirmacion" ? "Confirmar cita nueva" : a.tipo === "preventivo" ? "💉 Vacuna / desparasitación" : "Recordatorio"}
                            </span>
                            <p className="font-black text-slate-800">
                              {a.mascota} <span className="font-semibold text-slate-500 text-sm">· {a["dueño"]}</span>
                            </p>
                            <p className="text-sm font-semibold text-slate-600 first-letter:uppercase">
                              {a.tipo === "preventivo" ? "Le toca el " : ""}
                              {new Date(`${a.fecha}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                              {a.hora ? ` a las ${a.hora}` : ""} · {a.motivo}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {a.telefono ? (
                              <button
                                onClick={() => enviarAvisoWhatsApp(a)}
                                className="px-4 py-2.5 bg-[#25D366] text-white hover:bg-[#128C7E] rounded-xl font-black text-sm flex items-center gap-2 shadow-sm"
                              >
                                <Phone size={16} /> WhatsApp
                              </button>
                            ) : (
                              <span className="px-3 py-2 text-xs font-bold text-slate-400 bg-white rounded-xl border">
                                Sin teléfono
                              </span>
                            )}
                            <button
                              onClick={() => marcarAvisoEnviado(a)}
                              className="px-3 py-2.5 bg-white text-slate-500 hover:text-slate-800 rounded-xl font-bold text-xs border border-slate-200"
                              title="Ya se le avisó por otro medio (en persona, llamada…)"
                            >
                              Ya se avisó
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ADMINISTRACIÓN DE USUARIOS (solo administradora) --- */}
      {showUsersModal && isAdmin && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[90] p-4"
          onClick={() => setShowUsersModal(false)}
        >
          <div
            className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-indigo-600 p-8 text-white flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Key size={26} /> Usuarios del Sistema
                </h2>
                <p className="text-indigo-100 font-bold text-sm mt-1">
                  Solo la administradora puede crear o eliminar usuarios.
                </p>
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                className="p-2 bg-white/20 hover:bg-rose-500 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-3">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <User className="text-slate-400" size={20} />
                      <span className="font-black text-slate-800">{u.username}</span>
                      {u.is_admin && (
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Administradora
                        </span>
                      )}
                    </div>
                    {!u.is_admin && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleCreateUser}
                className="space-y-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100"
              >
                <h3 className="text-lg font-black text-slate-800">Crear nuevo usuario</h3>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  required
                  minLength={3}
                  autoComplete="off"
                  className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="password"
                    placeholder="Contraseña (mín. 6)"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    required
                    autoComplete="new-password"
                    className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={newUserForm.confirm}
                    onChange={(e) => setNewUserForm({ ...newUserForm, confirm: e.target.value })}
                    required
                    autoComplete="new-password"
                    className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 ml-1">
                    🔒 Tu contraseña (para autorizar)
                  </label>
                  <input
                    type="password"
                    placeholder="Contraseña de la administradora"
                    value={newUserForm.admin_password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, admin_password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="w-full p-4 bg-white border-2 border-indigo-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
                >
                  Crear Usuario
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL AGREGAR / CORREGIR LOTE --- */}
      {lotModal.open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[90] p-4"
          onClick={() => setLotModal(emptyLotModal)}
        >
          <form
            onSubmit={handleSaveLot}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
          >
            <div className={`p-7 text-white ${lotModal.mode === "add" ? "bg-teal-600" : "bg-amber-500"}`}>
              <h2 className="text-2xl font-black flex items-center gap-2">
                {lotModal.mode === "add" ? <PlusCircle size={24} /> : <Edit size={24} />}
                {lotModal.mode === "add" ? "Agregar lote" : "Corregir lote"}
              </h2>
              <p className="font-bold text-sm mt-1 opacity-90">
                {lotModal.group?.name} · precio ${lotModal.group?.price}
              </p>
            </div>
            <div className="p-7 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  {lotModal.mode === "add" ? "Cantidad que llegó" : "Cantidad correcta"} ({lotModal.group?.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  autoFocus
                  required
                  value={lotModal.quantity}
                  onChange={(e) => setLotModal({ ...lotModal, quantity: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl outline-none focus:ring-2 focus:ring-teal-600 text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Caducidad (opcional)
                </label>
                <SmartDateInput
                  value={lotModal.expiration}
                  onChange={(val) => setLotModal({ ...lotModal, expiration: val })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-slate-700"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLotModal(emptyLotModal)}
                  className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`w-2/3 text-white font-black py-4 rounded-2xl shadow-lg ${lotModal.mode === "add" ? "bg-teal-600 hover:bg-teal-700" : "bg-amber-500 hover:bg-amber-600"}`}
                >
                  {lotModal.mode === "add" ? "Agregar al almacén" : "Guardar corrección"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL CARTILLA: registrar vacuna / desparasitación --- */}
      {preventivoModal.open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[85] p-4"
          onClick={() => setPreventivoModal(emptyPreventivo)}
        >
          <form
            onSubmit={guardarPreventivo}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
          >
            <div className="p-7 bg-indigo-600 text-white">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Syringe size={24} /> {preventivoModal.record ? "Editar registro" : "Registrar en la cartilla"}
              </h2>
              <p className="font-bold text-sm mt-1 text-indigo-100">
                Paciente: {preventivoModal.pet?.name} ({preventivoModal.pet && formatExpediente(preventivoModal.pet.id)})
              </p>
            </div>
            <div className="p-7 space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TIPOS_PREVENTIVO).map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPreventivoModal({ ...preventivoModal, tipo: k })}
                    className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center gap-1 border-2 transition-all ${preventivoModal.tipo === k ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                  >
                    <t.Icon size={20} /> {t.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                <input
                  list="sugerencias-preventivo"
                  required
                  value={preventivoModal.nombre}
                  onChange={(e) => setPreventivoModal({ ...preventivoModal, nombre: e.target.value })}
                  placeholder="Ej. Rabia, Séxtuple, Desparasitante interno…"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="sugerencias-preventivo">
                  {SUGERENCIAS_PREVENTIVO.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha de aplicación</label>
                <SmartDateInput
                  required
                  value={preventivoModal.aplicada}
                  onChange={(val) => setPreventivoModal({ ...preventivoModal, aplicada: val })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Próxima dosis</label>
                <select
                  value={preventivoModal.intervalo}
                  onChange={(e) => setPreventivoModal({ ...preventivoModal, intervalo: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                >
                  {INTERVALOS.map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
                {preventivoModal.intervalo === "custom" ? (
                  <div className="mt-3">
                    <SmartDateInput
                      value={preventivoModal.proxima}
                      onChange={(val) => setPreventivoModal({ ...preventivoModal, proxima: val })}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                    />
                  </div>
                ) : (
                  sumarIntervalo(preventivoModal.aplicada, preventivoModal.intervalo) && (
                    <p className="text-sm font-bold text-indigo-700 mt-2 ml-1">
                      Tocará el {fmtFecha(sumarIntervalo(preventivoModal.aplicada, preventivoModal.intervalo))}
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notas (opcional)</label>
                <input
                  value={preventivoModal.notas}
                  onChange={(e) => setPreventivoModal({ ...preventivoModal, notas: e.target.value })}
                  placeholder="Ej. lote 123, laboratorio, dosis…"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPreventivoModal(emptyPreventivo)} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="w-2/3 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg">
                  {preventivoModal.record ? "Guardar cambios" : "Anotar en la cartilla"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;