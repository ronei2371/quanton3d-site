import request from 'supertest';
import server from './backend/app.js';

describe('POST /ask', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('returns 200 OK with a reply for valid messages', async () => {
    const response = await request(server)
      .post('/api/ask')
      .send({ message: 'Olá, bot!', sessionId: 'session-123' });

    expect(response.status).toBe(200);
    expect(response.body.reply).toMatch(/Mensagem recebida/);
    expect(response.body.sessionId).toBe('session-123');
    expect(response.body.received).toEqual({ message: 'Olá, bot!' });
  });

  it('returns 400 Bad Request when message is empty', async () => {
    const response = await request(server)
      .post('/api/ask')
      .send({ message: '', sessionId: 'session-123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid request body');
    expect(response.body.errors?.message?.[0]).toMatch(/empty/);
  });
});
