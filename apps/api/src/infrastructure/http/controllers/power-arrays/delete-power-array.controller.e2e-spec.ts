import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('DeletePowerArrayController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let powerArrayId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();

    await prisma.effectBase.upsert({
      where: { id: 'dano' },
      create: {
        id: 'dano',
        nome: 'Dano',
        custoBase: 2,
        descricao: 'Causa dano a um alvo.',
        categorias: ['Ataque'],
        parametrosPadraoAcao: 1,
        parametrosPadraoAlcance: 1,
        parametrosPadraoDuracao: 0,
        requerInput: false,
      },
      update: {},
    });

    await request(app.getHttpServer()).post('/users').send({
      name: 'Array Deleter',
      email: 'arraydeleter@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'arraydeleter@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Tempestade Arcana',
        descricao: 'Uma grande tempestade de magia arcana que destrói tudo ao seu redor.',
        dominio: { name: 'psiquico' },
        parametros: { acao: 2, alcance: 4, duracao: 1 },
        effects: [{ effectBaseId: 'dano', grau: 5, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });

    const arrayRes = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Kit de Destruição',
        descricao: 'Coleção de poderes destrutivos para situações de emergência absoluta.',
        dominio: { name: 'psiquico' },
        powerIds: [powerRes.body.id],
        isPublic: false,
      });
    powerArrayId = arrayRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[DELETE] /power-arrays/:id — should return 403 if another user tries to delete', async () => {
    await request(app.getHttpServer()).post('/users').send({
      name: 'Invader',
      email: 'invader_array@example.com',
      password: '123456',
    });
    const auth2 = await request(app.getHttpServer()).post('/auth').send({
      email: 'invader_array@example.com',
      password: '123456',
    });

    const response = await request(app.getHttpServer())
      .delete(`/power-arrays/${powerArrayId}`)
      .set('Authorization', `Bearer ${auth2.body.access_token}`);

    expect(response.statusCode).toBe(403);
  });

  test('[DELETE] /power-arrays/:id — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).delete(`/power-arrays/${powerArrayId}`);
    expect(response.statusCode).toBe(401);
  });

  test('[DELETE] /power-arrays/:id — should return 204 and delete the array', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/power-arrays/${powerArrayId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);
  });

  test('[DELETE] /power-arrays/:id — should return 404 after deletion', async () => {
    const response = await request(app.getHttpServer())
      .get(`/power-arrays/${powerArrayId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
