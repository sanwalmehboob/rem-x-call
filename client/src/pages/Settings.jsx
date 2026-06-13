import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,63}$/;

const validateName = (value, label) => {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (trimmed.length > 64) return `${label} must be 64 characters or less.`;
  if (!NAME_PATTERN.test(trimmed)) return `${label} can only include letters, spaces, apostrophes, and hyphens.`;
  return '';
};

const Settings = () => {
  const { user, refreshMe } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [sipExtension, setSipExtension] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setEmail(user.email || '');
    setSipExtension(user.sipExtension || '');
    setPassword('');
    setProfilePreview(user.profileImageUrl || '');
  }, [user]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    const nextErrors = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateName(lastName, 'Last name'),
    };
    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAvatarFile = useCallback(
    async (file) => {
      if (!file || !/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
        setError('Please choose a PNG or JPG image.');
        return;
      }
      setUploadingAvatar(true);
      clearMessages();
      try {
        const body = new FormData();
        body.append('file', file);
        const { data } = await api.post('/auth/me/avatar', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data?.profileImageUrl) setProfilePreview(data.profileImageUrl);
        await refreshMe();
        setSuccess('Profile photo updated.');
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not upload image.');
      } finally {
        setUploadingAvatar(false);
      }
    },
    [refreshMe]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleAvatarFile(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    clearMessages();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        sipExtension,
      };
      const pw = password.trim();
      if (pw) payload.newPassword = pw;
      await api.patch('/auth/me', payload);
      await refreshMe();
      setPassword('');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl rounded-[24px] bg-white p-6 pb-10 shadow-sm ring-1 ring-gray-100 md:p-10 md:pb-12 animate-in fade-in duration-500">
      <h1 className="mb-8 font-display text-[28px] font-[900] tracking-tight text-[#1a1a1a] md:mb-10 md:text-[32px]">
        Settings
      </h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
          {success}
        </div>
      )}

      <form className="space-y-10" onSubmit={onSubmit} autoComplete="off">
        <section className="space-y-6">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 mb-1">Account Details</h2>
            <p className="text-[13px] font-medium text-gray-500">
              Update your personal details and password.
            </p>
          </div>

          <div className="w-full max-w-3xl space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) handleAvatarFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              disabled={uploadingAvatar}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-10 transition-colors ${
                dragActive ? 'border-[#7ae230] bg-[#f0fce8]' : 'border-gray-200 bg-[#f8f9fb] hover:border-gray-300'
              } disabled:cursor-wait disabled:opacity-70`}
            >
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt=""
                  className="mb-1 h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-100">
                  <Upload className="h-5 w-5" strokeWidth={2} />
                </span>
              )}
              <span className="text-center text-[14px] font-bold text-gray-800">
                {uploadingAvatar ? 'Uploading...' : 'Upload or drag and drop image'}
              </span>
              <span className="text-center text-[12px] font-medium text-gray-400">Format should be PNG or JPG</span>
            </button>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="settings-first" className="mb-2 block text-[13px] font-bold text-gray-700">
                  First Name
                </label>
                <input
                  id="settings-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: '' }));
                    clearMessages();
                  }}
                  autoComplete="given-name"
                  className={`w-full rounded-xl border bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230] ${
                    fieldErrors.firstName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                  }`}
                />
                {fieldErrors.firstName && <p className="mt-1.5 text-[12px] font-semibold text-red-600">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="settings-last" className="mb-2 block text-[13px] font-bold text-gray-700">
                  Last Name
                </label>
                <input
                  id="settings-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, lastName: '' }));
                    clearMessages();
                  }}
                  autoComplete="family-name"
                  className={`w-full rounded-xl border bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230] ${
                    fieldErrors.lastName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                  }`}
                />
                {fieldErrors.lastName && <p className="mt-1.5 text-[12px] font-semibold text-red-600">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="settings-email" className="mb-2 block text-[13px] font-bold text-gray-700">
                  Login Email
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  disabled
                  autoComplete="email"
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3.5 text-[14px] font-semibold text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="settings-sip" className="mb-2 block text-[13px] font-bold text-gray-700">
                  SIP Extension
                </label>
                <input
                  id="settings-sip"
                  type="text"
                  value={sipExtension}
                  onChange={(e) => {
                    setSipExtension(e.target.value);
                    clearMessages();
                  }}
                  placeholder="e.g. 1001"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230]"
                />
              </div>
            </div>

            <div className="max-w-xl">
              <label htmlFor="settings-password" className="mb-2 block text-[13px] font-bold text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  id="settings-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearMessages();
                  }}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] py-3.5 pl-4 pr-12 text-[14px] font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#7ae230]"
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

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#8bed21] to-[#5AD43D] text-gray-900 text-[15px] font-bold shadow-sm hover:opacity-95 transition-opacity min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
