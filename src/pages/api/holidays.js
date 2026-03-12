import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Query to get holidays for current year and next year
    const query = `
      SELECT 
        id,
        name,
        date,
        description,
        type,
        is_recurring
      FROM public_holidays 
      WHERE EXTRACT(YEAR FROM date) IN ($1, $2)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [currentYear, currentYear + 1]);
    
    // If no holidays found in database, return some default holidays
    if (result.rows.length === 0) {
      const defaultHolidays = getDefaultHolidays();
      return res.status(200).json({
        success: true,
        holidays: defaultHolidays
      });
    }

    // Format the dates to ISO string for consistency
    const holidays = result.rows.map(holiday => ({
      id: holiday.id,
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: holiday.description,
      type: holiday.type,
      is_recurring: holiday.is_recurring
    }));

    res.status(200).json({
      success: true,
      holidays: holidays
    });

  } catch (error) {
    console.error('Error fetching holidays:', error);
    
    // Fallback to default holidays in case of error
    const defaultHolidays = getDefaultHolidays();
    res.status(200).json({
      success: true,
      holidays: defaultHolidays,
      note: 'Using default holidays due to database error'
    });
  }
}

// Default holidays as fallback
function getDefaultHolidays() {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  return [
    // Current Year Holidays
    {
      id: 1,
      name: "New Year's Day",
      date: `${currentYear}-01-01`,
      description: "Celebration of the new year",
      type: "national",
      is_recurring: true
    },
    {
      id: 2,
      name: "Republic Day",
      date: `${currentYear}-01-26`,
      description: "Celebration of India's Republic Day",
      type: "national",
      is_recurring: true
    },
    {
      id: 3,
      name: "Holi",
      date: `${currentYear}-03-25`,
      description: "Festival of colors",
      type: "religious",
      is_recurring: true
    },
    {
      id: 4,
      name: "Independence Day",
      date: `${currentYear}-08-15`,
      description: "Celebration of India's Independence",
      type: "national",
      is_recurring: true
    },
    {
      id: 5,
      name: "Gandhi Jayanti",
      date: `${currentYear}-10-02`,
      description: "Birthday of Mahatma Gandhi",
      type: "national",
      is_recurring: true
    },
    {
      id: 6,
      name: "Diwali",
      date: `${currentYear}-11-12`,
      description: "Festival of lights",
      type: "religious",
      is_recurring: true
    },
    {
      id: 7,
      name: "Christmas",
      date: `${currentYear}-12-25`,
      description: "Christmas celebration",
      type: "religious",
      is_recurring: true
    },
    
    // Next Year Holidays
    {
      id: 8,
      name: "New Year's Day",
      date: `${nextYear}-01-01`,
      description: "Celebration of the new year",
      type: "national",
      is_recurring: true
    },
    {
      id: 9,
      name: "Republic Day",
      date: `${nextYear}-01-26`,
      description: "Celebration of India's Republic Day",
      type: "national",
      is_recurring: true
    }
  ];
}