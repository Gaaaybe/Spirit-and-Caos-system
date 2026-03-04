import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('UpdatePeculiarityController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let otherAccessToken: string;
  let peculiarityId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Usuário principal
    await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      email: 'update-peculiarity@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'update-peculiarity@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    // Segundo usuário (para testar 403)
    await request(app.getHttpServer()).post('/users').send({
      name: 'Jane Doe',
      email: 'update-peculiarity-other@example.com',
      password: '123456',
    });

    const otherAuthResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'update-peculiarity-other@example.com',
      password: '123456',
    });

    otherAccessToken = otherAuthResponse.body.access_token;

    // Cria a peculiaridade do usuário principal
    const createResponse = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Telecinese',
        descricao: 'Capacidade de mover objetos com a força da mente.',
        espiritual: false,
        isPublic: false,
      });

    peculiarityId = createResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PUT] /peculiarities/:id — should update and return the peculiarity', async () => {
    const response = await request(app.getHttpServer())
      .put(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Telecinese Avançada',
        descricao: 'Capacidade de mover objetos com a força da mente com grande precisão.',
        espiritual: true,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: peculiarityId,
      nome: 'Telecinese Avançada',
      espiritual: true,
    });
  });

  test('[PUT] /peculiarities/:id — should return 403 when user is not the owner', async () => {
    const response = await request(app.getHttpServer())
      .put(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({
        nome: 'Tentando mudar',
      });

    expect(response.statusCode).toBe(403);
  });

  test('[PUT] /peculiarities/:id — should return 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .put('/peculiarities/non-existent-id-00000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Nome Novo Que Nao Existe',
      });

    expect(response.statusCode).toBe(404);
  });

  test('[PUT] /peculiarities/:id — should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .put(`/peculiarities/${peculiarityId}`)
      .send({ nome: 'Sem Token' });

    expect(response.statusCode).toBe(401);
  });

  test('[PUT] /peculiarities/:id — should return 400 when body is invalid', async () => {
    const response = await request(app.getHttpServer())
      .put(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        espiritual: 'não é boolean',
      });

    expect(response.statusCode).toBe(400);
  });
});
