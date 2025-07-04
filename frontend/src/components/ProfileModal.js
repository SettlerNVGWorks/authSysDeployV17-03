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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-[#0a1b2a] text-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 relative border border-yellow-500 overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-white text-xl sm:text-2xl z-10 p-1"
          aria-label="Закрыть"
        >
          ✖
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 pt-6 sm:pt-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Мой профиль</h2>
          <p className="text-gray-300 text-xs sm:text-sm">Добро пожаловать, {profile?.username || currentUser?.username}!</p>
        </div>

        {loading && !profile && (
          <div className="flex justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Error/Success messages */}
        {error && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-xs sm:text-sm">
            {success}
          </div>
        )}

        {profile && (
          <div className="space-y-4 sm:space-y-6">
            {/* Balance Section */}
            <div className="bg-[#142b45] rounded-lg p-3 sm:p-4 border border-yellow-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-yellow-400">Баланс</h3>
                  <p className="text-xl sm:text-2xl font-bold text-white">{profile.balance}₽</p>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl">💰</div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Email</label>
                <div className="p-3 bg-[#142b45] rounded-lg text-gray-300 border border-yellow-400 text-xs sm:text-sm">
                  {profile.email || 'Не указан'}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Имя пользователя</label>
                <div className="p-3 bg-[#142b45] rounded-lg text-gray-300 border border-yellow-400 text-xs sm:text-sm">
                  {profile.username}
                </div>
              </div>

              {/* Telegram Status */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Telegram</label>
                <div className={`p-3 rounded-lg border text-xs sm:text-sm ${profile.telegram_connected ? 'bg-green-900/50 border-green-500 text-green-200' : 'bg-yellow-900/50 border-yellow-500 text-yellow-200'}`}>
                  {profile.telegram_connected ? (
                    <div className="flex items-center space-x-2">
                      <span>✅</span>
                      <span className="break-all">Подключен (@{profile.telegram_username})</span>
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
                <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-white">Реферальный код</label>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowReferralTooltip(true)}
                      onMouseLeave={() => setShowReferralTooltip(false)}
                      onClick={() => setShowReferralTooltip(!showReferralTooltip)} // For mobile tap
                      className="w-4 h-4 bg-yellow-500 text-[#0a1b2a] rounded-full text-xs flex items-center justify-center hover:bg-yellow-600 transition-colors font-bold"
                      aria-label="Информация о реферальной системе"
                    >
                      ?
                    </button>
                    
                    {showReferralTooltip && (
                      <div className="absolute bottom-6 left-0 w-48 sm:w-64 bg-[#142b45] text-white text-xs rounded-lg p-3 z-20 shadow-lg border border-yellow-400">
                        <div className="font-medium mb-2 text-yellow-400">Реферальная система:</div>
                        <ul className="space-y-1">
                          <li>• Пригласите друга - получите 500₽</li>
                          <li>• Ваш друг получит 2000₽ вместо 1000₽</li>
                          <li>• Просто поделитесь своим кодом!</li>
                        </ul>
                        <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#142b45]"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-[#142b45] rounded-lg text-yellow-400 font-mono text-sm sm:text-lg font-bold border border-yellow-400 break-all">
                    {profile.referral_code}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="px-3 py-3 bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] rounded-lg transition-colors font-bold text-sm sm:text-base min-w-[48px]"
                    title="Скопировать код"
                  >
                    📋
                  </button>
                </div>
                
                {profile.referral_stats && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-300 text-center sm:text-left">
                    Приглашено: {profile.referral_stats.total_referrals} чел. | 
                    Заработано: {profile.referral_stats.total_earnings}₽
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            {profile.auth_method === 'email' && (
              <div className="border-t border-yellow-400 pt-3 sm:pt-4">
                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Изменить пароль
                  </button>
                ) : (
                  <div className="bg-[#142b45] rounded-lg p-3 sm:p-4 border border-yellow-400">
                    <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
                      <h3 className="text-sm sm:text-lg font-semibold text-yellow-400">Смена пароля</h3>
                      
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Текущий пароль"
                        className="w-full px-3 sm:px-4 py-3 bg-[#0a1b2a] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-300 text-sm sm:text-base"
                        required
                        disabled={loading}
                      />
                      
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Новый пароль (минимум 6 символов)"
                        className="w-full px-3 sm:px-4 py-3 bg-[#0a1b2a] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-300 text-sm sm:text-base"
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
                        className="w-full px-3 sm:px-4 py-3 bg-[#0a1b2a] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-300 text-sm sm:text-base"
                        required
                        disabled={loading}
                        minLength="6"
                      />
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                        >
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(false)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <div className="border-t border-yellow-400 pt-3 sm:pt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;