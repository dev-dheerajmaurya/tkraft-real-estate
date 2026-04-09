import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // Pretend to securely decode a JWT via headers!
  const is_admin = req.headers.get('x-user-role') === 'admin';
  const adminSelectField = is_admin ? ', p.internal_status_notes' : '';
  
  // Basic pagination handling
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 10;
  
  const queryParams: any[] = [];
  let whereClause = 'WHERE 1=1'; // simple hack so we can just append 'AND' logic
  
  // Handy SQL injection safe filter mapper
  const applyFilter = (column: string, value: string | null, operator = '=') => {
    if (value) { 
      queryParams.push(value); 
      whereClause += ` AND ${column} ${operator} $${queryParams.length}`; 
    }
  };

  // Stack up the filters!
  applyFilter('p.suburb', searchParams.get('suburb') ? `%${searchParams.get('suburb')}%` : null, 'ILIKE');
  applyFilter('p.property_type', searchParams.get('type'));
  applyFilter('p.status', searchParams.get('status'));

  // Slice up hyphenated price ranges smoothly
  const priceRange = searchParams.get('price');
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-');
    applyFilter('p.price', minPrice, '>=');
    if (maxPrice) { 
      applyFilter('p.price', maxPrice, '<='); 
    }
  }

  // Push pagination limits safely
  queryParams.push(limit, (page - 1) * limit);
  
  const rawSql = `
    SELECT p.*, a.name as agent_name ${adminSelectField} 
    FROM properties p 
    JOIN agents a ON p.agent_id = a.id 
    ${whereClause} 
    ORDER BY p.id DESC 
    LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
  `;

  try {
    const results = await pool.query(rawSql, queryParams);
    return NextResponse.json({ data: results.rows });
  } catch (err) {
    console.error("Database died while fetching list:", err);
    return NextResponse.json({ error: 'Failed DB query' }, { status: 500 });
  }
}