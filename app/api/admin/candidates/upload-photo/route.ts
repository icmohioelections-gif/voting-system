import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Upload candidate photo (using base64 data URL for simplicity)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const candidateId = formData.get('candidateId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB for base64 storage)
    const maxSize = 2 * 1024 * 1024; // 2MB (base64 increases size by ~33%)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 2MB. Please compress the image or use a smaller file.' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update candidate with photo data URL
    const { error: updateError } = await supabaseAdmin
      .from('candidates')
      .update({ 
        photo_url: dataUrl, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', candidateId);

    if (updateError) {
      console.error('Candidate update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update candidate photo', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo_url: dataUrl,
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
