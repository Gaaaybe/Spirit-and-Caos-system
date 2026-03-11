import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('UpdatePowerArrayController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let powerArrayId: string;
  let powerId: string;

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
      name: 'Array Updater',
      email: 'arrayupdater@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'arrayupdater@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Flecha de Luz',
        descricao: 'Uma flecha de energia luminosa que atravessa as sombras.',
        dominio: { name: 'sagrado' },
        parametros: { acao: 1, alcance: 3, duracao: 0 },
        effects: [{ effectBaseId: 'dano', grau: 2, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });
    powerId = powerRes.body.id;

    const arrayRes = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Coleção Sagrada',
        descricao: 'Conjunto de poderes sagrados para combate contra criaturas sombrias.',
        dominio: { name: 'sagrado' },
        powerIds: [powerId],
        isPublic: false,
      });
    powerArrayId = arrayRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PUT] /power-arrays/:id — should update and return 200', async () => {
    const response = await request(app.getHttpServer())
      .put(`/power-arrays/${powerArrayId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Arsenal Divino' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: powerArrayId,
      nome: 'Arsenal Divino',
      dominio: { name: 'sagrado' },
    });
  });

  test('[PUT] /power-arrays/:id — should return 404 for nonexistent id', async () => {
    const response = await request(app.getHttpServer())
      .put('/power-arrays/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Fantasma' });

    expect(response.statusCode).toBe(404);
  });

  test('[PUT] /power-arrays/:id — should return 403 if another user tries to update', async () => {
    await request(app.getHttpServer()).post('/users').send({
      name: 'Outsider',
      email: 'outsider_array@example.com',
      password: '123456',
    });
    const auth2 = await request(app.getHttpServer()).post('/auth').send({
      email: 'outsider_array@example.com',
      password: '123456',
    });

    const response = await request(app.getHttpServer())
      .put(`/power-arrays/${powerArrayId}`)
      .set('Authorization', `Bearer ${auth2.body.access_token}`)
      .send({ nome: 'Invasor' });

    expect(response.statusCode).toBe(403);
  });

  test('[PUT] /power-arrays/:id — should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .put(`/power-arrays/${powerArrayId}`)
      .send({ nome: 'Sem Token' });

    expect(response.statusCode).toBe(401);
  });
});
