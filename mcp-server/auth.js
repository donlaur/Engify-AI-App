/**
 * Engify MCP Server - OAuth Authentication
 * 
 * Handles OAuth flow with Engify to get user's bug reports
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '.engify-auth.json');
const AUTH_URL = process.env.ENGIFY_AUTH_URL || 'https://www.engify.ai/auth/mcp';
const CALLBACK_PORT = 3002;

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  try {
    if (!fs.existsSync(AUTH_FILE)) {
      return false;
    }
    
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    
    // Check if token exists and not expired
    if (!auth.accessToken || !auth.expiresAt) {
      return false;
    }
    
    const expiresAt = new Date(auth.expiresAt);
    const now = new Date();
    
    if (now >= expiresAt) {
      console.log('⚠️  Token expired, please re-authenticate');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking auth:', error.message);
    return false;
  }
}

/**
 * Get stored auth token
 */
function getAuthToken() {
  try {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    return auth.accessToken;
  } catch (error) {
    return null;
  }
}

/**
 * Get user info from auth
 */
function getUserInfo() {
  try {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    return {
      userId: auth.userId,
      email: auth.email,
      name: auth.name
    };
  } catch (error) {
    return null;
  }
}

/**
 * Start OAuth flow
 */
async function authenticate() {
  return new Promise((resolve, reject) => {
    console.log('\n🔐 Engify Authentication Required\n');
    console.log('Opening browser to login...\n');
    
    // Start local callback server
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
      
      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token');
        const userId = url.searchParams.get('userId');
        const email = url.searchParams.get('email');
        const name = url.searchParams.get('name');
        const expiresIn = parseInt(url.searchParams.get('expiresIn') || '86400'); // 24 hours default
        
        if (!token || !userId) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication Failed</h1><p>Missing token or userId</p>');
          server.close();
          reject(new Error('Authentication failed'));
          return;
        }
        
        // Save auth info
        const expiresAt = new Date(Date.now() + expiresIn * 1000);
        const authData = {
          accessToken: token,
          userId,
          email,
          name,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString()
        };
        
        fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));
        
        // Success page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head>
              <title>Engify MCP - Authenticated</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                       display: flex; align-items: center; justify-content: center; height: 100vh; 
                       margin: 0; background: #f5f5f5; }
                .container { text-align: center; background: white; padding: 40px; border-radius: 12px; 
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                h1 { color: #28a745; margin: 0 0 16px 0; }
                p { color: #666; margin: 8px 0; }
                .close { margin-top: 24px; color: #999; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>✅ Authentication Successful!</h1>
                <p>Welcome, <strong>${name || email}</strong></p>
                <p>You can now close this window and return to your terminal.</p>
                <div class="close">This window will close automatically in 3 seconds...</div>
              </div>
              <script>setTimeout(() => window.close(), 3000);</script>
            </body>
          </html>
        `);
        
        server.close();
        console.log('\n✅ Authentication successful!');
        console.log(`   Logged in as: ${name || email}`);
        console.log(`   Token expires: ${expiresAt.toLocaleString()}\n`);
        resolve(authData);
      }
    });
    
    server.listen(CALLBACK_PORT, () => {
      // Open browser to auth URL
      const authUrlWithCallback = `${AUTH_URL}?callback=http://localhost:${CALLBACK_PORT}/callback`;
      
      // Open browser based on platform
      const platform = process.platform;
      const openCommand = platform === 'darwin' ? 'open' : 
                         platform === 'win32' ? 'start' : 
                         'xdg-open';
      
      exec(`${openCommand} "${authUrlWithCallback}"`, (error) => {
        if (error) {
          console.error('Failed to open browser. Please visit:');
          console.error(authUrlWithCallback);
        }
      });
      
      console.log('Waiting for authentication...');
      console.log(`If browser doesn't open, visit: ${authUrlWithCallback}\n`);
    });
    
    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentication timeout'));
    }, 300000);
  });
}

/**
 * Logout (clear auth)
 */
function logout() {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      fs.unlinkSync(AUTH_FILE);
      console.log('✅ Logged out successfully');
    } else {
      console.log('Already logged out');
    }
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
}

module.exports = {
  isAuthenticated,
  getAuthToken,
  getUserInfo,
  authenticate,
  logout
};
