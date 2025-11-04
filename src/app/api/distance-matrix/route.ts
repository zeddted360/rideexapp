import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origins = searchParams.get('origins');
    const destinations = searchParams.get('destinations');
    const key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!origins || !destinations || !key) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${key}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    // Log the request for debugging
    console.log('Distance Matrix API Request:', {
      origins,
      destinations,
      status: data.status,
      elements: data.rows?.[0]?.elements?.[0]?.status
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Distance Matrix API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch distance matrix data' },
      { status: 500 }
    );
  }
} 