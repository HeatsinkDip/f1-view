"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fetch async data keyed by a serialized parameter string without calling setState synchronously inside effects.
 * When `initialKey` matches `requestKey`, SSR-provided `initialValue` is used immediately without a redundant initial fetch.
 */
export function useAsyncData<T>(
    requestKey: string | null,
    fetcher: () => Promise<T>,
    initialValue: T,
    initialKey: string | null = null
): { data: T; loading: boolean; error: string | null } {
    const fetcherRef = useRef(fetcher);
    const initialRef = useRef(initialValue);
    const hydratedKeyRef = useRef(initialKey);

    useEffect(() => {
        fetcherRef.current = fetcher;
        initialRef.current = initialValue;
    });

    const [state, setState] = useState<{
        loadedKey: string | null;
        data: T;
        error: string | null;
    }>({
        loadedKey: initialKey,
        data: initialValue,
        error: null,
    });

    useEffect(() => {
        if (requestKey === null) {
            return;
        }
        if (hydratedKeyRef.current !== null && hydratedKeyRef.current === requestKey) {
            hydratedKeyRef.current = null;
            return;
        }
        let active = true;
        fetcherRef
            .current()
            .then((data) => {
                if (active) {
                    setState({ loadedKey: requestKey, data, error: null });
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    setState({
                        loadedKey: requestKey,
                        data: initialRef.current,
                        error: err instanceof Error ? err.message : "Failed to load data",
                    });
                }
            });
        return () => {
            active = false;
        };
    }, [requestKey]);

    if (requestKey === null) {
        return { data: initialValue, loading: false, error: null };
    }

    const loading = state.loadedKey !== requestKey;
    return {
        data: loading ? initialValue : state.data,
        loading,
        error: loading ? null : state.error,
    };
}

