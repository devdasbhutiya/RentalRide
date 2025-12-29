# Debugging Guide: Vehicle Not Found & Booking Conflicts

## Overview
This document explains the two main errors you're encountering and how to debug them.

---

## Error 1: "Vehicle not found"

### When it appears:
- When navigating to a vehicle detail page
- URL format: `/vehicle/:id`

### Common causes:

1. **Invalid Vehicle ID in URL**
   - Check if the URL contains a valid vehicle ID
   - Example bad URLs: `/vehicle/undefined`, `/vehicle/null`, `/vehicle/`
   
2. **Vehicle Deleted**
   - The vehicle may have been deleted from Firestore
   
3. **Firestore Permissions**
   - Check Firebase console security rules
   - Ensure read access is granted for vehicles collection

4. **Firebase Connection Issues**
   - Check internet connection
   - Verify Firebase configuration in `src/services/firebase.js`

### How to debug:

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Look for these logs:**
   ```
   🔍 Fetching vehicle with ID: [vehicle-id]
   ✅ Vehicle loaded successfully: [vehicle-title]
   ```
   OR error logs:
   ```
   ❌ Invalid vehicle ID: undefined
   ❌ Error fetching vehicle: [error message]
   ❌ Vehicle not found for ID: [vehicle-id]
   ```

3. **Check Firestore:**
   - Go to Firebase Console → Firestore Database
   - Navigate to the `vehicles` collection
   - Verify the vehicle document exists with the ID from the URL

4. **Verify the ID is being passed correctly:**
   - Check your navigation code (e.g., in Home.jsx or Browse.jsx)
   - Ensure you're using: `navigate(\`/vehicle/${vehicle.id}\`)`

---

## Error 2: "❌ These dates are not available - they conflict with an existing booking"

### When it appears:
- When trying to book a vehicle
- After selecting start and end dates in the booking modal

### Common causes:

1. **Date Overlap with Existing Booking**
   - Someone else has already booked the vehicle for those dates
   
2. **Timezone Issues**
   - Date conversion problems between client and Firestore

3. **Booking Status Not Updated**
   - Previous bookings marked as "pending" or "confirmed" when they should be "cancelled" or "completed"

### How to debug:

1. **Open Browser Console** (F12)

2. **Look for these logs:**
   ```
   📅 Checking availability for dates: 2025-12-30 to 2026-01-05
   🔍 Checking availability for vehicle: [vehicle-id]
   📋 Found 3 total bookings for this vehicle
   ✅ 2 active bookings (confirmed/pending)
   🔍 Checking against booking: Mon Dec 28 2025 to Fri Jan 03 2026 (confirmed)
   ❌ CONFLICT! Dates overlap with existing booking from Mon Dec 28 2025 to Fri Jan 03 2026
   ```

3. **Check Firestore Bookings:**
   - Go to Firebase Console → Firestore Database
   - Navigate to the `bookings` collection
   - Filter by `vehicleId` to see all bookings for the vehicle
   - Check the `startDate`, `endDate`, and `status` fields

4. **Verify booking statuses:**
   - Make sure old bookings are marked as "completed" or "cancelled"
   - Only "confirmed" and "pending" bookings block dates

5. **Understanding Date Overlap Logic:**
   ```
   Your dates:     [START -------- END]
   Existing:  [---------------------]     ❌ CONFLICT
   Existing:       [------]               ❌ CONFLICT
   Existing:            [------]          ❌ CONFLICT
   Existing:                 [----------] ❌ CONFLICT
   Existing:  [--]                        ✅ OK (ends before your start)
   Existing:                      [----]  ✅ OK (starts after your end)
   ```

---

## Solutions

### For "Vehicle not found":

1. **Verify your navigation:**
   ```javascript
   // Correct way to navigate
   navigate(`/vehicle/${vehicle.id}`);
   
   // NOT this
   navigate(`/vehicle/${vehicle.vehicleId}`); // if the field is named 'id'
   ```

2. **Check Firebase Rules:**
   ```javascript
   // In Firebase Console → Firestore → Rules
   match /vehicles/{vehicleId} {
     allow read: if true; // or more restrictive rules
   }
   ```

3. **Add error boundaries in your app**

### For "Dates not available":

1. **Check the console logs** to see which booking is conflicting

2. **Update old booking statuses:**
   - Go to Firestore Console
   - Find old bookings that should be completed
   - Update their `status` field to "completed"

3. **Choose different dates** that don't overlap

4. **Contact support** if you believe the conflict is incorrect

---

## Testing Tips

### Test "Vehicle not found" scenario:
1. Navigate to: `/vehicle/fake-id-that-does-not-exist`
2. You should see the error message
3. Console should show: `❌ Vehicle not found for ID: fake-id-that-does-not-exist`

### Test "Dates conflict" scenario:
1. Create a test booking for a vehicle
2. Try to book the same vehicle with overlapping dates
3. You should see the conflict error
4. Console should show detailed overlap information

---

## Additional Improvements Made

1. **Auto-clearing errors**: Errors now disappear after 5-8 seconds
2. **Console logging**: Detailed logs help debug issues
3. **Better error messages**: More informative messages for users
4. **Validation**: ID validation before fetching
5. **Loading states**: Clear loading indicators

---

## Need More Help?

If you're still experiencing issues:

1. **Share the console logs** - They contain valuable debugging information
2. **Check Firestore data** - Verify the data exists and is correct
3. **Verify Firebase config** - Ensure your Firebase connection is working
4. **Test with different vehicles** - See if the issue is vehicle-specific
