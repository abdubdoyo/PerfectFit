const axios = require('axios'); 

async function getCountryFromCoordinates(lat, lng) { 
    try { 
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', 
            {
                params: {
                    latlng: `${lat},${lng}`, 
                    key: process.env.GOOGLE_PLACE_KEY
                }
            }
        ); 

        const countryComponent = response.data.results[0]?.address_components?.find(
            component => component.types.includes('country')
        ); 

        return countryComponent?.short_name?.toLowerCase() || 'us'; 
    }
    catch (error) { 
        console.error('Geocoding failed:', error); 
        return 'us'; // Default fallback 
    }
}

module.exports = { getCountryFromCoordinates }; 