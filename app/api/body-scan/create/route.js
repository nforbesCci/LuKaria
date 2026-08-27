import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import { createMeasurement, sanitizeMeasurement } from '../../../../lib/fitxpress';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function toNum(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Accept height as cm, or feet+inches, or inches. */
function resolveHeightCm(body) {
  const direct = toNum(body.height ?? body.heightCm);
  if (direct != null) return direct;

  const feet = toNum(body.heightFeet);
  const inches = toNum(body.heightInches);
  if (feet != null || inches != null) {
    return (feet || 0) * 30.48 + (inches || 0) * 2.54;
  }

  const totalInches = toNum(body.heightIn);
  if (totalInches != null) return totalInches * 2.54;

  return null;
}

/** Accept weight as kg or lb. */
function resolveWeightKg(body) {
  const kg = toNum(body.weight ?? body.weightKg);
  if (kg != null) return kg;
  const lb = toNum(body.weightLb ?? body.weightLbs);
  if (lb != null) return lb / 2.2046226218;
  return null;
}

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gender, age, frontPhoto, sidePhoto } = body || {};

    if (!gender || !frontPhoto || !sidePhoto) {
      return NextResponse.json(
        {
          error:
            'gender, frontPhoto, and sidePhoto are required (also provide height / heightCm or heightFeet+heightInches)',
        },
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

    const heightCm = resolveHeightCm(body || {});
    if (heightCm == null || heightCm < 145 || heightCm > 220) {
      return NextResponse.json(
        { error: 'height must be between 145 and 220 cm (or equivalent imperial)' },
        { status: 400 },
      );
    }

    const weightKg = resolveWeightKg(body || {});
    if (weightKg != null && (weightKg < 40 || weightKg > 200)) {
      return NextResponse.json(
        { error: 'weight must be between 40 and 200 kg (or equivalent lb)' },
        { status: 400 },
      );
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
    const sanitized = sanitizeMeasurement(measurement);
    const doc = {
      userId,
      userEmail,
      measurementId: measurement.id,
      status: measurement.status || 'pending',
      gender: genderNorm,
      heightCm,
      weightKg,
      age: ageNum,
      // Full FitXpress payload (photos stripped) — all circumference / linear / volume fields
      result: sanitized,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('bodyScans').insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        measurementId: measurement.id,
        status: measurement.status,
        measurement: sanitized,
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
