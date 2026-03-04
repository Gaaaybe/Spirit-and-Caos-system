import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('FetchEffectsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();

    await prisma.effectBase.createMany({
      data: [
        {
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
        {
          id: 'escudo',
          nome: 'Escudo',
          custoBase: 1,
          descricao: 'Cria uma barreira protetora.',
          categorias: ['Defesa'],
          parametrosPadraoAcao: 1,
          parametrosPadraoAlcance: 0,
          parametrosPadraoDuracao: 1,
          requerInput: false,
        },
        {
          id: 'controlar',
          nome: 'Controlar',
          custoBase: 3,
          descricao: 'Controla o movimento de um alvo.',
          categorias: ['Ataque', 'Controle'],
          parametrosPadraoAcao: 2,
          parametrosPadraoAlcance: 2,
          parametrosPadraoDuracao: 1,
          requerInput: false,
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /effects — should return 200 with all effects', async () => {
    const response = await request(app.getHttpServer()).get('/effects');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(3);
  });

  test('[GET] /effects — should return effects with correct shape', async () => {
    const response = await request(app.getHttpServer()).get('/effects');

    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      nome: expect.any(String),
      custoBase: expect.any(Number),
      descricao: expect.any(String),
      categorias: expect.any(Array),
      parametrosPadrao: {
        acao: expect.any(Number),
        alcance: expect.any(Number),
        duracao: expect.any(Number),
      },
      requerInput: expect.any(Boolean),
    });
  });

  test('[GET] /effects?category=Ataque — should return only effects from that category', async () => {
    const response = await request(app.getHttpServer()).get('/effects?category=Ataque');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    for (const effect of response.body) {
      expect(effect.categorias).toContain('Ataque');
    }
  });

  test('[GET] /effects?category=Defesa — should return only Defesa effects', async () => {
    const response = await request(app.getHttpServer()).get('/effects?category=Defesa');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('escudo');
  });

  test('[GET] /effects?category=Inexistente — should return empty array', async () => {
    const response = await request(app.getHttpServer()).get('/effects?category=Inexistente');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});
