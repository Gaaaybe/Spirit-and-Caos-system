import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { DomainEvent } from '@/core/events/domain-event';
import { DomainEvents } from '@/core/events/domain-events';
import { PowerMadePublicEvent } from '../../enterprise/events/power-made-public-event';
import { PeculiaritiesRepository } from '../repositories/peculiarities-repository';

@Injectable()
export class OnPowerMadePublic implements OnModuleInit {
  constructor(private peculiaritiesRepository: PeculiaritiesRepository) {}

  onModuleInit(): void {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.publishReferencedPeculiarity.bind(this), PowerMadePublicEvent.name);
  }

  private async publishReferencedPeculiarity(event: DomainEvent): Promise<void> {
    const { peculiarityId } = event as PowerMadePublicEvent;

    if (!peculiarityId) return;

    const peculiarity = await this.peculiaritiesRepository.findById(peculiarityId);

    if (peculiarity && !peculiarity.isPublic) {
      const publicPeculiarity = peculiarity.makePublic();
      await this.peculiaritiesRepository.update(publicPeculiarity);
    }
  }
}
