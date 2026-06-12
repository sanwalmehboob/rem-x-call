import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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

  const handleAvatarFile = useCallback(
    async (file) => {
      if (!file || !/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
        setError('Please choose a PNG or JPG image.');
        return;
      }
      setUploadingAvatar(true);
      setError('');
      setSuccess('');
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
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { firstName, lastName, email, sipExtension };
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
    <div className="mx-auto w-full max-w-6xl rounded-[24px] bg-white p-6 pb-10 shadow-sm ring-1 ring-gray-100 md:p-10 md:pb-12">
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

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <div className="shrink-0 lg:max-w-[220px]">
          <h2 className="mb-1 text-[15px] font-bold text-gray-900">Basic info</h2>
          <p className="text-[13px] font-medium leading-relaxed text-gray-500">Enter your basic information.</p>
        </div>

        <div className="w-full min-w-0 lg:flex lg:flex-1 lg:justify-end">
          <form
            className="w-full max-w-[440px] space-y-5 lg:ml-auto"
            onSubmit={onSubmit}
            autoComplete="off"
          >
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
                {uploadingAvatar ? 'Uploading…' : 'Upload or drag and drop image'}
              </span>
              <span className="text-center text-[12px] font-medium text-gray-400">Format should be PNG or JPG</span>
            </button>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
                    setError('');
                    setSuccess('');
                  }}
                  autoComplete="given-name"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230]"
                />
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
                    setError('');
                    setSuccess('');
                  }}
                  autoComplete="family-name"
                  className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="settings-email" className="mb-2 block text-[13px] font-bold text-gray-700">
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230]"
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
                  setError('');
                  setSuccess('');
                }}
                placeholder="e.g. 1001"
                className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-4 py-3.5 text-[14px] font-semibold text-gray-900 focus:ring-2 focus:ring-[#7ae230]"
              />
            </div>

            <div>
              <label htmlFor="settings-password" className="mb-2 block text-[13px] font-bold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="settings-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  autoComplete="new-password"
                  placeholder="Enter Password"
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
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-[#8bed21] to-[#5AD43D] py-4 text-[14px] font-bold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
