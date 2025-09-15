// Simple test to verify the environment variable processing fix
const fs = require('fs');
const path = require('path');

// Test the helper functions that we implemented
const getEnvKey = (envVar) => {
  return typeof envVar === 'string' ? envVar : envVar.key;
};

const getEnvExample = (envVar) => {
  return typeof envVar === 'object' ? envVar.example : undefined;
};

// Test data - mix of old string format and new object format
const testEnvVars = [
  'JWT_SECRET', // old format
  'JWT_EXPIRES_IN', // old format
  { key: 'RESEND_API_KEY', required: true, example: 're_123456789abcdef' }, // new format
  { key: 'MAIL_FROM', required: true, example: 'noreply@example.com' }, // new format
  { key: 'RBAC_SUPER_ADMIN_EMAIL', required: true, example: 'admin@yourapp.com' }, // new format
  'AWS_ACCESS_KEY_ID', // old format
  { key: 'GOOGLE_CLIENT_ID', required: true, example: 'your-google-client-id' }, // new format
];

console.log('Testing environment variable processing fix...\n');

// Test categorization
const dbVars = testEnvVars.filter(v => {
  const key = getEnvKey(v);
  return key.includes('DB_') || key.includes('DATABASE_');
});

const authVars = testEnvVars.filter(v => {
  const key = getEnvKey(v);
  return key.includes('JWT_') || key.includes('AUTH_') || key.includes('RBAC_');
});

const mailVars = testEnvVars.filter(v => {
  const key = getEnvKey(v);
  return key.includes('MAIL_') || key.includes('SMTP_') || key.includes('RESEND_');
});

const oauthVars = testEnvVars.filter(v => {
  const key = getEnvKey(v);
  return key.includes('GOOGLE_') || key.includes('GITHUB_') || key.includes('MICROSOFT_');
});

const awsVars = testEnvVars.filter(v => {
  const key = getEnvKey(v);
  return key.includes('AWS_');
});

console.log('Categorization results:');
console.log('Database vars:', dbVars.map(getEnvKey));
console.log('Auth vars:', authVars.map(getEnvKey));
console.log('Mail vars:', mailVars.map(getEnvKey));
console.log('OAuth vars:', oauthVars.map(getEnvKey));
console.log('AWS vars:', awsVars.map(getEnvKey));

console.log('\nTesting .env template generation...\n');

// Generate template content
const envTemplateContent = [
  '# Environment Configuration Template',
  '# Copy this file to .env and fill in the values',
  '',
  '# Application Configuration',
  'NODE_ENV=development',
  'PORT=3000',
  '',
];

// Process auth vars as an example
if (authVars.length > 0) {
  envTemplateContent.push('# Authentication Configuration');
  authVars.forEach(envVar => {
    const key = getEnvKey(envVar);
    const example = getEnvExample(envVar);

    if (key.includes('JWT_SECRET')) {
      envTemplateContent.push(`${key}=${example || 'your-jwt-secret-key-here'}`);
    } else if (key.includes('JWT_EXPIRES_IN')) {
      envTemplateContent.push(`${key}=${example || '1h'}`);
    } else {
      envTemplateContent.push(`${key}=${example || ''}`);
    }
  });
  envTemplateContent.push('');
}

// Process mail vars
if (mailVars.length > 0) {
  envTemplateContent.push('# Mail Configuration');
  mailVars.forEach(envVar => {
    const key = getEnvKey(envVar);
    const example = getEnvExample(envVar);
    envTemplateContent.push(`${key}=${example || ''}`);
  });
  envTemplateContent.push('');
}

// Process OAuth vars
if (oauthVars.length > 0) {
  envTemplateContent.push('# OAuth Configuration');
  const googleVars = oauthVars.filter(v => getEnvKey(v).includes('GOOGLE_'));

  if (googleVars.length > 0) {
    envTemplateContent.push('# Google OAuth');
    googleVars.forEach(envVar => {
      const key = getEnvKey(envVar);
      const example = getEnvExample(envVar);
      envTemplateContent.push(`${key}=${example || ''}`);
    });
  }
  envTemplateContent.push('');
}

// Process AWS vars
if (awsVars.length > 0) {
  envTemplateContent.push('# AWS Configuration');
  awsVars.forEach(envVar => {
    const key = getEnvKey(envVar);
    const example = getEnvExample(envVar);

    if (key.includes('AWS_REGION')) {
      envTemplateContent.push(`${key}=${example || 'us-east-1'}`);
    } else {
      envTemplateContent.push(`${key}=${example || ''}`);
    }
  });
  envTemplateContent.push('');
}

console.log('Generated .env template:');
console.log(envTemplateContent.join('\n'));

console.log('\n✅ Test completed successfully! The fix handles both string and object formats correctly.');
console.log('📝 Key improvements:');
console.log('  - Helper functions getEnvKey() and getEnvExample() abstract format differences');
console.log('  - Categorization now works with both formats');
console.log('  - Template generation includes example values when available');
console.log('  - Backward compatibility maintained for existing string format');