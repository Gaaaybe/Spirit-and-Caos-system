import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('CreatePeculiarityController (e2e)', () => {
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
      email: 'johndoe@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'johndoe@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /peculiarities — should create and return 201 with peculiarity', async () => {
    const response = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Telepatia',
        descricao: 'Capacidade de ler mentes e se comunicar mentalmente.',
        espiritual: true,
        isPublic: false,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      nome: 'Telepatia',
      descricao: 'Capacidade de ler mentes e se comunicar mentalmente.',
      espiritual: true,
      isPublic: false,
    });
  });

  test('[POST] /peculiarities — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post('/peculiarities').send({
      nome: 'Telepatia',
      descricao: 'Capacidade de ler mentes e se comunicar mentalmente.',
      espiritual: true,
    });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /peculiarities — should return 400 when body is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'AB', // min 3 chars na entidade, mas o schema aceita 2 — testa campo faltando
        // descricao ausente
        espiritual: 'não é boolean',
      });

    expect(response.statusCode).toBe(400);
  });
});
