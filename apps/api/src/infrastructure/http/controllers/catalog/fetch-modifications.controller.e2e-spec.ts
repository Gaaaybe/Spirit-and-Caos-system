import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('FetchModificationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();

    await prisma.modificationBase.createMany({
      data: [
        {
          id: 'alcance-extra',
          nome: 'Alcance Extra',
          tipo: 'EXTRA',
          custoFixo: 0,
          custoPorGrau: 1,
          descricao: 'Aumenta o alcance do efeito.',
          categoria: 'Parâmetros',
        },
        {
          id: 'dano-reduzido',
          nome: 'Dano Reduzido',
          tipo: 'FALHA',
          custoFixo: -1,
          custoPorGrau: 0,
          descricao: 'O dano causado é reduzido.',
          categoria: 'Restrição',
        },
        {
          id: 'duracao-extra',
          nome: 'Duração Extra',
          tipo: 'EXTRA',
          custoFixo: 0,
          custoPorGrau: 2,
          descricao: 'Aumenta a duração do efeito.',
          categoria: 'Parâmetros',
        },
        {
          id: 'custo-alto',
          nome: 'Custo Alto',
          tipo: 'FALHA',
          custoFixo: -2,
          custoPorGrau: 0,
          descricao: 'O poder tem custo aumentado.',
          categoria: 'Restrição',
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /modifications — should return 200 with all modifications', async () => {
    const response = await request(app.getHttpServer()).get('/modifications');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(4);
  });

  test('[GET] /modifications — should return modifications with correct shape', async () => {
    const response = await request(app.getHttpServer()).get('/modifications');

    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      nome: expect.any(String),
      tipo: expect.any(String),
      custoFixo: expect.any(Number),
      custoPorGrau: expect.any(Number),
      descricao: expect.any(String),
      categoria: expect.any(String),
    });
  });

  test('[GET] /modifications?type=extra — should return only extras', async () => {
    const response = await request(app.getHttpServer()).get('/modifications?type=extra');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    for (const mod of response.body) {
      expect(mod.tipo).toBe('extra');
    }
  });

  test('[GET] /modifications?type=falha — should return only falhas', async () => {
    const response = await request(app.getHttpServer()).get('/modifications?type=falha');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    for (const mod of response.body) {
      expect(mod.tipo).toBe('falha');
    }
  });

  test('[GET] /modifications?category=Parâmetros — should return only that category', async () => {
    const response = await request(app.getHttpServer()).get(
      '/modifications?category=Par%C3%A2metros',
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    for (const mod of response.body) {
      expect(mod.categoria).toBe('Parâmetros');
    }
  });

  test('[GET] /modifications?category=Inexistente — should return empty array', async () => {
    const response = await request(app.getHttpServer()).get(
      '/modifications?category=Inexistente',
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});
