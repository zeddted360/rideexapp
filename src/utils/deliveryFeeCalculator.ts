// utils/deliveryFeeCalculator.ts (complete updated file with enhanced logging)
import { validateEnv } from "./appwrite";

export interface DeliveryFeeBiasResult {
  fee: number;
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

export interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const branches: Branch[] = [
  {
    id: 1,
    name: "FAVGRAB OWERRI-1 (main)",
    lat: 5.4862,
    lng: 7.0256,
    address: "Obinze, Owerri, Imo State, Nigeria",
  },
  {
    id: 2,
    name: "FavGrab FUTO (OWERRI)",
    lat: 5.3846,
    lng: 6.996,
    address: "Federal University of Technology, Owerri, Imo State, Nigeria",
  },
];

// === CONSTANTS ===
const BASE_DURATION_MINUTES = 15;
const TIME_SURCHARGE_PER_MINUTE = 100;
const PRICE_PER_KM = 333; // Based on table
const MAX_TABLE_DISTANCE_KM = 25; // Table goes up to 25km
const CLOSER_THRESHOLD_METERS = 10000; // 10km

// === HELPERS ===
function cleanAddress(address: string): string {
  let cleaned = address.trim().replace(/\s+/g, " ");
  if (!cleaned.toLowerCase().includes("nigeria")) {
    cleaned += ", Nigeria";
  }
  return cleaned;
}

// === MAIN DELIVERY FEE CALCULATION WITH BIAS ===
export async function calculateDeliveryFee(
  deliveryAddress: string,
  selectedBranch: Branch,
  restaurantAddressesMap: { [restaurantId: string]: string[] }
): Promise<DeliveryFeeBiasResult> {
  try {
    if (!selectedBranch) {
      throw new Error("Selected branch not found");
    }

    const cleanDestination = cleanAddress(deliveryAddress);

    const restaurantIds = Object.keys(restaurantAddressesMap);
    if (!restaurantIds.length) {
      // Fallback to branch-to-user
      const cleanOrigin = cleanAddress(selectedBranch.address);
      const response = await fetch(
        `/api/distance-matrix?origins=${encodeURIComponent(
          cleanOrigin
        )}&destinations=${encodeURIComponent(cleanDestination)}`
      );
      const data = await response.json();
      if (data.status !== "OK") throw new Error("Fallback failed");
      const element = data.rows[0].elements[0];
      if (element.status !== "OK") throw new Error("Fallback element failed");
      const distanceValue = element.distance.value;
      const durationValue = element.duration.value;
      const distanceKm = distanceValue / 1000;
      let fee = Math.round(PRICE_PER_KM * distanceKm);
      const durationMinutes = durationValue / 60;
      if (durationMinutes > BASE_DURATION_MINUTES) {
        const additionalMinutes = Math.ceil(
          durationMinutes - BASE_DURATION_MINUTES
        );
        fee += additionalMinutes * TIME_SURCHARGE_PER_MINUTE;
      }
      return {
        fee,
        distance: element.distance.text,
        duration: element.duration.text,
        distanceValue,
        durationValue,
      };
    }

    // Clean all addresses
    const cleanBranch = cleanAddress(selectedBranch.address);
    const allRestaurantBranches: { restaurantId: string; address: string }[] =
      [];
    restaurantIds.forEach((id) => {
      restaurantAddressesMap[id].filter(Boolean).forEach((addr) => {
        allRestaurantBranches.push({
          restaurantId: id,
          address: cleanAddress(addr),
        });
      });
    });

    if (!allRestaurantBranches.length) {
      throw new Error("No valid restaurant addresses");
    }

    // Step 1: Find branches close to selected app branch
    const cleanBranchAddresses = allRestaurantBranches.map((b) => b.address);
    const filterResponse = await fetch(
      `/api/distance-matrix?origins=${encodeURIComponent(
        cleanBranch
      )}&destinations=${cleanBranchAddresses.map(encodeURIComponent).join("|")}`
    );
    const filterData = await filterResponse.json();
    if (filterData.status !== "OK") throw new Error("Filter failed");

    // Log Step 1: Distances from app branch to all restaurant branches
    console.group("Step 1: App Branch to Restaurant Branches Distances");
    console.log(`App Branch: ${cleanBranch}`);
    console.table(
      allRestaurantBranches.map((branch, i) => ({
        restaurantId: branch.restaurantId,
        branchAddress: branch.address,
        distance: filterData.rows[0].elements[i]?.distance?.text || "N/A",
        distanceValue: filterData.rows[0].elements[i]?.distance?.value || 0,
        duration: filterData.rows[0].elements[i]?.duration?.text || "N/A",
      }))
    );
    console.groupEnd();

    const filterElements = filterData.rows[0].elements;
    const closerBranchesByResto: { [restoId: string]: string[] } = {};
    filterElements.forEach((el: any, i: number) => {
      if (el.status === "OK" && el.distance.value < CLOSER_THRESHOLD_METERS) {
        const { restaurantId, address } = allRestaurantBranches[i];
        if (!closerBranchesByResto[restaurantId]) {
          closerBranchesByResto[restaurantId] = [];
        }
        closerBranchesByResto[restaurantId].push(address);
      }
    });

    // If no close branches for a restaurant, use all its branches
    restaurantIds.forEach((id) => {
      if (!closerBranchesByResto[id] || !closerBranchesByResto[id].length) {
        closerBranchesByResto[id] = restaurantAddressesMap[id]
          .map(cleanAddress)
          .filter(Boolean);
      }
    });

    // Log filtered closer branches per restaurant
    console.group("Filtered Closer Branches per Restaurant");
    Object.entries(closerBranchesByResto).forEach(([restoId, branches]) => {
      console.log(`${restoId}:`, branches);
    });
    console.groupEnd();

    // Step 2: For each restaurant, get distances from all its closer branches to user, sort, and pick second closest (or closest if only one)
    const userResponse = await fetch(
      `/api/distance-matrix?origins=${Object.values(closerBranchesByResto)
        .flat()
        .map(encodeURIComponent)
        .join("|")}&destinations=${encodeURIComponent(cleanDestination)}`
    );
    const userData = await userResponse.json();
    if (userData.status !== "OK") throw new Error("User distance failed");

    let branchIndex = 0;
    let maxSecondClosestDistanceValue = 0;
    let maxSecondClosestDurationValue = 0;
    let maxSecondClosestDistanceText = "";
    let maxSecondClosestDurationText = "";
    let finalSelectedBranchAddress = ""; // Track the winning branch address

    for (const id of restaurantIds) {
      const restoBranches = closerBranchesByResto[id];
      const distancesToUser: {
        distanceValue: number;
        durationValue: number;
        distanceText: string;
        durationText: string;
        branchAddress: string; // Add this to track which branch
      }[] = [];

      // Map branches to indices for logging
      const branchMap = restoBranches.map((addr, idx) => ({
        address: addr,
        originalIndex: idx, // For reference
      }));

      for (const branch of branchMap) {
        // Use for...of for loop scope
        const el = userData.rows[branchIndex].elements[0];
        branchIndex++;
        if (el.status === "OK") {
          distancesToUser.push({
            distanceValue: el.distance.value,
            durationValue: el.duration.value,
            distanceText: el.distance.text,
            durationText: el.duration.text,
            branchAddress: branch.address, // Log the actual address
          });
        }
      }

      if (distancesToUser.length === 0) {
        console.warn(`No valid distances for restaurant ${id} - skipping`);
        continue;
      }

      // Log per-restaurant details (distances from delivery address to each branch)
      console.group(`Restaurant ${id} distances (second-closest bias)`);
      console.log(`Delivery Address: ${cleanDestination}`);
      console.table(distancesToUser); // Table view of all branches/distances from delivery address
      console.log(`Filtered branches for ${id}:`, restoBranches);

      // Sort by distance ascending (closest first)
      distancesToUser.sort((a, b) => a.distanceValue - b.distanceValue);

      // Pick second closest (index 1) or closest (index 0) if only one
      const selectedDistance =
        distancesToUser.length > 1 ? distancesToUser[1] : distancesToUser[0];
      console.log(`Selected for ${id}:`, {
        branchAddress: selectedDistance.branchAddress,
        distance: selectedDistance.distanceText,
        distanceValue: selectedDistance.distanceValue,
        duration: selectedDistance.durationText,
      });
      console.groupEnd();

      if (selectedDistance.distanceValue > maxSecondClosestDistanceValue) {
        maxSecondClosestDistanceValue = selectedDistance.distanceValue;
        maxSecondClosestDurationValue = selectedDistance.durationValue;
        maxSecondClosestDistanceText = selectedDistance.distanceText;
        maxSecondClosestDurationText = selectedDistance.durationText;
        finalSelectedBranchAddress = selectedDistance.branchAddress; // Track winner
      }
    }

    // Log final result
    console.group("Final Fee Calculation");
    console.log(
      `Max second-closest branch used: ${finalSelectedBranchAddress}`
    );
    console.log(
      `Final distance: ${maxSecondClosestDistanceText} (${maxSecondClosestDistanceValue}m)`
    );
    console.log(`Final duration: ${maxSecondClosestDurationText}`);
    console.log(
      `Calculated fee: NGN${
        (maxSecondClosestDistanceValue / 1000) * PRICE_PER_KM
      }`
    );
    console.groupEnd();

    if (maxSecondClosestDistanceValue === 0) {
      throw new Error("No valid distances");
    }

    const distanceKm = maxSecondClosestDistanceValue / 1000;
    let fee = Math.round(PRICE_PER_KM * distanceKm);
    const durationMinutes = maxSecondClosestDurationValue / 60;
    if (durationMinutes > BASE_DURATION_MINUTES) {
      const additionalMinutes = Math.ceil(
        durationMinutes - BASE_DURATION_MINUTES
      );
      fee += additionalMinutes * TIME_SURCHARGE_PER_MINUTE;
    }

    return {
      fee,
      distance: maxSecondClosestDistanceText,
      duration: maxSecondClosestDurationText,
      distanceValue: maxSecondClosestDistanceValue,
      durationValue: maxSecondClosestDurationValue,
    };
  } catch (error) {
    console.error("Error calculating delivery fee:", error);

    return {
      fee: PRICE_PER_KM * 5, // fallback = 5km fee
      distance: "Unknown",
      duration: "Unknown",
      distanceValue: 0,
      durationValue: 0,
    };
  }
}

// === BRANCH HELPERS ===
export function getBranchById(branchId: number): Branch | undefined {
  return branches.find((b) => b.id === branchId);
}

export function getAllBranches(): Branch[] {
  return branches;
}

// === QUICK FEE ESTIMATE (without API) ===
export function estimateDeliveryFee(distanceKm: number): number {
  return Math.round(PRICE_PER_KM * distanceKm);
}
