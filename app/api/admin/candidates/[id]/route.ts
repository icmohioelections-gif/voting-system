import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PATCH - Update candidate
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, position, photo_url, description } = await request.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (position !== undefined) updateData.position = position.trim();
    if (photo_url !== undefined) updateData.photo_url = photo_url?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('candidates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Candidate update error:', error);
      return NextResponse.json(
        { error: 'Failed to update candidate', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate: data,
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Candidate delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete candidate', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
