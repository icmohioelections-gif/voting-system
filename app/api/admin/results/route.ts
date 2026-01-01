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
    
    interface VoteWithCandidate {
      candidate_id: string;
      candidates: Candidate | null;
    }
    
    const voteCounts: Record<string, VoteCount> = {};
    
    votes?.forEach((vote: VoteWithCandidate) => {
      const candidateId = vote.candidate_id;
      if (!voteCounts[candidateId]) {
        voteCounts[candidateId] = {
          candidate: vote.candidates,
          count: 0,
        };
      }
      voteCounts[candidateId].count++;
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

