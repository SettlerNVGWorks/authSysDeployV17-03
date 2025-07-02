import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import crownImage from './source_pics/main-pic.jpg';
import logoVideo from './source_pics/main-vid.mp4';
import onewin_logo from './source_pics/1win-mid-1280x720-1.png';
import { authAPI, sportsAPI } from './services/api';
import TodayMatches from './components/TodayMatches';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import EmailVerification from './components/EmailVerification';

// Main App Component
const MainApp = () => {
  const [showServices, setShowServices] = useState(false);
  const [showSponsor, setShowSponsor] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBot, setShowBot] = useState(false);
  
  // Document modal states
  const [showTerms, setShowTerms] = useState(false);
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [stats, setStats] = useState({
    totalPredictions: 1247,
    successRate: 78.5,
    activeBettors: 5892,
    monthlyWins: 342
  });

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
      }
    }

    // Load stats from backend
    loadStats();
  }, []);

  // Load statistics from backend
  const loadStats = async () => {
    try {
      const response = await sportsAPI.getStats();
      const data = response.data;
      setStats({
        totalPredictions: data.total_predictions,
        successRate: data.success_rate,
        activeBettors: data.active_bettors,
        monthlyWins: data.monthly_wins
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep default values if API fails
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  // Handle user update (for profile changes)
  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Also update localStorage/sessionStorage
    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(updatedUser));
  };

  // Handle logout
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
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch (error) {
      return dateString;
    }
  };

  const sports = [
    {
      name: 'Бейсбол',
      icon: '⚾',
      image: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402',
      stats: { predictions: 312, accuracy: 82.1 },
      description: 'Профессиональные прогнозы на MLB и международные турниры'
    },
    {
      name: 'Хоккей',
      icon: '🏒',
      image: 'https://images.unsplash.com/photo-1576584520374-c55375496eac',
      stats: { predictions: 285, accuracy: 79.8 },
      description: 'Экспертные прогнозы на NHL и международные чемпионаты'
    }
  ];

  const testimonials = [
    {
      name: 'Алексей М.',
      text: 'За месяц подписки удалось выйти в плюс на 15%. Прогнозы действительно работают!',
      rating: 5
    },
    {
      name: 'Дмитрий К.',
      text: 'Лучший канал по спортивной аналитике. Подробные разборы и высокий процент проходимости.',
      rating: 5
    },
    {
      name: 'Михаил С.',
      text: 'Следую рекомендациям уже полгода. Стабильный профит и качественная аналитика.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-gold-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-b from-gold-300 to-gold-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                <img src={crownImage} alt="Crown" className="w-32 h-32 object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">ПРОГНОЗЫ</h1>
                <div className="text-gold-400 text-sm font-semibold">НА СПОРТ №1</div>
              </div>
            </div>
        <div className="flex items-center space-x-3">
          {/* Profile/Login Button */}
          {isLoggedIn ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition group"
              aria-label="Открыть профиль"
            >
              <svg className="w-6 h-6 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-white font-medium text-sm hidden sm:block">{currentUser?.username}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition group"
              aria-label="Войти"
            >
              <svg className="w-6 h-6 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-white font-medium text-sm hidden sm:block">Войти</span>
            </button>
          )}
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center animate-pulse hover:bg-white/20 transition"
            aria-label="Открыть меню"
          >
            <div className="space-y-1">
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </div>
          </button>
        </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-blue-900/70"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1700085663927-d223c604fb57)' }}
        ></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo Section with Video */}
            <div className="mb-8">
              <div className="w-full max-w-3xl mx-auto mb-6">
                <video
                  src={logoVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-auto object-cover rounded-xl shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                    minHeight: '200px'
                  }}
                  onLoadStart={() => console.log('🔄 Видео начало загружаться')}
                  onCanPlay={() => console.log('✅ Видео готово к воспроизведению')}
                  onError={(e) => console.error('❌ Ошибка загрузки видео:', e)}
                />
              </div>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
                Лучшие аналитики мира предоставляют экспертные прогнозы на бейсбол и хоккей.
                <br />
                <span className="text-gold-400 font-semibold">Стабильный профит с доказанной статистикой успешности.</span>
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-gold-500/30 hover:border-gold-500/60 transition-all">
                <div className="text-4xl font-bold text-gold-400 mb-2">{stats.totalPredictions}</div>
                <div className="text-white text-sm font-medium">Всего прогнозов</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-gold-500/30 hover:border-gold-500/60 transition-all">
                <div className="text-4xl font-bold text-gold-400 mb-2">{stats.successRate}%</div>
                <div className="text-white text-sm font-medium">Проходимость</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-gold-500/30 hover:border-gold-500/60 transition-all">
                <div className="text-4xl font-bold text-gold-400 mb-2">{stats.activeBettors}</div>
                <div className="text-white text-sm font-medium">Активных подписчиков</div>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-gold-500/30 hover:border-gold-500/60 transition-all">
                <div className="text-4xl font-bold text-gold-400 mb-2">{stats.monthlyWins}</div>
                <div className="text-white text-sm font-medium">Побед в месяц</div>
              </div>
            </div>

            <a
              href="https://t.me/+UD8DYv3MgfUxNWU6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-gold-400 to-gold-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-gold-500 hover:to-gold-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <span>🚀 ПОЛУЧИТЬ ПРОГНОЗЫ</span>
            </a>
          </div>
        </div>
      </section>

      {/* Today's Matches Section */}
      <TodayMatches />

      {/* Sports Sections */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Наши специализации</h3>
            <p className="text-xl text-gray-300">Экспертная аналитика по бейсболу и хоккею</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {sports.map((sport, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 transform hover:scale-105">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{sport.icon}</span>
                    <h4 className="text-xl font-bold text-white">{sport.name}</h4>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed">{sport.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-gold-400 font-bold text-lg">{sport.stats.predictions}</div>
                      <div className="text-gray-400 text-xs">прогнозов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gold-400 font-bold text-lg">{sport.stats.accuracy}%</div>
                      <div className="text-gray-400 text-xs">точность</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Отзывы клиентов</h3>
            <p className="text-xl text-gray-300">Что говорят наши подписчики</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-gold-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-200 mb-4 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="text-gold-400 font-semibold">— {testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Готовы стать №1?
            </h3>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto leading-relaxed">
              Присоединяйтесь к нашему Telegram каналу и получите доступ к эксклюзивным прогнозам
              и детальной аналитике от лучших экспертов мира.
            </p>
            <a
              href="https://t.me/+UD8DYv3MgfUxNWU6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <span>📈 ПРИСОЕДИНИТЬСЯ К КАНАЛУ</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gold-500/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-b from-gold-300 to-gold-600 rounded-lg flex items-center justify-center">
              <img src={crownImage} alt="Crown" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">ПРОГНОЗЫ НА СПОРТ №1</h4>
              </div>
            </div>
            <p className="text-gray-300 mb-6 text-lg">
              Лучшие аналитики мира • Профессиональные спортивные прогнозы
            </p>
          </div>

          {/* Document Links */}
          <div className="flex flex-wrap justify-center items-center space-x-6 mb-6 text-sm">
            <button
              onClick={() => setShowTerms(true)}
              className="text-gray-400 hover:text-white underline transition-colors"
            >
              Условия сотрудничества
            </button>
            <button
              onClick={() => setShowUserAgreement(true)}
              className="text-gray-400 hover:text-white underline transition-colors"
            >
              Пользовательское соглашение
            </button>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-gray-400 hover:text-white underline transition-colors"
            >
              Политика конфиденциальности
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Прогнозы на спорт №1 не проводит и не является организатором игр на деньги. Вся информация носит ознакомительный характер. Возрастное ограничение 18+
            </p>
            <div className="text-gray-400 text-sm">
              © 2025 Прогнозы на спорт №1. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
      
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-end">
          <div className="w-64 bg-[#0a1b2a] text-white h-full p-6 shadow-lg border-l border-blue-100 relative animate-slide-in-right">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ✖
            </button>
            <div className="space-y-4 mt-12">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowServices(true);
                }}
                className="block w-full text-left text-blue-300 hover:text-blue-100 font-semibold border-t border-blue-100 py-3 px-2 hover:bg-blue-900/20 transition"
              >
                💼 Наши услуги
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowBot(true);
                }}
                className="block w-full text-left text-blue-300 hover:text-blue-100 font-semibold border-t border-blue-100 py-3 px-2 hover:bg-blue-900/20 transition"
              >
                🤖 Наш бот
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowGame(true);
                }}
                className="block w-full text-left text-blue-300 hover:text-blue-100 font-semibold border-t border-blue-100 py-3 px-2 hover:bg-blue-900/20 transition"
              >
                🎮 Мини-игра
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowSponsor(true);
                }}
                className="block w-full text-left text-blue-300 hover:text-blue-100 font-semibold border-t border-blue-100 py-3 px-2 hover:bg-blue-900/20 transition"
              >
                🤝 Наши спонсоры
              </button>
              
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowContact(true);
                }}
                className="block w-full text-left text-blue-300 hover:text-blue-100 font-semibold border-t border-blue-100 py-3 px-2 hover:bg-blue-900/20 transition"
              >
                📞 Контакты
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowFAQ(true);
                }}
                className="block w-full text-left text-blue-300 hover:text-blue-100 font-semibold border-t border-blue-100 py-3 px-2 hover:bg-blue-900/20 transition"
              >
                ❓ FAQ
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Windows - keeping existing modals */}
      {showServices && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#0a1b2a] text-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-yellow-500 overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-6 text-center">Наши услуги</h2>

            {/* ОРДИНАР */}
            <div className="mb-6 p-4 bg-[#142b45] rounded-lg border border-yellow-400">
              <h3 className="text-lg font-semibold mb-2">🎯 ОРДИНАР — 599₽</h3>
              <p className="mb-4">
                Одиночный прогноз с коэффициентом от 1.8 до 2.2. Надёжность около 98%. Отличный выбор для тех, кто хочет ставить уверенно и постепенно увеличивать банк.
              </p>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-2 px-4 rounded transition"
                onClick={() => alert('Покупка ОРДИНАРа')}
              >
                Купить
              </button>
            </div>

            {/* ДВОЙНИК */}
            <div className="mb-6 p-4 bg-[#142b45] rounded-lg border border-yellow-400">
              <h3 className="text-lg font-semibold mb-2">⚡ ДВОЙНИК — 999₽</h3>
              <p className="mb-4">
                Прогноз на два события с общим коэффициентом от 1.99 до 2.5. Надёжность около 95%. Для тех, кто хочет немного больше риска, но при этом высокую проходимость.
              </p>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-2 px-4 rounded transition"
                onClick={() => alert('Покупка ДВОЙНИКа')}
              >
                Купить
              </button>
            </div>

            {/* ЭКСПРЕСС */}
            <div className="mb-6 p-4 bg-[#142b45] rounded-lg border border-yellow-400">
              <h3 className="text-lg font-semibold mb-2">🚀 ЭКСПРЕСС — 1999₽</h3>
              <p className="mb-4">
                Несколько событий с коэффициентом от 3.5 до 6.5. Надёжность около 99%. Подходит для опытных игроков, готовых на более крупные выигрыши.
              </p>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-2 px-4 rounded transition"
                onClick={() => alert('Покупка ЭКСПРЕССа')}
              >
                Купить
              </button>
            </div>

            {/* VIP КАНАЛ */}
            <div className="p-4 bg-[#142b45] rounded-lg border border-yellow-400">
              <h3 className="text-lg font-semibold mb-2">👑 VIP КАНАЛ — Только уверенные события</h3>
              <p className="mb-4">Доступ к самым надёжным прогнозам и разбору матчей:</p>
              <ul className="list-disc list-inside mb-4">
                <li>Неделя — 3500₽ </li>
                <li>Месяц — 15000₽ </li>
                <li>Год — 50000₽ </li>
              </ul>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-[#0a1b2a] font-bold py-2 px-4 rounded transition"
                onClick={() => alert('Покупка ВИПа')}
              >
                Купить
              </button>
            </div>

            <button
              onClick={() => setShowServices(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
              aria-label="Закрыть окно услуг"
            >
              ✖
            </button>
          </div>
        </div>
      )}
      
      {/* Keeping all other existing modals... */}
      {showBot && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#123045] text-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-yellow-500 overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-4">🤖 Наш бот</h2>
            <p className="mb-4">
              Наш бот — это удобный помощник в Telegram, который помогает вам быть в курсе всех прогнозов и управлять подпиской напрямую из мессенджера. Вот что он умеет:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-sm">
              <li>🔔 Уведомляет вас о новых прогнозах сразу после публикации.</li>
              <li>👤 Позволяет просматривать ваши личные данные и статус подписки.</li>
              <li>⚙️ Работает через встроенное Telegram-приложение для быстрого и удобного взаимодействия с нашим сервисом.</li>
              <li>💬 Поддерживает обратную связь — вы можете отправить вопрос или запросить помощь прямо в чате с ботом.</li>
            </ul>
            <p className="mb-6">
              Чтобы начать пользоваться ботом, просто перейдите по ссылке:
              <br />
              <a
                href="https://t.me/ByWin52Bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                https://t.me/ByWin52Bot
              </a>
            </p>
            <button
              onClick={() => setShowBot(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              aria-label="Закрыть окно бота"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showGame && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#1a1f2e] text-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-yellow-500">
            <h2 className="text-2xl font-bold mb-4">Мини-игра</h2>
            <p className="text-sm text-gray-300">Скоро появится увлекательная мини-игра с возможностью выигрыша призов!</p>
            <button onClick={() => setShowGame(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">✖</button>
          </div>
        </div>
      )}

      {showFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#1c2a38] text-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-yellow-500 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">FAQ — Частые вопросы</h2>
            <ul className="text-sm space-y-2">
            <li>
              <strong>❓ Кто вы такие?</strong> — Мы команда профессиональных спортивных аналитиков с более чем 7-летним опытом. 
              Наша работа основана на глубоком анализе статистики, формы команд, состава игроков и других факторов, влияющих на исход спортивных событий. 
              Мы не гонимся за хайпом, а предоставляем качественные и продуманные прогнозы.
            </li>

            <li>
              <strong>💼 Как подписаться?</strong> — Всё очень просто. Нажмите кнопку Telegram на сайте и перейдите в наш канал. 
              После подключения вы получите инструкции по активации подписки через нашего бота. Оплата производится быстро и безопасно.
            </li>

            <li>
              <strong>📈 Что значит "точность прогноза"?</strong> — Это процент успешных прогнозов по отношению к общему числу. 
              Например, если из 100 прогнозов 85 зашли — это 85% точности. Мы регулярно публикуем статистику, чтобы вы могли видеть нашу реальную эффективность.
            </li>

            <li>
              <strong>💸 Безопасна ли оплата?</strong> — Да. Мы принимаем оплату через проверенные и защищённые методы: Telegram-бот, банковские переводы, криптовалюта. 
              Ваши данные не передаются третьим лицам. Мы дорожим своей репутацией и безопасностью клиентов.
            </li>

            <li>
              <strong>🎁 Есть ли пробный доступ?</strong> — Да. Мы регулярно публикуем бесплатные прогнозы в Telegram, чтобы вы могли протестировать наш подход перед покупкой. 
              Это честный способ убедиться в нашем уровне.
            </li>

            <li>
              <strong>📊 Какие услуги вы предлагаете?</strong> — Мы делаем ОРДИНАРЫ, ДВОЙНИКИ и ЭКСПРЕССЫ с высокой проходимостью. 
              Также доступна VIP-подписка, куда попадают только самые надёжные события. Подписки доступны на неделю, месяц или год.
            </li>

            <li>
              <strong>🔐 Есть ли гарантии?</strong> — Мы не обещаем 100% успех — в ставках это невозможно. 
              Но если прогноз не заходит, мы компенсируем это бонусным прогнозом. 
              Наша главная цель — долгосрочная прибыль клиентов, а не разовые ставки.
            </li>

            <li>
              <strong>📞 Как связаться с вами?</strong> — Мы всегда на связи в Telegram. Просто напишите нам — отвечаем оперативно и по существу. 
              Поддержка доступна ежедневно, без выходных.
            </li>

            <li>
              <strong>🤝 Почему вам стоит доверять?</strong> — У нас открытая статистика, настоящие отзывы клиентов, постоянная обратная связь и прозрачные условия. 
              Мы не скрываем ни успехов, ни неудач. Наша задача — стабильный доход для вас и честный сервис.
            </li>

            <li>
              <strong>📦 Что входит в подписку?</strong> — В зависимости от тарифа вы получаете:
              <ul className="list-disc list-inside ml-4">
                <li>Доступ к прогнозам в закрытом канале</li>
                <li>Подробную аналитику и разбор матчей</li>
                <li>Рекомендации по суммам ставок</li>
                <li>Бесплатные бонус-прогнозы и акции</li>
                <li>Консультации и помощь по ставкам</li>
              </ul>
            </li>
          </ul>

            <button onClick={() => setShowFAQ(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">✖</button>
          </div>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#1d2f3a] text-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-yellow-500">
            <h2 className="text-2xl font-bold mb-4">Контакты</h2>

            <p className="text-sm text-gray-300 mb-2">
              🛠️ Вы можете обращаться в поддержку через форму на сайте — мы оперативно ответим на все вопросы.
            </p>

            <p className="text-sm text-gray-300 mb-2">
              📞 Админ: <a href="https://t.me/bos0009" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">@bos0009</a>
            </p>

            <p className="text-sm text-gray-300 mb-2">
              📢 Telegram-канал: <a href="https://t.me/+UD8DYv3MgfUxNWU6" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">t.me/+UD8DYv3MgfUxNWU6</a>
            </p>

            <p className="text-sm text-gray-300 mb-4">
              Присоединяйтесь к нашему каналу, чтобы получать надёжные прогнозы, бесплатные разборы и новости из мира спорта каждый день. Мы — за честную аналитику и долгосрочный профит.
            </p>

            <p className="text-sm text-gray-300">
              🌍 Мы доступны 24/7 для ваших вопросов и предложений.
            </p>

            <button 
              onClick={() => setShowContact(false)} 
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showSponsor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
        <div className="bg-[#0a1b2a] text-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-yellow-500">
            <h2 className="text-2xl font-bold mb-4">Наш спонсор — 1WIN</h2>
            <div className="space-y-4 text-sm">
              <p><strong>1WIN</strong> — ведущая международная букмекерская компания.</p>
              <p>🎁 Бонус до 25 000₽ на первый депозит</p>
              <p>📱 Удобное приложение и круглосуточная поддержка</p>
              <img
                src={onewin_logo}
                alt="1WIN Logo"
                className="w-full rounded"
              />
            </div>
            <button
              onClick={() => setShowSponsor(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* Document Modals */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#0a1b2a] text-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative border border-gold-500 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gold-400">Условия сотрудничества</h2>
            <div className="space-y-4 text-sm">
              <p><strong>1. Общие положения</strong></p>
              <p>1.1. Настоящие условия сотрудничества определяют порядок предоставления информационных услуг в области спортивной аналитики.</p>
              <p>1.2. Мы предоставляем исключительно информационные и аналитические материалы, основанные на статистике и экспертном анализе.</p>
              
              <p><strong>2. Предоставляемые услуги</strong></p>
              <p>2.1. Спортивная аналитика и прогнозы на основе статистических данных.</p>
              <p>2.2. Информационные материалы о предстоящих спортивных событиях.</p>
              <p>2.3. Консультации по вопросам спортивной статистики.</p>
              
              <p><strong>3. Ответственность</strong></p>
              <p>3.1. Мы не несем ответственности за результаты принятых вами решений на основе предоставленной информации.</p>
              <p>3.2. Вся информация носит рекомендательный характер и не является руководством к действию.</p>
              
              <p><strong>4. Конфиденциальность</strong></p>
              <p>4.1. Мы гарантируем конфиденциальность персональных данных клиентов.</p>
              <p>4.2. Информация о подписчиках не передается третьим лицам.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showUserAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#0a1b2a] text-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative border border-gold-500 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gold-400">Пользовательское соглашение</h2>
            <div className="space-y-4 text-sm">
              <p><strong>1. Принятие условий</strong></p>
              <p>1.1. Используя наши услуги, вы автоматически соглашаетесь с условиями данного соглашения.</p>
              <p>1.2. Если вы не согласны с условиями, прекратите использование наших услуг.</p>
              
              <p><strong>2. Описание услуг</strong></p>
              <p>2.1. Мы предоставляем информационно-аналитические материалы в сфере спорта.</p>
              <p>2.2. Услуги включают прогнозы, статистику и экспертные комментарии.</p>
              
              <p><strong>3. Права пользователя</strong></p>
              <p>3.1. Получать качественную информацию в соответствии с выбранным тарифом.</p>
              <p>3.2. Обращаться в службу поддержки по любым вопросам.</p>
              <p>3.3. Отказаться от услуг в любое время.</p>
              
              <p><strong>4. Обязанности пользователя</strong></p>
              <p>4.1. Использовать информацию исключительно в личных целях.</p>
              <p>4.2. Не распространять полученные материалы третьим лицам.</p>
              <p>4.3. Соблюдать законодательство своей страны.</p>
              
              <p><strong>5. Ограничения</strong></p>
              <p>5.1. Мы не гарантируем 100% точность прогнозов.</p>
              <p>5.2. Вся информация носит исключительно рекомендательный характер.</p>
            </div>
            <button
              onClick={() => setShowUserAgreement(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-[#0a1b2a] text-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative border border-gold-500 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gold-400">Политика конфиденциальности</h2>
            <div className="space-y-4 text-sm">
              <p><strong>1. Сбор информации</strong></p>
              <p>1.1. Мы собираем только необходимую для предоставления услуг информацию.</p>
              <p>1.2. Персональные данные включают: имя пользователя, Telegram-тег, дату регистрации.</p>
              
              <p><strong>2. Использование данных</strong></p>
              <p>2.1. Персональные данные используются исключительно для предоставления услуг.</p>
              <p>2.2. Мы можем использовать данные для улучшения качества сервиса.</p>
              <p>2.3. Информация может использоваться для уведомлений о новых услугах.</p>
              
              <p><strong>3. Защита данных</strong></p>
              <p>3.1. Мы применяем современные методы защиты информации.</p>
              <p>3.2. Доступ к персональным данным имеют только уполномоченные сотрудники.</p>
              <p>3.3. Данные хранятся на защищенных серверах.</p>
              
              <p><strong>4. Передача третьим лицам</strong></p>
              <p>4.1. Мы не продаем и не передаем персональные данные третьим лицам.</p>
              <p>4.2. Исключение составляют случаи, предусмотренные законодательством.</p>
              
              <p><strong>5. Права пользователя</strong></p>
              <p>5.1. Вы имеете право запросить удаление своих персональных данных.</p>
              <p>5.2. Вы можете получить информацию о том, какие данные мы о вас храним.</p>
              <p>5.3. Вы можете отозвать согласие на обработку персональных данных.</p>
              
              <p><strong>6. Контакты</strong></p>
              <p>6.1. По вопросам обработки персональных данных обращайтесь: @bos0009</p>
            </div>
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

// App with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/verify-email" element={<EmailVerification />} />
      </Routes>
    </Router>
  );
}

export default App;