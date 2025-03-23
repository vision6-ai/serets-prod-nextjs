// Test script for fetching movie data
const SHOWTIMES_API_URL = 'https://admin.countit.online/api/v2/getview/showtimes_webSite/200/ISRAEL';
const API_KEY = '20a3cb24-04c5-11f0-bec4-42010a13f03d';

async function fetchShowtimes() {
  try {
    console.log(`Fetching data from: ${SHOWTIMES_API_URL}?key=${API_KEY}`);
    const response = await fetch(`${SHOWTIMES_API_URL}?key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log a sample of the data (first 2 items)
    if (Array.isArray(data) && data.length > 0) {
      console.log(`Total items: ${data.length}`);
      console.log('First 2 items:');
      console.log(JSON.stringify(data.slice(0, 2), null, 2));
    } else {
      console.log('Data is not an array or is empty:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw error;
  }
}

// Execute the function
fetchShowtimes()
  .then(() => console.log('Fetch completed successfully'))
  .catch(error => console.error('Error in main execution:', error)); 