import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const ProfileModal = ({ isOpen, onClose, currentUser, onUserUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showReferralTooltip, setShowReferralTooltip] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      setError('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.changePassword(passwordForm);
      setSuccess('Пароль успешно изменён!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setShowChangePassword(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code).then(() => {
        setSuccess('Реферальный код скопирован!');
        setTimeout(() => setSuccess(''), 3000);
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      onClose();
      window.location.reload(); // Refresh to update app state
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
          aria-label="Закрыть"
        >
          ✖
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-6">
          <h2 className="text-2xl font-bold mb-2">Мой профиль</h2>
          <p className="text-blue-100">Добро пожаловать, {profile?.username || currentUser?.username}!</p>
        </div>

        <div className="px-6 py-4">
          {loading && !profile && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error/Success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {profile && (
            <div className="space-y-6">
              {/* Balance Section */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Баланс</h3>
                    <p className="text-2xl font-bold text-green-600">{profile.balance}₽</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                    {profile.email || 'Не указан'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                    {profile.username}
                  </div>
                </div>

                {/* Telegram Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                  <div className={`p-3 rounded-lg ${profile.telegram_connected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {profile.telegram_connected ? (
                      <div className="flex items-center space-x-2">
                        <span>✅</span>
                        <span>Подключен (@{profile.telegram_username})</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>Не подключен</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Referral Code Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="block text-sm font-medium text-gray-700">Реферальный код</label>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowReferralTooltip(true)}
                        onMouseLeave={() => setShowReferralTooltip(false)}
                        className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-600 transition-colors"
                        aria-label="Информация о реферальной системе"
                      >
                        ?
                      </button>
                      
                      {showReferralTooltip && (
                        <div className="absolute bottom-6 left-0 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 z-20 shadow-lg">
                          <div className="font-medium mb-2">Реферальная система:</div>
                          <ul className="space-y-1">
                            <li>• Пригласите друга - получите 500₽</li>
                            <li>• Ваш друг получит 2000₽ вместо 1000₽</li>
                            <li>• Просто поделитесь своим кодом!</li>
                          </ul>
                          <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 bg-blue-50 rounded-lg text-blue-700 font-mono text-lg font-bold">
                      {profile.referral_code}
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Скопировать код"
                    >
                      📋
                    </button>
                  </div>
                  
                  {profile.referral_stats && (
                    <div className="mt-2 text-sm text-gray-600">
                      Приглашено: {profile.referral_stats.total_referrals} чел. | 
                      Заработано: {profile.referral_stats.total_earnings}₽
                    </div>
                  )}
                </div>
              </div>

              {/* Password Change Section */}
              {profile.auth_method === 'email' && (
                <div className="border-t pt-4">
                  {!showChangePassword ? (
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Изменить пароль
                    </button>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Смена пароля</h3>
                      
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Текущий пароль"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                      />
                      
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Новый пароль (минимум 6 символов)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                        minLength="6"
                      />
                      
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Подтвердите новый пароль"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                        minLength="6"
                      />
                      
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(false)}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Logout Button */}
              <div className="border-t pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;