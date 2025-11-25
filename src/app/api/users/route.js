import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Create or get user (idempotent)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, email, name, image } = body;

    // Validation
    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: 'User id and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking user:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check user existence' },
        { status: 500 }
      );
    }

    // If user already exists, return success
    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        created: false
      });
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id,
        email,
        name: name || null,
        image: image || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      created: true
    });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

