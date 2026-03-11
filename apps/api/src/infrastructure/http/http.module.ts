import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/accounts/application/useCases/authenticate-user';
import { RegisterUserUseCase } from '@/domain/accounts/application/useCases/register-user';
import { CopyPublicItemUseCase } from '@/domain/item-manager/application/use-cases/copy-public-item';
import { CreateItemUseCase } from '@/domain/item-manager/application/use-cases/create-item';
import { DeleteItemUseCase } from '@/domain/item-manager/application/use-cases/delete-item';
import { FetchPublicItemsUseCase } from '@/domain/item-manager/application/use-cases/fetch-public-items';
import { FetchUserItemsUseCase } from '@/domain/item-manager/application/use-cases/fetch-user-items';
import { GetItemByIdUseCase } from '@/domain/item-manager/application/use-cases/get-item-by-id';
import { UpdateItemUseCase } from '@/domain/item-manager/application/use-cases/update-item';
import { CopyPublicPeculiarityUseCase } from '@/domain/power-manager/application/use-cases/copy-public-peculiarity';
import { CopyPublicPowerUseCase } from '@/domain/power-manager/application/use-cases/copy-public-power';
import { CopyPublicPowerArrayUseCase } from '@/domain/power-manager/application/use-cases/copy-public-power-array';
import { FetchPublicPeculiaritiesUseCase } from '@/domain/power-manager/application/use-cases/fetch-public-peculiarities';
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
import { OnPowerArrayMadePublic } from '@/domain/power-manager/application/subscribers/on-power-array-made-public';
import { OnPowerMadePublic } from '@/domain/power-manager/application/subscribers/on-power-made-public';
import { PowerCostCalculator } from '@/domain/power-manager/enterprise/services/power-cost-calculator';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { DatabaseModule } from '../database/database.module';
import { CatalogService } from '../services/catalog.service';
import { AuthenticateController } from './controllers/authenticate-user.controller';
import { CatalogController } from './controllers/catalog/catalog.controller';
import { FetchEffectsController } from './controllers/catalog/fetch-effects.controller';
import { FetchModificationsController } from './controllers/catalog/fetch-modifications.controller';
import { CopyPublicPeculiarityController } from './controllers/peculiarities/copy-public-peculiarity.controller';
import { CreatePeculiarityController } from './controllers/peculiarities/create-peculiarity.controller';
import { DeletePeculiarityController } from './controllers/peculiarities/delete-peculiarity.controller';
import { FetchPublicPeculiaritiesController } from './controllers/peculiarities/fetch-public-peculiarities.controller';
import { FetchUserPeculiaritiesController } from './controllers/peculiarities/fetch-user-peculiarities.controller';
import { GetPeculiarityByIdController } from './controllers/peculiarities/get-peculiarity-by-id.controller';
import { UpdatePeculiarityController } from './controllers/peculiarities/update-peculiarity.controller';
import { CopyPublicPowerArrayController } from './controllers/power-arrays/copy-public-power-array.controller';
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
import { CopyPublicItemController } from './controllers/items/copy-public-item.controller';
import { CreateItemController } from './controllers/items/create-item.controller';
import { DeleteItemController } from './controllers/items/delete-item.controller';
import { FetchPublicItemsController } from './controllers/items/fetch-public-items.controller';
import { FetchUserItemsController } from './controllers/items/fetch-user-items.controller';
import { GetItemByIdController } from './controllers/items/get-item-by-id.controller';
import { UpdateItemController } from './controllers/items/update-item.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    RegisterUserController,
    CatalogController,
    AuthenticateController,
    FetchEffectsController,
    FetchModificationsController,
    CreatePeculiarityController,
    FetchPublicPeculiaritiesController,
    FetchUserPeculiaritiesController,
    GetPeculiarityByIdController,
    UpdatePeculiarityController,
    DeletePeculiarityController,
    CopyPublicPeculiarityController,
    CreatePowerController,
    UpdatePowerController,
    FetchUserPowersController,
    FetchPublicPowersController,
    GetPowerByIdController,
    DeletePowerController,
    CopyPublicPowerController,
    CreatePowerArrayController,
    CopyPublicPowerArrayController,
    UpdatePowerArrayController,
    DeletePowerArrayController,
    FetchUserPowerArraysController,
    FetchPublicPowerArraysController,
    GetPowerArrayByIdController,
    CreateItemController,
    UpdateItemController,
    DeleteItemController,
    GetItemByIdController,
    FetchPublicItemsController,
    FetchUserItemsController,
    CopyPublicItemController,
  ],
  providers: [
    RegisterUserUseCase,
    CatalogService,
    AuthenticateUserUseCase,
    FetchEffectsUseCase,
    FetchModificationsUseCase,
    CreatePeculiarityUseCase,
    FetchPublicPeculiaritiesUseCase,
    FetchUserPeculiaritiesUseCase,
    GetPeculiarityByIdUseCase,
    UpdatePeculiarityUseCase,
    DeletePeculiarityUseCase,
    CopyPublicPeculiarityUseCase,
    CreatePowerUseCase,
    UpdatePowerUseCase,
    GetPowerByIdUseCase,
    DeletePowerUseCase,
    FetchPowersUseCase,
    FetchUserPowersUseCase,
    CopyPublicPowerUseCase,
    PowerCostCalculator,
    OnPowerMadePublic,
    OnPowerArrayMadePublic,
    CreatePowerArrayUseCase,
    CopyPublicPowerArrayUseCase,
    UpdatePowerArrayUseCase,
    DeletePowerArrayUseCase,
    GetPowerArrayByIdUseCase,
    FetchPowerArraysUseCase,
    FetchUserPowerArraysUseCase,
    CreateItemUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
    GetItemByIdUseCase,
    FetchPublicItemsUseCase,
    FetchUserItemsUseCase,
    CopyPublicItemUseCase,
  ],
})
export class HttpModule {}
