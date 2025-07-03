import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify', 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    verificationToken: '',
    referralCode: ''
  });
  
  const [referralStatus, setReferralStatus] = useState({
    checking: false,
    valid: null,
    message: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
    
    // Reset referral status when referral code changes
    if (name === 'referralCode') {
      setReferralStatus({
        checking: false,
        valid: null,
        message: ''
      });
    }
  };

  // Check referral code
  const checkReferralCode = async (code) => {
    if (!code.trim()) {
      setReferralStatus({
        checking: false,
        valid: null,
        message: ''
      });
      return;
    }

    setReferralStatus({
      checking: true,
      valid: null,
      message: ''
    });

    try {
      const response = await authAPI.checkReferral(code.trim());
      setReferralStatus({
        checking: false,
        valid: true,
        message: response.data.message
      });
    } catch (error) {
      setReferralStatus({
        checking: false,
        valid: false,
        message: error.response?.data?.error || 'Неверный код'
      });
    }
  };

  // Debounced referral check
  useEffect(() => {
    if (formData.referralCode) {
      const timer = setTimeout(() => {
        checkReferralCode(formData.referralCode);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.referralCode]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;
      
      // Save token and user data
      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userData', JSON.stringify(user));
      }
      
      setSuccess('Вход выполнен успешно!');
      onSuccess && onSuccess(user);
      setTimeout(() => onClose(), 1000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка входа';
      
      if (error.response?.data?.require_verification) {
        setError(errorMessage);
        setAuthMode('verify');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      setSuccess('Регистрация успешна! Проверьте email для подтверждения');
      setAuthMode('verify');
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка регистрации';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyEmail(formData.verificationToken);
      
      const { token, user } = response.data;
      
      // Auto-login after verification
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      setSuccess('Email успешно подтверждён!');
      onSuccess && onSuccess(user);
      setTimeout(() => onClose(), 1000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка подтверждения';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Введите email для повторной отправки');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resendVerification(formData.email);
      setSuccess('Письмо подтверждения отправлено повторно');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(formData.email);
      setSuccess('Инструкции по сбросу пароля отправлены на email');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  // Handle Telegram auth
  const handleTelegramAuth = async () => {
    setTelegramLoading(true);
    setError('');

    try {
      const response = await authAPI.telegramAuthStart(formData.email || '');
      const { telegram_url, auth_token } = response.data;
      
      // Open Telegram bot in new window
      window.open(telegram_url, '_blank');
      
      // Start polling for auth status
      pollTelegramAuthStatus(auth_token);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка Telegram авторизации');
      setTelegramLoading(false);
    }
  };

  // Poll Telegram auth status
  const pollTelegramAuthStatus = async (authToken) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await authAPI.telegramAuthStatus(authToken);
        const data = response.data;
        
        if (data.status === 'confirmed') {
          clearInterval(pollInterval);
          
          // Save token and user data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          
          setSuccess('Вход через Telegram выполнен успешно!');
          setTelegramLoading(false);
          onSuccess && onSuccess(data.user);
          setTimeout(() => onClose(), 1000);
        }
      } catch (error) {
        clearInterval(pollInterval);
        setError('Ошибка авторизации через Telegram');
        setTelegramLoading(false);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (telegramLoading) {
        setTelegramLoading(false);
        setError('Время ожидания истекло');
      }
    }, 5 * 60 * 1000);
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
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
            {authMode === 'login' && 'АВТОРИЗАЦИЯ'}
            {authMode === 'register' && 'РЕГИСТРАЦИЯ'}
            {authMode === 'verify' && 'ПОДТВЕРЖДЕНИЕ EMAIL'}
            {authMode === 'forgot' && 'СБРОС ПАРОЛЯ'}
          </h2>
        </div>

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

        {/* Login Form */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Введите e-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="e-mail"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Введите пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="Пароль"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-yellow-500 bg-[#142b45] border-yellow-400 rounded focus:ring-yellow-500"
                />
                <span className="ml-2 text-xs sm:text-sm text-white">Запомнить</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 underline text-left sm:text-right"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Telegram Auth Button */}
            <button
              type="button"
              onClick={handleTelegramAuth}
              disabled={telegramLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <span className="text-base sm:text-lg">✈️</span>
              <span>{telegramLoading ? 'Ожидание подтверждения...' : 'Войти через Telegram'}</span>
            </button>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>

            <div className="text-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-white">Нет аккаунта? </span>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 underline font-medium"
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        )}

        {/* Registration Form */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="Ваше имя"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="Минимум 6 символов"
                required
                disabled={loading}
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="Повторите пароль"
                required
                disabled={loading}
                minLength="6"
              />
            </div>

            {/* Referral Code Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Реферальный код (необязательно)
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base ${
                  referralStatus.valid === true ? 'border-green-500 focus:ring-green-500' :
                  referralStatus.valid === false ? 'border-red-500 focus:ring-red-500' :
                  'border-yellow-400 focus:ring-yellow-500'
                }`}
                placeholder="Введите код друга"
                disabled={loading}
              />
              
              {/* Referral Status */}
              {referralStatus.checking && (
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-yellow-400 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-yellow-400 mr-2"></div>
                  Проверяем код...
                </div>
              )}
              
              {referralStatus.valid === true && (
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-400 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="break-words">{referralStatus.message}</span>
                </div>
              )}
              
              {referralStatus.valid === false && (
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center">
                  <span className="mr-2">❌</span>
                  <span className="break-words">{referralStatus.message}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <div className="text-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-white">Уже есть аккаунт? </span>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 underline font-medium"
              >
                Войти
              </button>
            </div>
          </form>
        )}

        {/* Email Verification Form */}
        {authMode === 'verify' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📧</div>
              <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                Мы отправили письмо с кодом подтверждения на ваш email
              </p>
            </div>

            <form onSubmit={handleVerifyEmail}>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                  Код подтверждения из email
                </label>
                <input
                  type="text"
                  name="verificationToken"
                  value={formData.verificationToken}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                  placeholder="Введите код из письма"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors disabled:opacity-50 mt-3 sm:mt-4 text-sm sm:text-base"
              >
                {loading ? 'Подтверждение...' : 'Подтвердить'}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 underline"
              >
                Отправить код повторно
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Form */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3 sm:space-y-4">
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🔐</div>
              <p className="text-gray-300 text-xs sm:text-sm">
                Введите ваш email для сброса пароля
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-[#142b45] border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Отправка...' : 'Отправить инструкции'}
            </button>

            <div className="text-center mt-3 sm:mt-4">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 underline"
              >
                Вернуться к входу
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;