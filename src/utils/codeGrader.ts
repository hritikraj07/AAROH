import { TestCase } from '../types';

export interface TestCaseResult {
  id: string;
  testNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface CodeExecutionResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
  summary: string;
  logs: string[];
}

/**
 * Offline Mock Auto-Grader
 * Evaluates student code against test cases:
 * - If code contains 'return' and is longer than the starter code: all test cases pass.
 * - Otherwise: simulates a failure on test cases.
 */
export function simulateCodeExecution(
  studentCode: string,
  starterCode: string = '',
  testCases: TestCase[] = []
): CodeExecutionResult {
  const code = (studentCode || '').trim();
  const starter = (starterCode || '').trim();

  // Condition from spec: contains the word 'return' and is longer than starter code
  const containsReturn = /\breturn\b/.test(code);
  const isLonger = code.length > starter.length;
  const shouldPassAll = containsReturn && isLonger;

  const casesToRun: TestCase[] =
    testCases && testCases.length > 0
      ? testCases
      : [
          { id: 'tc_1', input: 'n = 5', expectedOutput: '25' },
          { id: 'tc_2', input: 'n = 10', expectedOutput: '100' },
        ];

  const results: TestCaseResult[] = casesToRun.map((tc, idx) => {
    // If shouldPassAll: all pass
    // Otherwise: test 1 passes, test 2 fails (or fail if only 1 test case)
    const passed = shouldPassAll ? true : idx === 0 && casesToRun.length > 1 ? true : false;

    return {
      id: tc.id || `tc_${idx + 1}`,
      testNumber: idx + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: passed ? tc.expectedOutput : 'None / AssertionError: Expected ' + tc.expectedOutput,
      passed,
    };
  });

  const passedCount = results.filter(r => r.passed).length;
  const allPassed = passedCount === results.length;

  // Format exact summary line required: "✅ Test 1 Passed | ❌ Test 2 Failed"
  const summary = results
    .map(r => `${r.passed ? '✅' : '❌'} Test ${r.testNumber} ${r.passed ? 'Passed' : 'Failed'}`)
    .join(' | ');

  const logs = [
    `[LiveLab Execution Environment] Language runtime initialized.`,
    `Running ${results.length} test assertions against target output...`,
    ...results.map(
      r => `  [Test ${r.testNumber}] Input: ${r.input} => Output: ${r.actualOutput} (${r.passed ? 'PASSED' : 'FAILED'})`
    ),
    allPassed
      ? `SUCCESS: All ${results.length} test cases passed. Ready for grading submission.`
      : `FAILURE: ${results.length - passedCount} test case(s) failed. Ensure return statement and complete logic are present.`,
  ];

  return {
    allPassed,
    passedCount,
    totalCount: results.length,
    results,
    summary,
    logs,
  };
}
