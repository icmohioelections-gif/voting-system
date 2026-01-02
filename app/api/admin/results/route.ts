import { NextResponse } from 'next/server';
import { supabaseAdmin, Candidate } from '@/lib/supabase';

export async function GET() {
  try {
    // Get vote counts by candidate
    const { data: votes, error: votesError } = await supabaseAdmin
      .from('votes')
      .select(`
        candidate_id,
        candidates (
          id,
          name,
          position
        )
      `);

    if (votesError) {
      console.error('Votes fetch error:', votesError);
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      );
    }

    // Count votes per candidate
    interface VoteCount {
      candidate: Candidate;
      count: number;
    }
    
    interface CandidatePartial {
      id: string;
      name: string;
      position: string;
    }
    
    interface VoteRow {
      candidate_id: string;
      candidates: CandidatePartial | CandidatePartial[] | null;
    }
    
    const voteCounts: Record<string, VoteCount> = {};
    
    votes?.forEach((vote: VoteRow) => {
      const candidateId = vote.candidate_id;
      // Handle both array and single candidate responses from Supabase
      const candidatePartial = Array.isArray(vote.candidates) 
        ? vote.candidates[0] 
        : vote.candidates;
      
      if (candidatePartial && !voteCounts[candidateId]) {
        // Convert partial candidate to full Candidate type
        const candidate: Candidate = {
          id: candidatePartial.id,
          name: candidatePartial.name,
          position: candidatePartial.position,
          photo_url: null,
          description: null,
          created_at: '', // Not needed for results
          updated_at: '', // Not needed for results
        };
        voteCounts[candidateId] = {
          candidate: candidate,
          count: 0,
        };
      }
      if (voteCounts[candidateId]) {
        voteCounts[candidateId].count++;
      }
    });

    // Get total voters and voted count
    const { count: totalVoters } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true });

    const { count: votedCount } = await supabaseAdmin
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', true);

    const results = Object.values(voteCounts).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      results,
      statistics: {
        total_voters: totalVoters || 0,
        votes_cast: votedCount || 0,
        turnout_percentage: totalVoters
          ? ((votedCount || 0) / totalVoters * 100).toFixed(2)
          : '0.00',
      },
    });
  } catch (error) {
    console.error('Results API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

