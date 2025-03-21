const { execSync } = require('child_process');
const port = process.env.PORT || 3000;

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully');
  
  process.env.PORT = port;
  process.env.HOST = '0.0.0.0';
  
  require('./dist/server');
} catch (error) {
  console.error('Error during build or startup:', error);
  process.exit(1);
}
