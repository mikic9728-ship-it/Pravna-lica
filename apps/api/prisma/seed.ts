import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedCompany = {
  name: string;
  city: string;
  industry: string;
  nace: string;
  revenue: number;
  profit: number;
  employees: number;
};

const companies: SeedCompany[] = [
  { name: 'Elektroprivreda Republike Srpske a.d.', city: 'Trebinje', industry: 'Energetika', nace: '3511', revenue: 980_000_000, profit: 42_000_000, employees: 8200 },
  { name: 'M:tel a.d. Banja Luka', city: 'Banja Luka', industry: 'Telekomunikacije', nace: '6110', revenue: 520_000_000, profit: 83_000_000, employees: 2100 },
  { name: 'Integral Inženjering a.d.', city: 'Laktaši', industry: 'Građevinarstvo', nace: '4211', revenue: 240_000_000, profit: 18_000_000, employees: 950 },
  { name: 'Optima Grupa d.o.o.', city: 'Banja Luka', industry: 'Trgovina naftom', nace: '4671', revenue: 410_000_000, profit: 12_500_000, employees: 640 },
  { name: 'Rafinerija nafte Brod a.d.', city: 'Brod', industry: 'Prerada nafte', nace: '1920', revenue: 360_000_000, profit: -8_000_000, employees: 1200 },
  { name: 'Rafinerija ulja Modriča a.d.', city: 'Modriča', industry: 'Prerada nafte', nace: '1920', revenue: 86_000_000, profit: 4_100_000, employees: 460 },
  { name: 'Lanaco d.o.o.', city: 'Banja Luka', industry: 'Informacione tehnologije', nace: '6201', revenue: 68_000_000, profit: 9_200_000, employees: 330 },
  { name: 'Prointer ITSS d.o.o.', city: 'Banja Luka', industry: 'Informacione tehnologije', nace: '6202', revenue: 74_000_000, profit: 7_800_000, employees: 290 },
  { name: 'Boksit a.d. Milići', city: 'Milići', industry: 'Rudarstvo', nace: '0729', revenue: 92_000_000, profit: 6_300_000, employees: 760 },
  { name: 'ArcelorMittal Prijedor d.o.o.', city: 'Prijedor', industry: 'Rudarstvo', nace: '0710', revenue: 155_000_000, profit: 19_000_000, employees: 780 },
  { name: 'Nestro Petrol a.d.', city: 'Banja Luka', industry: 'Trgovina naftom', nace: '4730', revenue: 310_000_000, profit: 10_500_000, employees: 890 },
  { name: 'Pošte Srpske a.d.', city: 'Banja Luka', industry: 'Poštanske usluge', nace: '5310', revenue: 64_000_000, profit: 1_800_000, employees: 2300 },
  { name: 'Željeznice Republike Srpske a.d.', city: 'Doboj', industry: 'Transport', nace: '4910', revenue: 58_000_000, profit: -4_500_000, employees: 2800 },
  { name: 'Hemofarm d.o.o. Banja Luka', city: 'Banja Luka', industry: 'Farmaceutska industrija', nace: '2120', revenue: 118_000_000, profit: 14_000_000, employees: 520 },
  { name: 'Alumina d.o.o.', city: 'Zvornik', industry: 'Hemijska industrija', nace: '2013', revenue: 285_000_000, profit: 31_000_000, employees: 1500 },
  { name: 'Swisslion Industrija alata a.d.', city: 'Trebinje', industry: 'Prehrambena industrija', nace: '1082', revenue: 76_000_000, profit: 5_600_000, employees: 760 },
  { name: 'Vitaminka a.d.', city: 'Banja Luka', industry: 'Prehrambena industrija', nace: '1039', revenue: 41_000_000, profit: 2_900_000, employees: 280 },
  { name: 'Mlijekoprodukt d.o.o.', city: 'Kozarska Dubica', industry: 'Prehrambena industrija', nace: '1051', revenue: 116_000_000, profit: 8_100_000, employees: 430 },
  { name: 'Tropic maloprodaja d.o.o.', city: 'Banja Luka', industry: 'Maloprodaja', nace: '4711', revenue: 265_000_000, profit: 11_200_000, employees: 2400 },
  { name: 'Krajina Klas d.o.o.', city: 'Banja Luka', industry: 'Prehrambena industrija', nace: '1071', revenue: 39_000_000, profit: 2_200_000, employees: 360 },
  { name: 'Kolektor CCL d.o.o.', city: 'Laktaši', industry: 'Elektro industrija', nace: '2931', revenue: 67_000_000, profit: 5_000_000, employees: 610 },
  { name: 'Pass d.o.o.', city: 'Bijeljina', industry: 'Auto industrija', nace: '2932', revenue: 88_000_000, profit: 6_700_000, employees: 900 },
  { name: 'Mega Drvo d.o.o.', city: 'Bijeljina', industry: 'Drvna industrija', nace: '1623', revenue: 54_000_000, profit: 4_300_000, employees: 310 },
  { name: 'Nova DI Vrbas d.o.o.', city: 'Banja Luka', industry: 'Drvna industrija', nace: '1610', revenue: 28_000_000, profit: 1_700_000, employees: 220 },
  { name: 'Elnos BL d.o.o.', city: 'Banja Luka', industry: 'Energetski inženjering', nace: '4321', revenue: 95_000_000, profit: 8_400_000, employees: 540 },
  { name: 'Kaldera Company d.o.o.', city: 'Laktaši', industry: 'Energetski inženjering', nace: '4321', revenue: 73_000_000, profit: 5_900_000, employees: 410 },
  { name: 'Hidroelektrane na Trebišnjici a.d.', city: 'Trebinje', industry: 'Energetika', nace: '3511', revenue: 122_000_000, profit: 21_000_000, employees: 620 },
  { name: 'Hidroelektrane na Vrbasu a.d.', city: 'Mrkonjić Grad', industry: 'Energetika', nace: '3511', revenue: 44_000_000, profit: 9_400_000, employees: 180 },
  { name: 'RiTE Ugljevik a.d.', city: 'Ugljevik', industry: 'Energetika', nace: '3511', revenue: 178_000_000, profit: 7_200_000, employees: 1900 },
  { name: 'RiTE Gacko a.d.', city: 'Gacko', industry: 'Energetika', nace: '3511', revenue: 162_000_000, profit: 6_500_000, employees: 1850 },
  { name: 'Univerzitetski klinički centar RS', city: 'Banja Luka', industry: 'Zdravstvo', nace: '8610', revenue: 210_000_000, profit: 1_000_000, employees: 3300 },
  { name: 'Banja Vrućica a.d.', city: 'Teslić', industry: 'Turizam i zdravstvo', nace: '5510', revenue: 36_000_000, profit: 4_900_000, employees: 520 },
  { name: 'Orao a.d.', city: 'Bijeljina', industry: 'Mašinska industrija', nace: '3316', revenue: 33_000_000, profit: 2_400_000, employees: 380 },
  { name: 'Kosmos a.d.', city: 'Banja Luka', industry: 'Mašinska industrija', nace: '3312', revenue: 18_000_000, profit: 900_000, employees: 250 },
  { name: 'TRB d.o.o.', city: 'Bratunac', industry: 'Namjenska industrija', nace: '2540', revenue: 49_000_000, profit: 7_100_000, employees: 420 },
  { name: 'Prijedorputevi a.d.', city: 'Prijedor', industry: 'Građevinarstvo', nace: '4211', revenue: 47_000_000, profit: 3_600_000, employees: 360 },
  { name: 'Mrkonjićputevi a.d.', city: 'Mrkonjić Grad', industry: 'Građevinarstvo', nace: '4211', revenue: 32_000_000, profit: 2_100_000, employees: 290 },
  { name: 'Zvornikputevi a.d.', city: 'Zvornik', industry: 'Građevinarstvo', nace: '4211', revenue: 29_000_000, profit: 1_900_000, employees: 240 },
  { name: 'Krajina osiguranje a.d.', city: 'Banja Luka', industry: 'Osiguranje', nace: '6512', revenue: 24_000_000, profit: 1_200_000, employees: 180 },
  { name: 'Dunav osiguranje a.d. Banja Luka', city: 'Banja Luka', industry: 'Osiguranje', nace: '6512', revenue: 42_000_000, profit: 3_200_000, employees: 260 },
  { name: 'Atos Bank a.d.', city: 'Banja Luka', industry: 'Bankarstvo', nace: '6419', revenue: 58_000_000, profit: 8_700_000, employees: 420 },
  { name: 'Nova banka a.d.', city: 'Banja Luka', industry: 'Bankarstvo', nace: '6419', revenue: 142_000_000, profit: 26_000_000, employees: 760 },
  { name: 'NLB Banka a.d. Banja Luka', city: 'Banja Luka', industry: 'Bankarstvo', nace: '6419', revenue: 118_000_000, profit: 24_000_000, employees: 620 },
  { name: 'Microfin d.o.o.', city: 'Banja Luka', industry: 'Mikrofinansije', nace: '6492', revenue: 51_000_000, profit: 9_500_000, employees: 520 },
  { name: 'Akvana d.o.o.', city: 'Banja Luka', industry: 'Usluge', nace: '9329', revenue: 9_000_000, profit: 300_000, employees: 130 },
  { name: 'Gradip a.d.', city: 'Prnjavor', industry: 'Građevinarstvo', nace: '4120', revenue: 26_000_000, profit: 1_800_000, employees: 210 },
  { name: 'Mira a.d.', city: 'Prijedor', industry: 'Prehrambena industrija', nace: '1072', revenue: 46_000_000, profit: 3_900_000, employees: 410 },
  { name: 'Sava Semberija a.d.', city: 'Bijeljina', industry: 'Prehrambena industrija', nace: '1039', revenue: 27_000_000, profit: 1_600_000, employees: 230 },
  { name: 'Jelšingrad Livar a.d.', city: 'Banja Luka', industry: 'Metalna industrija', nace: '2451', revenue: 22_000_000, profit: 1_100_000, employees: 260 },
  { name: 'Metal a.d.', city: 'Gradiška', industry: 'Metalna industrija', nace: '2511', revenue: 31_000_000, profit: 2_400_000, employees: 300 },
];

function slugify(name: string, jib: string) {
  return `${name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')}-${jib.slice(-4)}`;
}

function jib(index: number) {
  return `440${String(100000000 + index).slice(1)}${String(index % 97).padStart(2, '0')}`;
}

async function main() {
  const adminPassword = await bcrypt.hash('Admin12345!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@rsbi.local' },
    update: {},
    create: {
      email: 'admin@rsbi.local',
      name: 'RSBI Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      apiKey: 'dev-admin-api-key',
      subscription: { create: { tier: 'ENTERPRISE' } },
    },
  });

  for (const [index, c] of companies.entries()) {
    const companyJib = jib(index + 1);
    const industry = await prisma.industry.upsert({
      where: { naceCode: c.nace },
      update: { name: c.industry },
      create: { naceCode: c.nace, name: c.industry, sector: c.industry },
    });

    const foundedYear = 1995 + (index % 25);
    await prisma.company.upsert({
      where: { jib: companyJib },
      update: {},
      create: {
        name: c.name,
        slug: slugify(c.name, companyJib),
        jib: companyJib,
        registrationNumber: `1-${String(index + 1).padStart(4, '0')}-00`,
        foundedAt: new Date(`${foundedYear}-01-01T00:00:00.000Z`),
        status: c.profit < -5_000_000 ? 'BANKRUPTCY' : 'ACTIVE',
        website: `https://www.${slugify(c.name, companyJib).replace(/-\d+$/, '')}.ba`,
        email: `info@${slugify(c.name, companyJib).replace(/-\d+$/, '')}.ba`,
        phone: `+387 5${index % 9} ${String(100000 + index * 137)}`,
        revenue: c.revenue,
        profit: c.profit,
        employeeCount: c.employees,
        averageSalary: 1_450 + (index % 9) * 140,
        ebitda: c.profit * 1.25 + c.revenue * 0.03,
        profitMargin: c.profit / c.revenue,
        debtRatio: 0.18 + (index % 7) * 0.055,
        industryId: industry.id,
        address: {
          create: {
            city: c.city,
            street: `Poslovna zona ${index + 1}`,
            municipality: c.city,
            postalCode: String(78000 + index),
          },
        },
        owners: {
          create: [
            { name: index % 3 === 0 ? 'Republika Srpska / akcionari' : 'Privatni kapital', ownershipPercent: 60 + (index % 4) * 10, country: 'BA' },
            { name: 'Manjinski akcionari', ownershipPercent: 40 - (index % 4) * 10, country: 'BA' },
          ],
        },
        beneficialOwners: {
          create: [{ name: index % 3 === 0 ? 'Javni registar vlasnika' : `Beneficial owner ${index + 1}`, controlType: 'OWNERSHIP', ownershipPercent: 60 + (index % 4) * 10 }],
        },
        financialReports: {
          create: [2020, 2021, 2022, 2023, 2024].map((year, yearIndex) => {
            const multiplier = 0.74 + yearIndex * 0.075 + (index % 5) * 0.012;
            return {
              year,
              revenue: Math.round(c.revenue * multiplier),
              profit: Math.round(c.profit * (0.68 + yearIndex * 0.09)),
              assets: Math.round(c.revenue * (1.2 + (index % 4) * 0.15)),
              liabilities: Math.round(c.revenue * (0.38 + (index % 5) * 0.05)),
              equity: Math.round(c.revenue * 0.45),
              ebitda: Math.round((c.profit * 1.25 + c.revenue * 0.03) * multiplier),
              source: 'RSBI demo dataset',
              sourceUrl: 'https://rsbi.local/demo-source',
              reportedAt: new Date(`${year + 1}-04-30T00:00:00.000Z`),
            };
          }),
        },
        employeeStats: {
          create: [2020, 2021, 2022, 2023, 2024].map((year, yearIndex) => ({
            year,
            count: Math.max(1, Math.round(c.employees * (0.86 + yearIndex * 0.035))),
            source: 'RSBI demo dataset',
          })),
        },
        salaryStats: {
          create: [2020, 2021, 2022, 2023, 2024].map((year, yearIndex) => ({
            year,
            averageGross: 1_250 + (index % 10) * 85 + yearIndex * 110,
            averageNet: 850 + (index % 10) * 55 + yearIndex * 70,
            source: 'RSBI demo dataset',
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    console.log(`Seeded ${companies.length} companies plus admin@rsbi.local / Admin12345!`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
