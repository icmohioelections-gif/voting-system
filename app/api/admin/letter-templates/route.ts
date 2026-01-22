import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get all templates or a specific template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const defaultOnly = searchParams.get('default') === 'true';

    if (id) {
      // Get specific template
      const { data, error } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, template: data });
    }

    if (defaultOnly) {
      // Get default template
      const { data, error } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .eq('is_default', true)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Default template not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, template: data });
    }

    // Get all templates
    const { data, error } = await supabaseAdmin
      .from('letter_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, templates: data || [] });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const { name, content, is_default } = await request.json();

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabaseAdmin
        .from('letter_templates')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabaseAdmin
      .from('letter_templates')
      .insert({
        name,
        content,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template: data,
    });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update template
export async function PATCH(request: NextRequest) {
  try {
    const { id, name, content, is_default } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (is_default !== undefined) {
      updateData.is_default = is_default;
      // If setting as default, unset other defaults
      if (is_default) {
        await supabaseAdmin
          .from('letter_templates')
          .update({ is_default: false })
          .neq('id', id);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('letter_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      template: data,
    });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if it's the default template
    const { data: template } = await supabaseAdmin
      .from('letter_templates')
      .select('is_default')
      .eq('id', id)
      .single();

    if (template?.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default template. Set another template as default first.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('letter_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
