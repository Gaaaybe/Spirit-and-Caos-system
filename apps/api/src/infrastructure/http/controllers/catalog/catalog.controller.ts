import { Controller, Get } from '@nestjs/common';
import { Public } from '@/infrastructure/auth/public';
import { CatalogService } from '@/infrastructure/services/catalog.service';

@Controller('/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}
  @Public()
  @Get('/scales')
  getScales() {
    return this.catalogService.getScales();
  }
  @Public()
  @Get('/universal-table')
  getUniversalTable() {
    return this.catalogService.getUniversalTable();
  }
  @Public()
  @Get('/domains')
  getDomains() {
    return this.catalogService.getDomains();
  }
}
