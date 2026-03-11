import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('FetchUserPowerArraysController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let otherAccessToken: string;
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

    // Usuário principal
    await request(app.getHttpServer()).post('/users').send({
      name: 'Fetch User Arrays',
      email: 'fetchuserarrays@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'fetchuserarrays@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    // Segundo usuário (para garantir isolamento)
    await request(app.getHttpServer()).post('/users').send({
      name: 'Other User Arrays',
      email: 'otheruserarrays@example.com',
      password: '123456',
    });

    const otherAuth = await request(app.getHttpServer()).post('/auth').send({
      email: 'otheruserarrays@example.com',
      password: '123456',
    });
    otherAccessToken = otherAuth.body.access_token;

    // Cria poder base para usar nos acervos
    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Relâmpago',
        descricao: 'Descarga de energia elétrica.',
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 2, duracao: 0 },
        effects: [{ effectBaseId: 'dano', grau: 2, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });
    powerId = powerRes.body.id;

    // Cria 2 acervos para o usuário principal
    for (const [nome, isPublic] of [
      ['Acervo do Trovão', false],
      ['Acervo da Luz', true],
    ] as [string, boolean][]) {
      await request(app.getHttpServer())
        .post('/power-arrays')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome,
          descricao: `Descrição detalhada do acervo ${nome}.`,
          dominio: { name: 'natural' },
          parametrosBase: { acao: 1, alcance: 2, duracao: 0 },
          powerIds: [powerId],
          isPublic,
        });
    }

    // Cria 1 acervo para o outro usuário (não deve aparecer na listagem do principal)
    const otherPowerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({
        nome: 'Poder Alheio',
        descricao: 'Poder que pertence a outro usuário.',
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 1, duracao: 0 },
        effects: [{ effectBaseId: 'dano', grau: 1, modifications: [] }],
        globalModifications: [],
        isPublic: true,
      });

    await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({
        nome: 'Acervo do Outro',
        descricao: 'Este acervo pertence a outro usuário.',
        dominio: { name: 'natural' },
        parametrosBase: { acao: 1, alcance: 1, duracao: 0 },
        powerIds: [otherPowerRes.body.id],
        isPublic: true,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /power-arrays/me — should return only the authenticated user power arrays', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-arrays/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    const nomes = response.body.map((a: { nome: string }) => a.nome);
    expect(nomes).toContain('Acervo do Trovão');
    expect(nomes).toContain('Acervo da Luz');
    expect(nomes).not.toContain('Acervo do Outro');
  });

  test('[GET] /power-arrays/me — should return correct power array shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-arrays/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      nome: expect.any(String),
      dominio: expect.objectContaining({ name: expect.any(String) }),
      powers: expect.any(Array),
      isPublic: expect.any(Boolean),
    });
  });

  test('[GET] /power-arrays/me?page=1 — should paginate correctly', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-arrays/me?page=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /power-arrays/me — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/power-arrays/me');

    expect(response.statusCode).toBe(401);
  });
});
