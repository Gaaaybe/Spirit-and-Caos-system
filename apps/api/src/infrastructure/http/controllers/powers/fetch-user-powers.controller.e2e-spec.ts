import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('FetchUserPowersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let otherAccessToken: string;

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
      name: 'Fetch User Powers',
      email: 'fetchuserpowers@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'fetchuserpowers@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    // Segundo usuário (para garantir isolamento)
    await request(app.getHttpServer()).post('/users').send({
      name: 'Other User Powers',
      email: 'otheruserpowers@example.com',
      password: '123456',
    });

    const otherAuth = await request(app.getHttpServer()).post('/auth').send({
      email: 'otheruserpowers@example.com',
      password: '123456',
    });
    otherAccessToken = otherAuth.body.access_token;

    // Cria 3 poderes para o usuário principal (públicos e privados)
    for (const [nome, isPublic] of [
      ['Raio Solar', false],
      ['Escudo de Luz', true],
      ['Cura Menor', false],
    ] as [string, boolean][]) {
      await request(app.getHttpServer())
        .post('/powers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome,
          descricao: `Descrição detalhada do poder ${nome}.`,
          dominio: { name: 'natural' },
          parametros: { acao: 1, alcance: 1, duracao: 0 },
          effects: [{ effectBaseId: 'dano', grau: 1, modifications: [] }],
          globalModifications: [],
          isPublic,
        });
    }

    // Cria 1 poder para o outro usuário (não deve aparecer na listagem do principal)
    await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({
        nome: 'Poder do Outro',
        descricao: 'Este poder pertence a outro usuário.',
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 1, duracao: 0 },
        effects: [{ effectBaseId: 'dano', grau: 1, modifications: [] }],
        globalModifications: [],
        isPublic: true,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /powers/me — should return only the authenticated user powers', async () => {
    const response = await request(app.getHttpServer())
      .get('/powers/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);

    const nomes = response.body.map((p: { nome: string }) => p.nome);
    expect(nomes).toContain('Raio Solar');
    expect(nomes).toContain('Escudo de Luz');
    expect(nomes).toContain('Cura Menor');
    expect(nomes).not.toContain('Poder do Outro');
  });

  test('[GET] /powers/me — should return correct power shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/powers/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      nome: expect.any(String),
      dominio: expect.objectContaining({ name: expect.any(String) }),
      parametros: expect.objectContaining({
        acao: expect.any(Number),
        alcance: expect.any(Number),
        duracao: expect.any(Number),
      }),
      custoTotal: expect.objectContaining({
        pda: expect.any(Number),
        pe: expect.any(Number),
        espacos: expect.any(Number),
      }),
      effects: expect.any(Array),
      isPublic: expect.any(Boolean),
    });
  });

  test('[GET] /powers/me?page=1 — should paginate correctly', async () => {
    const response = await request(app.getHttpServer())
      .get('/powers/me?page=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /powers/me — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/powers/me');

    expect(response.statusCode).toBe(401);
  });
});
