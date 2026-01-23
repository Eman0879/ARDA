// utils/getUserDisplayName.ts
import type { Model } from 'mongoose';

/**
 * Fetches the display name for a user from FormData collection
 * @param userIdentifier - Username or ObjectId to lookup
 * @param FormDataModel - Mongoose FormData model
 * @returns Display name or fallback to identifier
 */
export const getUserDisplayName = async (
  userIdentifier: string,
  FormDataModel: Model<any>
): Promise<string> => {
  if (!userIdentifier) return 'Unknown User';
  
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(userIdentifier);
    const query = isObjectId ? { _id: userIdentifier } : { username: userIdentifier };

    const userData = await FormDataModel.findOne(query)
      .select('basicDetails.name username')
      .lean();

    if (userData?.basicDetails?.name) {
      return userData.basicDetails.name;
    }
    
    // Fallback to username if name not found
    if (userData?.username) {
      return userData.username;
    }
    
    // Final fallback
    return userIdentifier;
  } catch (error) {
    console.warn(`⚠️  Could not fetch display name for: ${userIdentifier}`);
    return userIdentifier;
  }
};

/**
 * Fetches display names for multiple users at once (more efficient)
 * @param userIdentifiers - Array of usernames or ObjectIds
 * @param FormDataModel - Mongoose FormData model
 * @returns Map of identifier -> display name
 */
export const getBulkUserDisplayNames = async (
  userIdentifiers: string[],
  FormDataModel: Model<any>
): Promise<Map<string, string>> => {
  const nameMap = new Map<string, string>();
  
  if (!userIdentifiers || userIdentifiers.length === 0) {
    return nameMap;
  }

  try {
    const uniqueIds = [...new Set(userIdentifiers.filter(Boolean))];
    
    // Separate ObjectIds and usernames
    const objectIds = uniqueIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    const usernames = uniqueIds.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
    
    // Query both by _id and username
    const users = await FormDataModel.find({
      $or: [
        { _id: { $in: objectIds } },
        { username: { $in: usernames } }
      ]
    })
      .select('_id username basicDetails.name')
      .lean();

    // Build the map
    users.forEach((user: any) => {
      const displayName = user.basicDetails?.name || user.username || 'Unknown User';
      
      // Map by _id
      if (user._id) {
        nameMap.set(user._id.toString(), displayName);
      }
      
      // Map by username
      if (user.username) {
        nameMap.set(user.username, displayName);
      }
    });

    // Fill in any missing entries with the identifier itself
    uniqueIds.forEach(id => {
      if (!nameMap.has(id)) {
        nameMap.set(id, id);
      }
    });

    return nameMap;
  } catch (error) {
    console.error('❌ Bulk name fetch failed:', error);
    
    // Fallback: map each identifier to itself
    userIdentifiers.forEach(id => {
      if (id) nameMap.set(id, id);
    });
    
    return nameMap;
  }
};

export default {
  getUserDisplayName,
  getBulkUserDisplayNames,
};