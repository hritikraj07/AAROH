import { CodingLab, LabSubmission } from '../types';

export const DEFAULT_GLOBAL_LABS: CodingLab[] = [
  {
    id: 'lab_daa_501',
    title: 'DAA-Lab-04: Matrix Chain Multiplication & Dynamic Programming',
    problemStatement: `# Matrix Chain Multiplication (Dynamic Programming)

### Problem Description
Given a sequence of matrices, find the most efficient way to multiply these matrices together. The problem is not actually to perform the multiplications, but merely to decide in which order to perform the multiplications.

We are given an array \`p[]\` which represents the chain of 2D matrices such that the \`i-th\` matrix \`A[i]\` has dimension \`p[i-1] x p[i]\`.

### Task
Write a function \`matrix_chain_order(p)\` that returns the minimum number of scalar multiplications needed to compute the matrix product.

### Sample Input
\`\`\`python
p = [10, 20, 30, 40, 30]
\`\`\`

### Sample Output
\`\`\`
30000
\`\`\`
`,
    starterCode: `def matrix_chain_order(p):
    """
    p: List[int] representing dimensions
    Returns: int - minimum scalar multiplications
    """
    n = len(p) - 1
    m = [[0 for _ in range(n + 1)] for _ in range(n + 1)]

    # Dynamic programming table filling
    for L in range(2, n + 1):
        for i in range(1, n - L + 2):
            j = i + L - 1
            m[i][j] = float('inf')
            for k in range(i, j):
                q = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
                if q < m[i][j]:
                    m[i][j] = q

    return m[1][n]

if __name__ == "__main__":
    test_dims = [10, 20, 30, 40, 30]
    print("Result:", matrix_chain_order(test_dims))
`,
    semester: 5,
    subject: 'Design & Analysis of Algorithms',
    courseId: 'CS-501',
    windowStartTime: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    windowEndTime: new Date(Date.now() + 3600 * 1000 * 48).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    createdByFacultyName: 'Dr. K. Ramanujam',
  },
  {
    id: 'lab_os_502',
    title: 'OS-Lab-03: Preemptive Round-Robin CPU Scheduling Simulation',
    problemStatement: `# Round-Robin CPU Scheduling Simulator

### Objective
Implement the preemptive Round-Robin (RR) scheduling algorithm for a set of given processes with specific burst times and arrival times under a fixed time quantum \`q\`.

### Requirements
1. Implement context-switch tracking and process queue rotation.
2. Return a dictionary containing \`avg_waiting_time\` and \`avg_turnaround_time\`.
`,
    starterCode: `def round_robin_scheduler(processes, quantum):
    """
    processes: list of dicts with 'id', 'arrival', 'burst'
    quantum: int
    """
    # Implement Round Robin scheduling queue
    return {"avg_waiting_time": 5.5, "avg_turnaround_time": 11.5}

if __name__ == "__main__":
    sample = [
        {"id": "P1", "arrival": 0, "burst": 5},
        {"id": "P2", "arrival": 1, "burst": 4},
        {"id": "P3", "arrival": 2, "burst": 2},
    ]
    print(round_robin_scheduler(sample, 2))
`,
    semester: 5,
    subject: 'Operating Systems',
    courseId: 'CS-502',
    windowStartTime: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    windowEndTime: new Date(Date.now() + 3600 * 1000 * 72).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    createdByFacultyName: 'Prof. Sneha Verma',
  },
  {
    id: 'lab_dbms_503',
    title: 'DBMS-Lab-05: Strict Two-Phase Locking (2PL) Concurrency Protocol',
    problemStatement: `# Strict Two-Phase Locking (2PL) Protocol

### Description
Implement a strict 2-Phase Locking transaction concurrency manager that grants Shared (S) and Exclusive (X) locks on database records, guaranteeing serializability without cascading rollbacks.
`,
    starterCode: `class Strict2PLManager:
    def __init__(self):
        self.lock_table = {}

    def acquire_lock(self, txn_id, record_id, lock_type):
        return True

    def commit(self, txn_id):
        return True

if __name__ == "__main__":
    mgr = Strict2PLManager()
    print("Lock manager ready")
`,
    semester: 5,
    subject: 'Database Management Systems',
    courseId: 'CS-503',
    windowStartTime: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    windowEndTime: new Date(Date.now() + 3600 * 1000 * 96).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    createdByFacultyName: 'Dr. Amit Chhabra',
  },
  {
    id: 'lab_cn_504',
    title: 'CN-Lab-02: Go-Back-N (GBN) Sliding Window Flow Control Protocol',
    problemStatement: `# Go-Back-N (GBN) Sliding Window Protocol

### Description
Simulate reliable data transmission across an unreliable communication channel using the Go-Back-N sliding window protocol with window size \`N = 4\`.
`,
    starterCode: `def simulate_go_back_n(window_size=4, total_packets=10, loss_rate=0.2):
    return {"status": "SUCCESS", "passed_tests": 10, "total_tests": 10}

if __name__ == "__main__":
    print(simulate_go_back_n())
`,
    semester: 5,
    subject: 'Computer Networks',
    courseId: 'CS-504',
    windowStartTime: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    windowEndTime: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    createdByFacultyName: 'Prof. Rajesh Gupta',
  },
];

export const DEFAULT_LAB_SUBMISSIONS: LabSubmission[] = [
  {
    id: 'sub_cn_504_aarav',
    studentId: 'usr_std_demo',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav@aaroh.edu.in',
    labId: 'lab_cn_504',
    submittedCode: `# Go-Back-N Sliding Window Implementation
def simulate_go_back_n(window_size=4, total_packets=10, loss_rate=0.2):
    return {"status": "SUCCESS", "passed_tests": 10, "total_tests": 10}
`,
    timestamp: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    status: 'REVIEWED',
  },
];
