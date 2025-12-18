import { Branch } from "../../types/types";

// utils/deliveryFeeCalculator.ts
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

// === NEW PRICING RULES (2025 Update) ===
const BASE_FARE = 800;           // ₦800 flat
const RATE_PER_KM = 400;         // ₦400 per km
const MAX_DELIVERY_KM = 18;      // Beyond this = not deliverable
const MIN_DELIVERY_KM = 1;     // Only applies for single-restaurant orders
const SERVICE_CHARGE = 200;      // Fixed ₦200 platform fee
const ROUND_TO_NEAREST = 100;    // Always round UP to nearest 100

export interface DeliveryFeeResult {
  deliveryFee: number;           // Final delivery fee (rounded up)
  serviceCharge: number;         // Always ₦200
  totalLogisticsCost: number;    // deliveryFee + serviceCharge
  distanceKm: number;
  distanceText: string;
  isDeliverable: boolean;
  reason?: string;
}

// Helper: Round up to nearest 100
function roundUpToNearest100(amount: number): number {
  return Math.ceil(amount / ROUND_TO_NEAREST) * ROUND_TO_NEAREST;
}

// Main function used during checkout
export function calculateDeliveryFeeSimple(
  distanceInMeters: number,
  isSingleRestaurantOrder: boolean = true
): DeliveryFeeResult {
  const distanceKm = distanceInMeters / 1000;

  // 1. Check max distance
  if (distanceKm > MAX_DELIVERY_KM) {
    return {
      deliveryFee: 0,
      serviceCharge: 0,
      totalLogisticsCost: 0,
      distanceKm,
      distanceText: `${distanceKm.toFixed(1)} km`,
      isDeliverable: false,
      reason: `Delivery not available beyond ${MAX_DELIVERY_KM}km`,
    };
  }

  // 2. Enforce minimum distance only for single restaurant orders
  const effectiveDistanceKm = isSingleRestaurantOrder
    ? Math.max(distanceKm, MIN_DELIVERY_KM)
    : distanceKm;

  // 3. Calculate raw delivery fee
  const rawDeliveryFee = BASE_FARE + (effectiveDistanceKm * RATE_PER_KM);

  // 4. Round up to nearest ₦100
  const deliveryFee = roundUpToNearest100(rawDeliveryFee);

  return {
    deliveryFee,
    serviceCharge: SERVICE_CHARGE,
    totalLogisticsCost: deliveryFee + SERVICE_CHARGE,
    distanceKm: effectiveDistanceKm,
    distanceText: `${effectiveDistanceKm.toFixed(1)} km`,
    isDeliverable: true,
  };
}

// Optional: Keep API-based version for live distance (fallback or advanced use)
export async function calculateDeliveryFeeFromAddress(
  deliveryAddress: string,
  selectedBranchId: number
): Promise<DeliveryFeeResult> {
  const branch = branches.find(b => b.id === selectedBranchId);
  if (!branch) throw new Error("Branch not found");

  const origin = encodeURIComponent(branch.address + ", Nigeria");
  const destination = encodeURIComponent(deliveryAddress.trim() + ", Nigeria");

  try {
    const res = await fetch(`/api/distance-matrix?origins=${origin}&destinations=${destination}`);
    const data = await res.json();

    if (data.status !== "OK" || data.rows[0]?.elements[0]?.status !== "OK") {
      throw new Error("Distance API failed");
    }

    const distanceMeters = data.rows[0].elements[0].distance.value;
    const distanceText = data.rows[0].elements[0].distance.text;

    // Use same logic as simple calculator
    return calculateDeliveryFeeSimple(distanceMeters, true);
  } catch (error) {
    console.error("Distance API error:", error, error);
    // Fallback: estimate 5km if API fails
    return calculateDeliveryFeeSimple(5000, true);
  }
}

// Quick estimate function (e.g. for cart preview)
export function estimateDeliveryFee(distanceKm: number): DeliveryFeeResult {
  return calculateDeliveryFeeSimple(distanceKm * 1000, true);
}

// Get branch helpers
export function getBranchById(branchId: number): Branch | undefined {
  return branches.find((b) => b.id === branchId);
}

export function getAllBranches(): Branch[] {
  return branches;
}