import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('CopyPublicPeculiarityController (e2e)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let otherToken: string;
  let publicPeculiarityId: string;
  let privatePeculiarityId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'Peculiarity Owner',
      email: 'peculiarity-owner@example.com',
      password: '123456',
    });
    await request(app.getHttpServer()).post('/users').send({
      name: 'Peculiarity Copier',
      email: 'peculiarity-copier@example.com',
      password: '123456',
    });

    ownerToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'peculiarity-owner@example.com',
        password: '123456',
      })
    ).body.access_token;

    otherToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'peculiarity-copier@example.com',
        password: '123456',
      })
    ).body.access_token;

    const publicPeculiarity = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        nome: 'Peculiaridade Copiável',
        descricao: 'Esta peculiaridade pública pode ser copiada por qualquer usuário.',
        espiritual: true,
        isPublic: true,
      });
    publicPeculiarityId = publicPeculiarity.body.id;

    const privatePeculiarity = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        nome: 'Peculiaridade Privada',
        descricao: 'Esta peculiaridade privada não pode ser copiada por outros usuários.',
        espiritual: false,
        isPublic: false,
      });
    privatePeculiarityId = privatePeculiarity.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /peculiarities/:id/copy — should return 201 with copied peculiarity', async () => {
    const response = await request(app.getHttpServer())
      .post(`/peculiarities/${publicPeculiarityId}/copy`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      nome: 'Peculiaridade Copiável',
      isPublic: false,
    });
    expect(response.body.id).not.toBe(publicPeculiarityId);
  });

  test('[POST] /peculiarities/:id/copy — should return 403 for private peculiarity', async () => {
    const response = await request(app.getHttpServer())
      .post(`/peculiarities/${privatePeculiarityId}/copy`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('[POST] /peculiarities/:id/copy — should return 404 for nonexistent peculiarity', async () => {
    const response = await request(app.getHttpServer())
      .post('/peculiarities/00000000-0000-0000-0000-000000000000/copy')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[POST] /peculiarities/:id/copy — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post(
      `/peculiarities/${publicPeculiarityId}/copy`,
    );

    expect(response.statusCode).toBe(401);
  });
});
