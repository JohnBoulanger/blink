/*
 * Seed script — populates the database with demo data for Blink.
 * Usage: npm run seed (or npx prisma db seed)
 * Re-runs whenever changes are committed in environments that auto-seed.
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const encodePassword = require('../src/helpers/encodePassword');
const prisma = new PrismaClient();

const PASSWORD = '123123';

// Toronto-area optometry clinic names and coordinates
const BUSINESS_DATA = [
  { name: 'Bahen Vision Clinic', owner: 'Sarah Chen', lon: -79.3957, lat: 43.6596, address: '40 St George St, Toronto', phone: '416-555-0101' },
  { name: 'Spadina Vision Centre', owner: 'Michael Park', lon: -79.3985, lat: 43.6554, address: '200 Spadina Ave, Toronto', phone: '416-555-0102' },
  { name: 'Bloor Eye Care', owner: 'Emily Watson', lon: -79.3990, lat: 43.6677, address: '700 Bloor St W, Toronto', phone: '416-555-0103' },
  { name: 'King West Optometry', owner: 'David Kim', lon: -79.3940, lat: 43.6445, address: '500 King St W, Toronto', phone: '416-555-0104' },
  { name: 'Danforth Vision Studio', owner: 'Priya Sharma', lon: -79.3520, lat: 43.6784, address: '300 Danforth Ave, Toronto', phone: '416-555-0105' },
  { name: 'Queen Street Eyecare', owner: 'James Liu', lon: -79.3820, lat: 43.6485, address: '100 Queen St W, Toronto', phone: '416-555-0106' },
  { name: 'Yorkville Optometry Group', owner: 'Anna Martinez', lon: -79.3920, lat: 43.6715, address: '55 Yorkville Ave, Toronto', phone: '416-555-0107' },
  { name: 'College Vision Clinic', owner: 'Robert Nguyen', lon: -79.3965, lat: 43.6580, address: '400 College St, Toronto', phone: '416-555-0108' },
  { name: 'Harbourfront Eye Care', owner: 'Lisa Thompson', lon: -79.3810, lat: 43.6390, address: '10 Queens Quay W, Toronto', phone: '416-555-0109' },
  { name: 'CSSU Eyecare', owner: 'Kevin Brown', lon: -79.3950, lat: 43.6600, address: '6 Hoskin Ave, Toronto', phone: '416-555-0110' },
  { name: 'Annex Vision Studio', owner: 'Stephanie Ross', lon: -79.4050, lat: 43.6690, address: '388 Bloor St W, Toronto', phone: '416-555-0111' },
  { name: 'Rosedale Optometry', owner: 'Patrick O\'Brien', lon: -79.3780, lat: 43.6770, address: '1030 Yonge St, Toronto', phone: '416-555-0112' },
  { name: 'Liberty Village Eye Centre', owner: 'Michelle Tran', lon: -79.4200, lat: 43.6380, address: '171 E Liberty St, Toronto', phone: '416-555-0113' },
  { name: 'Leslieville Vision Care', owner: 'Andrew Campbell', lon: -79.3290, lat: 43.6650, address: '1100 Queen St E, Toronto', phone: '416-555-0114' },
  { name: 'Midtown Eye Centre', owner: 'Laura Singh', lon: -79.3930, lat: 43.6870, address: '2300 Yonge St, Toronto', phone: '416-555-0115' },
];

const REGULAR_FIRST_NAMES = [
  'Alice', 'Wayne', 'Sofia', 'Marcus', 'Priya',
  'Jason', 'Emma', 'Carlos', 'Yuki', 'Daniel',
  'Olivia', 'Hassan', 'Rachel', 'Tyler', 'Mei',
  'Jordan', 'Fatima', 'Liam', 'Grace', 'Noah',
];

const REGULAR_LAST_NAMES = [
  'Lin', 'Gretzky', 'Rodriguez', 'Johnson', 'Patel',
  'Chung', 'Wilson', 'Garcia', 'Tanaka', 'Lee',
  'Brown', 'Ahmed', 'Green', 'Scott', 'Wang',
  'Taylor', 'Hassan', 'Murphy', 'Kim', 'Davis',
];

const POSITION_TYPES = [
  { name: 'Optometric Assistant (Level 1)', description: 'Entry-level optometric assistant supporting pre-tests, instrument prep, and patient flow.' },
  { name: 'Optometric Assistant (Level 2)', description: 'Experienced optometric assistant performing pretesting, OCT scans, and visual field testing.' },
  { name: 'Licensed Optician', description: 'Licensed optician fitting and dispensing prescription eyewear and contact lenses.' },
  { name: 'Front Desk Coordinator', description: 'Front desk staff handling scheduling, insurance verification, and patient communications.' },
  { name: 'Contact Lens Specialist', description: 'Specialist focused on contact lens fitting, training, and follow-up care.' },
  { name: 'Pediatric Vision Assistant', description: 'Assistant specializing in pediatric optometry and child behaviour management.' },
  { name: 'Optical Lab Technician', description: 'Technician fabricating and edging prescription lenses to frame specifications.' },
  { name: 'Pre-test Technician', description: 'Specialist responsible for auto-refraction, tonometry, and pre-exam diagnostics.' },
  { name: 'Practice Manager', description: 'Manages day-to-day clinic operations, staffing, and administrative workflows.' },
  { name: 'Vision Therapist', description: 'Conducts therapy sessions for binocular vision, amblyopia, and visual processing.' },
  { name: 'Optometrist', description: 'Licensed optometrist performing comprehensive eye exams and ocular health assessments.' },
  { name: 'Retail Optical Associate', description: 'Sales-floor associate guiding patients through frame selection and lens options.' },
];

const BIOGRAPHIES = [
  'Experienced optometry professional with a passion for patient care and community vision health.',
  'Recent graduate with strong clinical skills and enthusiasm for learning in eye care.',
  'Dedicated healthcare worker with 5 years of experience in optometry settings.',
  'Detail-oriented professional committed to maintaining the highest standards of vision care.',
  'Bilingual optometry professional fluent in English and French.',
  'Certified optometric assistant with expertise in pediatric vision testing.',
  'Skilled clinician with a background in contact lens fitting and patient education.',
  'Healthcare professional with experience in both private practice and community vision clinics.',
  'Passionate about preventive eye care and patient education.',
  'Reliable team player with excellent patient communication skills.',
  'Graduate student with an interest in vision science and community outreach.',
  'Experienced professional transitioning from general to specialty contact lens care.',
  'Trained in advanced pretesting protocols including OCT and visual field testing.',
  'Committed to continuing education and professional development.',
  'Experienced in high-volume optometry clinics with diverse patient populations.',
  'Focused on patient comfort and accessible vision care experiences.',
  'Proficient with digital patient records and ophthalmic imaging software.',
  'Specializing in geriatric vision care and low-vision rehabilitation.',
  'Strong background in optical lab work and lens edging.',
  'Enthusiastic about integrating technology into modern optometry practice.',
];

async function main() {
  // Clear existing data in dependency order
  await prisma.negotiationMessage.deleteMany();
  await prisma.negotiation.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.qualification.deleteMany();
  await prisma.job.deleteMany();
  await prisma.resetToken.deleteMany();
  await prisma.administrator.deleteMany();
  await prisma.business.deleteMany();
  await prisma.regularUser.deleteMany();
  await prisma.positionType.deleteMany();
  await prisma.account.deleteMany();

  const hashedPassword = await encodePassword(PASSWORD);

  // --- Admin ---
  const adminAccount = await prisma.account.create({
    data: {
      email: 'admin1@blink.dev',
      password: hashedPassword,
      role: 'admin',
      activated: true,
      administrator: { create: {} },
    },
  });
  console.log(`Created admin: admin1@blink.dev (id: ${adminAccount.id})`);

  // --- Businesses ---
  const businessIds = [];
  for (let i = 0; i < 15; i++) {
    const b = BUSINESS_DATA[i];
    const account = await prisma.account.create({
      data: {
        email: `business${i + 1}@blink.dev`,
        password: hashedPassword,
        role: 'business',
        activated: true,
        business: {
          create: {
            business_name: b.name,
            owner_name: b.owner,
            phone_number: b.phone,
            postal_address: b.address,
            lon: b.lon,
            lat: b.lat,
            verified: i < 8, // first 8 verified, rest unverified
            biography: `${b.name} is a modern optometry clinic in the heart of Toronto, dedicated to providing exceptional eye care.`,
          },
        },
      },
    });
    businessIds.push(account.id);
    console.log(`Created business: business${i + 1}@blink.dev (id: ${account.id})`);
  }

  // --- Regular Users ---
  const regularIds = [];
  for (let i = 0; i < 20; i++) {
    const account = await prisma.account.create({
      data: {
        email: `regular${i + 1}@blink.dev`,
        password: hashedPassword,
        role: 'regular',
        activated: true,
        user: {
          create: {
            first_name: REGULAR_FIRST_NAMES[i],
            last_name: REGULAR_LAST_NAMES[i],
            phone_number: `416-555-${String(1000 + i)}`,
            postal_address: `${100 + i * 10} University Ave, Toronto`,
            biography: BIOGRAPHIES[i],
            available: i < 15, // first 15 are available
            suspended: i === 19, // user 20 is suspended
            lastActiveAt: new Date(), // everyone recently active
          },
        },
      },
    });
    regularIds.push(account.id);
    console.log(`Created regular: regular${i + 1}@blink.dev (id: ${account.id})`);
  }

  // --- Position Types ---
  const positionTypeIds = [];
  for (const pt of POSITION_TYPES) {
    const created = await prisma.positionType.create({
      data: {
        name: pt.name,
        description: pt.description,
        hidden: false,
      },
    });
    positionTypeIds.push(created.id);
  }
  console.log(`Created ${positionTypeIds.length} position types`);

  // --- Qualifications ---
  // Give each regular user 1-3 qualifications with mixed statuses
  const qualStatuses = ['submitted', 'approved', 'approved', 'approved', 'rejected', 'revised', 'created'];
  let qualCount = 0;
  for (let i = 0; i < 20; i++) {
    const numQuals = (i % 3) + 1; // 1, 2, or 3
    for (let q = 0; q < numQuals; q++) {
      const ptIndex = (i + q) % positionTypeIds.length;
      const statusIndex = (i + q) % qualStatuses.length;
      await prisma.qualification.create({
        data: {
          userId: regularIds[i],
          positionTypeId: positionTypeIds[ptIndex],
          status: qualStatuses[statusIndex],
          note: `Qualification document for ${POSITION_TYPES[ptIndex].name}.`,
        },
      });
      qualCount++;
    }
  }
  console.log(`Created ${qualCount} qualifications`);

  // --- ensure regular1 has approved qualifications for demo ---
  // regular1 (index 0) gets position types 0 and 1 from the loop above
  // override them to approved so regular1 can set available=true and browse jobs
  await prisma.qualification.updateMany({
    where: { userId: regularIds[0] },
    data: { status: 'approved' },
  });
  console.log('Updated regular1 qualifications to approved');

  // add a rejected qualification for regular1 (for revision demo)
  await prisma.qualification.create({
    data: {
      userId: regularIds[0],
      positionTypeId: positionTypeIds[2], // licensed optician
      status: 'rejected',
      note: 'Previous submission was incomplete — please resubmit with updated certification.',
    },
  });
  console.log('Created rejected qualification for regular1 (revision demo)');

  // ensure regular2 and regular3 also have approved qualifications for negotiation/no-show demos
  await prisma.qualification.updateMany({
    where: { userId: regularIds[1] },
    data: { status: 'approved' },
  });
  await prisma.qualification.updateMany({
    where: { userId: regularIds[2] },
    data: { status: 'approved' },
  });
  console.log('Updated regular2 and regular3 qualifications to approved');

  // --- Jobs ---
  // Create 35 jobs across different statuses and businesses
  const now = new Date();
  const jobRecords = [];

  // Helper to create a date offset from now
  function futureDate(daysOffset, hour) {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
  }
  function pastDate(daysOffset, hour) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  // 15 open jobs (future dates)
  for (let i = 0; i < 15; i++) {
    const biz = businessIds[i % 8]; // only verified businesses
    const ptIndex = i % positionTypeIds.length;
    const salaryMin = 25 + (i * 2);
    const job = await prisma.job.create({
      data: {
        businessId: biz,
        positionTypeId: positionTypeIds[ptIndex],
        salary_min: salaryMin,
        salary_max: salaryMin + 10,
        start_time: futureDate(2 + i, 9),
        end_time: futureDate(2 + i, 17),
        status: 'open',
        note: `Looking for ${/^[AEIOU]/.test(POSITION_TYPES[ptIndex].name) ? 'an' : 'a'} ${POSITION_TYPES[ptIndex].name} for an 8-hour shift.`,
      },
    });
    jobRecords.push(job);
  }

  // 5 filled jobs — worker's first qualification position type matches the job
  for (let i = 0; i < 5; i++) {
    const biz = businessIds[i % 8];
    const workerIndex = i;
    const ptIndex = workerIndex % positionTypeIds.length; // matches user i's first qual
    const job = await prisma.job.create({
      data: {
        businessId: biz,
        positionTypeId: positionTypeIds[ptIndex],
        salary_min: 30 + i * 3,
        salary_max: 40 + i * 3,
        start_time: pastDate(10 - i, 8),
        end_time: pastDate(10 - i, 16),
        status: 'filled',
        workerId: regularIds[workerIndex],
        note: `Filled position for ${POSITION_TYPES[ptIndex].name}.`,
      },
    });
    jobRecords.push(job);
  }

  // 5 completed jobs — worker's first qualification position type matches the job
  for (let i = 0; i < 5; i++) {
    const biz = businessIds[(i + 2) % 8];
    const workerIndex = 5 + i;
    const ptIndex = workerIndex % positionTypeIds.length; // matches user (5+i)'s first qual
    const job = await prisma.job.create({
      data: {
        businessId: biz,
        positionTypeId: positionTypeIds[ptIndex],
        salary_min: 28 + i * 2,
        salary_max: 38 + i * 2,
        start_time: pastDate(20 + i, 9),
        end_time: pastDate(20 + i, 17),
        status: 'completed',
        workerId: regularIds[workerIndex],
        note: `Completed shift for ${POSITION_TYPES[ptIndex].name}.`,
      },
    });
    jobRecords.push(job);
  }

  // 5 expired jobs (past end_time, no worker)
  for (let i = 0; i < 5; i++) {
    const biz = businessIds[(i + 4) % 8];
    const ptIndex = (i + 7) % positionTypeIds.length;
    const job = await prisma.job.create({
      data: {
        businessId: biz,
        positionTypeId: positionTypeIds[ptIndex],
        salary_min: 26 + i,
        salary_max: 36 + i,
        start_time: pastDate(5 + i, 10),
        end_time: pastDate(5 + i, 18),
        status: 'expired',
        note: `Expired listing for ${POSITION_TYPES[ptIndex].name}.`,
      },
    });
    jobRecords.push(job);
  }

  // 5 cancelled jobs
  for (let i = 0; i < 5; i++) {
    const biz = businessIds[(i + 6) % 8];
    const ptIndex = (i + 1) % positionTypeIds.length;
    const job = await prisma.job.create({
      data: {
        businessId: biz,
        positionTypeId: positionTypeIds[ptIndex],
        salary_min: 30 + i,
        salary_max: 42 + i,
        start_time: futureDate(5 + i, 8),
        end_time: futureDate(5 + i, 16),
        status: 'cancelled',
        note: `Cancelled posting for ${POSITION_TYPES[ptIndex].name}.`,
      },
    });
    jobRecords.push(job);
  }

  // --- special job: filled and currently in work window (for no-show demo) ---
  // regular3 (index 2) has position type 2 approved; business1 (index 0)
  const noShowJob = await prisma.job.create({
    data: {
      businessId: businessIds[0], // business1
      positionTypeId: positionTypeIds[2], // regular3's first qual position type (index 2)
      salary_min: 35,
      salary_max: 45,
      start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      end_time: new Date(now.getTime() + 6 * 60 * 60 * 1000),   // 6 hours from now
      status: 'filled',
      workerId: regularIds[2], // regular3
      note: 'Active shift — currently in work window (for no-show demo).',
    },
  });
  jobRecords.push(noShowJob);
  console.log(`Created no-show demo job (id: ${noShowJob.id})`);

  console.log(`Created ${jobRecords.length} jobs`);

  // --- Interests ---
  // Create interests to demo invitations, user interest, and mutual interest
  const openJobs = jobRecords.filter(j => j.status === 'open');
  const interestRecords = [];

  // Business invited users (businessInterested = true, userInterested = null) — invitations
  for (let i = 0; i < 12; i++) {
    const job = openJobs[i % openJobs.length];
    const userId = regularIds[(i + 5) % 15]; // from available users
    try {
      const interest = await prisma.interest.create({
        data: {
          jobId: job.id,
          userId: userId,
          businessInterested: true,
          userInterested: null,
        },
      });
      interestRecords.push(interest);
    } catch (e) {
      // skip duplicates
    }
  }

  // User expressed interest (userInterested = true, businessInterested = null)
  for (let i = 0; i < 10; i++) {
    const job = openJobs[(i + 3) % openJobs.length];
    const userId = regularIds[i % 15];
    try {
      const interest = await prisma.interest.create({
        data: {
          jobId: job.id,
          userId: userId,
          userInterested: true,
          businessInterested: null,
        },
      });
      interestRecords.push(interest);
    } catch (e) {
      // skip duplicates
    }
  }

  // Mutual interest (both true) — negotiation-eligible
  for (let i = 0; i < 6; i++) {
    const job = openJobs[(i + 8) % openJobs.length];
    const userId = regularIds[(i + 10) % 15];
    try {
      const interest = await prisma.interest.create({
        data: {
          jobId: job.id,
          userId: userId,
          userInterested: true,
          businessInterested: true,
        },
      });
      interestRecords.push(interest);
    } catch (e) {
      // skip duplicates
    }
  }

  // --- dedicated jobs + mutual interests for negotiation demo ---
  // create two open jobs from business1 specifically for negotiations
  const negJob1 = await prisma.job.create({
    data: {
      businessId: businessIds[0], // business1
      positionTypeId: positionTypeIds[0], // matches regular1's approved qual
      salary_min: 40,
      salary_max: 50,
      start_time: futureDate(3, 9),
      end_time: futureDate(3, 17),
      status: 'open',
      note: 'Negotiation demo job 1 — for regular1.',
    },
  });
  jobRecords.push(negJob1);

  const negJob2 = await prisma.job.create({
    data: {
      businessId: businessIds[0], // business1
      positionTypeId: positionTypeIds[1], // matches regular2's approved qual
      salary_min: 42,
      salary_max: 52,
      start_time: futureDate(4, 10),
      end_time: futureDate(4, 18),
      status: 'open',
      note: 'Negotiation demo job 2 — for regular2 (decline path).',
    },
  });
  jobRecords.push(negJob2);
  console.log(`Created 2 negotiation demo jobs (ids: ${negJob1.id}, ${negJob2.id})`);

  // mutual interest: regular1 ↔ negJob1
  try {
    const mi1 = await prisma.interest.create({
      data: {
        jobId: negJob1.id,
        userId: regularIds[0],
        userInterested: true,
        businessInterested: true,
      },
    });
    interestRecords.push(mi1);
    console.log(`Created mutual interest: regular1 ↔ job ${negJob1.id}`);
  } catch (e) {
    console.log('Mutual interest for regular1 already exists, skipping');
  }

  // mutual interest: regular2 ↔ negJob2
  try {
    const mi2 = await prisma.interest.create({
      data: {
        jobId: negJob2.id,
        userId: regularIds[1],
        userInterested: true,
        businessInterested: true,
      },
    });
    interestRecords.push(mi2);
    console.log(`Created mutual interest: regular2 ↔ job ${negJob2.id}`);
  } catch (e) {
    console.log('Mutual interest for regular2 already exists, skipping');
  }

  console.log(`Created ${interestRecords.length} interests`);

  // --- Negotiations ---
  // Create a couple of failed negotiations from filled jobs
  const filledJobs = jobRecords.filter(j => j.status === 'filled');
  let negCount = 0;

  for (let i = 0; i < 3; i++) {
    const job = filledJobs[i];
    // Create the interest that led to the successful negotiation
    let interest;
    try {
      interest = await prisma.interest.create({
        data: {
          jobId: job.id,
          userId: job.workerId,
          userInterested: true,
          businessInterested: true,
        },
      });
    } catch (e) {
      // might already exist
      interest = await prisma.interest.findFirst({
        where: { jobId: job.id, userId: job.workerId },
      });
    }
    if (interest) {
      await prisma.negotiation.create({
        data: {
          jobId: job.id,
          userId: job.workerId,
          businessId: job.businessId,
          interestId: interest.id,
          status: 'success',
          candidateDecision: 'accept',
          businessDecision: 'accept',
          expiresAt: pastDate(9 - i, 12),
        },
      });
      negCount++;
    }
  }

  // Failed negotiations from mutual interests
  const mutualInterests = interestRecords.filter(
    ir => ir.userInterested === true && ir.businessInterested === true
  );
  for (let i = 0; i < Math.min(4, mutualInterests.length); i++) {
    const interest = mutualInterests[i];
    const job = jobRecords.find(j => j.id === interest.jobId);
    if (job) {
      await prisma.negotiation.create({
        data: {
          jobId: job.id,
          userId: interest.userId,
          businessId: job.businessId,
          interestId: interest.id,
          status: 'failed',
          candidateDecision: i % 2 === 0 ? 'accept' : 'decline',
          businessDecision: i % 2 === 0 ? 'decline' : 'accept',
          expiresAt: pastDate(1 + i, 12),
        },
      });
      negCount++;
    }
  }

  // More failed negotiations from additional interests to hit pagination (11+)
  // Create dedicated interests for these
  for (let i = 0; i < 5; i++) {
    const job = openJobs[(i + 12) % openJobs.length];
    const userId = regularIds[i % 15];
    try {
      const interest = await prisma.interest.create({
        data: {
          jobId: job.id,
          userId: userId,
          userInterested: true,
          businessInterested: true,
        },
      });
      await prisma.negotiation.create({
        data: {
          jobId: job.id,
          userId: userId,
          businessId: job.businessId,
          interestId: interest.id,
          status: 'failed',
          candidateDecision: 'decline',
          businessDecision: null,
          expiresAt: pastDate(2 + i, 10),
        },
      });
      negCount++;
    } catch (e) {
      // skip if duplicate interest
    }
  }

  // Add negotiation messages to the successful negotiations
  let msgCount = 0;
  const successNegs = await prisma.negotiation.findMany({
    where: { status: 'success' },
  });
  const chatMessages = [
    'Hi! I can confirm I\'m available for this shift.',
    'Great, thanks for confirming. Could you arrive 10 minutes early?',
    'Absolutely, I\'ll be there early.',
    'Perfect. Looking forward to working with you!',
    'See you then!',
  ];
  for (const neg of successNegs) {
    for (let m = 0; m < chatMessages.length; m++) {
      const senderAccountId = m % 2 === 0 ? neg.userId : neg.businessId;
      await prisma.negotiationMessage.create({
        data: {
          negotiationId: neg.id,
          senderAccountId: senderAccountId,
          text: chatMessages[m],
          createdAt: new Date(neg.createdAt.getTime() + m * 60000),
        },
      });
      msgCount++;
    }
  }

  console.log(`Created ${negCount} negotiations`);
  console.log(`Created ${msgCount} negotiation messages`);
  console.log('\nSeed complete!');
  console.log(`Password for all accounts: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
