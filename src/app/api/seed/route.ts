import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ message: 'Seeding completed', result });
  } catch (error) {
    return NextResponse.json({ message: 'Seeding failed', error }, { status: 500 });
  }
}
