const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Supabase PostgreSQL connection...');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 3,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  });

  try {
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test query
    const [results] = await sequelize.query('SELECT version()');
    console.log('📊 PostgreSQL version:', results[0].version);
    
    // Test if we can create a simple table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table creation test successful!');
    
    // Insert test data
    await sequelize.query(`
      INSERT INTO test_table (name) VALUES ('Connection Test')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Data insertion test successful!');
    
    // Query test data
    const [testData] = await sequelize.query('SELECT * FROM test_table LIMIT 1');
    console.log('✅ Data query test successful:', testData[0]);
    
    // Clean up
    await sequelize.query('DROP TABLE IF EXISTS test_table');
    console.log('✅ Cleanup successful!');
    
    console.log('\n🎉 All tests passed! Your Supabase database is ready.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Fix: Check your password in DATABASE_URL');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Fix: Check your database name and project reference');
    } else if (error.message.includes('connection refused')) {
      console.error('\n💡 Fix: Check your Supabase project is running');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testConnection();