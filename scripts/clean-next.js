const fs = require('fs');
const path = require('path');

/**
 * Removes the .next/standalone directory before running dev/build commands.
 * This avoids Windows readlink issues when Next.js tries to clean up old standalone output.
 */
function removeStandaloneDir() {
  const projectRoot = path.resolve(__dirname, '..');
  const standaloneDir = path.join(projectRoot, '.next', 'standalone');

  if (!fs.existsSync(standaloneDir)) {
    return;
  }

  try {
    fs.rmSync(standaloneDir, { recursive: true, force: true });
    console.log(`[clean-next] Removed ${standaloneDir}`);
  } catch (error) {
    console.warn(`[clean-next] Failed to remove ${standaloneDir}:`, error.message);
  }
}

removeStandaloneDir();

