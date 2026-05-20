import axios from 'axios';

// @desc    Check if delivery is available for a pincode
// @route   POST /api/check-pincode
// @access  Public
export const checkPincode = async (req, res) => {
  try {
    const rawPincode = req.body.pincode
    const pincode = String(rawPincode || '').trim()

    // Validate 6-digit pincode
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit pincode'
      });
    }

    // Call India Post API
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data;

    // Check if API returned an error or no records
    if (!data || data[0].Status === 'Error' || !data[0].PostOffice || data[0].PostOffice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid pincode or area not found'
      });
    }

    // Extract details from the first PostOffice entry
    const postOffice = data[0].PostOffice[0];
    const area = postOffice.Name;
    const district = postOffice.District;
    const state = postOffice.State;
    const location = [area, district, state].filter(Boolean).join(', ');

    const isKhordha = district && ['khordha', 'khorda'].includes(district.toLowerCase());
    if (isKhordha && state && state.toLowerCase() === 'odisha') {
      return res.json({
        success: true,
        deliveryAvailable: true,
        area,
        district,
        state,
        location,
        message: `Delivery available in ${location}`
      });
    }

    return res.json({
      success: false,
      deliveryAvailable: false,
      area,
      district,
      state,
      location,
      message: location ? `Currently not delivering in this area (${location})` : 'Currently not delivering in this area'
    });
  } catch (error) {
    console.error('Pincode check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify pincode. Please try again later.'
    });
  }
};
