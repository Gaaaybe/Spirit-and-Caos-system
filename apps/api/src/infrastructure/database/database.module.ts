import { Module } from '@nestjs/common';
import { UsersRepository } from '@/domain/accounts/application/repositories/users-repository';
import { ItemsRepository } from '@/domain/item-manager/application/repositories/items-repository';
import { PowersLookupPort } from '@/domain/item-manager/application/repositories/powers-lookup-port';
import { PowerArraysLookupPort } from '@/domain/item-manager/application/repositories/power-arrays-lookup-port';
import { EffectsRepository } from '@/domain/power-manager/application/repositories/effects-repository';
import { ModificationsRepository } from '@/domain/power-manager/application/repositories/modifications-repository';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';
import { PowerArraysRepository } from '@/domain/power-manager/application/repositories/power-arrays-repository';
import { PowersRepository } from '@/domain/power-manager/application/repositories/powers-repository';
import { PrismaPowersLookupAdapter } from './prisma-powers-lookup-adapter';
import { PrismaPowerArraysLookupAdapter } from './prisma-power-arrays-lookup-adapter';
import { PrismaService } from './prisma/prisma.service';
import { PrismaEffectsRepository } from './prisma/repositories/prisma-effects-repository';
import { PrismaItemsRepository } from './prisma/repositories/prisma-items-repository';
import { PrismaModificationsRepository } from './prisma/repositories/prisma-modifications-repository';
import { PrismaPeculiaritiesRepository } from './prisma/repositories/prisma-peculiarities-repository';
import { PrismaPowerArraysRepository } from './prisma/repositories/prisma-power-arrays-repository';
import { PrismaPowersRepository } from './prisma/repositories/prisma-powers-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';

@Module({
  providers: [
    PrismaService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: PowersRepository, useClass: PrismaPowersRepository },
    { provide: PowerArraysRepository, useClass: PrismaPowerArraysRepository },
    { provide: PeculiaritiesRepository, useClass: PrismaPeculiaritiesRepository },
    { provide: ModificationsRepository, useClass: PrismaModificationsRepository },
    { provide: EffectsRepository, useClass: PrismaEffectsRepository },
    { provide: ItemsRepository, useClass: PrismaItemsRepository },
    { provide: PowersLookupPort, useClass: PrismaPowersLookupAdapter },
    { provide: PowerArraysLookupPort, useClass: PrismaPowerArraysLookupAdapter },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    PowersRepository,
    PowerArraysRepository,
    PeculiaritiesRepository,
    ModificationsRepository,
    EffectsRepository,
    ItemsRepository,
    PowersLookupPort,
    PowerArraysLookupPort,
  ],
})
export class DatabaseModule {}
