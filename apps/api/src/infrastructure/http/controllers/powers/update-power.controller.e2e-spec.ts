import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('UpdatePowerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let powerId: string;

  const basePowerBody = {
    nome: 'Relâmpago Certeiro',
    descricao: 'Um raio preciso que atinge o alvo com velocidade extrema.',
    dominio: { name: 'natural' },
    parametros: { acao: 1, alcance: 3, duracao: 0 },
    effects: [{ effectBaseId: 'dano', grau: 2, modifications: [] }],
    globalModifications: [],
    isPublic: false,
  };

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
      name: 'Power Updater',
      email: 'powerupdater@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'powerupdater@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(basePowerBody);

    powerId = powerRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PUT] /powers/:id — should update nome and return 200', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Relâmpago Devastador' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: powerId,
      nome: 'Relâmpago Devastador',
      descricao: 'Um raio preciso que atinge o alvo com velocidade extrema.',
      dominio: { name: 'natural' },
    });
  });

  test('[PUT] /powers/:id — should update effects and recalculate custoTotal', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        effects: [{ effectBaseId: 'dano', grau: 5, modifications: [] }],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.effects[0].grau).toBe(5);
    expect(response.body.custoTotal).toMatchObject({
      pda: expect.any(Number),
      pe: expect.any(Number),
      espacos: expect.any(Number),
    });
  });

  test('[PUT] /powers/:id — should update dominio', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ dominio: { name: 'sagrado' } });

    expect(response.statusCode).toBe(200);
    expect(response.body.dominio.name).toBe('sagrado');
  });

  test('[PUT] /powers/:id — should update notas', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ notas: 'Anotação de teste atualizada.' });

    expect(response.statusCode).toBe(200);
    expect(response.body.notas).toBe('Anotação de teste atualizada.');
  });

  test('[PUT] /powers/:id — should make power public', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isPublic: true });

    expect(response.statusCode).toBe(200);
    expect(response.body.isPublic).toBe(true);
  });

  test('[PUT] /powers/:id — should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .send({ nome: 'Sem Token' });

    expect(response.statusCode).toBe(401);
  });

  test('[PUT] /powers/:id — should return 404 for nonexistent power', async () => {
    const response = await request(app.getHttpServer())
      .put('/powers/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Fantasma' });

    expect(response.statusCode).toBe(404);
  });

  test('[PUT] /powers/:id — should return 403 if another user tries to update', async () => {
    await request(app.getHttpServer()).post('/users').send({
      name: 'Invasor',
      email: 'invasor_power@example.com',
      password: '123456',
    });
    const auth2 = await request(app.getHttpServer()).post('/auth').send({
      email: 'invasor_power@example.com',
      password: '123456',
    });

    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${auth2.body.access_token}`)
      .send({ nome: 'Tentativa Invasão' });

    expect(response.statusCode).toBe(403);
  });

  test('[PUT] /powers/:id — should return 400 for invalid body (nome too short)', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'A' });

    expect(response.statusCode).toBe(400);
  });

  test('[PUT] /powers/:id — should return 400 for dominio cientifico without areaConhecimento', async () => {
    const response = await request(app.getHttpServer())
      .put(`/powers/${powerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ dominio: { name: 'cientifico' } });

    expect(response.statusCode).toBe(400);
  });
});
