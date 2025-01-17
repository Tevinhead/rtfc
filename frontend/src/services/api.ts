// Re-export all API modules
export * from './apiUtils';
export * from './studentApi';
export * from './flashcardApi';
export * from './flashcardPackApi';
export * from './arenaApi';
export * from './matchApi';

// Note: This file now serves as a central export point for all API modules.
// Each domain has its own file with focused responsibilities and proper error handling.
// The shared axios instance and error handling utilities are in apiUtils.ts.
