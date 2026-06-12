import React, { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const FONTS = ['Inter', 'Poppins', 'Montserrat', 'Roboto', 'DM Sans'];
const DEFAULT_PRIMARY = '#000000';
const DEFAULT_SECONDARY = '#111111';

export default function AgentSettings() {
  const { refreshMe } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
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
      setSuccess('Settings updated successfully.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[960px] mx-auto bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/60 min-h-full p-6 md:p-10 flex flex-col animate-in fade-in duration-500">
      <h1 className="text-[28px] md:text-[32px] font-display font-[900] text-[#1a1a1a] tracking-tight mb-10">Settings</h1>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</div>}
      {success && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{success}</div>}

      <form
        className="space-y-10"
        onSubmit={handleSave}
      >
        <section className="space-y-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">Company Details</h2>
          <p className="text-[13px] font-medium text-gray-500 mb-6">
            Update your company details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
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

          <div className="mb-8 max-w-xl">
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

          <div className="space-y-6 max-w-xl">
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
            <div className="relative max-w-md">
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
