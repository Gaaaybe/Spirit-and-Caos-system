import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('FetchPublicPowersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

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
      name: 'Fetch Powers User',
      email: 'fetchpowers@example.com',
      password: '123456',
    });

    accessToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'fetchpowers@example.com',
        password: '123456',
      })
    ).body.access_token;

    const powerBase = {
      dominio: { name: 'natural' },
      parametros: { acao: 1, alcance: 1, duracao: 0 },
      effects: [{ effectBaseId: 'dano', grau: 1, modifications: [] }],
      globalModifications: [],
    };

    await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...powerBase,
        nome: 'Poder Público Alpha',
        descricao: 'Descrição do poder público alpha para teste.',
        isPublic: true,
      });

    await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...powerBase,
        nome: 'Poder Público Beta',
        descricao: 'Descrição do poder público beta para teste.',
        isPublic: true,
      });

    await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...powerBase,
        nome: 'Poder Privado',
        descricao: 'Este poder é privado e não deve aparecer na listagem.',
        isPublic: false,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /powers — should return 200 without auth', async () => {
    const response = await request(app.getHttpServer()).get('/powers');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /powers — should return only public powers', async () => {
    const response = await request(app.getHttpServer()).get('/powers');

    expect(response.statusCode).toBe(200);
    for (const power of response.body) {
      expect(power.isPublic).toBe(true);
    }
  });

  test('[GET] /powers — each item should have correct shape', async () => {
    const response = await request(app.getHttpServer()).get('/powers');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      nome: expect.any(String),
      isPublic: true,
      dominio: expect.any(Object),
      parametros: expect.any(Object),
      custoTotal: expect.any(Object),
      effects: expect.any(Array),
    });
  });
});
