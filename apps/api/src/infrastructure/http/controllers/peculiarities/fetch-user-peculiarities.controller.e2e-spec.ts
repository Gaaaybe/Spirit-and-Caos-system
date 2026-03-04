import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('FetchUserPeculiaritiesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      email: 'fetch-peculiarities@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'fetch-peculiarities@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    // Cria 3 peculiaridades para listar
    for (const nome of ['Telepatia', 'Invisibilidade', 'Voo']) {
      await request(app.getHttpServer())
        .post('/peculiarities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome,
          descricao: `Descrição detalhada da peculiaridade ${nome}.`,
          espiritual: false,
          isPublic: true,
        });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /peculiarities — should return list of user peculiarities', async () => {
    const response = await request(app.getHttpServer())
      .get('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      nome: expect.any(String),
      descricao: expect.any(String),
      espiritual: expect.any(Boolean),
      isPublic: expect.any(Boolean),
    });
  });

  test('[GET] /peculiarities?page=1 — should paginate correctly', async () => {
    const response = await request(app.getHttpServer())
      .get('/peculiarities?page=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /peculiarities — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/peculiarities');

    expect(response.statusCode).toBe(401);
  });
});
