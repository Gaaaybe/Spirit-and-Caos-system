import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('DeletePeculiarityController (e2e)', () => {
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
      email: 'delete-peculiarity@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'delete-peculiarity@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    // Segundo usuário (para testar 403)
    await request(app.getHttpServer()).post('/users').send({
      name: 'Jane Doe',
      email: 'delete-peculiarity-other@example.com',
      password: '123456',
    });

    const otherAuthResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'delete-peculiarity-other@example.com',
      password: '123456',
    });

    otherAccessToken = otherAuthResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  // Cria uma nova peculiarity antes de cada teste que precisa deletar
  async function createPeculiarity(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/peculiarities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Para Deletar',
        descricao: 'Esta peculiaridade será deletada no teste seguinte.',
        espiritual: false,
        isPublic: false,
      });

    return res.body.id;
  }

  test('[DELETE] /peculiarities/:id — should return 401 without token', async () => {
    peculiarityId = await createPeculiarity();

    const response = await request(app.getHttpServer()).delete(`/peculiarities/${peculiarityId}`);

    expect(response.statusCode).toBe(401);
  });

  test('[DELETE] /peculiarities/:id — should return 403 when user is not the owner', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('[DELETE] /peculiarities/:id — should delete and return 204', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});
  });

  test('[DELETE] /peculiarities/:id — should return 404 after deletion', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/peculiarities/${peculiarityId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[DELETE] /peculiarities/:id — should return 404 for unknown id', async () => {
    const response = await request(app.getHttpServer())
      .delete('/peculiarities/non-existent-id-00000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
