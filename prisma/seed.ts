import { PrismaClient } from '@prisma/client';
import { uuidv7 } from 'uuidv7';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();
process.env.DATABASE_URL = process.env.DIRECT_URL

const prisma = new PrismaClient()

const data_json = require(path.join(__dirname, '..', 'seed_profiles.json'));
const profiles: any[] = data_json.profiles;

async function main() {
  console.log(`Found ${profiles.length} profiles to seed...`);

  const data = profiles.map((p: any) => ({
    id: uuidv7(),
    name: p.name,
    gender: p.gender,
    gender_probability: p.gender_probability,
    age: p.age,
    age_group: p.age_group,
    country_id: p.country_id,
    country_name: p.country_name,
    country_probability: p.country_probability,
  }));

  const chunkSize = 500;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await prisma.profile.createMany({ data: chunk, skipDuplicates: true });
    console.log(`Inserted ${Math.min(i + chunkSize, data.length)} / ${data.length}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });