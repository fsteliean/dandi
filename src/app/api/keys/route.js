import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Retrieve all API keys
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, monthlyLimit } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate a new API key
    const newKey = `pk_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
    
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        name,
        key: newKey,
        monthly_limit: monthlyLimit || 1000,
        permissions: ['read', 'write']
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        name: data.name,
        key: data.key,
        monthlyLimit: data.monthly_limit,
        permissions: data.permissions,
        createdAt: data.created_at.split('T')[0],
        lastUsed: data.last_used ? data.last_used.split('T')[0] : 'Never'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// PUT - Update an API key
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, monthlyLimit } = body;

    // Validation
    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .update({
        name,
        monthly_limit: monthlyLimit || 1000
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        name: data.name,
        key: data.key,
        monthlyLimit: data.monthly_limit,
        permissions: data.permissions,
        createdAt: data.created_at.split('T')[0],
        lastUsed: data.last_used ? data.last_used.split('T')[0] : 'Never'
      }
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an API key
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'API key ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        name: data.name,
        key: data.key,
        monthlyLimit: data.monthly_limit,
        permissions: data.permissions,
        createdAt: data.created_at.split('T')[0],
        lastUsed: data.last_used ? data.last_used.split('T')[0] : 'Never'
      },
      message: 'API key deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
