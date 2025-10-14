import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Validate an API key
export async function POST(request) {
  try {
    const body = await request.json();
    const { key } = body;

    // Validation
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Check if the API key exists in the database
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key, monthly_limit, permissions, created_at, last_used')
      .eq('key', key)
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Invalid API key'
      });
    }

    // Update last_used timestamp
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', data.id);

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        id: data.id,
        name: data.name,
        key: data.key,
        monthlyLimit: data.monthly_limit,
        permissions: data.permissions,
        createdAt: data.created_at,
        lastUsed: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}
