import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const FONTS = ['Inter', 'Poppins', 'Montserrat', 'Roboto', 'DM Sans'];
const DEFAULT_PRIMARY = '#000000';
const DEFAULT_SECONDARY = '#111111';
const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,63}$/;

const validateName = (value, label) => {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (trimmed.length > 64) return `${label} must be 64 characters or less.`;
  if (!NAME_PATTERN.test(trimmed)) return `${label} can only include letters, spaces, apostrophes, and hyphens.`;
  return '';
};

export default function AgentSettings() {
  const { user, refreshMe } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    sipExtension: '',
    password: '',
  });
  const [branding, setBranding] = useState({
    whiteLabelEnabled: false,
    whiteLabelLogoUrl: '',
    primaryBrandColor: DEFAULT_PRIMARY,
    secondaryBrandColor: DEFAULT_SECONDARY,
    brandFont: 'Inter',
    companyName: '',
    businessEmail: '',
  });

  useEffect(() => {
    if (!user) return;
    setAccount({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      phone: user.phone || '',
      sipExtension: user.sipExtension || '',
      password: '',
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/companies/my-branding');
        const payload = data?.branding || {};
        if (!cancelled) {
          setBranding({
            whiteLabelEnabled: Boolean(payload.whiteLabelEnabled),
            whiteLabelLogoUrl: payload.whiteLabelLogoUrl || '',
            primaryBrandColor: payload.primaryBrandColor || DEFAULT_PRIMARY,
            secondaryBrandColor: payload.secondaryBrandColor || DEFAULT_SECONDARY,
            brandFont: payload.brandFont || 'Inter',
            companyName: payload.companyName || payload.name || '',
            businessEmail: payload.businessEmail || '',
          });
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUploadLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const body = new FormData();
      body.append('file', file);
      const { data } = await api.post('/companies/upload-logo', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.url) {
        setBranding((prev) => ({ ...prev, whiteLabelLogoUrl: data.url }));
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {
      firstName: validateName(account.firstName, 'First name'),
      lastName: validateName(account.lastName, 'Last name'),
    };
    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setSaving(true);
    try {
      const accountPayload = {
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
        username: account.username,
        phone: account.phone,
        sipExtension: account.sipExtension,
      };
      const nextPassword = account.password.trim();
      if (nextPassword) accountPayload.newPassword = nextPassword;
      await api.patch('/auth/me', accountPayload);

      const updateData = {
        companyName: branding.companyName,
        businessEmail: branding.businessEmail || null,
      };
      if (branding.whiteLabelEnabled) {
        updateData.whiteLabelLogoUrl = branding.whiteLabelLogoUrl || null;
        updateData.primaryBrandColor = branding.primaryBrandColor || DEFAULT_PRIMARY;
        updateData.secondaryBrandColor = branding.secondaryBrandColor || DEFAULT_SECONDARY;
        updateData.brandFont = branding.brandFont || 'Inter';
      }
      await api.patch('/companies/my-branding', updateData);
      await refreshMe();
      setAccount((prev) => ({ ...prev, password: '' }));
      setSuccess('Settings updated successfully.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl rounded-[24px] bg-white p-6 pb-10 shadow-sm ring-1 ring-gray-100 md:p-10 md:pb-12 animate-in fade-in duration-500">
      <h1 className="text-[28px] md:text-[32px] font-display font-[900] text-[#1a1a1a] tracking-tight mb-8 md:mb-10">Settings</h1>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</div>}
      {success && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{success}</div>}

      <form
        className="space-y-10"
        onSubmit={handleSave}
      >
        <section className="space-y-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">Account Details</h2>
          <p className="text-[13px] font-medium text-gray-500 mb-6">
            Update your personal details and password. Your login email cannot be edited here.
          </p>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">First Name</label>
              <input
                type="text"
                disabled={loading}
                value={account.firstName}
                onChange={(e) => {
                  setAccount((prev) => ({ ...prev, firstName: e.target.value }));
                  setFieldErrors((prev) => ({ ...prev, firstName: '' }));
                }}
                className={`w-full bg-[#f8f9fb] border py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 ${
                  fieldErrors.firstName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8bed21]/40'
                }`}
              />
              {fieldErrors.firstName && <p className="mt-1.5 text-[12px] font-semibold text-red-600">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Last Name</label>
              <input
                type="text"
                disabled={loading}
                value={account.lastName}
                onChange={(e) => {
                  setAccount((prev) => ({ ...prev, lastName: e.target.value }));
                  setFieldErrors((prev) => ({ ...prev, lastName: '' }));
                }}
                className={`w-full bg-[#f8f9fb] border py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 ${
                  fieldErrors.lastName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8bed21]/40'
                }`}
              />
              {fieldErrors.lastName && <p className="mt-1.5 text-[12px] font-semibold text-red-600">{fieldErrors.lastName}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Username</label>
              <input
                type="text"
                disabled={loading}
                value={account.username}
                onChange={(e) => setAccount((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Login Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full cursor-not-allowed bg-gray-100 border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-500"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Phone</label>
              <input
                type="tel"
                disabled={loading}
                value={account.phone}
                onChange={(e) => setAccount((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
                className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">SIP Extension</label>
              <input
                type="text"
                disabled={loading}
                value={account.sipExtension}
                onChange={(e) => setAccount((prev) => ({ ...prev, sipExtension: e.target.value }))}
                placeholder="e.g. 1001"
                className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
              />
            </div>
            <div className="sm:col-span-2 max-w-xl">
              <label className="block text-[13px] font-bold text-gray-800 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  value={account.password}
                  onChange={(e) => setAccount((prev) => ({ ...prev, password: e.target.value }))}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 pl-4 pr-12 rounded-xl text-[14px] font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-900"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-[12px] font-medium text-gray-400">Leave blank to keep your current password.</p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section className="space-y-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">Company Details</h2>
          <p className="text-[13px] font-medium text-gray-500 mb-6">
            Update your company details.
          </p>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Company Name</label>
              <input
                type="text"
                disabled={loading}
                value={branding.companyName}
                onChange={(e) => setBranding((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Company Name"
                className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Business Email</label>
              <input
                type="email"
                disabled={loading}
                value={branding.businessEmail}
                onChange={(e) => setBranding((prev) => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="billing@company.com"
                className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">White-Label Setup</h2>
          <p className="text-[13px] font-medium text-gray-500 mb-6">
            {branding.whiteLabelEnabled
              ? 'Customize your dashboard branding.'
              : 'Your current subscription does not include white-label customization.'}
          </p>

          <div className="mb-8 w-full max-w-3xl">
            <label className="block text-[13px] font-bold text-gray-800 mb-3">Logo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => handleUploadLogo(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={!branding.whiteLabelEnabled || uploading || loading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl bg-[#fafafa] py-10 px-6 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {branding.whiteLabelLogoUrl ? (
                <img src={branding.whiteLabelLogoUrl} alt="Logo preview" className="mb-3 h-14 w-14 rounded-lg object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
              )}
              <p className="text-[13px] font-semibold text-gray-600">
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </p>
            </button>
          </div>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[13px] font-bold text-gray-800 mb-3">Primary Brand Color</p>
              <input
                type="color"
                disabled={!branding.whiteLabelEnabled || loading}
                value={branding.primaryBrandColor}
                onChange={(e) => setBranding((prev) => ({ ...prev, primaryBrandColor: e.target.value }))}
                className="h-10 w-16 rounded-md border border-gray-200 bg-transparent disabled:opacity-60"
              />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-800 mb-3">Secondary Color</p>
              <input
                type="color"
                disabled={!branding.whiteLabelEnabled || loading}
                value={branding.secondaryBrandColor}
                onChange={(e) => setBranding((prev) => ({ ...prev, secondaryBrandColor: e.target.value }))}
                className="h-10 w-16 rounded-md border border-gray-200 bg-transparent disabled:opacity-60"
              />
            </div>
            <div className="relative sm:col-span-2 max-w-xl">
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Font</label>
              <select
                disabled={!branding.whiteLabelEnabled || loading}
                value={branding.brandFont}
                onChange={(e) => setBranding((prev) => ({ ...prev, brandFont: e.target.value }))}
                className="w-full bg-[#f8f9fb] border border-gray-200 py-3.5 px-4 rounded-xl text-[14px] font-semibold text-gray-900 disabled:opacity-60"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#8bed21] to-[#5AD43D] text-gray-900 text-[15px] font-bold shadow-sm hover:opacity-95 transition-opacity min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
