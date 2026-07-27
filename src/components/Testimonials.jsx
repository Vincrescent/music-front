import { useState, useEffect, useRef, useCallback } from "react";
import api from '../utils/axiosConfig';

/* ── Scroll reveal hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Avatar with initials fallback ── */
const avatarColors = [
  "bg-accent", "bg-brand", "bg-amber", "bg-dark-brown",
  "bg-orange-500", "bg-emerald-600", "bg-violet-600", "bg-rose-500",
];

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/storage/')) {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
    return `${baseUrl}${url}`;
  }
  return url;
};

function AvatarImage({ src, name, className = "" }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorIdx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length;

  if (src && !failed) {
    return (
      <img
        src={getImageUrl(src)}
        alt={name}
        onError={() => setFailed(true)}
        className={`w-10 h-10 rounded-full object-cover bg-gray-200 ${className}`}
      />
    );
  }

  return (
    <div className={`w-10 h-10 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center ${className}`}>
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

/* ── Animated counter ── */
function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);
  return <span ref={ref}>{count}+</span>;
}

/* ── Toast ── */
function Toast({ message, show, onClose }) {
  useEffect(() => { if (show) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); } }, [show, onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="bg-dark-brown text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium">
        <span className="text-green-400">✓</span> {message}
      </div>
    </div>
  );
}

/* ── Stars display ── */
function Stars({ rating }) {
  if (rating === null || rating === undefined) return null;
  return (
    <div className="flex gap-0.5 text-accent text-lg mb-3" aria-label={`${rating} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i}>{i <= rating ? "★" : "☆"}</span>)}
    </div>
  );
}

/* ── Expandable Text ── */
function ExpandableText({ text, maxLen = 120, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = text.length > maxLen;
  return (
    <p className={`italic text-sm leading-relaxed ${className}`}>
      "{needsTruncate && !expanded ? text.slice(0, maxLen) + "..." : text}"
      {needsTruncate && (
        <button onClick={() => setExpanded(!expanded)} className="ml-1 text-accent font-semibold not-italic hover:underline cursor-pointer text-xs">
          {expanded ? "Sembunyikan" : "Baca selengkapnya..."}
        </button>
      )}
    </p>
  );
}

/* ── Uniform Testimonial Card ── */
function TestimonialCard({ item }) {
  const photoUrl = item.image || (item.avatar && item.avatar.startsWith('/storage/') ? item.avatar : null);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-default group">
      {/* Optional Top Image */}
      {photoUrl && (
        <div className="w-full h-48 overflow-hidden bg-gray-100 dark:bg-slate-900 shrink-0 relative">
          <img
            src={getImageUrl(photoUrl)}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Card Body */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <Stars rating={item.rating} />
          <ExpandableText text={item.text} className="text-gray-600 dark:text-gray-300" maxLen={110} />
        </div>

        {/* User Info Footer */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700/60 shrink-0">
          <AvatarImage src={item.avatar} name={item.name} className="group-hover:ring-2 group-hover:ring-accent/40 transition shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-brand dark:text-amber-400 font-semibold text-sm truncate">{item.name}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs tracking-wide truncate">{item.role || "Pengunjung Studio"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Review Form ── */
function ReviewForm({ onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ name: "", band: "", text: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.text.trim()) e.text = "Testimoni wajib diisi";
    if (rating === 0) e.rating = "Berikan penilaian";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('role', form.band);
      formData.append('rating', rating);
      formData.append('text', form.text);
      if (file) {
        formData.append('avatar', file);
      }

      const res = await api.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setToast(true);
        setForm({ name: "", band: "", text: "" });
        setRating(0);
        setFile(null);
        setPreview(null);
        setErrors({});
        setTimeout(() => setToast(false), 3000);

        if (onReviewAdded) {
          onReviewAdded(res.data.data);
        }
      }
    } catch (err) {
      console.error("Gagal mengirim ulasan", err);
      setErrors({ text: "Gagal mengirim ulasan. Coba lagi." });
    }
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="max-w-2xl mx-auto border border-gray-200 rounded-2xl p-8 bg-white mt-16 transition-all duration-300 hover:shadow-lg">
      <Toast message="Ulasan berhasil dikirim! 🎉" show={toast} onClose={() => setToast(false)} />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-dark-brown">Kirim Ulasan Anda</h3>
          <p className="text-warm-gray-light text-sm mt-1">Bagikan pengalaman studio Anda dengan komunitas.</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-brown mb-1.5">Nama Anda</label>
            <input type="text" placeholder="Masukkan nama lengkap Anda" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition ${errors.name ? "border-red-400" : "border-gray-300"}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-brown mb-1.5">Nama Band atau Proyek</label>
            <input type="text" placeholder="Masukkan nama band / proyek" value={form.band} onChange={(e) => setForm({ ...form, band: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">Penilaian</label>
          <div className="flex gap-1 text-2xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                className={`transition-all duration-150 hover:scale-125 ${i <= (hoverRating || rating) ? "text-accent" : "text-gray-300"}`}
              >★</span>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">Testimoni Anda</label>
          <textarea rows={4} placeholder="Ceritakan pengalaman Anda di studio..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
            className={`w-full h-32 border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition ${errors.text ? "border-red-400" : "border-gray-300"}`} />
          {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-brown mb-1.5">Unggah Foto (Opsional)</label>
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-amber-50/30 transition-all group relative overflow-hidden">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {preview ? (
              <div className="absolute inset-0 w-full h-full p-2">
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <p className="text-sm text-gray-500">Seret foto artis atau <span className="text-accent font-medium">klik untuk mencari</span></p>
              </>
            )}
          </label>
        </div>

        <div className="text-center pt-2">
          <button type="submit" className="bg-accent hover:bg-accent-dark text-white rounded-full px-8 py-3 font-semibold transition-all cursor-pointer hover:shadow-lg hover:shadow-accent/20 active:scale-95">
            Kirim Ulasan
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main Section ── */
export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/reviews')
      .then(res => {
        if (res.data.success) {
          setReviews(res.data.data);
        }
      })
      .catch(err => console.error("Gagal memuat ulasan", err));
  }, []);

  const [headerRef, headerVisible] = useReveal();

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        {/* ── Header ── */}
        <div ref={headerRef} className={`text-center mb-14 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl md:text-5xl font-extrabold text-dark-brown mb-4">Suara Kepuasan</h2>
          <p className="text-warm-gray max-w-2xl mx-auto leading-relaxed">
            Temukan mengapa produser top Jakarta dan talenta baru memilih ruang kami untuk presisi ritmis dan kejernihan kreatif mereka.
          </p>
          <div className="flex items-center justify-center mt-6">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-amber-200" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-200" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-200" />
            </div>
            <span className="ml-3 text-accent font-semibold text-sm">
              Bergabung dengan <AnimatedCounter target={500} /> Artis
            </span>
          </div>
        </div>

        {/* ── Uniform Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((item) => (
            <div key={item.id} className="h-full">
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>

        {/* ── Review Form ── */}
        <ReviewForm onReviewAdded={(newReview) => setReviews(prev => [...prev, newReview])} />
      </div>
    </section>
  );
}
