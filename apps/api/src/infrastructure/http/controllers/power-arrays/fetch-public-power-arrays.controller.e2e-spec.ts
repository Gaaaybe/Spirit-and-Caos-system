import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('FetchPublicPowerArraysController (e2e)', () => {
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
      name: 'Array Publisher',
      email: 'arraypublisher@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'arraypublisher@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Chama Eterna',
        descricao: 'Uma chama que nunca se apaga e queima com intensidade crescente.',
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 2, duracao: 3 },
        effects: [{ effectBaseId: 'dano', grau: 4, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });

    // Create a public power array
    await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Acervo Público de Fogo',
        descricao: 'Coleção pública de poderes elementais de fogo para todos os conjuradores.',
        dominio: { name: 'natural' },
        powerIds: [powerRes.body.id],
        isPublic: true,
      });

    // Create a private power array (should not appear in public list)
    await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Acervo Privado',
        descricao: 'Coleção privada que não deve aparecer na lista pública de acervos.',
        dominio: { name: 'natural' },
        powerIds: [powerRes.body.id],
        isPublic: false,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /power-arrays — should return 200 and only public arrays (no auth)', async () => {
    const response = await request(app.getHttpServer()).get('/power-arrays');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const names = response.body.map((a: { nome: string }) => a.nome);
    expect(names).toContain('Acervo Público de Fogo');
    expect(names).not.toContain('Acervo Privado');
  });

  test('[GET] /power-arrays — should return 200 with pagination', async () => {
    const response = await request(app.getHttpServer()).get('/power-arrays?page=1');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('[GET] /power-arrays — each item should have correct shape', async () => {
    const response = await request(app.getHttpServer()).get('/power-arrays');
    expect(response.statusCode).toBe(200);

    for (const item of response.body) {
      expect(item).toMatchObject({
        id: expect.any(String),
        nome: expect.any(String),
        isPublic: true,
        dominio: expect.objectContaining({ name: expect.any(String) }),
        custoTotal: expect.objectContaining({
          pda: expect.any(Number),
          pe: expect.any(Number),
          espacos: expect.any(Number),
        }),
        powers: expect.any(Array),
      });
    }
  });
});
