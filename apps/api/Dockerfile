# Build stage
FROM node:22-alpine AS builder

# Habilita o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instala todas as dependências (necessárias para o build) e gera o client do prisma
RUN pnpm install --frozen-lockfile

# Copia o código-fonte
COPY . .

# Faz o build da aplicação NestJS
RUN pnpm run build

# Production stage
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia pacotes para produção (apenas dependências de produção)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instala apenas as dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copia os arquivos transpilados do estágio de build
COPY --from=builder /app/dist ./dist

# Garante que o Prisma tenha os binários necessários gerados para produção
RUN pnpm prisma generate

# Define ambiente de produção
ENV NODE_ENV=production

# A porta padrão do NestJS (pode ser sobrescrita via docker-compose)
EXPOSE 3333

# O script de início real será passado pelo docker-compose para rodar as migrations antes
CMD ["pnpm", "run", "start:prod"]