// MongoDB initialization script for production
db = db.getSiblingDB('sport_predictions');

// Create collections
db.createCollection('users');
db.createCollection('matches');
db.createCollection('predictions');
db.createCollection('stats');

// Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "telegram_id": 1 }, { sparse: true });
db.users.createIndex({ "created_at": 1 });

db.matches.createIndex({ "match_date": 1 });
db.matches.createIndex({ "sport": 1 });
db.matches.createIndex({ "match_time": 1 });
db.matches.createIndex({ "team1": 1 });
db.matches.createIndex({ "team2": 1 });

db.predictions.createIndex({ "match_id": 1 });
db.predictions.createIndex({ "user_id": 1 });
db.predictions.createIndex({ "created_at": 1 });

db.stats.createIndex({ "date": 1 });
db.stats.createIndex({ "type": 1 });

print('MongoDB initialized successfully for sport_predictions');