'use service';

import { NextResponse } from 'next/server';
import connection from '../../../../utils/db';
import bcrypt from 'bcrypt';

type Admin = {
  username: string;
  email?: string;
  password?: string;
};

// Handle GET requests to fetch all admins
export async function GET() {
  try {
    console.log('Handling GET request');
    return new Promise<NextResponse>((resolve, reject) => {
      connection.query('SELECT * FROM admin', (error, results) => {
        if (error) {
          console.error('Database query failed:', error);
          reject(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
          return;
        }
        console.log('Fetched admins:', results);
        resolve(NextResponse.json({ admins: results as Admin[] }));
      });
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST requests to insert a new admin
export async function POST(request: Request) {
  try {
    const { username, password, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(
        'INSERT INTO admin (username, passwd, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email],
        (error) => {
          if (error) {
            console.error('Failed to insert data:', error);
            reject(NextResponse.json({ error: 'Failed to insert data' }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ message: 'Admin added successfully' }, { status: 201 }));
        }
      );
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle PUT requests to update an admin
export async function PUT(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const query = 'UPDATE admin SET email = ?, passwd = ? WHERE username = ?';
    const values = [email, password, username];

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(query, values, (error) => {
        if (error) {
          console.error('Failed to update data:', error);
          reject(NextResponse.json({ error: 'Failed to update data' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ message: 'Admin updated successfully' }, { status: 200 }));
      });
    });
  } catch (error) {
    console.error('Error in PUT request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle DELETE requests to delete an admin
export async function DELETE(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const query = 'DELETE FROM admin WHERE username = ?';

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(query, [username], (error) => {
        if (error) {
          console.error('Failed to delete data:', error);
          reject(NextResponse.json({ error: 'Failed to delete data' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ message: 'Admin deleted successfully' }, { status: 200 }));
      });
    });
  } catch (error) {
    console.error('Error in DELETE request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
