import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('CreatePowerArrayController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
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
      name: 'Array Creator',
      email: 'arraycreator@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'arraycreator@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Bola de Fogo',
        descricao: 'Projétil de fogo que explode ao atingir o alvo.',
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 2, duracao: 0 },
        effects: [{ effectBaseId: 'dano', grau: 3, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });

    powerId = powerRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /power-arrays — should create and return 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Conjunto de Ataque',
        descricao: 'Uma coleção de poderes ofensivos para combate direto.',
        dominio: { name: 'natural' },
        powerIds: [powerId],
        isPublic: false,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      nome: 'Conjunto de Ataque',
      descricao: 'Uma coleção de poderes ofensivos para combate direto.',
      isPublic: false,
      dominio: { name: 'natural', areaConhecimento: null, peculiarId: null },
      parametrosBase: null,
      custoTotal: {
        pda: expect.any(Number),
        pe: expect.any(Number),
        espacos: expect.any(Number),
      },
      powers: expect.arrayContaining([expect.objectContaining({ id: powerId })]),
    });
  });

  test('[POST] /power-arrays — should return 404 when power not found', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Inválido Array',
        descricao: 'Array com poder inexistente no banco de dados.',
        dominio: { name: 'natural' },
        powerIds: ['00000000-0000-0000-0000-000000000000'],
        isPublic: false,
      });

    expect(response.statusCode).toBe(404);
  });

  test('[POST] /power-arrays — should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-arrays')
      .send({
        nome: 'Sem Auth',
        descricao: 'Tentativa de criar array sem autenticação válida.',
        dominio: { name: 'natural' },
        powerIds: [powerId],
        isPublic: false,
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /power-arrays — should return 400 with invalid body', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'A',
        powerIds: [],
      });

    expect(response.statusCode).toBe(400);
  });
});
