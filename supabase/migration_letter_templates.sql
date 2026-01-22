-- Migration: Add letter_templates table
-- Execute this in Supabase SQL Editor

-- Create letter_templates table to store letter templates
CREATE TABLE IF NOT EXISTS letter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Default Template',
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default template
INSERT INTO letter_templates (name, content, is_default)
VALUES (
    'Default Template',
    '<div style="page-break-after: always; padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="border: 2px solid #333; padding: 30px; min-height: 500px;">
        <h2 style="font-size: 24px; margin-bottom: 30px; color: #1f2937;">Voting Instructions</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>{{full_name}}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          You are registered to vote in the upcoming election. Please use the following information to access the voting system:
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <p style="font-size: 14px; margin-bottom: 10px; color: #6b7280;">Your Unique Election Code:</p>
          <p style="font-size: 28px; font-weight: bold; font-family: monospace; color: #1f2937; letter-spacing: 2px;">
            {{election_code}}
          </p>
        </div>
        
        <div style="margin: 30px 0;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            <strong>To vote online:</strong>
          </p>
          <ol style="font-size: 16px; line-height: 1.8; padding-left: 25px;">
            <li>Visit the voting website</li>
            <li>Click "Vote Now" or go to the login page</li>
            <li>Enter your Election Code: <strong>{{election_code}}</strong></li>
            <li>Enter your name: <strong>{{first_name}}{{#last_name}} {{last_name}}{{/last_name}}</strong></li>
            <li>Review the candidates and cast your vote</li>
          </ol>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">
            <strong>Voter Information:</strong>
          </p>
          <p style="font-size: 14px; color: #6b7280;">
            Name: {{full_name}}<br>
            Election Code: {{election_code}}
          </p>
        </div>
      </div>
    </div>',
    true
)
ON CONFLICT DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_letter_templates_is_default ON letter_templates(is_default);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_letter_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_letter_templates_updated_at ON letter_templates;
CREATE TRIGGER update_letter_templates_updated_at 
    BEFORE UPDATE ON letter_templates
    FOR EACH ROW EXECUTE FUNCTION update_letter_templates_updated_at();

-- RLS Policy for letter_templates
ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything on letter_templates" ON letter_templates;
CREATE POLICY "Service role can do everything on letter_templates"
ON letter_templates FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
