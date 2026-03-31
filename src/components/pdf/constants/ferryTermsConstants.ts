/**
 * Ferry Provider-Specific Terms and Conditions
 * 
 * Each ferry operator has their own set of terms and conditions
 * that will be displayed in the PDF ticket.
 */

export interface FerryTermsConfig {
    provider: string;
    terms: string[];
}

// Makruzz Terms and Conditions (10 terms)
export const MAKRUZZ_TERMS: string[] = [
    "1. Passengers are requested to re-confirm their booking one day in advance,Contact Number : Tel: 03192-236677, 237788 | M:+91-8001240006(0900hrs to 1700hrs).",
    "2. Correction of NAME is not permitted in ticket ONCE BOOKED. So please make sure for correct NAME.",
    "3. Reporting should be 2 hrs prior to departure.",
    "4. Passenger should carry a PHOTO IDENTITY CARD & RTPCR report hard copy at the time of Check-In.",
    "5. Cancellation Charges Before 48Hrs of Departure - Rs100 + Taxes are applicable (Documentation Charges Per Ticket No.), Before 24Hrs of Departure - 50% + Taxes are applicable, WITHIN 24 Hrs of Departure - No Refund.",
    "6. Tickets are Non Transferable and Non Re-routable.",
    "7. Ticket will be valid only till the date of travel prior to departure.",
    "8. Carriage of Security Removed Articles will not be permitted in hand baggage eg: Nail cutters, Knifes, explosives, Inflammable etc.",
    "9. LIQUOR & SMOKING is NOT ALLOWED in the vessel by LAW.",
    "10. Passenger belongings carried in hand will be at their own risk carrier is no way liable in any lose or damage from what so ever it may cause.",
    "11a. The carrier reserves the right to cancel or change the published voyage for any official purpose and in any manner or to any extent. The carrier shall bear no liability for any loss that passenger may suffer, any consequences thereof or in respect of any changes in scheduled due to Bad weather or Technical reasons, In this case passenger can either claim full refund or can rescheduled His/her Journey on availability.",
    "11b. In case of vessel change/shifting, carrier reserves the right to change the alloted seats at the tince of check-in.",
    "12. The passenger hereby warrants and declares he / she including any accompanying children and / or babies in arms does not suffer from any form of major illness or ailments. The Carrier shall not be responsible for any consequences of whatsoever nature resulting from pre-carriage illness / ailments that may manifest during the course of carriage. The passenger undertakes to indemnify and hold the carrier harmless from any and all such consequences.",
    "13. This Ticket and the carriage of passenger hereunder shall be governed by Indian law, and all disputes and claims ( Including but not limited to claims arising out of personal injury) and the carriage of passengers shall be referred to the exclusive jurisdiction of the competent court in Port Blair, Andaman & Nicobar Islands, India.",
    "14. The carrier shall have no liability whatsoever for any injury or illness arising or resulting from any cause not attributable to any act, neglect, default on the part of the carrier and its servants.",
    "15.a) Check-in counter closes - 30 mins prior to departure.",
    "15.b) Boarding closes 15 Mins prior to departure.",
    "16. Free Baggage Allowance 25Kg as Registered Baggage.",
    "17. Pets and Animals not allowed On Board the Ferry.",
    "18. Ticket once reschedule (with applicable reschedule charges) will not be cancelled and not be refunded.",
    "19. Paid Snacks are non refundable if the tickets in Premium class is been canceled after 1800Hrs for the next day departure.",
    "20. Infant (0 – 1 year) will be charged Rs. 0 per infant per ticket.",
    "21. Extra copy of the ticket print out will be charged Rs 50/- if taken from the MAKRUZZ offices.",
    "22. “A hard copy of the ticket is mandatory while check-in.",
    "23. PSF (Passenger Service Fee) of Rs. 50 per person per ticket is applicable.",
    "24. Peak Season Supplement applicable from 1st Dec to 31st Jan per person per ticket per sector for all classes except infant and islander.",
    "25. SEAT SELECTION PROCEDURE.",
    "25a. ADD Correct Contact Details of the Customer during Booking.",
    "25b. Seat Chart will Open 2 Days before Departure Date followed by Notification send thru Text Messages and Email.",
];

// Sealink Terms and Conditions (15 terms)
export const SEALINK_TERMS: string[] = [
    "1. Passengers should report at least 45 minutes prior to departure.",
    "2. Boarding closes 20 minutes before departure.",
    "3. Tickets are valid only for the date and time once booked, so please ensure correct details while booking.",
    "4. Every individual passenger must carry a valid ticket.",
    "5. Once the ferry departs, the ticket will be invalid.",
    "6. Tickets are non-transferable and non re-routable.",
    "7. Passengers are responsible for the safety of their valuables and personal belongings. Management is not responsible for any theft or loss.",
    "8. Consumption or carrying of paan, gutka, alcohol, etc. is prohibited onboard as per GOI regulations and is punishable.",
    "9. The ferry operation is subject to weather conditions, technical issues, or any unforeseen reasons.",
    "10. The company reserves the right to reschedule or cancel trips if required.",
    "11. The company is not responsible for damages caused by passengers to the ferry while sailing.",
    "12. Personal baggage is allowed up to the permitted limit (charges may apply beyond the limit).",
    "13. Items such as knives, nail cutters, explosives, firearms, and ammunition are strictly prohibited onboard."
];

// Green Ocean Terms and Conditions (20 terms)
export const GREEN_OCEAN_TERMS: string[] = [
    "1. Reporting time should be 01 hours prior to Departure.",
    "2. Check in closes - 20 mins prior to Departure & Boarding closes 10 mins prior to departure.",
    "3. Passengers must carry valid ID proof .Tickets stands invalid after departure of the vessel.",
    "4. Reschedule of ticket is only applicable on the basis of seat availability.",
    "5. Reschedule / Cancellation of tickets before 48 hours of departure will be charged Rs.100 (Documentation charges per ticket); above 24>48 hours will be 50% and within 24 hours of sailing – No Refund.",
    "6. Correction of NAME is not permitted in ticket ONCE BOOKED. Transferring or re-routing of ticket by your own is strictly prohibited.",
    "7. Green Ocean is not responsible for any theft, loss and damage of personal belongings of passengers on board.",
    "8. Personal baggage is allowed up to 25 Kg per person",
    "9. Consumption of alcohol,narcotics, smoking, chewing of tobacco and spittinginside the vessel is strictly prohibited.",
    "10. In case of any Cancellation of sailing due to bad weather, any technical reasons or any other reasons Green Ocean management will have no liability for any loss that passengers may suffer.",
    "11.Green Ocean reserves the right to cancel or change the sailing schedule for any official reason.",
    "12. Any loss or damage to Green Ocean property by any passenger, the management retains the right to recover the losses so incurred from the passenger.",
    "13. The passenger hereby warrants and declares he/she including any accompanying children and / or babies in arms does not suffer from any form of major illness or ailments. The Carrier shall not be responsible for any consequences of whatsoever nature resulting from pre-carriage illness/ailments that may manifest during the course of carriage. The passenger undertakes to indemnify and hold the carrier harmless from any and all such consequences.",
    "14. This Ticket and the carriage of passenger here under shall be governed by Indian law, and all disputes and claims (including but not limited to claims arising out of personal injury) and the carriage of passengers shall be referred to the exclusive jurisdiction of the competent court in Port Blair, Andaman & Nicobar Islands, India.",
    "15. Items such as knives, nail cutters, explosive, fire arms and ammunition etc are strictly prohibited onboard. Pets and animals allowed as per the conditions of carriage.",
];

/**
 * Get terms and conditions for a specific ferry provider
 * @param operator - Ferry operator name (case-insensitive)
 * @returns Array of terms and conditions
 */
export function getTermsForProvider(operator: string): string[] {
    const normalizedOperator = operator.toLowerCase().trim();

    if (normalizedOperator.includes('makruzz')) {
        return MAKRUZZ_TERMS;
    } else if (normalizedOperator.includes('sealink') || normalizedOperator.includes('sea link')) {
        return SEALINK_TERMS;
    } else if (normalizedOperator.includes('green ocean') || normalizedOperator.includes('greenocean')) {
        return GREEN_OCEAN_TERMS;
    }

    // Default fallback terms if provider not recognized
    return MAKRUZZ_TERMS; // Using Makruzz as default
}

/**
 * Get all available ferry providers
 */
export const FERRY_PROVIDERS = {
    MAKRUZZ: 'Makruzz',
    SEALINK: 'Sealink',
    GREEN_OCEAN: 'Green Ocean',
} as const;
