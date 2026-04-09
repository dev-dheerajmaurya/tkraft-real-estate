import pool from '../lib/db';

// Handy dev script to wipe constraints and dump mock properties!
async function main() {
  console.log('Hold tight, starting DB seeding...');

  try {
    // 1. Safely nuke existing schemas
    await pool.query(`DROP TABLE IF EXISTS properties CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS agents CASCADE;`);

    // 2. Setup structural DB schemas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        suburb VARCHAR(100) NOT NULL,
        property_type VARCHAR(50) NOT NULL,
        price NUMERIC(15, 2) NOT NULL,
        bedrooms INT NOT NULL,
        bathrooms INT NOT NULL,
        agent_id INT REFERENCES agents(id),
        status VARCHAR(50) NOT NULL DEFAULT 'For Sale',
        internal_status_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Add sweet performance indexes for scale!
    await pool.query(`CREATE INDEX idx_suburb ON properties(suburb);`);
    await pool.query(`CREATE INDEX idx_type ON properties(property_type);`);
    await pool.query(`CREATE INDEX idx_price ON properties(price);`);

    // 4. Inject hard-working fake agents
    const agentsRes = await pool.query(`
      INSERT INTO agents (name, email, phone) 
      VALUES 
        ('Alice Wonder', 'alice@techkraft.com', '+977-9800000001'),
        ('Bob Builder', 'bob@techkraft.com', '+977-9800000002')
      RETURNING id;
    `);
    
    const aliceId = agentsRes.rows[0].id;
    const bobId = agentsRes.rows[1].id;
    console.log(`Agents seeded: ${agentsRes.rowCount}`);

    // 5. Inject handcrafted matrix of Nepal properties!
    const propertiesRes = await pool.query(`
      INSERT INTO properties 
        (title, description, suburb, property_type, status, price, bedrooms, bathrooms, agent_id, internal_status_notes)
      VALUES 
        ('Luxury Family House', 'Beautiful 4-bedroom house with a large backyard.', 'Kathmandu', 'House', 'For Sale', 45000000, 4, 3, $1, 'Owner very motivated to sell.'),
        ('Modern City Apartment', 'Sleek 2-bedroom apartment right in the center.', 'Lalitpur', 'Apartment', 'For Rent', 15000000, 2, 1, $2, 'Viewing arranged for next week.'),
        ('Residential Plot', 'Perfect empty land to build your dream home.', 'Bhaktapur', 'Land', 'For Sale', 8500000, 0, 0, $1, 'Negotiable price.'),
        ('Commercial IT Space', 'Fully equipped 5-room office space.', 'Kathmandu', 'Business', 'For Lease', 85000000, 5, 2, $2, 'VIP clients only.'),
        ('Budget Flat', 'A cozy flat suited for a small family.', 'Lalitpur', 'Flat', 'For Rent', 9000000, 2, 1, $1, ''),
        ('Heritage Banglow', 'Traditional architectural banglow in Durbar square perimeter.', 'Bhaktapur', 'House', 'For Sale', 110000000, 6, 4, $2, 'Foreigner buyers interested.'),
        ('Retail Shop Space', 'Ground floor shop near main road.', 'Kathmandu', 'Business', 'For Lease', 25000000, 1, 1, $1, ''),
        ('Spacious Outer Land', 'Large agricultural land for future investments.', 'Lalitpur', 'Land', 'For Sale', 55000000, 0, 0, $2, 'Clear papers.')
      RETURNING id;
    `, [aliceId, bobId]);

    console.log(`Properties seeded: ${propertiesRes.rowCount}`);

  } catch (error) {
    console.error('Error seeding DB:', error);
  } finally {
    // Safely put the pool connection to sleep
    await pool.end();
  }
}

main();
