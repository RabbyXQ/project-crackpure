'use service'

import { NextResponse } from 'next/server';
import connection from '../../../../utils/db';

type Admin = {
  username: string;
  email?: string;
};

// Handle GET requests to fetch all admins
export async function GET() {
  return new Promise<NextResponse>((resolve, reject) => {
    connection.query('SELECT * FROM admin', (error, results) => {
      if (error) {
        reject(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ admins: results as Admin[] }));
    });
  });
}

// Handle POST requests to insert a new admin
export async function POST(request: Request) {
  const { username, email } = await request.json();

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve, reject) => {
    connection.query('INSERT INTO admin (username, email) VALUES (?, ?)', [username, email], (error) => {
      if (error) {
        reject(NextResponse.json({ error: 'Failed to insert data' }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ message: 'Admin added successfully' }, { status: 201 }));
    });
  });
}

// Handle PUT requests to update an existing admin
export async function PUT(request: Request) {
  const { id, username, email } = await request.json();

  if (!id || !username) {
    return NextResponse.json({ error: 'ID and username are required' }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve, reject) => {
    connection.query('UPDATE admin SET username = ?, email = ? WHERE id = ?', [username, email, id], (error) => {
      if (error) {
        reject(NextResponse.json({ error: 'Failed to update data' }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ message: 'Admin updated successfully' }, { status: 200 }));
    });
  });
}

// Handle DELETE requests to remove an admin
export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve, reject) => {
    connection.query('DELETE FROM admin WHERE id = ?', [id], (error) => {
      if (error) {
        reject(NextResponse.json({ error: 'Failed to delete data' }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ message: 'Admin deleted successfully' }, { status: 200 }));
    });
  });
}
