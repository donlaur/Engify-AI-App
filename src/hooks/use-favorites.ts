/**
 * Favorites Hook
 *
 * Manages user favorites with MongoDB persistence for authenticated users
 * Falls back to localStorage for non-authenticated users (temporary)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const FAVORITES_KEY = 'engify_favorites';

export function useFavorites() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (status === 'loading') return;

      try {
        if (session?.user) {
          // Authenticated: fetch from DB
          const response = await fetch('/api/favorites');
          if (response.ok) {
            const data = await response.json();
            setFavorites(data.favorites || []);
          } else {
            // Fallback to localStorage if API fails
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
              setFavorites(JSON.parse(stored));
            }
          }
        } else {
          // Not authenticated: use localStorage (temporary)
          const stored = localStorage.getItem(FAVORITES_KEY);
          if (stored) {
            setFavorites(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [session, status]);

  // Save to localStorage for non-auth users (legacy support)
  useEffect(() => {
    if (!isLoading && !session?.user) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoading, session]);

  const addFavorite = async (promptId: string) => {
    if (favorites.includes(promptId)) return;

    // Optimistic update
    setFavorites((prev) => [...prev, promptId]);

    if (session?.user) {
      // Authenticated: persist to DB
      try {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptId }),
        });

        if (!response.ok) {
          // Revert on failure
          setFavorites((prev) => prev.filter((id) => id !== promptId));
          throw new Error('Failed to add favorite');
        }
      } catch (error) {
        console.error('Failed to add favorite:', error);
      }
    }
  };

  const removeFavorite = async (promptId: string) => {
    // Optimistic update
    setFavorites((prev) => prev.filter((id) => id !== promptId));

    if (session?.user) {
      // Authenticated: persist to DB
      try {
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptId }),
        });

        if (!response.ok) {
          // Revert on failure
          setFavorites((prev) => [...prev, promptId]);
          throw new Error('Failed to remove favorite');
        }
      } catch (error) {
        console.error('Failed to remove favorite:', error);
      }
    }
  };

  const toggleFavorite = async (promptId: string) => {
    if (favorites.includes(promptId)) {
      await removeFavorite(promptId);
    } else {
      await addFavorite(promptId);
    }
  };

  const isFavorite = (promptId: string) => {
    return favorites.includes(promptId);
  };

  return {
    favorites,
    isLoading,
    isAuthenticated: !!session?.user,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
