import { NextResponse } from 'next/server';
import APP from '@/config';

const { apiUrl, apiToken } = APP.ctfc;

async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        raw: text || null
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      data
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      data: {
        error: err.message || 'Unknown fetch error'
      }
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const action = searchParams.get('action');

  if (action === 'inspect') {
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Missing service name' },
        { status: 400 }
      );
    }

    const result = await safeFetch(
      `${apiUrl}/inspect/${name}`,
      {
        headers: {
          'X-CTFC-Token': apiToken
        }
      }
    );

    return NextResponse.json(result.data, {
      status: result.status
    });
  }

  if (action !== 'status') {
    return NextResponse.json(
      { error: 'Invalid GET action' },
      { status: 400 }
    );
  }

  const result = await safeFetch(
    `${apiUrl}/status`,
    {
      headers: {
        'X-CTFC-Token': apiToken
      }
    }
  );

  return NextResponse.json(result.data, {
    status: result.status
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { action, name } = body;

    if (!['up', 'down', 'restart', 'extend'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Missing challenge name' },
        { status: 400 }
      );
    }

    const result = await safeFetch(
      `${apiUrl}/${action}/${name}`,
      {
        method: 'POST',
        headers: {
          'X-CTFC-Token': apiToken
        }
      }
    );

    return NextResponse.json(result.data, {
      status: result.status
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Unknown server error'
      },
      {
        status: 500
      }
    );
  }
}
