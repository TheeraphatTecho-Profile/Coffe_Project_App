/**
 * usePagination — Generic Firestore cursor-based pagination hook.
 *
 * Usage:
 *   const { data, loading, hasMore, loadMore, refresh } = usePagination<Harvest>({
 *     collectionName: 'harvests',
 *     constraints: [where('userId', '==', uid)],
 *     orderField: 'harvestDate',
 *     orderDirection: 'desc',
 *     pageSize: 15,
 *   });
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  orderBy as fsOrderBy,
  limit as fsLimit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  OrderByDirection,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PaginationOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  orderField: string;
  orderDirection?: OrderByDirection;
  pageSize?: number;
  enabled?: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalLoaded: number;
}

export function usePagination<T extends { id: string }>(
  options: PaginationOptions
): PaginationResult<T> {
  const {
    collectionName,
    constraints = [],
    orderField,
    orderDirection = 'desc',
    pageSize = 15,
    enabled = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDoc = useRef<QueryDocumentSnapshot | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchPage = useCallback(
    async (isRefresh: boolean) => {
      if (!enabled) return;

      try {
        if (isRefresh) {
          setLoading(true);
          lastDoc.current = null;
        } else {
          setLoadingMore(true);
        }

        const colRef = collection(db, collectionName);

        const queryConstraints: QueryConstraint[] = [
          ...constraints,
          fsOrderBy(orderField, orderDirection),
          fsLimit(pageSize + 1), // +1 to check if there are more
        ];

        if (!isRefresh && lastDoc.current) {
          queryConstraints.push(startAfter(lastDoc.current));
        }

        const q = query(colRef, ...queryConstraints);
        const snapshot = await getDocs(q);

        if (!isMounted.current) return;

        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as T[];

        // Check if we have more items
        const hasMoreData = docs.length > pageSize;
        if (hasMoreData) {
          docs.pop(); // Remove the extra item
        }

        // Track the last document for cursor
        if (snapshot.docs.length > 0) {
          lastDoc.current = snapshot.docs[Math.min(snapshot.docs.length - 1, pageSize - 1)];
        }

        if (isRefresh) {
          setData(docs);
        } else {
          setData((prev) => [...prev, ...docs]);
        }

        setHasMore(hasMoreData);
      } catch (err) {
        console.error(`[usePagination] Error fetching ${collectionName}:`, err);
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [collectionName, constraints, orderField, orderDirection, pageSize, enabled]
  );

  // Initial load
  useEffect(() => {
    fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchPage(false);
  }, [fetchPage, loadingMore, hasMore]);

  const refresh = useCallback(async () => {
    await fetchPage(true);
  }, [fetchPage]);

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    totalLoaded: data.length,
  };
}
