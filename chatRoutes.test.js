import request from 'supertest';
import server from './server.js';

afterAll((done) => {
  server.close(done);
});

describe('POST /ask', () => {

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

describe('POST /register-user', () => {
  it('returns 201 Created for valid users', async () => {
    const response = await request(server)
      .post('/api/register-user')
      .send({
        name: 'User Test',
        phone: '11999998888',
        email: 'user@test.com',
        resin: 'Iron',
        problemType: 'Adesao',
        sessionId: 'session-987'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toMatch(/Usuário registrado/i);
    expect(response.body.user.sessionId).toBe('session-987');
  });
});
