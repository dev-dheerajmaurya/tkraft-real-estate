import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../app/api/listings/route';
import pool from '../lib/db';

// Blindfold the native PG-pool to save the live DB!
vi.mock('../lib/db', () => ({
  default: { query: vi.fn() }
}));

describe('Listings API GET Engine', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('drops internal notes out of the payload for normal viewers', async () => {
    // Simulate simple DB response
    (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 1, title: 'House 1' }] });

    // Hit API as an anonymous user
    const req = new Request('http://localhost/api/listings');
    const response = await GET(req);
    await response.json();

    // Verify successful fetch
    expect(response.status).toBe(200);
    
    // Grab the raw backend SQL query
    const sqlPassedToDb = (pool.query as any).mock.calls[0][0];
    
    // Verify code protected the secret column!
    expect(sqlPassedToDb).not.toContain('p.internal_status_notes');
  });

  it('preserves internal notes in the payload when simulated admin check fires', async () => {
    // DB response with VIP Admin data
    (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 1, title: 'House 1', internal_status_notes: 'VIP client' }] });

    // Hit API flashing the Admin badge
    const req = new Request('http://localhost/api/listings', {
      headers: new Headers({ 'x-user-role': 'admin' })
    });
    
    const response = await GET(req);
    await response.json();

    expect(response.status).toBe(200);
    
    // Verify SQL safely fetched the hidden treasure!
    const sqlPassedToDb = (pool.query as any).mock.calls[0][0];
    expect(sqlPassedToDb).toContain('p.internal_status_notes');
  });

});
