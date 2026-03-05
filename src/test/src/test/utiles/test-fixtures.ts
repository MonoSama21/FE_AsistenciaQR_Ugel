import { test as base } from 'playwright-bdd';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'playwright.env' });

// No exportar fixtures de Page Objects específicos
// Cada step definition crea su propia instancia cuando la necesite
export const test = base;

export { expect } from '@playwright/test';
