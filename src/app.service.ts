import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto/searchquery.dto';
import { GetProfilesDto } from './dto/getProfiles.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetProfilesDto) {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      order = 'desc',
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
    } = query;

    const where: Prisma.ProfileWhereInput = {};

    // Dynamic Filter Construction
    if (gender) where.gender = gender;
    if (age_group) where.age_group = age_group;
    if (country_id) where.country_id = country_id;

    if (min_age || max_age) {
      where.age = {
        ...(min_age && { gte: Number(min_age) }),
        ...(max_age && { lte: Number(max_age) }),
      };
    }

    if (min_gender_probability)
      where.gender_probability = { gte: Number(min_gender_probability) };
    if (min_country_probability)
      where.country_probability = { gte: Number(min_country_probability) };

    const [total, data] = await Promise.all([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        orderBy: { [sort_by]: order },
        skip: (Number(page) - 1) * Number(limit),
        take: Math.min(Number(limit), 50),
      }),
    ]);

    return {
      status: 'success',
      page: Number(page),
      limit: Number(limit),
      total,
      data,
    };
  }

  async search(q: SearchQueryDto, page = 1, limit = 10) {
    if (!q) throw new BadRequestException('Query parameter is required');

    const filters = this.parseNaturalLanguage(q);
    if (Object.keys(filters).length === 0) {
      return { status: 'error', message: 'Unable to interpret query' };
    }

    return this.findAll({ ...filters, page, limit });
  }

  private parseNaturalLanguage(q) {
    const filters: Partial<GetProfilesDto> = {};

    // 1. Gender Detection
    if (/\bfemales?\b/.test(q)) filters.gender = 'female';
    else if (/\bmales?\b/.test(q)) filters.gender = 'male';

    // 2. Age Group & "Young" Rule
    if (/\byoung\b/.test(q)) {
      filters.min_age = 16;
      filters.max_age = 24;
    }
    if (/\bteenagers?\b/.test(q)) filters.age_group = 'teenager';
    if (/\badults?\b/.test(q)) filters.age_group = 'adult';
    if (/\bseniors?\b/.test(q)) filters.age_group = 'senior';

    // 3. Comparison Logic (Regex for "above X")
    const aboveMatch = q.match(/\b(?:above|over|older than)\s+(\d+)\b/);
    if (aboveMatch) filters.min_age = parseInt(aboveMatch[1]);

    const belowMatch = q.match(
      /\b(?:below|under|younger than|less than)\s+(\d+)\b/,
    );
    if (belowMatch) filters.max_age = parseInt(belowMatch[1]);

    const exactAgeMatch = q.match(
      /\b(?:age\s*)?(\d{1,3})\s*(?:years?\s*old)?\b/,
    );
    if (exactAgeMatch) {
      const age = parseInt(exactAgeMatch[1]);
      filters.min_age = age;
      filters.max_age = age;
    }

    const betweenMatch = q.match(/\bbetween\s+(\d+)\s+(?:and|to)\s+(\d+)\b/);
    if (betweenMatch) {
      filters.min_age = parseInt(betweenMatch[1]);
      filters.max_age = parseInt(betweenMatch[2]);
    }

    if (/\b(females?|women|girls|ladies)\b/.test(q)) {
      filters.gender = 'female';
    } else if (/\b(males?|men|boys|guys)\b/.test(q)) {
      filters.gender = 'male';
    }

    const rangeMatch = q.match(/\bfrom\s+(\d+)\s+(?:to|-)\s+(\d+)\b/);
    if (rangeMatch) {
      filters.min_age = parseInt(rangeMatch[1]);
      filters.max_age = parseInt(rangeMatch[2]);
    }

    // 4. Country Detection (Simple Map - Extend as needed)
    const countryMap = {
      nigeria: 'NG',
      kenya: 'KE',
      angola: 'AO',
      benin: 'BJ',
      angolan: 'AO',
      kenyan: 'KE',
      nigerian: 'NG',
    };
    for (const [name, code] of Object.entries(countryMap)) {
      if (new RegExp(`\\b${name}\\b`).test(q)) {
        filters.country_id = code;
      }
    }

    return filters;
  }
}
