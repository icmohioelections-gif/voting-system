import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: voters, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Voters fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch voters' },
        { status: 500 }
      );
    }

    // Generate HTML letters for each voter
    const lettersHtml = (voters || []).map((voter) => {
      const fullName = `${voter.first_name} ${voter.last_name || ''}`.trim();
      return `
        <div style="page-break-after: always; padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="border: 2px solid #333; padding: 30px; min-height: 500px;">
            <h2 style="font-size: 24px; margin-bottom: 30px; color: #1f2937;">Voting Instructions</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>${fullName}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              You are registered to vote in the upcoming election. Please use the following information to access the voting system:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; margin-bottom: 10px; color: #6b7280;">Your Unique Election Code:</p>
              <p style="font-size: 28px; font-weight: bold; font-family: monospace; color: #1f2937; letter-spacing: 2px;">
                ${voter.election_code}
              </p>
            </div>
            
            <div style="margin: 30px 0;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                <strong>To vote online:</strong>
              </p>
              <ol style="font-size: 16px; line-height: 1.8; padding-left: 25px;">
                <li>Visit the voting website</li>
                <li>Click "Vote Now" or go to the login page</li>
                <li>Enter your Election Code: <strong>${voter.election_code}</strong></li>
                <li>Enter your name: <strong>${voter.first_name}${voter.last_name ? ' ' + voter.last_name : ''}</strong></li>
                <li>Review the candidates and cast your vote</li>
              </ol>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">
                <strong>Voter Information:</strong>
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                Name: ${fullName}<br>
                Election Code: ${voter.election_code}
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Create complete HTML document
    const htmlDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Voter Letters - ${new Date().toLocaleDateString()}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${lettersHtml}
        </body>
      </html>
    `;

    // Return as downloadable HTML file
    return new NextResponse(htmlDocument, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="voter-letters-${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error) {
    console.error('Letter generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
