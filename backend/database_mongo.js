const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection URL
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sport_predictions';

let db = null;
let client = null;

// Connect to MongoDB
const connectDatabase = async () => {
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB database');
    return db;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
};

// Get database instance
const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
};

// Enhanced sport-specific analyses
const sportAnalyses = {
  football: [
    'Домашняя команда демонстрирует феноменальную статистику дома - 12 побед в 15 последних матчах. Сила домашних стен очевидна.',
    'Анализ xG (ожидаемых голов) показывает значительное превосходство первой команды в создании голевых моментов.',
    'Ключевой нападающий команды набрал отличную форму - 8 голов в последних 6 матчах. Рекомендуем ставку на его результативность.',
    'Тактическая схема 4-3-3 идеально подходит против обороны соперника. Ожидаем доминирование в средней линии.',
    'Статистика личных встреч впечатляет: 7 побед из 10 последних матчей. Психологическое преимущество налицо.',
    'Травма ключевого защитника соперника открывает уязвимости в обороне. Видим отличную ценность в атакующих ставках.',
    'Команда показывает невероятную стабильность в обороне - всего 3 пропущенных гола в последних 8 матчах.',
    'Мотивация максимальная: команде нужны очки для выхода в еврокубки. Ожидаем самоотдачу на 200%.',
    'Погодные условия (дождь) благоприятствуют силовому стилю игры фаворита. Техническое преимущество сохраняется.',
    'Глубина скамейки запасных позволяет ротировать состав без потери качества. Свежесть игроков - решающий фактор.'
  ],
  hockey: [
    'Команда демонстрирует потрясающую игру в большинстве - 78% реализации в последних 10 матчах. Дисциплина соперника под вопросом.',
    'Вратарь находится в феноменальной форме: 94.2% отражённых бросков за последние 5 игр. Крепость ворот обеспечена.',
    'Первое звено показывает невероятную результативность - 15 очков в последних 4 матчах. Химия на льду очевидна.',
    'Физическая подготовка команды позволяет доминировать в третьем периоде. 60% голов забивается в финальной трети.',
    'Тренерская схема с активным форчекингом идеально работает против стиля игры соперника.',
    'Домашний лёд даёт решающее преимущество - команда не проигрывала дома уже 12 матчей подряд.',
    'Статистика бросков в створ впечатляет: 38 бросков в среднем за матч против 24 у соперника.',
    'Молодые игроки набирают невероятный темп - 3 новичка уже набрали по 20+ очков за сезон.',
    'Опыт в плей-офф играет решающую роль. Команда знает, как выигрывать важные матчи под давлением.',
    'Травмы ключевых игроков соперника серьёзно ослабляют их шансы. Глубина состава не позволяет полноценно заменить.'
  ],
  baseball: [
    'Стартовый питчер демонстрирует выдающуюся статистику: ERA 2.15 в последних 8 играх. Контроль подачи безупречен.',
    'Команда сильна против левосторонних питчеров - batting average .312 в текущем сезоне.',
    'Домашнее поле даёт серьёзные преимущества: особенности ветра и размеры поля играют в пользу хозяев.',
    'Буллпен команды показывает стабильность - только 2 провала в последних 15 матчах.',
    'Статистика с бегунами в скоринговой позиции впечатляет: 67% успешных ситуаций.',
    'Команда традиционно сильна в дневных играх - 18 побед в 24 дневных матчах сезона.',
    'Психологический фактор: команда выиграла 8 из последних 10 встреч с этим соперником.',
    'Менеджер принимает правильные тактические решения в критических моментах игры.',
    'Глубина ротации питчеров позволяет не зависеть от одного игрока. Стабильность обеспечена.',
    'Мотивация на пике: команда борется за wild card место в плей-офф.'
  ],
  esports: [
    'Map pool команды идеально подходит под формат турнира. Доминирование на 4 из 7 карт очевидно.',
    'Синхронизация действий команды достигла пика - только 2 ошибки в коммуникации за последние 5 матчей.',
    'AWP-ер команды показывает феноменальную точность: 78% попаданий в голову в решающих раундах.',
    'Тактическая подготовка на высочайшем уровне: 15 новых стратегий отработано за последний месяц.',
    'Опыт в клатчевых ситуациях неоценим - команда выигрывает 73% раундов при численном меньшинстве.',
    'Ментальная устойчивость игроков проверена в крупных турнирах. Давление не сломает команду.',
    'Индивидуальное мастерство каждого игрока превосходит средний уровень соперника на 15-20%.',
    'Адаптивность команды позволяет быстро перестраиваться под стиль игры противника.',
    'Физическая форма игроков оптимальна: полноценный сон и тренировки дают преимущество в концентрации.',
    'Аналитическая работа тренерского штаба выявила слабые места в игре соперника.'
  ]
};

// Initialize MongoDB collections and insert initial data
const initDatabase = async () => {
  try {
    if (!db) {
      await connectDatabase();
    }

    // Create indexes for better performance with error handling
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (error) {
      if (error.code !== 85) { // Index already exists
        console.log('Email index already exists or created successfully');
      }
    }
    
    // Handle telegram_user_id index separately with better error handling
    try {
      // First try to drop existing problematic index if it exists
      try {
        await db.collection('users').dropIndex('telegram_user_id_1');
        console.log('Dropped existing telegram_user_id index');
      } catch (dropError) {
        // Index doesn't exist, that's fine
      }
      
      // Create new index with correct configuration
      await db.collection('users').createIndex(
        { telegram_user_id: 1 }, 
        { 
          unique: true,
          partialFilterExpression: { telegram_user_id: { $exists: true, $ne: null } }
        }
      );
      console.log('✅ Created telegram_user_id index successfully');
    } catch (error) {
      console.error('❌ Error with telegram_user_id index:', error.message);
      // Continue without this index - the app can still work
    }
    
    try {
      await db.collection('users').createIndex({ verification_token: 1 }, { sparse: true });
    } catch (error) {
      if (error.code !== 85) {
        console.log('Verification token index already exists');
      }
    }
    
    try {
      await db.collection('users').createIndex({ password_reset_token: 1 }, { sparse: true });
    } catch (error) {
      if (error.code !== 85) {
        console.log('Password reset token index already exists');
      }
    }
    
    await db.collection('matches').createIndex({ match_date: 1 });
    await db.collection('matches').createIndex({ sport: 1 });
    await db.collection('predictions').createIndex({ sport: 1 });
    await db.collection('predictions').createIndex({ match_date: 1 });
    await db.collection('telegram_auth_sessions').createIndex({ auth_token: 1 }, { unique: true });
    await db.collection('telegram_auth_sessions').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

    // Initialize stats collection if empty
    const statsCount = await db.collection('stats').countDocuments();
    if (statsCount === 0) {
      await db.collection('stats').insertOne({
        total_predictions: 1567,
        success_rate: 82.3,
        active_bettors: 6234,
        monthly_wins: 458,
        total_matches_analyzed: 2341,
        ai_prediction_accuracy: 78.9,
        updated_at: new Date()
      });
    }

    // Initialize match_analyses collection with sport-specific analyses
    const analysesCount = await db.collection('match_analyses').countDocuments();
    if (analysesCount === 0) {
      const analyses = [];
      for (const [sport, analyses_list] of Object.entries(sportAnalyses)) {
        for (const analysis of analyses_list) {
          analyses.push({
            analysis_text: analysis,
            sport: sport,
            category: 'expert',
            confidence_weight: 1.0,
            created_at: new Date()
          });
        }
      }
      
      if (analyses.length > 0) {
        await db.collection('match_analyses').insertMany(analyses);
      }
    }

    console.log('✅ MongoDB database initialized successfully');
    console.log(`📊 Sport-specific analyses available`);
    
    // Log statistics
    for (const [sport, analyses] of Object.entries(sportAnalyses)) {
      console.log(`   ${sport}: ${analyses.length} expert analyses`);
    }

  } catch (error) {
    console.error('❌ Error initializing MongoDB database:', error);
    throw error;
  }
};

// Get sport-specific analysis
const getSportAnalysis = async (sport) => {
  try {
    if (!db) {
      await connectDatabase();
    }

    // Try to get sport-specific analysis
    const analyses = await db.collection('match_analyses')
      .find({ sport: sport })
      .toArray();
    
    if (analyses.length > 0) {
      const randomIndex = Math.floor(Math.random() * analyses.length);
      return analyses[randomIndex].analysis_text;
    }
    
    // Fallback to any analysis
    const fallbackAnalyses = await db.collection('match_analyses')
      .find({})
      .limit(1)
      .toArray();
    
    if (fallbackAnalyses.length > 0) {
      return fallbackAnalyses[0].analysis_text;
    }
    
    return 'Экспертный анализ доступен в VIP-канале.';
  } catch (error) {
    console.error('Error getting sport analysis:', error);
    return 'Детальный анализ матча доступен подписчикам.';
  }
};

// Update team statistics
const updateTeamStats = async (teamName, sport, matchResult) => {
  try {
    if (!db) {
      await connectDatabase();
    }

    await db.collection('team_stats').updateOne(
      { team_name: teamName, sport: sport },
      {
        $inc: {
          wins: matchResult.wins || 0,
          losses: matchResult.losses || 0,
          draws: matchResult.draws || 0
        },
        $set: {
          last_updated: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating team stats:', error);
  }
};

// Get team statistics for prediction enhancement
const getTeamStats = async (teamName, sport) => {
  try {
    if (!db) {
      await connectDatabase();
    }

    return await db.collection('team_stats').findOne({ 
      team_name: teamName, 
      sport: sport 
    });
  } catch (error) {
    console.error('Error getting team stats:', error);
    return null;
  }
};

// Create Telegram auth session
const createTelegramAuthSession = async (authToken, userEmail = null) => {
  try {
    if (!db) {
      await connectDatabase();
    }

    const session = {
      auth_token: authToken,
      user_email: userEmail,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      status: 'pending', // pending, confirmed, expired
      telegram_chat_id: null,
      telegram_user_info: null
    };

    await db.collection('telegram_auth_sessions').insertOne(session);
    return session;
  } catch (error) {
    console.error('Error creating Telegram auth session:', error);
    throw error;
  }
};

// Update Telegram auth session
const updateTelegramAuthSession = async (authToken, updateData) => {
  try {
    if (!db) {
      await connectDatabase();
    }

    const result = await db.collection('telegram_auth_sessions').updateOne(
      { auth_token: authToken },
      { $set: { ...updateData, updated_at: new Date() } }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating Telegram auth session:', error);
    throw error;
  }
};

// Get Telegram auth session
const getTelegramAuthSession = async (authToken) => {
  try {
    if (!db) {
      await connectDatabase();
    }

    return await db.collection('telegram_auth_sessions').findOne({ auth_token: authToken });
  } catch (error) {
    console.error('Error getting Telegram auth session:', error);
    return null;
  }
};

// Close database connection
const closeDatabase = async () => {
  try {
    if (client) {
      await client.close();
      db = null;
      client = null;
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

module.exports = {
  connectDatabase,
  getDatabase,
  initDatabase,
  getSportAnalysis,
  updateTeamStats,
  getTeamStats,
  closeDatabase,
  sportAnalyses,
  createTelegramAuthSession,
  updateTelegramAuthSession,
  getTelegramAuthSession
};