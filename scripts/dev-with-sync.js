const { spawn } = require('child_process');
const path = require('path');

// Start the Next.js development server
const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

console.log('🚀 Started Next.js development server');

// Process the sync queue every 10 seconds
const processInterval = setInterval(() => {
  console.log('⏱️ Running scheduled sync queue processing...');
  
  const syncProcess = spawn('npm', ['run', 'process-sync-queue'], {
    stdio: 'inherit',
    shell: true
  });
  
  syncProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Sync queue processing exited with code ${code}`);
    }
  });
}, 10000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Stopping development server and sync queue processing...');
  clearInterval(processInterval);
  nextDev.kill('SIGINT');
  process.exit(0);
});

nextDev.on('close', (code) => {
  console.log(`🛑 Next.js development server exited with code ${code}`);
  clearInterval(processInterval);
  process.exit(code);
}); 