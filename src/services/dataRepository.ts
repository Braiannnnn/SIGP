import type { DataRepository } from '../types/models';
import { apiRepository } from './apiRepository';
import { mockRepository, resetMockDatabase } from './mockRepository';

const requestedMode = (import.meta.env.VITE_DATA_MODE ?? 'demo').toLowerCase();

export const isDemoMode = requestedMode !== 'api';

export const dataRepository: DataRepository = isDemoMode ? mockRepository : apiRepository;

export const resetDemoDatabase = async () => {
  if (!isDemoMode) return;
  await resetMockDatabase();
};
