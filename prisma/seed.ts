import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin
  const adminPassword = await bcrypt.hash("Admin@123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@learnhub.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@learnhub.com",
      password: adminPassword,
      role: "ADMIN",
      isApproved: true,
      isActive: true,
      referralCode: "ADMIN001",
    },
  });

  // Create instructor
  const instructorPassword = await bcrypt.hash("Instructor@123!", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@learnhub.com" },
    update: {},
    create: {
      name: "John Instructor",
      email: "instructor@learnhub.com",
      password: instructorPassword,
      role: "INSTRUCTOR",
      isApproved: true,
      isActive: true,
      bio: "Expert instructor with 10 years of experience in software development.",
      referralCode: "INST001",
    },
  });

  // Create student
  const studentPassword = await bcrypt.hash("Student@123!", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@learnhub.com" },
    update: {},
    create: {
      name: "Jane Student",
      email: "student@learnhub.com",
      password: studentPassword,
      role: "STUDENT",
      isApproved: true,
      isActive: true,
      referralCode: "STU001",
    },
  });

  // Create categories
  const categories = [
    { name: "Web Development", slug: "web-development", icon: "💻" },
    { name: "Data Science", slug: "data-science", icon: "📊" },
    { name: "Design", slug: "design", icon: "🎨" },
    { name: "Business", slug: "business", icon: "💼" },
    { name: "Marketing", slug: "marketing", icon: "📢" },
    { name: "Photography", slug: "photography", icon: "📷" },
    { name: "Music", slug: "music", icon: "🎵" },
    { name: "Health & Fitness", slug: "health-fitness", icon: "💪" },
    { name: "Personal Development", slug: "personal-development", icon: "🧠" },
    { name: "Technology", slug: "technology", icon: "⚙️" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const webDevCategory = await prisma.category.findUnique({ where: { slug: "web-development" } });

  // Create a sample course
  const course = await prisma.course.upsert({
    where: { slug: "complete-nextjs-course-2024" },
    update: {},
    create: {
      title: "Complete Next.js 14 Course",
      slug: "complete-nextjs-course-2024",
      description: "Master Next.js 14 with the App Router. Build production-ready full-stack applications with TypeScript, Prisma, and Tailwind CSS.",
      shortDesc: "Build modern full-stack apps with Next.js 14, TypeScript, and Tailwind CSS",
      price: 500,
      originalPrice: 999,
      currency: "ZMW",
      level: "INTERMEDIATE",
      language: "English",
      status: "PUBLISHED",
      isFeatured: true,
      instructorId: instructor.id,
      categoryId: webDevCategory?.id,
      requirements: ["Basic HTML/CSS knowledge", "JavaScript fundamentals"],
      objectives: [
        "Build full-stack apps with Next.js 14",
        "Master the App Router",
        "Implement authentication with NextAuth",
        "Work with databases using Prisma",
        "Deploy to Vercel",
      ],
      tags: ["nextjs", "react", "typescript", "fullstack"],
      publishedAt: new Date(),
    },
  });

  // Create sections and lessons
  const section1 = await prisma.section.upsert({
    where: { id: "seed-section-1" },
    update: {},
    create: {
      id: "seed-section-1",
      title: "Getting Started",
      order: 0,
      courseId: course.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-1" },
    update: {},
    create: {
      id: "seed-lesson-1",
      title: "Introduction to Next.js 14",
      type: "VIDEO",
      duration: 600,
      order: 0,
      isFree: true,
      sectionId: section1.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-2" },
    update: {},
    create: {
      id: "seed-lesson-2",
      title: "Setting Up Your Project",
      type: "VIDEO",
      duration: 900,
      order: 1,
      isFree: false,
      sectionId: section1.id,
    },
  });

  await prisma.course.update({
    where: { id: course.id },
    data: { totalLessons: 2, totalDuration: 1500 },
  });

  console.log("✅ Seed complete!");
  console.log(`
  📝 Test Credentials:
  Admin: admin@learnhub.com / Admin@123!
  Instructor: instructor@learnhub.com / Instructor@123!
  Student: student@learnhub.com / Student@123!
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
