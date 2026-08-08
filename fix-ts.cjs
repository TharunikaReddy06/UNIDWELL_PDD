const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/App.tsx',
  'src/components/common/PropertyCard.tsx',
  'src/components/roommate/RoommateCard.tsx',
  'src/data/mock.ts',
  'src/layouts/AuthLayout.tsx',
  'src/layouts/MainLayout.tsx',
  'src/pages/ChatList.tsx',
  'src/pages/ChatScreen.tsx',
  'src/pages/Home.tsx',
  'src/pages/Login.tsx',
  'src/pages/OwnerDashboard.tsx',
  'src/pages/Profile.tsx',
  'src/pages/RoommatesHome.tsx',
  'src/pages/Signup.tsx',
  'src/store/useStore.ts'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix React imports
  content = content.replace(/import React(?:, {([^}]+)})? from 'react';\r?\n/g, (match, p1) => {
      if (p1) return `import { ${p1} } from 'react';\n`;
      return '';
  });

  // Fix type imports
  content = content.replace(/import {([^}]+)} from '\.\.\/types';/g, "import type {$1} from '../types';");
  content = content.replace(/import {([^}]+)} from '\.\.\/\.\.\/types';/g, "import type {$1} from '../../types';");
  
  // Unused variables
  if (file.endsWith('ChatScreen.tsx')) {
      content = content.replace(/, MoreVertical/, '');
  }
  if (file.endsWith('Login.tsx')) {
      content = content.replace(/data: LoginFormValues/g, '_data: LoginFormValues');
  }
  if (file.endsWith('Profile.tsx')) {
      content = content.replace(/, CardContent/, '');
  }
  if (file.endsWith('useStore.ts')) {
      content = content.replace(/, mockStudents/, '');
  }
  
  fs.writeFileSync(file, content);
});
