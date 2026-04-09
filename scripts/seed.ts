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
        ('Baluwatar Premier Residence', 'Fully furnished 4-Aana modern house with parking facility.', 'Kathmandu', 'House', 'For Sale', 45000000, 4, 3, $1, 'Owner very motivated to sell.'),
        ('Jhamsikhel Studio Apartment', 'Premium 2BHK located in the heart of Jhamsikhel VIP residential area.', 'Lalitpur', 'Apartment', 'For Rent', 65000, 2, 1, $2, 'Viewing arranged for next week.'),
        ('Suryabinayak 3-Aana Plot', 'South-facing residential plot highly suitable for fresh construction.', 'Bhaktapur', 'Land', 'For Sale', 8500000, 0, 0, $1, 'Negotiable price.'),
        ('Putalisadak Corporate Space', 'Spacious semi-furnished office floor with power backup.', 'Kathmandu', 'Business', 'For Lease', 150000, 5, 2, $2, 'VIP clients only.'),
        ('Imadol 2BHK Flat', 'Affordable residential setup with 24/7 water supply & parking.', 'Lalitpur', 'Flat', 'For Rent', 25000, 2, 1, $1, ''),
        ('Traditional Newari Bungalow', 'Exquisite multi-story heritage style house near Durbar Square.', 'Bhaktapur', 'House', 'For Sale', 110000000, 6, 4, $2, 'Foreigner buyers interested.'),
        ('Baneshwor Ground Floor Shutter', 'Prime shutter location on the main highway corridor.', 'Kathmandu', 'Business', 'For Lease', 45000, 1, 1, $1, ''),
        ('Godawari Greenfield Land', 'Peaceful plot spanning over an acre, suitable for resorts or high-end housing.', 'Lalitpur', 'Land', 'For Sale', 55000000, 0, 0, $2, 'Clear papers.')
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
