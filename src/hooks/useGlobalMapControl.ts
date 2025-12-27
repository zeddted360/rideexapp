// hooks/useGlobalMapControl.ts
import { useEffect, useState } from "react";
import { client, databases, validateEnv } from "@/utils/appwrite";

interface IPayload {
  $id: string;
  isMapPaused?: boolean;
  message?: string;
  $createdAt: string;
  $updatedAt: string;
};

const GLOBAL_DOC_ID = "map_global_control";

export function useGlobalMapControl() {
  const [isPaused, setIsPaused] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchGlobalStatus = async () => {
      try {
        setLoading(true);
        const { databaseId, mapSubscriptionsCollectionId } = validateEnv();

        const doc = await databases.getDocument(
          databaseId,
          mapSubscriptionsCollectionId,
          GLOBAL_DOC_ID
        );

        const paused = doc.isMapPaused ?? false;
        setIsPaused(paused);
        setMessage(doc.message || "");

        // Auto-resume logic (if paused > 33 days ago)
        if (paused && doc.pausedAt) {
          const pausedTime = new Date(doc.pausedAt).getTime();
          const now = Date.now();
          const daysPassed = (now - pausedTime) / (1000 * 60 * 60 * 24);

          if (daysPassed > 33) {
            await databases.updateDocument(
              databaseId,
              mapSubscriptionsCollectionId,
              GLOBAL_DOC_ID,
              {
                isMapPaused: false,
                pausedAt: null,
              }
            );
            setIsPaused(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch global map control:", err);
        setIsPaused(false); 
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStatus();

    const channel = `databases.${validateEnv().databaseId}.collections.${
      validateEnv().mapSubscriptionsCollectionId
    }.documents.${GLOBAL_DOC_ID}`;

    const unsubscribe = client.subscribe(channel, (response) => {
      if (
        response.events.includes("databases.*.collections.*.documents.*.update")
      ) {
          const payload = response.payload as unknown as IPayload;
          
        if (payload) {
          setIsPaused(payload.isMapPaused ?? false);
          setMessage(payload.message || "");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { isPaused, loading, message };
}
