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
        ('Ramesh Shrestha', 'ramesh.shrestha@tkraftrealty.com.np', '+977-9841234567'),
        ('Sunita Tamang', 'sunita.tamang@tkraftrealty.com.np', '+977-9857654321')
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
        ('4BHK Bungalow in Budhanilkantha', 'Spacious 4-bedroom bungalow with a private garden, parking for 2 cars, and mountain views. Located in a quiet lane of Budhanilkantha, ideal for families seeking peace without sacrificing city access.', 'Kathmandu', 'House', 'For Sale', 42500000, 4, 3, $1, 'Owner very motivated to sell.'),
        ('2BHK Apartment in Pulchowk', 'Fully furnished 2-bedroom apartment on the 3rd floor of a gated complex. Includes 24hr security, backup power, and covered parking. Walking distance from Pulchowk Engineering Campus.', 'Lalitpur', 'Apartment', 'For Rent', 55000, 2, 2, $2, 'Viewing arranged for next week.'),
        ('5 Aana Plot in Suryabinayak', 'Flat, road-facing 5 aana land in the heart of Suryabinayak. Suitable for residential construction. All government paperwork cleared. Water and electricity connections available at plot edge.', 'Bhaktapur', 'Land', 'For Sale', 7200000, 0, 0, $1, 'Negotiable price.'),
        ('Commercial Office Space in New Baneshwor', '3,200 sq ft open-plan office space on the 4th floor of a modern building. Fibre internet ready, conference room, and dedicated washroom. Suitable for IT companies or corporate HQs.', 'Kathmandu', 'Business', 'For Lease', 175000, 0, 2, $2, 'VIP clients only.'),
        ('Cozy 2BHK Flat in Imadol', 'Compact 2-bedroom flat in a well-maintained building. Tiled floors, attached bathroom, kitchen with chimney setup included. Ideal for young professionals or small families. Near Imadol Chowk.', 'Lalitpur', 'Flat', 'For Rent', 22000, 2, 1, $1, ''),
        ('Heritage-Style House in Dattatreya Tole', '6-bedroom traditional newari-style banglow with original woodwork, inner courtyard, and rooftop access overlooking Dattatreya Square. A rare opportunity in the heritage zone of Bhaktapur.', 'Bhaktapur', 'House', 'For Sale', 98000000, 6, 4, $2, 'Foreigner buyers interested.'),
        ('Prime Retail Shop in Asan Bazaar', 'Ground floor corner shop with 400 sq ft area in the busiest retail belt of Kathmandu. High foot traffic, dual entrance, storage room at back. Ideal for grocery, clothing, or food outlet.', 'Kathmandu', 'Business', 'For Lease', 40000, 0, 1, $1, ''),
        ('12 Aana Agricultural Land in Godawari', 'Fertile agricultural land in the outskirts of Lalitpur near Godawari. Suitable for organic farming or future residential development. Road access from Godawari main road. No disputes on ownership.', 'Lalitpur', 'Land', 'For Sale', 48000000, 0, 0, $2, 'Clear papers.')
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
