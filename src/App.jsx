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
} from "lucide-react";

function App() {
  // --- ESTADOS DE SEGURIDAD ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState({ username: "", password: "" });

  // --- ESTADOS GENERALES ---
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = "http://localhost:8000";

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

  // --- ESTADOS PARA VENTA POR DOSIS/FRACCIÓN ---
  const [isFractionalSale, setIsFractionalSale] = useState(false);
  const [fractionCapacity, setFractionCapacity] = useState("");

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
      fetchData();
      fetchProducts();
      fetchSales();
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
      fetch(`http://127.0.0.1:8000/appointments/booked-times/${newAppt.date}`)
        .then((res) => {
          if (!res.ok) throw new Error("Red falló");
          return res.json();
        })
        .then((data) => {
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
  const availableTimeSlots = allTimeSlots.filter((time) => {
    const isBooked = safeBookedTimes.some((booked) => booked.startsWith(time));
    return !isBooked || time === newAppt.time;
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("username", authData.username.toLowerCase());
      params.append("password", authData.password);

      const res = await axios.post(`${API_BASE}/login/`, params);
      const token = res.data.access_token;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const loggedUser = authData.username.toLowerCase();
      setCurrentUser(loggedUser);
      setIsAuthenticated(true);
      setAuthData({ username: "", password: "" });

      localStorage.setItem("vet_token", token);
      localStorage.setItem("vet_user", loggedUser);

      Toast.fire({ icon: "success", title: `¡Bienvenido, ${loggedUser}!` });

      fetchData();
      fetchProducts();
      fetchSales();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de acceso",
        text: "Usuario o contraseña incorrectos.",
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/register/`, {
        username: authData.username.toLowerCase(),
        password: authData.password,
      });
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Ahora puedes iniciar sesión.",
      });
      setAuthMode("login");
      setAuthData({ username: "", password: "" });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.detail || "No se pudo crear el usuario.",
      });
    }
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("vet_token");
    localStorage.removeItem("vet_user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab("home");
  };

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

    if (!inventoryGroupedMap.has(key)) {
      inventoryGroupedMap.set(key, {
        ...p,
        name: baseName,
        totalQuantity: p.category === "Servicio" ? 999999 : p.quantity,
        allDates:
          p.expiration_date && p.quantity > 0 ? [p.expiration_date] : [],
        subItems: [p],
      });
    } else {
      const group = inventoryGroupedMap.get(key);
      if (p.category !== "Servicio") group.totalQuantity += p.quantity;
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
  const groupedInventory = Array.from(inventoryGroupedMap.values()).sort(
    (a, b) => a.name.localeCompare(b.name),
  );

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    if (currentUser !== "admin") return;
    try {
      let qty =
        newProduct.category === "Servicio"
          ? 999999
          : parseFloat(newProduct.quantity);
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

      if (editingGroupItems) {
        for (let item of editingGroupItems) {
          await axios.put(`${API_BASE}/products/${item.id}`, {
            ...item,
            category: newProduct.category,
            price: parseFloat(newProduct.price),
            unit: unit,
            min_stock: minStock,
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
      min_stock: group.min_stock,
      expiration_date: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteGroup = async (group) => {
    if (currentUser !== "admin") return;
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
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const productGroup = groupedInventory.find(
      (p) => p.name.toLowerCase() === newSale.product_key,
    );
    if (!productGroup) return;
    const qty = parseFloat(newSale.quantity);

    const currentQtyInCart = cart
      .filter((item) => item.product_key === productGroup.name.toLowerCase())
      .reduce((sum, item) => sum + item.quantity, 0);
    if (
      productGroup.category !== "Servicio" &&
      currentQtyInCart + qty > productGroup.totalQuantity
    ) {
      Swal.fire(
        "Stock Insuficiente",
        `Solo hay ${productGroup.totalQuantity} disponibles.`,
        "warning",
      );
      return;
    }

    let finalPrice = productGroup.price;
    let desc = productGroup.name;
    if (isFractionalSale && fractionCapacity) {
      finalPrice = productGroup.price / parseFloat(fractionCapacity);
      desc = `${productGroup.name} (Dosis fraccionada)`;
    }

    const itemsToAdd = [];
    itemsToAdd.push({
      cart_id: Math.random().toString(36).substr(2, 9),
      product_key: productGroup.name.toLowerCase(),
      name: desc,
      category: productGroup.category,
      unit: productGroup.unit,
      price: finalPrice,
      quantity: qty,
      total: finalPrice * qty,
      payment_method: newSale.payment_method,
    });

    if (isExtraCharge) {
      const amt = parseFloat(extraDetails.amount);
      let extraProd = products.find((p) => p.name === "Cargo Extra Genérico");
      if (!extraProd) {
        try {
          const res = await axios.post(`${API_BASE}/products/`, {
            category: "Servicio",
            name: "Cargo Extra Genérico",
            quantity: 999999,
            unit: "servicio",
            price: 1,
            min_stock: 0,
            expiration_date: null,
          });
          extraProd = res.data;
          fetchProducts();
        } catch (err) {
          Swal.fire("Error", "Fallo conexión BD para el extra", "error");
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
        total: amt,
        payment_method: newSale.payment_method,
      });
    }

    setCart((prevCart) => [...prevCart, ...itemsToAdd]);
    setNewSale({ ...newSale, product_key: "", quantity: "" });
    setIsFractionalSale(false);
    setFractionCapacity("");
    setExtraDetails({ description: "", amount: "" });
    setIsExtraCharge(false);
    Toast.fire({
      icon: "success",
      title: isExtraCharge
        ? "Producto y Extra agregados"
        : "Agregado al ticket",
    });
  };

  const removeFromCart = (cart_id) => {
    setCart(cart.filter((item) => item.cart_id !== cart_id));
  };

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return;
    try {
      for (const item of cart) {
        let qtyNeeded = item.quantity;
        let lots = products.filter(
          (p) =>
            p.name.split("_@@_")[0].trim().toLowerCase() === item.product_key &&
            (p.category === "Servicio" || p.quantity > 0),
        );
        lots.sort((a, b) => {
          if (!a.expiration_date) return 1;
          if (!b.expiration_date) return -1;
          return new Date(a.expiration_date) - new Date(b.expiration_date);
        });

        for (let lot of lots) {
          if (qtyNeeded <= 0) break;
          let take =
            lot.category === "Servicio"
              ? qtyNeeded
              : Math.min(qtyNeeded, lot.quantity);
          qtyNeeded -= take;
          let priceToSend = (item.total / item.quantity) * take;

          await axios.post(`${API_BASE}/sales/`, {
            product_id: lot.id,
            quantity: take,
            payment_method: item.payment_method,
            total_price: priceToSend,
          });
        }
      }
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
      Swal.fire("Error", "Hubo un fallo de conexión", "error");
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
        await axios.delete(`${API_BASE}/pets${id}/delete`);
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
        await axios.post(`${API_BASE}/appointments/`, {
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
            cancelButtonText: "No, solo guardar",
          }).then((result) => {
            if (result.isConfirmed) {
              const mensaje = `Hola *${ownerOfPet.name}*, te confirmamos la cita de *${selectedPet.name}* para el día *${newAppt.date}* a las *${newAppt.time}*. Motivo: ${newAppt.reason}. ¡Te esperamos en Dogs & Cats! 🐾`;
              const telLimpio = ownerOfPet.phone.replace(/\D/g, "");
              const url = `https://wa.me/52${telLimpio}?text=${encodeURIComponent(mensaje)}`;
              window.open(url, "_blank");
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
      Swal.fire("Error", "No se pudo procesar la cita", "error");
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
          <title>Receta Médica - ${pet.name}</title>
          <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
              .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; border-bottom: 3px solid #0d9488; padding-bottom: 15px;}
              .logo { width: 140px; flex-shrink: 0; }
              .header-content { flex-grow: 1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center;}
              .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #0f172a; }
              .doctor-info { text-align: center; font-size: 14px; font-weight: bold; color: #475569;}
              .cedula-area { text-align: right; font-size: 12px; color: #475569; display: flex; flex-direction: column; align-items: flex-end; margin-top: 10px;}
              
              .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; font-size: 14px; background-color: #f0fdfa; padding: 20px; border-radius: 10px; border: 1px solid #ccfbf1; }
              .info-item { border-bottom: 1px dashed #99f6e4; padding-bottom: 5px; }
              .info-label { font-weight: bold; color: #0d9488; display: inline-block; width: 140px;}
              
              .prescription-body { min-height: 400px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 30px; white-space: pre-wrap; font-size: 16px; line-height: 1.6; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px; }
              .firma-area { text-align: right; margin-bottom: 40px; padding-right: 40px; }
              .firma-line { border-top: 1px solid #1e293b; width: 200px; display: inline-block; text-align: center; padding-top: 5px; font-weight: bold; font-size: 14px;}
              
              .footer { display: flex; justify-content: space-between; font-size: 11px; border-top: 3px solid #ccfbf1; padding-top: 15px; color: #0f172a; }
              .footer-box { display: flex; gap: 10px; align-items: flex-start;}
              .footer-icon { font-size: 18px; }
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
              <div class="info-item"><span class="info-label">Nombre de la Mascota:</span> ${pet.name}</div>
              <div class="info-item"><span class="info-label">Fecha:</span> ${new Date().toLocaleDateString()}</div>
              <div class="info-item"><span class="info-label">Raza:</span> ${pet.breed || "N/E"}</div>
              <div class="info-item"><span class="info-label">Sexo:</span> ${pet.sex || "N/E"}</div>
              <div class="info-item"><span class="info-label">Color:</span> ${pet.color || "N/E"}</div>
              <div class="info-item"><span class="info-label">Diagnóstico:</span> ${appt ? appt.reason : "Consulta General"}</div>
          </div>

          <div class="prescription-body">℞<br><br>${text}</div>

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
            <div class="pet-header">🐾 Paciente: ${p.name}</div>
            <div class="pet-info">
              <span><b>Especie:</b> ${p.species}</span>
              <span><b>Raza:</b> ${p.breed || "N/E"}</span>
              <span><b>Sexo:</b> ${p.sex || "N/E"}</span>
              <span><b>Color:</b> ${p.color || "N/E"}</span>
              <span><b>Nacimiento:</b> ${p.birth_date || "N/E"}</span>
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
            petsHtml += `<tr><td style="width: 15%;">${a.date}</td><td>${a.reason}</td><td style="width: 15%; font-weight: bold;">${a.status}</td></tr>`;
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
          <title>Expediente Clínico - ${selectedOwner.name}</title>
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
                  <div class="date-print">Fecha de Impresión: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</div>
              </div>
          </div>

          <div class="owner-info">
              <div><span class="info-label">Cliente / Propietario</span><span class="info-data">${selectedOwner.name}</span></div>
              <div><span class="info-label">Teléfono de Contacto</span><span class="info-data">${selectedOwner.phone || "No registrado"}</span></div>
              <div><span class="info-label">Dirección Completa</span><span class="info-data">${selectedOwner.address || "No registrado"}</span></div>
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

  const printSurgeryAuth = (pet, owner) => {
    const printWindow = window.open("", "_blank");
    const today = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Consentimiento Informado - ${pet.name}</title>
          <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #000; max-width: 800px; margin: 0 auto; line-height: 1.6; font-size: 14px; text-align: justify; }
              
              /* --- NUEVO ESTILO DEL ENCABEZADO TIPO MEMBRETE --- */
              .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 30px; }
              .logo { width: 180px; flex-shrink: 0; }
              .header-content { flex-grow: 1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center; padding-top: 15px;}
              .title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.5px; }
              .doctor-info { text-align: center; font-size: 15px; margin-bottom: 25px; }
              .date-row { text-align: right; font-size: 15px; margin-right: 20px;}

              .content-text { margin-bottom: 15px; }
              ul { margin-top: 10px; margin-bottom: 15px; padding-left: 40px; }
              li { margin-bottom: 8px; }
              .signatures { display: flex; justify-content: space-between; margin-top: 80px; text-align: center; }
              .sign-box { width: 40%; }
              .sign-line { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
              .footer-quote { text-align: center; margin-top: 50px; font-style: italic; font-weight: bold; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="header">
              <img src="/Dogs_&_Cats.jpeg" alt="Dogs and Cats Logo" class="logo" />
              <div class="header-content">
                  <div class="title">CONSENTIMIENTO INFORMADO</div>
                  <div class="doctor-info">M.V.Z. MARÍA EUGENIA PEÑA ACOSTA CED. PROFESIONAL. 6992889</div>
                  <div class="date-row">Fecha: &nbsp;&nbsp;<strong>${today}</strong></div>
              </div>
          </div>

          <div class="content-text">
              Yo, <strong>${owner.name}</strong>, propietario(a) de la mascota <strong>${pet.name}</strong> autorizo de manera libre y consciente la realización del procedimiento quirúrgico y la aplicación de anestésicos, medicamentos y materiales necesarios para la atención de mi mascota, en las instalaciones del Consultorio Veterinario Dogs & Cats.
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

  const todayDateString = new Date().toLocaleDateString();
  const todaySales = sales.filter(
    (s) => new Date(s.sale_date).toLocaleDateString() === todayDateString,
  );
  const todayTotalRevenue = todaySales.reduce(
    (sum, s) => sum + s.total_price,
    0,
  );

  const filteredOwners = owners
    .filter((owner) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        owner.name.toLowerCase().includes(searchLower) ||
        (owner.address && owner.address.toLowerCase().includes(searchLower)) ||
        (owner.phone && owner.phone.includes(searchLower))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const lowStockProducts = groupedInventory.filter(
    (p) => p.totalQuantity <= p.min_stock && p.category !== "Servicio",
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
    .map((p) => ({ ...p, cleanName: p.name.split("_@@_")[0].trim() }));

  let currentItemPrice = 0;
  const selectedProductGroup = groupedInventory.find(
    (p) => p.name.toLowerCase() === newSale.product_key,
  );
  if (selectedProductGroup) {
    currentItemPrice = selectedProductGroup.price;
    if (isFractionalSale && fractionCapacity) {
      currentItemPrice =
        selectedProductGroup.price / parseFloat(fractionCapacity);
    }
  }
  const currentItemTotal =
    selectedProductGroup && newSale.quantity
      ? (currentItemPrice * parseFloat(newSale.quantity)).toFixed(2)
      : "0.00";

  const cartGrandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // ==========================================
  // --- PANTALLA DE LOGIN (MODERNA) ---
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-sans text-slate-900 selection:bg-teal-100 relative flex justify-center items-center p-6 z-0">
        
        {/* FONDO ANIMADO BOKEH Y MASCOTAS (Consistente con el interior) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-300/40 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-300/30 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[15%] w-[30vw] h-[30vw] bg-amber-200/40 rounded-full blur-[90px] mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZTllOWU5Ii8+PC9zdmc+')] opacity-50"></div>
          
          <PawPrint className="absolute top-[15%] left-[15%] text-teal-600/10 -rotate-12 w-32 h-32" />
          <Cat className="absolute bottom-[20%] left-[10%] text-rose-600/10 rotate-12 w-48 h-48" />
          <Dog className="absolute bottom-[15%] right-[15%] text-teal-600/10 -rotate-12 w-40 h-40" />
        </div>

        {/* TARJETA DE LOGIN CRISTAL */}
        <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white/50 w-full max-w-md animate-in zoom-in-95 duration-700">
          
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-white flex items-center justify-center p-1 relative">
              <img src="/Dogs_&_Cats.jpeg" alt="Dogs & Cats Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 text-center mb-1 tracking-tight">
            {authMode === "login" ? "DOGS AND CATS" : "Nuevo Admin"}
          </h2>
          <p className="text-teal-600 text-center mb-8 font-bold uppercase tracking-widest text-xs">
            {authMode === "login" ? "Acceso al Sistema" : "Registro de Sistema"}
          </p>

          <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="flex flex-col gap-5">
            <div className="group relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Usuario"
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                required
                className="w-full pl-14 pr-5 py-4 bg-white/60 border border-white/50 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none text-slate-800 font-bold placeholder:text-slate-400 transition-all shadow-inner"
              />
            </div>
            <div className="group relative">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Contraseña"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                required
                className="w-full pl-14 pr-5 py-4 bg-white/60 border border-white/50 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none text-slate-800 font-bold placeholder:text-slate-400 transition-all shadow-inner"
              />
            </div>
            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-teal-500/30 text-lg flex justify-center items-center gap-2">
              {authMode === "login" ? <><Lock size={20}/> Entrar</> : <><User size={20}/> Registrar</>}
            </button>
          </form>

          <button
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthData({ username: "", password: "" });
            }}
            className="w-full mt-8 text-slate-500 hover:text-teal-600 transition-colors text-sm font-bold"
          >
            {authMode === "login" ? "¿No tienes cuenta? Crea una aquí" : "Volver a Iniciar Sesión"}
          </button>
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
        {/* --- FONDO ANIMADO BOKEH Y MASCOTAS --- */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
          {/* Luces difuminadas (Efecto Bokeh) */}
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-300/30 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-300/20 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[15%] w-[30vw] h-[30vw] bg-amber-200/30 rounded-full blur-[90px] mix-blend-multiply"></div>

          {/* Patrón de puntitos sutil para darle textura */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZTllOWU5Ii8+PC9zdmc+')] opacity-50"></div>

          {/* Animalitos y huellas flotando en el fondo */}
          <PawPrint className="absolute top-[15%] left-[5%] text-teal-600/5 -rotate-12 w-32 h-32" />
          <Cat className="absolute bottom-[20%] left-[10%] text-rose-600/5 rotate-12 w-48 h-48" />
          <Bone className="absolute top-[30%] right-[8%] text-amber-600/5 rotate-45 w-24 h-24" />
          <Dog className="absolute bottom-[10%] right-[25%] text-teal-600/5 -rotate-12 w-40 h-40" />
        </div>

        <div className="max-w-[1400px] mx-auto p-4 md:p-8"></div>
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
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                DOGS <span className="text-rose-500">AND</span> CATS
              </h1>
              <div className="flex items-center gap-2">
                <PawPrint size={16} className="text-teal-500 animate-bounce" />
                <p className="text-teal-700 text-sm font-bold uppercase tracking-widest">
                  Veterinaria • {currentUser}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex bg-white/50 p-1.5 rounded-2xl gap-1 overflow-x-auto border border-white/60">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "home" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <Dog size={18} /> Clínica
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "inventory" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <Bone size={18} /> Almacén
            </button>
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "pos" ? "bg-white text-teal-600 shadow-md border border-teal-100" : "text-slate-500 hover:text-teal-700 hover:bg-white/40"}`}
            >
              <ShoppingCart size={18} /> Caja
            </button>
          </nav>

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
        </header>

        {/* --- PANTALLA INICIO (CLÍNICA) --- */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* BRANDED DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Tarjeta Azul Marino Profundo */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute right-[-10px] bottom-[-20px] opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <User size={140} />
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
                    placeholder="Buscar por nombre o teléfono..."
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
                    <input
                      type="date"
                      value={
                        editingPet ? editingPet.birth_date : newPet.birth_date
                      }
                      onChange={(e) =>
                        editingPet
                          ? setEditingPet({
                              ...editingPet,
                              birth_date: e.target.value,
                            })
                          : setNewPet({ ...newPet, birth_date: e.target.value })
                      }
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-slate-500"
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
                      <input
                        type="date"
                        value={newAppt.date}
                        onChange={(e) =>
                          setNewAppt({ ...newAppt, date: e.target.value })
                        }
                        required
                        className="w-full p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-600"
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
                  window.open(`${API_BASE}/reports/inventory-status/`, "_blank")
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
                          • {p.name} (Quedan {p.totalQuantity} {p.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {expiringProducts.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-amber-800 font-black flex items-center gap-2 mb-3">
                      <Calendar size={20} /> Próximos a Caducar (30 días)
                    </h3>
                    <ul className="text-amber-600 text-sm font-bold space-y-1">
                      {expiringProducts.map((p) => (
                        <li key={p.id}>
                          • {p.cleanName} (Vence: {p.expiration_date})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {currentUser === "admin" && (
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
                    <b>todos los lotes</b> de este producto. Para registrar
                    stock nuevo con otra caducidad, dale a Cancelar y guarda un
                    "Nuevo Artículo" escribiendo el nombre exactamente igual.
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
                      <option value="Servicio">
                        Servicio (Baño, Corte...)
                      </option>
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
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-center"
                    />
                  </div>

                  {!editingGroupItems && newProduct.category !== "Servicio" && (
                    <>
                      <div className="w-24">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Cant.
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.quantity}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              quantity: e.target.value,
                            })
                          }
                          required
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-center"
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Caducidad
                        </label>
                        <input
                          type="date"
                          value={newProduct.expiration_date}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              expiration_date: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-teal-600 text-slate-500"
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
            )}

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
                      {currentUser === "admin" && (
                        <th className="p-6 text-center">Acciones</th>
                      )}
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
                          <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
                            {group.category}
                          </span>
                        </td>
                        <td className="p-6">
                          <span
                            className={`font-black text-lg ${group.totalQuantity <= group.min_stock && group.category !== "Servicio" ? "text-rose-500" : "text-teal-600"}`}
                          >
                            {group.category === "Servicio"
                              ? "∞"
                              : group.totalQuantity}{" "}
                            <span className="text-sm">
                              {group.category !== "Servicio" ? group.unit : ""}
                            </span>
                          </span>
                        </td>
                        <td className="p-6 text-slate-500 font-medium text-sm max-w-[200px]">
                          {group.allDates.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {group.allDates.map((d, i) => (
                                <span
                                  key={i}
                                  className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-6 font-black text-slate-800 text-lg">
                          ${group.price}
                        </td>
                        {currentUser === "admin" && (
                          <td className="p-6 text-center flex justify-center gap-2">
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
                        )}
                      </tr>
                    ))}
                    {groupedInventory.length === 0 && (
                      <tr>
                        <td
                          colSpan={currentUser === "admin" ? "6" : "5"}
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

        {/* --- PANTALLA POS (CAJA) --- */}
        {activeTab === "pos" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-4xl font-extrabold text-emerald-900 flex items-center gap-3">
                <ShoppingCart size={36} className="text-emerald-500" /> Punto de
                Venta
              </h2>
              <div className="flex gap-4">
                {currentUser === "admin" && (
                  <button
                    onClick={() =>
                      window.open(`${API_BASE}/reports/sales-weekly/`, "_blank")
                    }
                    className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
                  >
                    <FileSpreadsheet size={20} /> Reporte Semanal (Excel)
                  </button>
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
                        {groupedInventory.map((p) => (
                          <option
                            key={p.name.toLowerCase()}
                            value={p.name.toLowerCase()}
                          >
                            {p.name} - ${p.price} (Stock:{" "}
                            {p.category === "Servicio" ? "∞" : p.totalQuantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProductGroup &&
                      ["ml", "L", "g", "kg"].includes(
                        selectedProductGroup.unit,
                      ) && (
                        <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 flex flex-col gap-3">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-800 text-sm">
                            <input
                              type="checkbox"
                              checked={isFractionalSale}
                              onChange={(e) =>
                                setIsFractionalSale(e.target.checked)
                              }
                              className="w-5 h-5 rounded text-teal-600"
                            />
                            ¿Cobrar por dosis / fracción del envase?
                          </label>
                          {isFractionalSale && (
                            <div className="animate-in fade-in zoom-in-95 duration-200 mt-2">
                              <label className="text-xs font-black text-teal-500 uppercase tracking-widest mb-2 ml-1 block">
                                Capacidad total del frasco (
                                {selectedProductGroup.unit})
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={fractionCapacity}
                                onChange={(e) =>
                                  setFractionCapacity(e.target.value)
                                }
                                placeholder="Ej. 250"
                                required={isFractionalSale}
                                className="w-full p-4 bg-white border border-teal-200 rounded-2xl font-black outline-none focus:ring-2 focus:ring-teal-600 text-teal-900"
                              />
                            </div>
                          )}
                        </div>
                      )}

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                          {isFractionalSale
                            ? `Cant. a usar (${selectedProductGroup?.unit})`
                            : "Cant."}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={newSale.quantity}
                          onChange={(e) =>
                            setNewSale({ ...newSale, quantity: e.target.value })
                          }
                          required
                          placeholder="Ej. 1"
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl outline-none focus:ring-2 focus:ring-teal-600 transition-all text-center"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                          Pago
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
                        !newSale.quantity ||
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
                  {currentUser === "admin" && (
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
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-emerald-500 w-3/4"></div>
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
                          cart.length === 0 ||
                          (cart.some((i) => i.payment_method === "Efectivo") &&
                            (!amountPaid ||
                              parseFloat(amountPaid) < cartGrandTotal))
                        }
                        className="w-full xl:w-auto bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] text-xl font-black hover:bg-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-2xl"
                      >
                        Confirmar Venta
                      </button>
                    </div>
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
                        <h4 className="text-2xl font-black text-slate-800">
                          {p.name}
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
                        <span>{p.color || "Color N/E"}</span>
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
                          onClick={() =>
                            setPrescriptionHistoryModal({
                              isOpen: true,
                              pet: p,
                            })
                          }
                          className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl transition-all font-bold text-sm flex items-center gap-1"
                          title="Ver todas las recetas pasadas"
                        >
                          <Archive size={16} /> 📜 Historial
                        </button>
                      </div>

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
    </div>
  );
}

export default App;
