import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Generate letter for a single voter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const electionCode = searchParams.get('election_code');
    const templateId = searchParams.get('template_id');

    if (!electionCode) {
      return NextResponse.json(
        { error: 'Election code is required' },
        { status: 400 }
      );
    }

    // Get voter
    const { data: voter, error: voterError } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('election_code', electionCode)
      .single();

    if (voterError || !voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // Get template
    let template;
    if (templateId) {
      const { data } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      template = data;
    }

    if (!template) {
      // Get default template
      const { data } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .eq('is_default', true)
        .single();
      template = data;
    }

    // Use default template if none found
    if (!template) {
      template = {
        content: `<div style="page-break-after: always; padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="border: 2px solid #333; padding: 30px; min-height: 500px;">
            <h2 style="font-size: 24px; margin-bottom: 30px; color: #1f2937;">Voting Instructions</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Dear <strong>{{full_name}}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your Election Code: <strong>{{election_code}}</strong></p>
          </div>
        </div>`,
      };
    }

    // Replace template variables
    const fullName = `${voter.first_name} ${voter.last_name || ''}`.trim();
    let letterContent = template.content
      .replace(/\{\{full_name\}\}/g, fullName)
      .replace(/\{\{first_name\}\}/g, voter.first_name)
      .replace(/\{\{last_name\}\}/g, voter.last_name || '')
      .replace(/\{\{election_code\}\}/g, voter.election_code)
      .replace(/\{\{#last_name\}\}(.*?)\{\{\/last_name\}\}/g, voter.last_name ? '$1' : '');

    // Create complete HTML document
    const htmlDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Voter Letter - ${voter.election_code}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${letterContent}
        </body>
      </html>
    `;

    return new NextResponse(htmlDocument, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="voter-letter-${voter.election_code}.html"`,
      },
    });
  } catch (error) {
    console.error('Generate letter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
