import { Controller, Get, HttpCode, HttpStatus, Query, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProfilesService } from './app.service';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { SearchQueryDto } from './dto/searchquery.dto';
import { GetProfilesDto } from './dto/getProfiles.dto';

@Controller('api/profiles')
@UseFilters(GlobalExceptionFilter) 
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  )
  async findAll(@Query() query: GetProfilesDto) {
    return this.profilesService.findAll(query);
  }

  // Natural Language Query search
  @Get('search')
  async searchProfiles(
    @Query('q') q: SearchQueryDto,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.profilesService.search(q, page, limit);
  }
}