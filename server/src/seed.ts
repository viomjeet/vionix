import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Upsert users
  const elena = await prisma.user.upsert({
    where: { username: 'elena' },
    update: {},
    create: {
      name: 'Elena Rostova',
      username: 'elena',
      email: 'elena@example.com',
      passwordHash,
      bio: 'Distributed systems engineer and open source contributor.',
    },
  });

  const marcus = await prisma.user.upsert({
    where: { username: 'marcus' },
    update: {},
    create: {
      name: 'Marcus Chen',
      username: 'marcus',
      email: 'marcus@example.com',
      passwordHash,
      bio: 'Product architect focusing on clean UI architecture and usability.',
    },
  });

  const devin = await prisma.user.upsert({
    where: { username: 'devin' },
    update: {},
    create: {
      name: 'Devin Vance',
      username: 'devin',
      email: 'devin@example.com',
      passwordHash,
      bio: 'TypeScript developer, exploring high-performance backend patterns.',
    },
  });

  // 4 Additional Creator Users
  const sophia = await prisma.user.upsert({
    where: { username: 'sophia_drone' },
    update: {},
    create: {
      name: 'Sophia Vance',
      username: 'sophia_drone',
      email: 'sophia@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Wildlife cinematographer & drone pilot. Exploring remote landscapes.',
    },
  });

  const arjun = await prisma.user.upsert({
    where: { username: 'arjun_dev' },
    update: {},
    create: {
      name: 'Arjun Patel',
      username: 'arjun_dev',
      email: 'arjun@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Senior creative developer & 3D animator. Building fluid web interactions.',
    },
  });

  const maya = await prisma.user.upsert({
    where: { username: 'maya_travels' },
    update: {},
    create: {
      name: 'Maya Lin',
      username: 'maya_travels',
      email: 'maya@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Travel creator & documentary photographer currently exploring South East Asia.',
    },
  });

  const david = await prisma.user.upsert({
    where: { username: 'david_fitness' },
    update: {},
    create: {
      name: 'David Miller',
      username: 'david_fitness',
      email: 'david@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Athletic performance coach & movement specialist. Strength, agility, and mobility.',
    },
  });

  // Add rich posts with images & dummy videos
  const creatorPosts = [
    {
      authorId: sophia.id,
      content: 'Morning aerial flight above the mist-covered pine ridge. Nature’s calm before the day begins. Notice the wind currents sweeping through the canopy.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
    {
      authorId: sophia.id,
      content: 'Golden hour reflection over the alpine lake. The lighting stayed perfect for roughly seven minutes before dusk.',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    },
    {
      authorId: arjun.id,
      content: 'Check out this 3D character motion demo rendered using WebGL and Blender shaders! Smooth 60fps pacing and clean physics weight.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      authorId: arjun.id,
      content: 'Minimalist mechanical keyboard and dual monitor workspace setup for maximum focus during deep architectural sprints.',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    },
    {
      authorId: maya.id,
      content: 'Breathtaking coastline views along the Pacific highway trail. The ocean breeze was unreal today!',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      authorId: maya.id,
      content: 'Traditional lantern festival illuminated through the night streets. The reflections in the water were pure magic.',
      imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
    },
    {
      authorId: david.id,
      content: 'High energy sprint drills and mobility warmups before today’s outdoor training session. Never skip ankle and hip prep.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    },
    {
      authorId: david.id,
      content: 'Clean nutrition and balanced fuel for recovery. Consistency is what compounds over months and years.',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const postData of creatorPosts) {
    const existing = await prisma.post.findFirst({
      where: {
        authorId: postData.authorId,
        content: postData.content,
      },
    });

    if (!existing) {
      await prisma.post.create({
        data: postData,
      });
    }
  }

  // Ensure Elena follows all creators so home feed is populated
  const creators = [sophia, arjun, maya, david, marcus, devin];
  for (const creator of creators) {
    if (creator.id !== elena.id) {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: elena.id,
            followingId: creator.id,
          },
        },
        update: {},
        create: {
          followerId: elena.id,
          followingId: creator.id,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
