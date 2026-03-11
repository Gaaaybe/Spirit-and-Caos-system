import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('AuthenticateController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /auth — should return 200 with access_token', async () => {
    const response = await request(app.getHttpServer()).post('/auth').send({
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
  });

  test('[POST] /auth — should return 401 when password is wrong', async () => {
    const response = await request(app.getHttpServer()).post('/auth').send({
      email: 'johndoe@example.com',
      password: 'wrong-password',
    });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /auth — should return 401 when email does not exist', async () => {
    const response = await request(app.getHttpServer()).post('/auth').send({
      email: 'nonexistent@example.com',
      password: '123456',
    });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /auth — should return 400 when body is invalid', async () => {
    const response = await request(app.getHttpServer()).post('/auth').send({
      email: 'not-an-email',
    });

    expect(response.statusCode).toBe(400);
  });
});
