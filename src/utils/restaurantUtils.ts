import { databases, config } from './appwrite';
import { IRestaurantFetched } from '../../types/types';

// Cache for restaurant names to avoid repeated API calls
const restaurantNameCache = new Map<string, string>();

/**
 * Get restaurant name by ID
 */
export const getRestaurantNameById = async (restaurantId: string): Promise<string> => {
  // Check cache first
  if (restaurantNameCache.has(restaurantId)) {
    return restaurantNameCache.get(restaurantId)!;
  }

  try {
    // Fetch restaurant document
    const restaurant = await databases.getDocument(
      config.databaseId,
      config.restaurantsCollectionId,
      restaurantId
    ) as IRestaurantFetched;

    // Cache the restaurant name
    restaurantNameCache.set(restaurantId, restaurant.name);
    return restaurant.name;
  } catch (error) {
    console.warn(`Failed to fetch restaurant name for ID: ${restaurantId}`, error);
    // Return a fallback name or the ID itself
    return `Restaurant ${restaurantId.slice(-4)}`;
  }
};

/**
 * Get multiple restaurant names by IDs
 */
export const getRestaurantNamesByIds = async (restaurantIds: string[]): Promise<Map<string, string>> => {
  const restaurantNames = new Map<string, string>();
  const uncachedIds = restaurantIds.filter(id => !restaurantNameCache.has(id));

  if (uncachedIds.length === 0) {
    // All IDs are cached
    restaurantIds.forEach(id => {
      restaurantNames.set(id, restaurantNameCache.get(id)!);
    });
    return restaurantNames;
  }

  try {
    // Fetch all uncached restaurants in parallel
    const promises = uncachedIds.map(async (id) => {
      try {
        const restaurant = await databases.getDocument(
          config.databaseId,
          config.restaurantsCollectionId,
          id
        ) as IRestaurantFetched;
        
        restaurantNameCache.set(id, restaurant.name);
        return { id, name: restaurant.name };
      } catch (error) {
        console.warn(`Failed to fetch restaurant name for ID: ${id}`, error);
        const fallbackName = `Restaurant ${id.slice(-4)}`;
        restaurantNameCache.set(id, fallbackName);
        return { id, name: fallbackName };
      }
    });

    const results = await Promise.all(promises);
    
    // Add cached results
    restaurantIds.forEach(id => {
      if (restaurantNameCache.has(id)) {
        restaurantNames.set(id, restaurantNameCache.get(id)!);
      }
    });

    // Add new results
    results.forEach(({ id, name }) => {
      restaurantNames.set(id, name);
    });

    return restaurantNames;
  } catch (error) {
    console.error('Failed to fetch restaurant names:', error);
    // Return fallback names
    restaurantIds.forEach(id => {
      restaurantNames.set(id, `Restaurant ${id.slice(-4)}`);
    });
    return restaurantNames;
  }
};

/**
 * Clear restaurant name cache (useful for testing or when data changes)
 */
export const clearRestaurantNameCache = (): void => {
  restaurantNameCache.clear();
}; 