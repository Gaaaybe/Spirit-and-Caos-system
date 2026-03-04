import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('GetPeculiarityByIdController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let peculiarityId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      email: 'get-peculiarity@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'get-peculiarity@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    const createResponse = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Precognição',
        descricao: 'Capacidade de prever eventos futuros com precisão.',
        espiritual: true,
        isPublic: false,
      });

    peculiarityId = createResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /peculiarities/:id — should return the peculiarity', async () => {
    const response = await request(app.getHttpServer())
      .get(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: peculiarityId,
      nome: 'Precognição',
      descricao: 'Capacidade de prever eventos futuros com precisão.',
      espiritual: true,
      isPublic: false,
    });
  });

  test('[GET] /peculiarities/:id — should return 404 when not found', async () => {
    const response = await request(app.getHttpServer())
      .get('/peculiarities/non-existent-id-00000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /peculiarities/:id — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get(`/peculiarities/${peculiarityId}`);

    expect(response.statusCode).toBe(401);
  });
});
