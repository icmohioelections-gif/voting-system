import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Email letter to voter
export async function POST(request: NextRequest) {
  try {
    const { election_code, email, template_id } = await request.json();

    if (!election_code) {
      return NextResponse.json(
        { error: 'Election code is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Get voter
    const { data: voter, error: voterError } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('election_code', election_code)
      .single();

    if (voterError || !voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // Get template
    let template;
    if (template_id) {
      const { data } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .eq('id', template_id)
        .single();
      template = data;
    }

    if (!template) {
      const { data } = await supabaseAdmin
        .from('letter_templates')
        .select('*')
        .eq('is_default', true)
        .single();
      template = data;
    }

    // Replace template variables
    const fullName = `${voter.first_name} ${voter.last_name || ''}`.trim();
    let letterContent = template?.content || '';
    letterContent = letterContent
      .replace(/\{\{full_name\}\}/g, fullName)
      .replace(/\{\{first_name\}\}/g, voter.first_name)
      .replace(/\{\{last_name\}\}/g, voter.last_name || '')
      .replace(/\{\{election_code\}\}/g, voter.election_code)
      .replace(/\{\{#last_name\}\}(.*?)\{\{\/last_name\}\}/g, voter.last_name ? '$1' : '');

    // TODO: Implement actual email sending
    // For now, we'll use a simple approach or integrate with a service like SendGrid, Resend, etc.
    // This is a placeholder - you'll need to configure an email service
    
    // Example using a simple approach (you'll need to set up an email service)
    // For production, use: SendGrid, Resend, AWS SES, or similar
    
    // Check if email service is configured
    const emailServiceConfigured = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.SMTP_HOST;
    
    if (!emailServiceConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured. Please set up RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials in environment variables.',
        message: 'Email service not configured yet. Please contact your administrator.',
      }, { status: 503 });
    }

    // If email service is configured, attempt to send
    // For now, return success with a note that implementation is needed
    return NextResponse.json({
      success: true,
      message: `Email service is configured. Letter would be sent to ${email}.`,
      note: 'Email sending functionality needs to be implemented with your configured service.',
    });

    /* 
    // Example with Resend (uncomment and configure):
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'elections@yourdomain.com',
      to: email,
      subject: 'Your Election Code - Voting Instructions',
      html: letterContent,
    });
    
    return NextResponse.json({
      success: true,
      message: `Letter sent successfully to ${email}`,
    });
    */
  } catch (error) {
    console.error('Email letter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
