import React, { useState, useEffect } from 'react';
import { matchesAPI } from '../services/api';

const TodayMatches = () => {
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Sport icons and names mapping - only baseball and hockey
  const sportsInfo = {
    baseball: {
      name: 'Бейсбол',
      icon: '⚾',
      color: 'from-blue-500 to-blue-700'
    },
    hockey: {
      name: 'Хоккей',
      icon: '🏒',
      color: 'from-purple-500 to-purple-700'
    }
  };

  // Load today's matches
  const loadMatches = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Загружаем матчи на сегодня...');
      
      const response = await matchesAPI.getTodayMatches();
      const data = response.data;
      
      console.log('✅ Получены данные матчей:', data);
      
      if (data.success) {
        setMatches(data.matches);
        setLastUpdated(new Date());
        console.log(`✅ Загружено матчей: ${data.total}`);
      } else {
        setError('Не удалось загрузить матчи');
        console.error('❌ Backend вернул success: false');
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки матчей:', err);
      if (err.code === 'NETWORK_ERROR' || err.message.includes('CORS')) {
        setError('Ошибка подключения к серверу. Проверьте что backend запущен на localhost:8001');
      } else if (err.response?.status === 500) {
        setError('Ошибка сервера. Проверьте логи backend');
      } else {
        setError(`Ошибка загрузки матчей: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    
    // Auto refresh every 30 minutes
    const interval = setInterval(loadMatches, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format match time from UTC/GMT to HH:MM format for Moscow timezone
  const formatMatchTime = (matchTime) => {
    try {
      const date = new Date(matchTime);
      // Convert to Moscow timezone (UTC+3)
      const moscowTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
      return moscowTime.toTimeString().slice(0, 5); // Get HH:MM format
    } catch (error) {
      return '??:??';
    }
  };

  // Get color class for odds based on value
  const getOddsColor = (odds) => {
    const oddsValue = parseFloat(odds);
    if (oddsValue <= 1.5) return 'text-green-400'; // Low odds - green
    if (oddsValue <= 2.5) return 'text-yellow-400'; // Medium odds - yellow
    return 'text-red-400'; // High odds - red
  };

  // Get match status with appropriate styling
  const getMatchStatus = (match) => {
    const now = new Date();
    const matchTime = new Date(match.match_time);
    const timeDiff = matchTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Check if match has explicit status
    if (match.status) {
      switch (match.status.toLowerCase()) {
        case 'live':
        case 'live_match':
          return {
            text: 'ИДЁТ МАТЧ',
            icon: '🔴',
            color: 'text-red-300',
            bgColor: 'bg-red-500/20 border border-red-500/50'
          };
        case 'finished':
        case 'completed':
          return {
            text: 'ЗАВЕРШЁН',
            icon: '✅',
            color: 'text-gray-300',
            bgColor: 'bg-gray-500/20 border border-gray-500/50'
          };
        case 'scheduled':
        default:
          return {
            text: 'ЗАПЛАНИРОВАН',
            icon: '⏰',
            color: 'text-blue-300',
            bgColor: 'bg-blue-500/20 border border-blue-500/50'
          };
      }
    }

    // Fallback: determine status based on time
    if (minutesDiff < -120) { // More than 2 hours passed
      return {
        text: 'ЗАВЕРШЁН',
        icon: '✅',
        color: 'text-gray-300',
        bgColor: 'bg-gray-500/20 border border-gray-500/50'
      };
    } else if (minutesDiff >= -120 && minutesDiff <= 120) { // Within 2 hours
      return {
        text: 'ВОЗМОЖНО ИДЁТ',
        icon: '🟡',
        color: 'text-orange-300',
        bgColor: 'bg-orange-500/20 border border-orange-500/50'
      };
    } else {
      return {
        text: 'ЗАПЛАНИРОВАН',
        icon: '⏰',
        color: 'text-blue-300',
        bgColor: 'bg-blue-500/20 border border-blue-500/50'
      };
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-600 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-600 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-white mb-4">Матчи на сегодня</h3>
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-300">{error}</p>
              <p className="text-xs text-gray-400 mt-2">
                Матчи обновляются 2 раза в день: 09:00 и 19:00 МСК
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const totalMatches = Object.values(matches).reduce((sum, sportMatches) => sum + sportMatches.length, 0);

  if (totalMatches === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-white mb-4">Матчи на сегодня</h3>
            <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-300 mb-3">На сегодня матчей не найдено</p>
              <p className="text-xs text-gray-400">
                Матчи обновляются 2 раза в день: 09:00 и 19:00 МСК
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-white mb-4">Матчи на сегодня</h3>
          <p className="text-xl text-gray-300 mb-4">
            Экспертный анализ и коэффициенты на {totalMatches} матчей
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-400">
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
            </p>
          )}
        </div>

        {/* Sports sections */}
        <div className="space-y-8">
          {Object.entries(matches).map(([sport, sportMatches]) => {
            const sportInfo = sportsInfo[sport];
            if (!sportInfo || sportMatches.length === 0) return null;

            return (
              <div key={sport} className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gold-500/20">
                {/* Sport header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${sportInfo.color} flex items-center justify-center text-2xl`}>
                    {sportInfo.icon}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">{sportInfo.name}</h4>
                    <p className="text-gray-300">{sportMatches.length} {sportMatches.length === 1 ? 'матч' : 'матчей'}</p>
                  </div>
                </div>

                {/* Matches grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {sportMatches.map((match) => (
                    <div key={match.id} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700 hover:border-gold-500/50 transition-all">
                      {/* Match header with team logos */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1">
                          <div className="flex items-center justify-center space-x-3 mb-2">
                            {match.logo_team1 ? (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                                {match.team1.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                                {match.team1.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="text-lg font-semibold text-white">
                              {match.team1}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">vs</div>
                          <div className="flex items-center justify-center space-x-3 mt-2">
                            <div className="text-lg font-semibold text-white">
                              {match.team2}
                            </div>
                            {match.logo_team2 ? (
                              <img 
                                src={`https://cors-anywhere.herokuapp.com/${match.logo_team2}`} 
                                alt={match.team2}
                                className="w-8 h-8 rounded-full object-contain bg-white/10 p-1"
                                onError={(e) => {
                                  console.log(`❌ Failed to load logo for ${match.team2}`);
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                                {match.team2.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold-400 font-bold text-lg">
                            {formatMatchTime(match.match_time)}
                          </div>
                          <div className="text-xs text-gray-400">МСК</div>
                          
                          {/* Match Status */}
                          <div className={`mt-2 inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getMatchStatus(match).bgColor} ${getMatchStatus(match).color}`}>
                            <span>{getMatchStatus(match).icon}</span>
                            <span>{getMatchStatus(match).text}</span>
                          </div>
                        </div>
                      </div>

                      {/* Odds */}
                      <div className="bg-black/30 rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-400 mb-2 text-center">Коэффициенты</div>
                        <div className="flex justify-center space-x-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-400 mb-1">П1</div>
                            <div className={`font-bold ${getOddsColor(match.odds_team1)}`}>
                              {match.odds_team1}
                            </div>
                          </div>
                          {match.odds_draw && (
                            <div className="text-center">
                              <div className="text-xs text-gray-400 mb-1">X</div>
                              <div className={`font-bold ${getOddsColor(match.odds_draw)}`}>
                                {match.odds_draw}
                              </div>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-xs text-gray-400 mb-1">П2</div>
                            <div className={`font-bold ${getOddsColor(match.odds_team2)}`}>
                              {match.odds_team2}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analysis */}
                      <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg p-3 border border-gold-500/20">
                        <div className="flex items-start space-x-2">
                          <div className="text-gold-400 text-lg">💡</div>
                          <div>
                            <div className="text-xs text-gold-400 font-semibold mb-1">ЭКСПЕРТНЫЙ АНАЛИЗ</div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {match.analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-[#0088cc]/20 to-[#0088cc]/30 rounded-xl p-6 border border-[#0088cc]/40">
            <h4 className="text-2xl font-bold text-white mb-3">Хотите больше анализов?</h4>
            <p className="text-gray-300 mb-4">
              Получите детальные прогнозы и эксклюзивную аналитику в нашем VIP-канале
            </p>
            <a
              href="https://t.me/+UD8DYv3MgfUxNWU6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#0088cc] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#0077bb] transition-all duration-300 transform hover:scale-105 shadow-lg min-w-[200px]"
            >
              <span>Забрать</span>
            </a>
          </div>
        </div>
        
        {/* Real Data Info */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
            <span className="text-green-400">✅</span>
            <span className="text-green-300 text-sm font-medium">100% реальные данные из официальных API</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodayMatches;