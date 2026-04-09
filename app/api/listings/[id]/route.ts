import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Validate VIP admin role via headers
  const is_admin = req.headers.get('x-user-role') === 'admin';
  
  // Wait for Next.js 15+ async params
  const { id } = await params;

  try {
    const rawSql = `
      SELECT p.*, a.name as agent_name, a.email as agent_email 
      FROM properties p 
      JOIN agents a ON p.agent_id = a.id 
      WHERE p.id = $1
    `;
    
    const res = await pool.query(rawSql, [id]);
    
    if (!res.rows[0]) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    const property = res.rows[0];
    
    // Cleanly nuke secret notes for non-admins
    if (!is_admin) {
      delete property.internal_status_notes;
    }
    
    return NextResponse.json({ data: property });
  } catch (err) {
    console.error("Crash during property ID fetch:", err);
    return NextResponse.json({ error: 'Server database crash' }, { status: 500 });
  }
}