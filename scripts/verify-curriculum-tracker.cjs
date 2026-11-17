const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- VERIFYING DYNAMIC INTERACTIVE CURRICULUM TRACKER ---');

// 1. Check zero usage of prohibited words ("gamified", "game", "RPG") in src
function scanDirectoryForProhibitedWords(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectoryForProhibitedWords(fullPath);
    } else if (/\.(ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/\b(gamified|game|rpg)\b/i);
      assert(!matches, `Prohibited word "${matches ? matches[0] : ''}" found in ${fullPath}`);
    }
  }
}
scanDirectoryForProhibitedWords(path.join(__dirname, '../src'));
console.log('✅ PASSED: Strictly zero occurrences of "gamified", "game", or "RPG" in src/');

// 2. Syllabus Mapping Engine Data Verification
const curriculumDataPath = path.join(__dirname, '../src/utils/curriculumData.ts');
assert(fs.existsSync(curriculumDataPath), 'curriculumData.ts exists');
const curriculumDataContent = fs.readFileSync(curriculumDataPath, 'utf8');

assert(curriculumDataContent.includes("'B.Tech CSE (Core)'"), 'Specialization includes B.Tech CSE (Core)');
assert(curriculumDataContent.includes("'B.Tech CSE (AI/ML)'"), 'Specialization includes B.Tech CSE (AI/ML)');
assert(curriculumDataContent.includes("'B.Tech CSE (AI/DS)'"), 'Specialization includes B.Tech CSE (AI/DS)');

// AI/ML Semester 1 subjects
assert(curriculumDataContent.includes('Programming for Problem Solving Using Python'), 'AI/ML includes Programming for Problem Solving Using Python');
assert(curriculumDataContent.includes('Computer Science Fundamentals & Career Pathways'), 'AI/ML includes Computer Science Fundamentals & Career Pathways');
assert(curriculumDataContent.includes('Web Development - I'), 'AI/ML includes Web Development - I');

// Python units & prerequisites
assert(curriculumDataContent.includes('Unit 1: Python Fundamentals & Problem-Solving Basics'), 'Python includes Unit 1: Python Fundamentals & Problem-Solving Basics');
assert(curriculumDataContent.includes('Unit 2: Functions, Data Structures & Coding Patterns'), 'Python includes Unit 2: Functions, Data Structures & Coding Patterns');
assert(curriculumDataContent.includes('Unit 3: Object-Oriented Programming & Real-World Programming'), 'Python includes Unit 3: Object-Oriented Programming & Real-World Programming');
assert(curriculumDataContent.includes('Unit 4: Data Processing & Practical Applications'), 'Python includes Unit 4: Data Processing & Practical Applications');
assert(curriculumDataContent.includes("prerequisites: ['node1']"), 'Python Unit 2 has prerequisite node1');
assert(curriculumDataContent.includes("prerequisites: ['node2']"), 'Python Unit 3 has prerequisite node2');
assert(curriculumDataContent.includes("prerequisites: ['node3']"), 'Python Unit 4 has prerequisite node3');

// Core & AI/DS subjects
assert(curriculumDataContent.includes('C Programming Basics'), 'Core includes C Programming Basics');
assert(curriculumDataContent.includes('Engineering Physics'), 'Core includes Engineering Physics');
assert(curriculumDataContent.includes('Data Science Fundamentals'), 'AI/DS includes Data Science Fundamentals');
assert(curriculumDataContent.includes('Intro to R'), 'AI/DS includes Intro to R');
console.log('✅ PASSED: Syllabus mapping engine data verified');

// 3. CurriculumTracker Component Visuals & Selectors
const trackerPath = path.join(__dirname, '../src/components/modules/academics/CurriculumTracker.tsx');
assert(fs.existsSync(trackerPath), 'CurriculumTracker.tsx exists');
const trackerContent = fs.readFileSync(trackerPath, 'utf8');

assert(trackerContent.includes('selectedSpecialization'), 'CurriculumTracker manages selectedSpecialization');
assert(trackerContent.includes('selectedSubjectName'), 'CurriculumTracker manages selectedSubjectName');
assert(trackerContent.includes('handleSpecializationChange'), 'CurriculumTracker has dynamic handler for specialization change');
assert(trackerContent.includes('opacity-50') && trackerContent.includes('border-slate-200'), 'CurriculumTracker implements dimmed locked state styles');
assert(trackerContent.includes('animate-pulse') && trackerContent.includes('border-teal-500'), 'CurriculumTracker implements pulsing active state styles');
assert(trackerContent.includes('bg-[#0F766E]') && trackerContent.includes('border-[#0F766E]'), 'CurriculumTracker implements glowing Deep Teal completed state styles');
assert(trackerContent.includes('Mark as Completed'), 'CurriculumTracker provides "Mark as Completed" button');
assert(trackerContent.includes('shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]'), 'Mark as Completed button implements 4-layer tactile button shadows');
console.log('✅ PASSED: CurriculumTracker visuals, dropdown selectors and layout verified');

// 4. Progress Persistence in localStorage
const storagePath = path.join(__dirname, '../src/services/storage.ts');
const storageContent = fs.readFileSync(storagePath, 'utf8');
assert(storageContent.includes("UNLOCKED_MODULES: 'unlockedModules'"), 'StorageService defines UNLOCKED_MODULES key as unlockedModules');
assert(storageContent.includes('getUnlockedModules(): UnlockedModuleRecord[]'), 'StorageService implements getUnlockedModules');
assert(storageContent.includes('markNodeCompleted('), 'StorageService implements markNodeCompleted');
assert(storageContent.includes('specializationId') && storageContent.includes('subjectId'), 'StorageService isolates progress by studentId, specializationId, and subjectId');

const contextPath = path.join(__dirname, '../src/context/AppContext.tsx');
const contextContent = fs.readFileSync(contextPath, 'utf8');
assert(contextContent.includes('unlockedModules'), 'AppContextType exposes unlockedModules');
assert(contextContent.includes('markNodeCompleted'), 'AppContextType exposes markNodeCompleted');
console.log('✅ PASSED: localStorage unlockedModules progress persistence verified');

// 5. Mount Verification
const tabPath = path.join(__dirname, '../src/components/modules/academics/SkillTreeTab.tsx');
const tabContent = fs.readFileSync(tabPath, 'utf8');
assert(tabContent.includes('CurriculumTracker'), 'SkillTreeTab mounts CurriculumTracker');
console.log('✅ PASSED: Component integration verified');

console.log('--- ALL DYNAMIC CURRICULUM TRACKER VERIFICATIONS PASSED ---');
