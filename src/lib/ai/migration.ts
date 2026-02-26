import { getAIConfig } from './config';

/**
 * Migrate AI config to current version
 * (Reserved for future schema changes)
 */
export async function migrateAIConfig(): Promise<void> {
  await getAIConfig();

  // Version 1: Current format - no migration needed
  // Future migrations would go here

  console.log('[AI Config] Migration check complete. Config version: 1');
}
