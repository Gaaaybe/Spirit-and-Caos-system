import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('FetchPublicPeculiaritiesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'Peculiarity Publisher',
      email: 'peculiarity-publisher@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'peculiarity-publisher@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    // Cria peculiaridades públicas
    for (const nome of ['Telepatia', 'Regeneração']) {
      await request(app.getHttpServer())
        .post('/peculiarities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome,
          descricao: `Descrição detalhada da peculiaridade ${nome} disponível ao público.`,
          espiritual: false,
          isPublic: true,
        });
    }

    // Cria uma peculiaridade privada (não deve aparecer)
    await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Invisibilidade',
        descricao: 'Capacidade de se tornar completamente invisível para todos.',
        espiritual: false,
        isPublic: false,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /peculiarities/public — should return 200 without authentication', async () => {
    const response = await request(app.getHttpServer()).get('/peculiarities/public');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /peculiarities/public — should return only public peculiarities', async () => {
    const response = await request(app.getHttpServer()).get('/peculiarities/public');

    expect(response.statusCode).toBe(200);

    const nomes = response.body.map((p: { nome: string }) => p.nome);
    expect(nomes).toContain('Telepatia');
    expect(nomes).toContain('Regeneração');
    expect(nomes).not.toContain('Invisibilidade');
  });

  test('[GET] /peculiarities/public — should return 200 with pagination', async () => {
    const response = await request(app.getHttpServer()).get('/peculiarities/public?page=1');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /peculiarities/public — each item should have correct shape', async () => {
    const response = await request(app.getHttpServer()).get('/peculiarities/public');
    expect(response.statusCode).toBe(200);

    for (const item of response.body) {
      expect(item).toMatchObject({
        id: expect.any(String),
        nome: expect.any(String),
        descricao: expect.any(String),
        espiritual: expect.any(Boolean),
        isPublic: true,
      });
    }
  });
});
