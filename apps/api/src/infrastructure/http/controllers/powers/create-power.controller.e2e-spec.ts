import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('CreatePowerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  const validBody = {
    nome: 'Raio Arcano',
    descricao: 'Dispara um raio de energia arcana contra um alvo.',
    dominio: { name: 'natural' },
    parametros: { acao: 1, alcance: 2, duracao: 0 },
    effects: [
      {
        effectBaseId: 'dano',
        grau: 3,
        modifications: [],
      },
    ],
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
      name: 'Power User',
      email: 'poweruser@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'poweruser@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /powers — should create and return 201 with power', async () => {
    const response = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      nome: 'Raio Arcano',
      descricao: 'Dispara um raio de energia arcana contra um alvo.',
      isPublic: false,
      dominio: { name: 'natural', areaConhecimento: null, peculiarId: null },
      parametros: { acao: 1, alcance: 2, duracao: 0 },
      custoTotal: {
        pda: expect.any(Number),
        pe: expect.any(Number),
        espacos: expect.any(Number),
      },
      effects: expect.arrayContaining([
        expect.objectContaining({
          effectBaseId: 'dano',
          grau: 3,
        }),
      ]),
    });
  });

  test('[POST] /powers — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post('/powers').send(validBody);

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /powers — should return 400 when body is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'A', // too short
        descricao: 'curta', // too short
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 2, duracao: 0 },
        effects: [], // min 1
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /powers — should return 400 for domain cientifico without areaConhecimento', async () => {
    const response = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBody,
        dominio: { name: 'cientifico' },
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /powers — should create public power when isPublic is true', async () => {
    const response = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validBody, isPublic: true });

    expect(response.statusCode).toBe(201);
    expect(response.body.isPublic).toBe(true);
  });

  test('[POST] /powers — should accept notas field', async () => {
    const response = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validBody, notas: 'Observação importante sobre o poder.' });

    expect(response.statusCode).toBe(201);
    expect(response.body.notas).toBe('Observação importante sobre o poder.');
  });
});
