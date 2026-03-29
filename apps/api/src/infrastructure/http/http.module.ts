import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/accounts/application/useCases/authenticate-user';
import { RegisterUserUseCase } from '@/domain/accounts/application/useCases/register-user';
import { AcquireBenefitUseCase } from '@/domain/character-manager/application/use-cases/acquire-benefit';
import { AcquireDomainMasteryUseCase } from '@/domain/character-manager/application/use-cases/acquire-domain-mastery';
import { DiscardDomainMasteryUseCase } from '@/domain/character-manager/application/use-cases/discard-domain-mastery';
import { AcquirePowerUseCase } from '@/domain/character-manager/application/use-cases/acquire-power';
import { AcquirePowerArrayUseCase } from '@/domain/character-manager/application/use-cases/acquire-power-array';
import { AddItemToInventoryUseCase } from '@/domain/character-manager/application/use-cases/add-item-to-inventory';
import { ChangeInventoryItemQuantityUseCase } from '@/domain/character-manager/application/use-cases/change-inventory-item-quantity';
import { AddRunicsUseCase } from '@/domain/character-manager/application/use-cases/add-runics';
import { ApplyConditionUseCase } from '@/domain/character-manager/application/use-cases/apply-condition';
import { ConsumeEnergyUseCase } from '@/domain/character-manager/application/use-cases/consume-energy';
import { CreateCharacterUseCase } from '@/domain/character-manager/application/use-cases/create-character';
import { DeleteCharacterUseCase } from '@/domain/character-manager/application/use-cases/delete-character';
import { DeletePowerArrayFromCharacterUseCase } from '@/domain/character-manager/application/use-cases/delete-power-array-from-character';
import { DeletePowerFromCharacterUseCase } from '@/domain/character-manager/application/use-cases/delete-power-from-character';
import { DiscardBenefitUseCase } from '@/domain/character-manager/application/use-cases/discard-benefit';
import { DeletePowerArrayFromCharacterController } from './controllers/characters/delete-power-array-from-character.controller';
import { DeletePowerFromCharacterController } from './controllers/characters/delete-power-from-character.controller';
import { DiscardBenefitController } from './controllers/characters/discard-benefit.controller';
import { EquipItemUseCase } from '@/domain/character-manager/application/use-cases/equip-item';
import { EquipPowerUseCase } from '@/domain/character-manager/application/use-cases/equip-power';
import { EquipPowerArrayUseCase } from '@/domain/character-manager/application/use-cases/equip-power-array';
import { EvolveSpiritualPrincipleUseCase } from '@/domain/character-manager/application/use-cases/evolve-spiritual-principle';
import { FetchCharacterPowerArraysUseCase } from '@/domain/power-manager/application/use-cases/fetch-character-power-arrays';
import { FetchCharacterPowersUseCase } from '@/domain/power-manager/application/use-cases/fetch-character-powers';
import { FetchCharacterItemsUseCase } from '@/domain/item-manager/application/use-cases/fetch-character-items';
import { FetchCharacterItemsController } from './controllers/characters/fetch-character-items.controller';
import { FetchCharacterPowerArraysController } from './controllers/characters/fetch-character-power-arrays.controller';
import { FetchCharacterPowersController } from './controllers/characters/fetch-character-powers.controller';
import { FetchUserCharactersUseCase } from '@/domain/character-manager/application/use-cases/fetch-user-characters';
import { GetCharacterByIdUseCase } from '@/domain/character-manager/application/use-cases/get-character-by-id';
import { HealCharacterUseCase } from '@/domain/character-manager/application/use-cases/heal-character';
import { LevelUpCharacterUseCase } from '@/domain/character-manager/application/use-cases/level-up-character';
import { RecoverEnergyUseCase } from '@/domain/character-manager/application/use-cases/recover-energy';
import { RemoveConditionUseCase } from '@/domain/character-manager/application/use-cases/remove-condition';
import { RemoveFromInventoryUseCase } from '@/domain/character-manager/application/use-cases/remove-from-inventory';
import { RestUseCase } from '@/domain/character-manager/application/use-cases/rest';
import { SpendRunicsUseCase } from '@/domain/character-manager/application/use-cases/spend-runics';
import { SyncCharacterUseCase } from '@/domain/character-manager/application/use-cases/sync-character';
import { TakeDamageUseCase } from '@/domain/character-manager/application/use-cases/take-damage';
import { TickDeathCounterUseCase } from '@/domain/character-manager/application/use-cases/tick-death-counter';
import { UnequipItemUseCase } from '@/domain/character-manager/application/use-cases/unequip-item';
import { UnequipPowerUseCase } from '@/domain/character-manager/application/use-cases/unequip-power';
import { UnequipPowerArrayUseCase } from '@/domain/character-manager/application/use-cases/unequip-power-array';
import { UnlockSpiritualPrincipleUseCase } from '@/domain/character-manager/application/use-cases/unlock-spiritual-principle';
import { UpgradeItemUseCase } from '@/domain/character-manager/application/use-cases/upgrade-item';
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
import { OnCharacterItemDiscarded } from '@/domain/item-manager/application/subscribers/on-character-item-discarded';
import { OnCharacterPowerArrayDiscarded } from '@/domain/power-manager/application/subscribers/on-character-power-array-discarded';
import { OnCharacterPowerDiscarded } from '@/domain/power-manager/application/subscribers/on-character-power-discarded';
import { OnPowerArrayMadePublic } from '@/domain/power-manager/application/subscribers/on-power-array-made-public';
import { OnPowerMadePublic } from '@/domain/power-manager/application/subscribers/on-power-made-public';
import { PowerCostCalculator } from '@/domain/power-manager/enterprise/services/power-cost-calculator';
import { AcquirePowerService } from '@/domain/character-manager/enterprise/services/acquire-power';
import { AcquirePowerArrayService } from '@/domain/character-manager/enterprise/services/acquire-power-array';
import { AcquireBenefitService } from '@/domain/character-manager/enterprise/services/acquire-benefit';
import { CalculateBenefitCostService } from '@/domain/character-manager/enterprise/services/calculate-benefit-cost';
import { RestService } from '@/domain/character-manager/enterprise/services/rest-service';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { DatabaseModule } from '../database/database.module';
import { CatalogService } from '../services/catalog.service';
import { AuthenticateController } from './controllers/authenticate-user.controller';
import { AcquireBenefitController } from './controllers/characters/acquire-benefit.controller';
import { AcquireDomainMasteryController } from './controllers/characters/acquire-domain-mastery.controller';
import { DiscardDomainMasteryController } from './controllers/characters/discard-domain-mastery.controller';
import { AcquirePowerController } from './controllers/characters/acquire-power.controller';
import { AcquirePowerArrayController } from './controllers/characters/acquire-power-array.controller';
import { AddItemToInventoryController } from './controllers/characters/add-item-to-inventory.controller';
import { ChangeInventoryItemQuantityController } from './controllers/characters/change-inventory-item-quantity.controller';
import { AddRunicsController } from './controllers/characters/add-runics.controller';
import { CreateCharacterController } from './controllers/characters/create-character.controller';
import { DeleteCharacterController } from './controllers/characters/delete-character.controller';
import { EquipItemController } from './controllers/characters/equip-item.controller';
import { EquipPowerController } from './controllers/characters/equip-power.controller';
import { EquipPowerArrayController } from './controllers/characters/equip-power-array.controller';
import { EvolveSpiritualPrincipleController } from './controllers/characters/evolve-spiritual-principle.controller';
import { FetchUserCharactersController } from './controllers/characters/fetch-user-characters.controller';
import { GetCharacterByIdController } from './controllers/characters/get-character-by-id.controller';
import { LevelUpCharacterController } from './controllers/characters/level-up-character.controller';
import { RemoveFromInventoryController } from './controllers/characters/remove-from-inventory.controller';
import { RestCharacterController } from './controllers/characters/rest-character.controller';
import { SpendRunicsController } from './controllers/characters/spend-runics.controller';
import { SyncCharacterController } from './controllers/characters/sync-character.controller';
import { TickDeathCounterController } from './controllers/characters/tick-death-counter.controller';
import { UnequipItemController } from './controllers/characters/unequip-item.controller';
import { UnequipPowerController } from './controllers/characters/unequip-power.controller';
import { UnequipPowerArrayController } from './controllers/characters/unequip-power-array.controller';
import { UnlockSpiritualPrincipleController } from './controllers/characters/unlock-spiritual-principle.controller';
import { UpgradeItemController } from './controllers/characters/upgrade-item.controller';
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
    CreateCharacterController,
    FetchUserCharactersController,
    FetchCharacterItemsController,
    FetchCharacterPowersController,
    FetchCharacterPowerArraysController,
    GetCharacterByIdController,
    DeleteCharacterController,
    DeletePowerFromCharacterController,
    DeletePowerArrayFromCharacterController,
    DiscardBenefitController,
    SyncCharacterController,
    AcquirePowerController,
    EquipPowerController,
    UnequipPowerController,
    EquipItemController,
    UnequipItemController,
    RemoveFromInventoryController,
    AddItemToInventoryController,
    ChangeInventoryItemQuantityController,
    AddRunicsController,
    SpendRunicsController,
    AcquirePowerArrayController,
    EquipPowerArrayController,
    UnequipPowerArrayController,
    AcquireBenefitController,
    AcquireDomainMasteryController,
    DiscardDomainMasteryController,
    UpgradeItemController,
    LevelUpCharacterController,
    UnlockSpiritualPrincipleController,
    EvolveSpiritualPrincipleController,
    RestCharacterController,
    TickDeathCounterController,
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
    FetchUserItemsController,
    FetchPublicItemsController,
    GetItemByIdController,
    CopyPublicItemController,
  ],
  providers: [
    // Services
    AcquirePowerService,
    AcquirePowerArrayService,
    AcquireBenefitService,
    CalculateBenefitCostService,
    RestService,
    // Use Cases
    AcquirePowerUseCase,
    EquipPowerUseCase,
    UnequipPowerUseCase,
    EquipItemUseCase,
    UnequipItemUseCase,
    RemoveFromInventoryUseCase,
    AddItemToInventoryUseCase,
    ChangeInventoryItemQuantityUseCase,
    AddRunicsUseCase,
    SpendRunicsUseCase,
    ApplyConditionUseCase,
    RemoveConditionUseCase,
    LevelUpCharacterUseCase,
    UnlockSpiritualPrincipleUseCase,
    EvolveSpiritualPrincipleUseCase,
    TakeDamageUseCase,
    HealCharacterUseCase,
    ConsumeEnergyUseCase,
    RecoverEnergyUseCase,
    RestUseCase,
    TickDeathCounterUseCase,
    AcquirePowerArrayUseCase,
    EquipPowerArrayUseCase,
    UnequipPowerArrayUseCase,
    AcquireBenefitUseCase,
    AcquireDomainMasteryUseCase,
    DiscardDomainMasteryUseCase,
    UpgradeItemUseCase,
    RegisterUserUseCase,
    CatalogService,
    AuthenticateUserUseCase,
    CreateCharacterUseCase,
    GetCharacterByIdUseCase,
    FetchUserCharactersUseCase,
    DeleteCharacterUseCase,
    DeletePowerFromCharacterUseCase,
    DeletePowerArrayFromCharacterUseCase,
    DiscardBenefitUseCase,
    SyncCharacterUseCase,
    FetchCharacterItemsUseCase,
    FetchCharacterPowersUseCase,
    FetchCharacterPowerArraysUseCase,
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
    OnCharacterItemDiscarded,
    OnCharacterPowerDiscarded,
    OnCharacterPowerArrayDiscarded,
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

