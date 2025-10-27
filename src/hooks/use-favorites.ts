/**
 * Favorites Hook
 *
 * Manages user favorites using localStorage
 * Will be replaced with database storage when auth is added
 */

'use client';

import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'engify_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoading]);

  const addFavorite = (promptId: string) => {
    setFavorites((prev) => {
      if (prev.includes(promptId)) return prev;
      return [...prev, promptId];
    });
  };

  const removeFavorite = (promptId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== promptId));
  };

  const toggleFavorite = (promptId: string) => {
    if (favorites.includes(promptId)) {
      removeFavorite(promptId);
    } else {
      addFavorite(promptId);
    }
  };

  const isFavorite = (promptId: string) => {
    return favorites.includes(promptId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
