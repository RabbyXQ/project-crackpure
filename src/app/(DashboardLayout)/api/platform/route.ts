'use service';

import { NextResponse } from 'next/server';
import connection from '../../../../utils/db';

type Platform = {
  platform_id: number;
  platform_name: string;
  description?: string;
};

// Handle GET requests to fetch all platforms
export async function GET() {
  try {
    console.log('Handling GET request for platforms');
    return new Promise<NextResponse>((resolve, reject) => {
      connection.query('SELECT * FROM platform', (error, results) => {
        if (error) {
          console.error('Database query failed:', error);
          reject(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
          return;
        }
        console.log('Fetched platforms:', results);
        resolve(NextResponse.json({ platforms: results as Platform[] }));
      });
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST requests to insert a new platform
export async function POST(request: Request) {
  try {
    const { platform_name, description } = await request.json();

    if (!platform_name) {
      return NextResponse.json({ error: 'Platform name is required' }, { status: 400 });
    }

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(
        'INSERT INTO platform (platform_name, description) VALUES (?, ?)',
        [platform_name, description],
        (error) => {
          if (error) {
            console.error('Failed to insert data:', error);
            reject(NextResponse.json({ error: 'Failed to insert data' }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ message: 'Platform added successfully' }, { status: 201 }));
        }
      );
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle PUT requests to update a platform
export async function PUT(request: Request) {
  try {
    const { platform_id, platform_name, description } = await request.json();

    if (!platform_id) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    const query = 'UPDATE platform SET platform_name = ?, description = ? WHERE platform_id = ?';
    const values = [platform_name, description, platform_id];

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(query, values, (error) => {
        if (error) {
          console.error('Failed to update data:', error);
          reject(NextResponse.json({ error: 'Failed to update data' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ message: 'Platform updated successfully' }, { status: 200 }));
      });
    });
  } catch (error) {
    console.error('Error in PUT request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle DELETE requests to delete a platform
export async function DELETE(request: Request) {
  try {
    const { platform_id } = await request.json();

    if (!platform_id) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    const query = 'DELETE FROM platform WHERE platform_id = ?';

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(query, [platform_id], (error) => {
        if (error) {
          console.error('Failed to delete data:', error);
          reject(NextResponse.json({ error: 'Failed to delete data' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ message: 'Platform deleted successfully' }, { status: 200 }));
      });
    });
  } catch (error) {
    console.error('Error in DELETE request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
