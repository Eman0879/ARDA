// ===== app/api/user/theme/route.ts =====
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import UserPreference from '@/models/UserPreference';

// GET - Fetch user's theme preference
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Uses unique index on username for fast lookup
    let userPreference = await UserPreference.findOne({ username }).lean();

    // If no preference exists, return default theme
    if (!userPreference) {
      return NextResponse.json({
        theme: 'dark',
        isDefault: true,
      });
    }

    return NextResponse.json({
      theme: userPreference.theme,
      fontSize: userPreference.fontSize,
      notifications: userPreference.notifications,
      updatedAt: userPreference.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme preference' },
      { status: 500 }
    );
  }
}

// POST - Save user's theme preference
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, theme } = body;

    // Validation
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { error: 'Valid theme is required (light or dark)' },
        { status: 400 }
      );
    }

    // Uses unique index on username for efficient upsert
    const userPreference = await UserPreference.findOneAndUpdate(
      { username },
      { 
        username,
        theme,
      },
      { 
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Theme preference saved successfully',
      theme: userPreference.theme,
      updatedAt: userPreference.updatedAt,
    });
  } catch (error) {
    console.error('Error saving theme preference:', error);
    return NextResponse.json(
      { error: 'Failed to save theme preference' },
      { status: 500 }
    );
  }
}

// PATCH - Update specific preference fields
export async function PATCH(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, ...updates } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Uses unique index on username for efficient upsert
    const userPreference = await UserPreference.findOneAndUpdate(
      { username },
      { $set: updates },
      { 
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: userPreference,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}