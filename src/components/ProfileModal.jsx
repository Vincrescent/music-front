import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, User, Shield, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import api from '../utils/axiosConfig';
import { useToast } from './shared/UIHelpers';

const TABS = [
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'security', label: 'Keamanan', icon: Shield },
];

/* ── Password Strength Meter ── */
function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const level = Math.min(score, 4);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= level ? colors[level] : 'bg-gray-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        level <= 1 ? 'text-red-500' : level === 2 ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {labels[level]}
      </p>
    </div>
  );
}

/* ── Avatar Component ── */
function AvatarDisplay({ user, avatarPreview, size = 'lg' }) {
  const sizeClasses = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
  const initials = (user?.name || user?.username || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = avatarPreview || (user?.avatar
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/storage/${user.avatar}`
    : null);

  return (
    <div className={`${sizeClasses} rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 ring-4 ring-white dark:ring-slate-800 shadow-lg`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-amber-500 text-white ${sizeClasses}`}>
          {initials}
        </div>
      )}
    </div>
  );
}

/* ── Main ProfileModal ── */
export default function ProfileModal({ isOpen, onClose, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // User data
  const [userData, setUserData] = useState(null);

  // Fetch profile on open
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('profile');
    setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
    setPasswordErrors({});
    setProfileErrors({});
    setAvatarPreview(null);
    fetchProfile();
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile');
      const data = res.data.data;
      setUserData(data);
      setProfileForm({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (err) {
      toast('Gagal memuat data profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileErrors({});
    try {
      const res = await api.put('/profile', profileForm);
      const updatedUser = res.data.data;
      setUserData(updatedUser);

      // Sync localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const merged = { ...stored, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      onProfileUpdate?.(merged);

      toast('Profil berhasil diperbarui!', 'success');
    } catch (err) {
      if (err.response?.status === 422) {
        setProfileErrors(err.response.data.errors || {});
      } else {
        toast('Gagal menyimpan profil', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPasswordErrors({});
    try {
      await api.put('/profile/password', passwordForm);
      setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
      toast('Password berhasil diubah!', 'success');
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || {};
        if (err.response.data.message && !Object.keys(errors).length) {
          setPasswordErrors({ old_password: [err.response.data.message] });
        } else {
          setPasswordErrors(errors);
        }
      } else {
        toast('Gagal mengubah password', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const avatarPath = res.data.data.avatar;
      setUserData(prev => ({ ...prev, avatar: avatarPath }));

      // Sync localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.avatar = avatarPath;
      localStorage.setItem('user', JSON.stringify(stored));
      onProfileUpdate?.(stored);

      toast('Avatar berhasil diperbarui!', 'success');
    } catch (err) {
      setAvatarPreview(null);
      toast('Gagal mengupload avatar. Maks 2MB (JPG/PNG/WebP)', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (!isOpen) return null;

  const roleLabels = {
    admin: 'Administrator',
    kasir: 'Kasir',
    teknisi: 'Teknisi',
    pemilik: 'Pemilik',
    customer: 'Customer',
    user: 'Customer',
  };

  const joinedDate = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-slate-800 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profil Saya</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Memuat profil...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Avatar & User Info */}
              <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-850 px-6 py-8">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <AvatarDisplay user={userData} avatarPreview={avatarPreview} size="lg" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute bottom-0 right-0 p-2 bg-accent hover:bg-accent-dark text-white rounded-full shadow-lg transition-all cursor-pointer disabled:opacity-50 ring-2 ring-white dark:ring-slate-800"
                      title="Ganti foto profil"
                    >
                      {avatarUploading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Camera size={14} />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {userData?.name || '—'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500 dark:text-slate-400">@{userData?.username}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent dark:bg-amber-500/20 dark:text-amber-400">
                      {roleLabels[userData?.role] || userData?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Bergabung sejak {joinedDate}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 pt-4">
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === key
                          ? 'bg-white dark:bg-slate-700 text-accent dark:text-amber-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-6 py-5">
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <InputField
                      label="Nama Lengkap"
                      value={profileForm.name}
                      onChange={(v) => setProfileForm(f => ({ ...f, name: v }))}
                      error={profileErrors.name}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                    <InputField
                      label="Username"
                      value={profileForm.username}
                      onChange={(v) => setProfileForm(f => ({ ...f, username: v }))}
                      error={profileErrors.username}
                      placeholder="Masukkan username"
                      required
                    />
                    <InputField
                      label="Email"
                      type="email"
                      value={profileForm.email}
                      onChange={(v) => setProfileForm(f => ({ ...f, email: v }))}
                      error={profileErrors.email}
                      placeholder="contoh@email.com"
                    />
                    <InputField
                      label="No. Telepon"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(v) => setProfileForm(f => ({ ...f, phone: v }))}
                      error={profileErrors.phone}
                      placeholder="08xxxxxxxxxx"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                    >
                      {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordSave} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3 mb-2">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 Password minimal 6 karakter. Gunakan kombinasi huruf besar, angka, dan simbol agar lebih kuat.
                      </p>
                    </div>
                    <PasswordField
                      label="Password Lama"
                      value={passwordForm.old_password}
                      onChange={(v) => setPasswordForm(f => ({ ...f, old_password: v }))}
                      error={passwordErrors.old_password}
                      show={showOldPass}
                      onToggle={() => setShowOldPass(!showOldPass)}
                      placeholder="Masukkan password lama"
                      required
                    />
                    <div>
                      <PasswordField
                        label="Password Baru"
                        value={passwordForm.new_password}
                        onChange={(v) => setPasswordForm(f => ({ ...f, new_password: v }))}
                        error={passwordErrors.new_password}
                        show={showNewPass}
                        onToggle={() => setShowNewPass(!showNewPass)}
                        placeholder="Masukkan password baru"
                        required
                      />
                      <PasswordStrength password={passwordForm.new_password} />
                    </div>
                    <PasswordField
                      label="Konfirmasi Password Baru"
                      value={passwordForm.new_password_confirmation}
                      onChange={(v) => setPasswordForm(f => ({ ...f, new_password_confirmation: v }))}
                      error={passwordErrors.new_password_confirmation}
                      show={showConfirmPass}
                      onToggle={() => setShowConfirmPass(!showConfirmPass)}
                      placeholder="Ulangi password baru"
                      required
                      match={passwordForm.new_password && passwordForm.new_password_confirmation && passwordForm.new_password === passwordForm.new_password_confirmation}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                    >
                      {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Shield size={18} />
                      )}
                      {saving ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/* ── Reusable Input Field ── */
function InputField({ label, type = 'text', value, onChange, error, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all ${
          error ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{Array.isArray(error) ? error[0] : error}</p>
      )}
    </div>
  );
}

/* ── Reusable Password Field ── */
function PasswordField({ label, value, onChange, error, show, onToggle, placeholder, required, match }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 pr-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all ${
            error ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {match && (
            <Check size={16} className="text-green-500" />
          )}
          <button
            type="button"
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{Array.isArray(error) ? error[0] : error}</p>
      )}
    </div>
  );
}
