import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/accounts/application/useCases/authenticate-user';
import { RegisterUserUseCase } from '@/domain/accounts/application/useCases/register-user';
import { CopyPublicPowerUseCase } from '@/domain/power-manager/application/use-cases/copy-public-power';
import { CreatePeculiarityUseCase } from '@/domain/power-manager/application/use-cases/create-peculiarity';
import { CreatePowerUseCase } from '@/domain/power-manager/application/use-cases/create-power';
import { CreatePowerArrayUseCase } from '@/domain/power-manager/application/use-cases/create-power-array';
import { DeletePeculiarityUseCase } from '@/domain/power-manager/application/use-cases/delete-peculiarity';
import { DeletePowerUseCase } from '@/domain/power-manager/application/use-cases/delete-power';
import { DeletePowerArrayUseCase } from '@/domain/power-manager/application/use-cases/delete-power-array';
import { FetchEffectsUseCase } from '@/domain/power-manager/application/use-cases/fetch-effects';
import { FetchModificationsUseCase } from '@/domain/power-manager/application/use-cases/fetch-modifications';
import { FetchPowerArraysUseCase } from '@/domain/power-manager/application/use-cases/fetch-public-power-arrays';
import { FetchPowersUseCase } from '@/domain/power-manager/application/use-cases/fetch-public-powers';
import { FetchUserPeculiaritiesUseCase } from '@/domain/power-manager/application/use-cases/fetch-user-peculiarities';
import { FetchUserPowerArraysUseCase } from '@/domain/power-manager/application/use-cases/fetch-user-power-arrays';
import { FetchUserPowersUseCase } from '@/domain/power-manager/application/use-cases/fetch-user-powers';
import { GetPeculiarityByIdUseCase } from '@/domain/power-manager/application/use-cases/get-peculiarity-by-id';
import { GetPowerArrayByIdUseCase } from '@/domain/power-manager/application/use-cases/get-power-array-by-id';
import { GetPowerByIdUseCase } from '@/domain/power-manager/application/use-cases/get-power-by-id';
import { UpdatePeculiarityUseCase } from '@/domain/power-manager/application/use-cases/update-peculiarity';
import { UpdatePowerUseCase } from '@/domain/power-manager/application/use-cases/update-power';
import { UpdatePowerArrayUseCase } from '@/domain/power-manager/application/use-cases/update-power-array';
import { PowerCostCalculator } from '@/domain/power-manager/enterprise/services/power-cost-calculator';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { DatabaseModule } from '../database/database.module';
import { CatalogService } from '../services/catalog.service';
import { AuthenticateController } from './controllers/authenticate-user.controller';
import { CatalogController } from './controllers/catalog/catalog.controller';
import { FetchEffectsController } from './controllers/catalog/fetch-effects.controller';
import { FetchModificationsController } from './controllers/catalog/fetch-modifications.controller';
import { CreatePeculiarityController } from './controllers/peculiarities/create-peculiarity.controller';
import { DeletePeculiarityController } from './controllers/peculiarities/delete-peculiarity.controller';
import { FetchUserPeculiaritiesController } from './controllers/peculiarities/fetch-user-peculiarities.controller';
import { GetPeculiarityByIdController } from './controllers/peculiarities/get-peculiarity-by-id.controller';
import { UpdatePeculiarityController } from './controllers/peculiarities/update-peculiarity.controller';
import { CreatePowerArrayController } from './controllers/power-arrays/create-power-array.controller';
import { DeletePowerArrayController } from './controllers/power-arrays/delete-power-array.controller';
import { FetchPublicPowerArraysController } from './controllers/power-arrays/fetch-public-power-arrays.controller';
import { FetchUserPowerArraysController } from './controllers/power-arrays/fetch-user-power-arrays.controller';
import { GetPowerArrayByIdController } from './controllers/power-arrays/get-power-array-by-id.controller';
import { UpdatePowerArrayController } from './controllers/power-arrays/update-power-array.controller';
import { CopyPublicPowerController } from './controllers/powers/copy-public-power.controller';
import { CreatePowerController } from './controllers/powers/create-power.controller';
import { DeletePowerController } from './controllers/powers/delete-power.controller';
import { FetchPublicPowersController } from './controllers/powers/fetch-public-powers.controller';
import { FetchUserPowersController } from './controllers/powers/fetch-user-powers.controller';
import { GetPowerByIdController } from './controllers/powers/get-power-by-id.controller';
import { UpdatePowerController } from './controllers/powers/update-power.controller';
import { RegisterUserController } from './controllers/register-user.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    RegisterUserController,
    CatalogController,
    AuthenticateController,
    FetchEffectsController,
    FetchModificationsController,
    CreatePeculiarityController,
    FetchUserPeculiaritiesController,
    GetPeculiarityByIdController,
    UpdatePeculiarityController,
    DeletePeculiarityController,
    CreatePowerController,
    UpdatePowerController,
    FetchUserPowersController,
    FetchPublicPowersController,
    GetPowerByIdController,
    DeletePowerController,
    CopyPublicPowerController,
    CreatePowerArrayController,
    UpdatePowerArrayController,
    DeletePowerArrayController,
    FetchUserPowerArraysController,
    FetchPublicPowerArraysController,
    GetPowerArrayByIdController,
  ],
  providers: [
    RegisterUserUseCase,
    CatalogService,
    AuthenticateUserUseCase,
    FetchEffectsUseCase,
    FetchModificationsUseCase,
    CreatePeculiarityUseCase,
    FetchUserPeculiaritiesUseCase,
    GetPeculiarityByIdUseCase,
    UpdatePeculiarityUseCase,
    DeletePeculiarityUseCase,
    CreatePowerUseCase,
    UpdatePowerUseCase,
    GetPowerByIdUseCase,
    DeletePowerUseCase,
    FetchPowersUseCase,
    FetchUserPowersUseCase,
    CopyPublicPowerUseCase,
    PowerCostCalculator,
    CreatePowerArrayUseCase,
    UpdatePowerArrayUseCase,
    DeletePowerArrayUseCase,
    GetPowerArrayByIdUseCase,
    FetchPowerArraysUseCase,
    FetchUserPowerArraysUseCase,
  ],
})
export class HttpModule {}
