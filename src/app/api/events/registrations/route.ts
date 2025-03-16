import { NextRequest, NextResponse } from 'next/server';
import { getTableData } from '@/lib/sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/events/registrations?company={companyName}&event={eventName} - Get registrations for an event
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get parameters from query
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company');
    const eventName = searchParams.get('event');
    
    if (!companyName || !eventName) {
      return NextResponse.json(
        { error: 'Company name and event name are required' },
        { status: 400 }
      );
    }
    
    // Check if user is admin or the company owner
    if (session.user.type !== 'admin' && session.user.name !== companyName) {
      return NextResponse.json(
        { error: 'Unauthorized to access this company\'s event registrations' },
        { status: 403 }
      );
    }
    
    // Get event registrations
    const tableData = await getTableData(companyName, eventName);
    
    // First row is headers
    const headers = tableData[0];
    
    // Find indices of settings columns
    const imageIndex = headers.indexOf('Image');
    const descriptionIndex = headers.indexOf('EventDescription');
    const dateIndex = headers.indexOf('EventDate');
    const statusIndex = headers.indexOf('EventStatus');
    
    // Map registrations to objects, filtering out settings rows
    const registrations = tableData.slice(1)
      .filter(row => {
        // Skip rows that only contain settings data
        const isSettingsRow = row.every((cell, index) => {
          // If this is a settings column and has data, or if the cell is empty
          return (
            (imageIndex !== -1 && index === imageIndex && cell) ||
            (descriptionIndex !== -1 && index === descriptionIndex && cell) ||
            (dateIndex !== -1 && index === dateIndex && cell) ||
            (statusIndex !== -1 && index === statusIndex && cell) ||
            !cell
          );
        });
        
        // Keep only non-settings rows
        return !isSettingsRow;
      })
      .map((row) => {
        const registration: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          registration[header] = row[index] || '';
        });
        
        return registration;
      });
    
    // If user is not admin, remove National ID from the response
    if (session.user.type !== 'admin') {
      registrations.forEach((registration) => {
        delete registration['National ID'];
      });
    }
    
    return NextResponse.json({
      headers,
      registrations,
      total: registrations.length,
    });
  } catch (error) {
    console.error('Error getting event registrations:', error);
    return NextResponse.json(
      { error: 'Failed to get event registrations' },
      { status: 500 }
    );
  }
} 