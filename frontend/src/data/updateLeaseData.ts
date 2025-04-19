import { leaseService } from '../services/api';

/**
 * Script to update the Sunrise Apartment lease payment_day field
 * 
 * This script should be run to fix the payment day for Sunrise Apartment
 * to ensure it's set to 10 instead of falling back to the start date.
 */
export const updateSunriseApartmentPaymentDay = async () => {
  try {
    // First, get all leases
    const leases = await leaseService.getAllLeases();
    
    // Find the Sunrise Apartment lease
    const sunriseApartment = leases.find(lease => 
      lease.property_name.includes('Sunrise Apartment')
    );
    
    if (!sunriseApartment) {
      console.error('Sunrise Apartment lease not found');
      return;
    }
    
    // Check if payment_day is already set correctly
    if (sunriseApartment.payment_day === 10) {
      console.log('Sunrise Apartment payment day is already set to 10');
      return;
    }
    
    // Update the lease with payment_day = 10
    const updatedLease = await leaseService.updateLease(sunriseApartment.id, {
      ...sunriseApartment,
      payment_day: 10
    });
    
    console.log('Sunrise Apartment payment day updated:', updatedLease);
    return updatedLease;
  } catch (error) {
    console.error('Error updating Sunrise Apartment payment day:', error);
    throw error;
  }
};

// You can call this function from App.tsx or another initialization point
// updateSunriseApartmentPaymentDay(); 