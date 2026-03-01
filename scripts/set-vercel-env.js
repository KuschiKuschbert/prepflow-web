#!/usr/bin/env node

/**
 * Set Vercel Environment Variables via REST API
 *
 * This script sets environment variables in Vercel production using the Vercel REST API.
 * It reads from .env.local and prompts for production values for secrets.
 *
 * Usage:
 *   node scripts/set-vercel-env.js
 *
 * Requirements:
 *   - VERCEL_TOKEN environment variable (get from https://vercel.com/account/tokens)
 *   - VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME (from Vercel dashboard)
 *   - VERCEL_TEAM_ID (optional, only if using team account)
 *
 * Environment Variables:
 *   VERCEL_TOKEN - Vercel API token (required)
 *   VERCEL_PROJECT_ID - Vercel project ID (optional, will prompt if not set)
 *   VERCEL_TEAM_ID - Vercel team ID (optional, for team accounts)
 *
 * See: https://vercel.com/docs/rest-api for API documentation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Required Vercel Environment Variables (Production)
const REQUIRED_VARS = {
  // Auth0 Configuration (CRITICAL)
  AUTH0_ISSUER_BASE_URL: {
    required: true,
    description: 'Auth0 tenant URL',
    example: 'https://dev-7myakdl4itf644km.us.auth0.com',
    critical: true,
    productionValue: 'https://dev-7myakdl4itf644km.us.auth0.com',
  },
  AUTH0_CLIENT_ID: {
    required: true,
    description: 'Auth0 application Client ID',
    example: 'CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL',
    critical: true,
    productionValue: 'CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL',
  },
  AUTH0_CLIENT_SECRET: {
    required: true,
    description: 'Auth0 application Client Secret',
    example: 'your-production-secret-here',
    critical: true,
    secret: true,
    prompt: true, // Prompt for production value
  },

  // Auth0 SDK Configuration (CRITICAL)
  AUTH0_SECRET: {
    required: true,
    description: 'Auth0 SDK secret (minimum 32 characters)',
    example: 'your-production-secret-min-32-chars',
    critical: true,
    secret: true,
    prompt: true, // Prompt for production value
    validation: value => {
      if (!value || value.length < 32) {
        return '⚠️ Must be at least 32 characters';
      }
      return '✅ Valid';
    },
  },
  AUTH0_BASE_URL: {
    required: true,
    description: 'Application URL (MUST be www.prepflow.org for production)',
    example: 'https://www.prepflow.org',
    critical: true,
    productionValue: 'https://www.prepflow.org',
    validation: value => {
      if (!value || !value.startsWith('https://www.prepflow.org')) {
        return '⚠️ MUST be https://www.prepflow.org (with www)';
      }
      return '✅ Correct';
    },
  },
  // Deprecated NextAuth Configuration (backward compatibility)
  NEXTAUTH_URL: {
    required: false,
    description: 'DEPRECATED: Use AUTH0_BASE_URL instead',
    example: 'https://www.prepflow.org',
    critical: false,
    deprecated: true,
    validation: value => {
      if (value) return '⚠️ Deprecated - use AUTH0_BASE_URL instead';
      return '✅ Not set (using AUTH0_BASE_URL)';
    },
  },
  NEXTAUTH_SECRET: {
    required: false,
    description: 'DEPRECATED: Use AUTH0_SECRET instead',
    example: 'your-production-secret-min-32-chars',
    critical: false,
    secret: true,
    deprecated: true,
    validation: value => {
      if (value) return '⚠️ Deprecated - use AUTH0_SECRET instead';
      return '✅ Not set (using AUTH0_SECRET)';
    },
  },
  NEXTAUTH_SESSION_MAX_AGE: {
    required: false,
    description: 'Session timeout in seconds (default: 14400 = 4 hours)',
    example: '14400',
    default: '14400',
    productionValue: '14400',
  },

  // Supabase Configuration (CRITICAL)
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    example: 'https://your-project-id.supabase.co',
    critical: true,
    productionValue: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase anonymous key (public)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true,
    productionValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: 'Supabase service role key (server-only, full access)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true,
    secret: true,
    prompt: true, // Prompt for production value
  },
};

function log(message, level = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m',
  };
  const icon = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };
  console.log(`${colors[level]}${icon[level]} ${message}${colors.reset}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envVars = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      }
    });
  }

  return envVars;
}

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: parsed, statusCode: res.statusCode });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: data, statusCode: res.statusCode });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl, query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function promptForValue(key, config, localValue) {
  const rl = createReadlineInterface();
  try {
    log(`\n${key}`, 'info');
    log(`   Description: ${config.description}`, 'info');
    if (localValue && !config.secret) {
      log(`   Current local value: ${localValue}`, 'info');
    } else if (localValue && config.secret) {
      log(
        `   Current local value: ${localValue.substring(0, 4)}...${localValue.substring(localValue.length - 4)}`,
        'info',
      );
    }
    if (config.productionValue && !config.prompt) {
      log(`   Using production value: ${config.productionValue}`, 'success');
      return config.productionValue;
    }
    const answer = await question(
      rl,
      `   Enter production value${config.example ? ` (example: ${config.example})` : ''}: `,
    );
    if (config.validation) {
      const validation = config.validation(answer);
      if (validation.includes('⚠️')) {
        log(`   ${validation}`, 'warn');
        const confirm = await question(rl, '   Continue anyway? (y/n): ');
        if (confirm.toLowerCase() !== 'y') {
          return await promptForValue(key, config, localValue);
        }
      }
    }
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function listVercelProjects(vercelToken, teamId) {
  const teamParam = teamId ? `?teamId=${teamId}` : '';
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects${teamParam}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await httpsRequest(options);
  return result.data.projects || [];
}

async function findVercelProject(vercelToken, teamId, projectName = 'prepflow-web') {
  log(`\n🔍 Searching for Vercel project matching "${projectName}"...`, 'info');

  try {
    const projects = await listVercelProjects(vercelToken, teamId);

    // Try exact match first
    let project = projects.find(
      p => p.name === projectName || p.name === 'prepflow-web' || p.name === 'prepflow-landing', // legacy fallback
    );

    // Try partial match
    if (!project) {
      project = projects.find(p => p.name.toLowerCase().includes(projectName.toLowerCase()));
    }

    if (project) {
      log(`✅ Found project: ${project.name} (${project.id})`, 'success');
      return { projectId: project.id, projectName: project.name };
    }

    // If not found, show available projects
    log(`\n📋 Available projects:`, 'info');
    projects.forEach(p => {
      log(`   - ${p.name} (${p.id})`, 'info');
    });

    return null;
  } catch (error) {
    log(`⚠️ Could not list projects: ${error.message}`, 'warn');
    return null;
  }
}

async function getVercelProjectId(vercelToken, teamId) {
  // Try to get from environment or .vercel directory
  const vercelDir = path.join(process.cwd(), '.vercel');
  if (fs.existsSync(vercelDir)) {
    const projectJson = path.join(vercelDir, 'project.json');
    if (fs.existsSync(projectJson)) {
      try {
        const projectData = JSON.parse(fs.readFileSync(projectJson, 'utf-8'));
        if (projectData.projectId) {
          log(`✅ Found project ID in .vercel directory: ${projectData.projectId}`, 'success');
          return projectData.projectId;
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  // Try to find project via API
  const found = await findVercelProject(vercelToken, teamId);
  if (found) {
    return found.projectId;
  }

  // If not found, prompt for it
  const rl = createReadlineInterface();
  try {
    log('\n📋 Vercel Project Configuration', 'info');
    const projectId = await question(
      rl,
      'Enter Vercel Project ID (found in Vercel Dashboard → Settings → General): ',
    );
    return projectId.trim();
  } finally {
    rl.close();
  }
}

async function listVercelEnvVars(vercelToken, projectId, teamId) {
  const teamParam = teamId ? `?teamId=${teamId}` : '';
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env${teamParam}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await httpsRequest(options);
  return result.data.envs || [];
}

async function createVercelEnvVar(
  vercelToken,
  projectId,
  teamId,
  key,
  value,
  environment = 'production',
) {
  const teamParam = teamId ? `?teamId=${teamId}` : '';
  const postData = JSON.stringify({
    key,
    value,
    type: 'encrypted',
    target: [environment], // 'production', 'preview', 'development'
  });

  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env${teamParam}`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const result = await httpsRequest(options, postData);
  return result.data;
}

async function updateVercelEnvVar(
  vercelToken,
  projectId,
  teamId,
  envVarId,
  key,
  value,
  environment = 'production',
) {
  const teamParam = teamId ? `?teamId=${teamId}` : '';
  const postData = JSON.stringify({
    key,
    value,
    type: 'encrypted',
    target: [environment],
  });

  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env/${envVarId}${teamParam}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const result = await httpsRequest(options, postData);
  return result.data;
}

async function deleteVercelEnvVar(vercelToken, projectId, teamId, envVarId) {
  const teamParam = teamId ? `?teamId=${teamId}` : '';
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env/${envVarId}${teamParam}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await httpsRequest(options);
  return result.data;
}

async function main() {
  try {
    log('🚀 Setting Vercel Environment Variables via API...\n', 'info');

    // Check for Vercel token
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      log('❌ VERCEL_TOKEN environment variable is required', 'error');
      log('\n💡 Get your token from: https://vercel.com/account/tokens', 'info');
      log('   Then set it: export VERCEL_TOKEN=your-token-here', 'info');
      process.exit(1);
    }

    // Get project ID
    const projectId =
      process.env.VERCEL_PROJECT_ID ||
      (await getVercelProjectId(vercelToken, process.env.VERCEL_TEAM_ID));
    if (!projectId) {
      log('❌ Vercel Project ID is required', 'error');
      process.exit(1);
    }

    const teamId = process.env.VERCEL_TEAM_ID;

    log(`\n📋 Project ID: ${projectId}`, 'info');
    if (teamId) {
      log(`📋 Team ID: ${teamId}`, 'info');
    }

    // Load local environment variables
    const localEnv = loadEnvFile();

    // Fetch current Vercel environment variables
    log('\n📥 Fetching current Vercel environment variables...', 'info');
    let currentVercelVars;
    try {
      currentVercelVars = await listVercelEnvVars(vercelToken, projectId, teamId);
      log(`✅ Found ${currentVercelVars.length} existing environment variables`, 'success');
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        log('❌ Authentication failed. Check your VERCEL_TOKEN', 'error');
        log('   Get your token from: https://vercel.com/account/tokens', 'info');
        process.exit(1);
      }
      if (error.message.includes('404')) {
        log('❌ Project not found. Check your VERCEL_PROJECT_ID', 'error');
        log('   Find it in: Vercel Dashboard → Project → Settings → General', 'info');
        process.exit(1);
      }
      throw error;
    }

    // Create a map of existing variables (key -> env var object)
    const existingVarsMap = new Map();
    currentVercelVars.forEach(envVar => {
      if (envVar.target && envVar.target.includes('production')) {
        existingVarsMap.set(envVar.key, envVar);
      }
    });

    // Prepare variables to set
    log('\n📋 Preparing environment variables to set...', 'info');
    const varsToSet = [];
    const varsToUpdate = [];

    for (const [key, config] of Object.entries(REQUIRED_VARS)) {
      if (!config.required && !config.critical) {
        continue; // Skip optional variables for now
      }

      let productionValue = config.productionValue;

      // For secrets, use local value if available (user wants automation)
      // Otherwise prompt for production input
      if (config.prompt || (config.secret && !productionValue)) {
        const localValue = localEnv[key];
        if (localValue && process.env.AUTO_MODE === 'true') {
          // Auto mode: use local value for secrets
          log(`   Using local value for ${key} (auto mode)`, 'info');
          productionValue = localValue;
        } else {
          productionValue = await promptForValue(key, config, localValue);
        }
      } else if (config.productionValue) {
        productionValue = config.productionValue;
      } else if (localEnv[key] && !config.secret) {
        // Use local value if not a secret and no production value specified
        productionValue = localEnv[key];
      } else if (localEnv[key] && config.secret) {
        // For secrets, use local value if available (assume it's production-ready)
        log(`   Using local value for ${key}`, 'info');
        productionValue = localEnv[key];
      }

      if (!productionValue) {
        log(`⚠️ Skipping ${key} - no value provided`, 'warn');
        continue;
      }

      // Validate if validation function exists
      if (config.validation) {
        const validation = config.validation(productionValue);
        if (validation.includes('⚠️')) {
          log(`⚠️ ${key}: ${validation}`, 'warn');
          const rl = createReadlineInterface();
          try {
            const confirm = await question(rl, `Continue with ${key}? (y/n): `);
            if (confirm.toLowerCase() !== 'y') {
              continue;
            }
          } finally {
            rl.close();
          }
        }
      }

      const existingVar = existingVarsMap.get(key);
      if (existingVar) {
        varsToUpdate.push({ envVar: existingVar, key, value: productionValue, config });
      } else {
        varsToSet.push({ key, value: productionValue, config });
      }
    }

    // Show summary
    log('\n📊 Summary:', 'info');
    log(`   Variables to create: ${varsToSet.length}`, 'info');
    log(`   Variables to update: ${varsToUpdate.length}`, 'info');

    if (varsToSet.length === 0 && varsToUpdate.length === 0) {
      log('\n✅ All required variables are already set!', 'success');
      process.exit(0);
    }

    // Confirm before proceeding
    log('\n⚠️  This will set environment variables in Vercel Production environment', 'warn');
    const rl = createReadlineInterface();
    try {
      const confirm = await question(rl, 'Continue? (y/n): ');
      if (confirm.toLowerCase() !== 'y') {
        log('Cancelled.', 'info');
        process.exit(0);
      }
    } finally {
      rl.close();
    }

    // Create new variables
    for (const { key, value, config } of varsToSet) {
      try {
        log(`\n➕ Creating ${key}...`, 'info');
        await createVercelEnvVar(vercelToken, projectId, teamId, key, value, 'production');
        log(`✅ Created ${key}`, 'success');
      } catch (error) {
        log(`❌ Failed to create ${key}: ${error.message}`, 'error');
      }
    }

    // Update existing variables
    for (const { envVar, key, value, config } of varsToUpdate) {
      try {
        log(`\n🔄 Updating ${key}...`, 'info');
        await updateVercelEnvVar(
          vercelToken,
          projectId,
          teamId,
          envVar.id,
          key,
          value,
          'production',
        );
        log(`✅ Updated ${key}`, 'success');
      } catch (error) {
        log(`❌ Failed to update ${key}: ${error.message}`, 'error');
      }
    }

    log('\n✅ Environment variables set successfully!', 'success');
    log('\n⏳ Next steps:', 'info');
    log('   1. Wait 1-2 minutes for changes to propagate', 'info');
    log('   2. Redeploy your application in Vercel Dashboard', 'info');
    log('   3. Test sign-in: https://www.prepflow.org', 'info');
    log('   4. Run: npm run auth0:check-config (to verify Auth0 configuration)', 'info');
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'error');
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
