import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import { createMeasurement, sanitizeMeasurement } from '../../../../lib/fitxpress';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { height, weight, gender, age, frontPhoto, sidePhoto } = body || {};

    if (!height || !gender || !frontPhoto || !sidePhoto) {
      return NextResponse.json(
        { error: 'height, gender, frontPhoto, and sidePhoto are required' },
        { status: 400 },
      );
    }

    const genderNorm = String(gender).toLowerCase();
    if (genderNorm !== 'male' && genderNorm !== 'female') {
      return NextResponse.json(
        { error: 'gender must be male or female' },
        { status: 400 },
      );
    }

    const heightCm = Number(height);
    if (!Number.isFinite(heightCm) || heightCm < 145 || heightCm > 220) {
      return NextResponse.json(
        { error: 'height must be between 145 and 220 cm' },
        { status: 400 },
      );
    }

    let weightKg = null;
    if (weight != null && weight !== '') {
      weightKg = Number(weight);
      if (!Number.isFinite(weightKg) || weightKg < 40 || weightKg > 200) {
        return NextResponse.json(
          { error: 'weight must be between 40 and 200 kg' },
          { status: 400 },
        );
      }
    }

    let ageNum = null;
    if (age != null && age !== '') {
      ageNum = Number(age);
      if (!Number.isFinite(ageNum) || ageNum < 16 || ageNum > 85) {
        return NextResponse.json(
          { error: 'age must be between 16 and 85' },
          { status: 400 },
        );
      }
    }

    const measurement = await createMeasurement({
      height: heightCm,
      weight: weightKg,
      gender: genderNorm,
      age: ageNum,
      frontPhoto,
      sidePhoto,
    });

    const userId = session.user.sub;
    const userEmail = session.user.email;
    const db = await getDatabase();
    const now = new Date();
    const doc = {
      userId,
      userEmail,
      measurementId: measurement.id,
      status: measurement.status || 'pending',
      gender: genderNorm,
      heightCm,
      weightKg,
      age: ageNum,
      result: sanitizeMeasurement(measurement),
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('bodyScans').insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        measurementId: measurement.id,
        status: measurement.status,
        measurement: sanitizeMeasurement(measurement),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Body scan create error:', error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return NextResponse.json(
      {
        error: error.message || 'Failed to create body scan',
        details: error.payload || undefined,
      },
      { status },
    );
  }
}
