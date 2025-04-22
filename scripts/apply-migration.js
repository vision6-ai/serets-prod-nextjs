#!/usr/bin/env node

const fetch = require('node-fetch');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const API_ENDPOINT = 'http://localhost:3000/api/admin/migrations/apply';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function listMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir);
    
    console.log('\nAvailable migrations:');
    files.forEach((file, i) => {
      if (file.endsWith('.sql')) {
        console.log(`${i + 1}. ${file.replace('.sql', '')}`);
      }
    });
    
    return files.filter(file => file.endsWith('.sql')).map(file => file.replace('.sql', ''));
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    process.exit(1);
  }
}

function promptForMigration(migrations) {
  return new Promise((resolve) => {
    rl.question('\nEnter the migration number to apply: ', (answer) => {
      const migrationIndex = parseInt(answer) - 1;
      
      if (isNaN(migrationIndex) || migrationIndex < 0 || migrationIndex >= migrations.length) {
        console.error('Invalid selection. Please enter a valid number.');
        return promptForMigration(migrations).then(resolve);
      }
      
      resolve(migrations[migrationIndex]);
    });
  });
}

function promptForToken() {
  return new Promise((resolve) => {
    rl.question('\nEnter your admin auth token: ', (token) => {
      resolve(token.trim());
    });
  });
}

async function applyMigration(migrationName, token) {
  try {
    console.log(`\nApplying migration: ${migrationName}...`);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ migrationName })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Error: ${data.error || response.statusText}`);
      return false;
    }
    
    console.log(`Success: ${data.message}`);
    return true;
  } catch (error) {
    console.error('Error applying migration:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('===== Migration Application Tool =====');
    
    const migrations = await listMigrations();
    const selectedMigration = await promptForMigration(migrations);
    const token = await promptForToken();
    
    const success = await applyMigration(selectedMigration, token);
    
    if (success) {
      console.log('\nMigration completed successfully.');
    } else {
      console.log('\nMigration failed.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    rl.close();
  }
}

main(); 