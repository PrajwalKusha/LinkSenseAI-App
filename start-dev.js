const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting LinkSense AI in development mode...\n');

// Start the backend server
const backend = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Start the frontend development server
const frontend = spawn('npm', ['start'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'client'),
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

console.log('📱 Frontend: http://localhost:3000');
console.log('🔧 Backend: http://localhost:3001');
console.log('\nPress Ctrl+C to stop both servers\n');
