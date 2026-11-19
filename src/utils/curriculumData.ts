import { Course, SpecializationOption, SyllabusNode } from '../types';

export interface CurriculumSubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  description: string;
  nodes: SyllabusNode[];
}

const btechAimlSubjects: CurriculumSubject[] = [
  {
    id: 'aiml_python',
    name: 'Programming for Problem Solving Using Python',
      code: 'CS101-AIML',
      semester: 1,
      description: 'Foundations of algorithmic problem solving, procedural abstractions, and computational Python workflows.',
      nodes: [
        {
          id: 'node1',
          title: 'Unit 1: Python Fundamentals & Problem-Solving Basics',
          unitNumber: 1,
          description: 'Computational thinking, variable semantics, dynamic typing, operators, control flow branching, and iterative constructs.',
          prerequisites: [],
          topics: ['Control Structures', 'Data Types', 'Loops & Iterators', 'Input/Output Pipelines'],
          learningOutcomes: ['Design algorithmic flowcharts for arithmetic operations', 'Implement branching decisions with if/elif/else constructs']
        },
        {
          id: 'node2',
          title: 'Unit 2: Functions, Data Structures & Coding Patterns',
          unitNumber: 2,
          description: 'Modular program design, function scoping, recursion, list comprehensions, tuples, dictionaries, and memory references.',
          prerequisites: ['node1'],
          topics: ['Scoping Rules', 'Collections & Hash Maps', 'Lambda Expressions', 'List Comprehensions'],
          learningOutcomes: ['Architect modular code using reusable functions', 'Operate efficiently on composite dictionaries and lists']
        },
        {
          id: 'node3',
          title: 'Unit 3: Object-Oriented Programming & Real-World Programming',
          unitNumber: 3,
          description: 'Class architecture, inheritance trees, encapsulation, polymorphism, custom exception handling, and modular packages.',
          prerequisites: ['node2'],
          topics: ['Encapsulation & Dunder Methods', 'Inheritance Hierarchies', 'Exception Handling', 'Package Namespaces'],
          learningOutcomes: ['Construct object-oriented models for real systems', 'Manage runtime safety via structured try/except blocks']
        },
        {
          id: 'node4',
          title: 'Unit 4: Data Processing & Practical Applications',
          unitNumber: 4,
          description: 'Vectorized computing, structured file I/O, data transformation pipelines, and introductory numerical analysis.',
          prerequisites: ['node3'],
          topics: ['File Streams (CSV/JSON)', 'Vector Operations', 'Numerical Analysis', 'Pipeline Automation'],
          learningOutcomes: ['Process raw semi-structured text and CSV feeds', 'Deploy automated data transformation workflows']
        }
      ]
    },
    {
      id: 'aiml_cs_fund',
      name: 'Computer Science Fundamentals & Career Pathways',
      code: 'CS102-AIML',
      semester: 1,
      description: 'Architecture of digital computers, operating system abstractions, cloud compute fabrics, and AI career landscape.',
      nodes: [
        {
          id: 'aiml_cs_1',
          title: 'Unit 1: Computer Systems & Architecture Principles',
          unitNumber: 1,
          description: 'Von Neumann model, instruction cycles, memory hierarchy, cache coherency, and binary number representation.',
          prerequisites: [],
          topics: ['CPU Architecture', 'Memory Hierarchy', 'Binary & Boolean Logic', 'Bus Architecture'],
          learningOutcomes: ['Trace CPU machine instruction execution cycles', 'Analyze cache memory impact on software throughput']
        },
        {
          id: 'aiml_cs_2',
          title: 'Unit 2: Algorithmic Thinking & Computational Models',
          unitNumber: 2,
          description: 'Complexity models (Big-O, Omega, Theta), search/sort analysis, and deterministic state machines.',
          prerequisites: ['aiml_cs_1'],
          topics: ['Asymptotic Notation', 'Divide & Conquer', 'State Automata', 'Complexity Bounds'],
          learningOutcomes: ['Evaluate time and space complexity mathematically', 'Decompose complex problem specifications into discrete sub-problems']
        },
        {
          id: 'aiml_cs_3',
          title: 'Unit 3: Professional Ethics & Emerging Tech Horizons',
          unitNumber: 3,
          description: 'Ethical AI governance, algorithmic bias, privacy regulations, intellectual property, and academic integrity.',
          prerequisites: ['aiml_cs_2'],
          topics: ['Ethical AI Principles', 'Algorithmic Fairness', 'Data Sovereignty', 'Open Source Licensing'],
          learningOutcomes: ['Detect algorithmic bias in dataset selection', 'Comply with intellectual property and university integrity codes']
        },
        {
          id: 'aiml_cs_4',
          title: 'Unit 4: Industry Capstone Project Preparation',
          unitNumber: 4,
          description: 'Git distributed version control, CI/CD foundations, system documentation, and industry career portfolios.',
          prerequisites: ['aiml_cs_3'],
          topics: ['Git Version Control', 'Agile Sprints', 'Portfolio Design', 'Technical Documentation'],
          learningOutcomes: ['Manage code branches and merge conflicts via Git', 'Present comprehensive technical software documentation']
        }
      ]
    },
    {
      id: 'aiml_web_dev',
      name: 'Web Development - I',
      code: 'CS103-AIML',
      semester: 1,
      description: 'Client-side web architecture, accessibility guidelines, responsive layout rendering, and DOM programming.',
      nodes: [
        {
          id: 'aiml_web_1',
          title: 'Unit 1: Modern Semantic HTML5 & Modern CSS3',
          unitNumber: 1,
          description: 'Semantic markup elements, document object tree structure, box model fundamentals, and typography hierarchy.',
          prerequisites: [],
          topics: ['Semantic Tags', 'CSS Box Model', 'Typography & Units', 'Accessibility (ARIA)'],
          learningOutcomes: ['Write accessible semantic HTML documents', 'Format precision interfaces with cascading style rules']
        },
        {
          id: 'aiml_web_2',
          title: 'Unit 2: Responsive Design & CSS Grid/Flexbox Layouts',
          unitNumber: 2,
          description: 'Mobile-first viewport media queries, multi-axis Flexbox alignment, and 2D grid matrix layouts.',
          prerequisites: ['aiml_web_1'],
          topics: ['CSS Flexbox Multi-Axis', 'CSS Grid Fr Units', 'Media Queries', 'Fluid Layouts'],
          learningOutcomes: ['Develop fluid layouts adapting to any device screen size', 'Utilize modern Flexbox and Grid without float workarounds']
        },
        {
          id: 'aiml_web_3',
          title: 'Unit 3: JavaScript Programming & DOM Manipulation',
          unitNumber: 3,
          description: 'ECMAScript modern standards, event propagation, dynamic DOM tree updates, and browser local storage APIs.',
          prerequisites: ['aiml_web_2'],
          topics: ['DOM Tree Querying', 'Event Bubbling', 'Storage APIs', 'ES6+ Syntax'],
          learningOutcomes: ['Intercept user events and update dynamic UI state', 'Persist client data reliably in browser storage']
        },
        {
          id: 'aiml_web_4',
          title: 'Unit 4: Asynchronous JavaScript, APIs & Client Apps',
          unitNumber: 4,
          description: 'Promises, async/await syntax, fetch API requests, JSON serialization, and reactive client-side rendering.',
          prerequisites: ['aiml_web_3'],
          topics: ['Fetch API & REST', 'Async/Await Cycles', 'JSON Data Parsing', 'Dynamic UI Updates'],
          learningOutcomes: ['Consume external HTTP REST endpoints via modern fetch APIs', 'Handle network errors and pending asynchronous states gracefully']
        }
      ]
    }
  ];

export const CURRICULUM_DATA: Record<SpecializationOption, CurriculumSubject[]> = {
  'B.Tech CSE (AI & ML)': btechAimlSubjects,
  'B.Tech CSE (AI/ML)': btechAimlSubjects,

  'B.Tech CSE (Core)': [
    {
      id: 'core_c_prog',
      name: 'C Programming Basics',
      code: 'CS101-CORE',
      semester: 1,
      description: 'Structured programming, memory addressing, pointers, and systems development in ANSI C.',
      nodes: [
        {
          id: 'core_c_1',
          title: 'Unit 1: Syntax, Variables, Control Flow & Conditionals',
          unitNumber: 1,
          description: 'C compilers, primitive types, bitwise operators, conditional branches, and iterative constructs.',
          prerequisites: [],
          topics: ['Primitive Data Types', 'Control Statements', 'Bitwise Operators', 'Compilation Flow'],
          learningOutcomes: ['Write standard C programs compiled via GCC', 'Execute bitwise manipulations on integer registers']
        },
        {
          id: 'core_c_2',
          title: 'Unit 2: Functions, Arrays & String Processing',
          unitNumber: 2,
          description: 'Stack frame execution, call-by-value vs call-by-reference, multi-dimensional arrays, and null-terminated strings.',
          prerequisites: ['core_c_1'],
          topics: ['Stack Frames', 'Pass by Reference', 'Array Buffers', 'String Algorithms'],
          learningOutcomes: ['Isolate logic into functions with stack frame safety', 'Process string buffers with proper null-termination']
        },
        {
          id: 'core_c_3',
          title: 'Unit 3: Pointers, Memory Allocation & Structures',
          unitNumber: 3,
          description: 'Pointer arithmetic, malloc/calloc/free heap management, structures, unions, and memory alignment.',
          prerequisites: ['core_c_2'],
          topics: ['Pointer Arithmetic', 'Heap Allocation (malloc/free)', 'Typedef Structures', 'Memory Padding'],
          learningOutcomes: ['Allocate and free dynamic heap memory without leaks', 'Construct linked data representations with pointers']
        },
        {
          id: 'core_c_4',
          title: 'Unit 4: File Handling & Low-Level Operations',
          unitNumber: 4,
          description: 'File descriptors, binary vs stream I/O, preprocessor directives, macros, and basic system utilities.',
          prerequisites: ['core_c_3'],
          topics: ['File Streams (fopen/fread)', 'Preprocessor Macros', 'Header Files', 'Binary File Buffers'],
          learningOutcomes: ['Persist binary records to persistent disk storage', 'Author modular multi-file header projects']
        }
      ]
    },
    {
      id: 'core_eng_physics',
      name: 'Engineering Physics',
      code: 'PH101-CORE',
      semester: 1,
      description: 'Optics, electromagnetic field theory, quantum states, and solid-state device physics.',
      nodes: [
        {
          id: 'core_ph_1',
          title: 'Unit 1: Wave Optics & Interference Phenomena',
          unitNumber: 1,
          description: 'Wave propagation, Young double slit, Newton rings, thin film interference, and diffraction gratings.',
          prerequisites: [],
          topics: ['Wavefront Theory', 'Interference in Thin Films', 'Fraunhofer Diffraction', 'Polarization'],
          learningOutcomes: ['Derive interference condition equations', 'Calculate resolving power of optical diffraction gratings']
        },
        {
          id: 'core_ph_2',
          title: 'Unit 2: Quantum Mechanics & Wave-Particle Duality',
          unitNumber: 2,
          description: 'De Broglie hypothesis, Heisenberg uncertainty principle, Schrödinger wave equation, and potential wells.',
          prerequisites: ['core_ph_1'],
          topics: ['De Broglie Waves', 'Uncertainty Principle', 'Schrödinger Equation', 'Particle in 1D Box'],
          learningOutcomes: ['Solve 1D time-independent Schrödinger equations', 'Interpret quantum wave function probability densities']
        },
        {
          id: 'core_ph_3',
          title: 'Unit 3: Semiconductor Physics & Solid State Devices',
          unitNumber: 3,
          description: 'Band theory of solids, Fermi-Dirac statistics, intrinsic and extrinsic semiconductors, and Hall effect.',
          prerequisites: ['core_ph_2'],
          topics: ['Energy Band Theory', 'Fermi Energy Level', 'Carrier Concentration', 'Hall Coefficient'],
          learningOutcomes: ['Map charge carrier movement in semiconductor junctions', 'Measure carrier density and type via Hall effect']
        },
        {
          id: 'core_ph_4',
          title: 'Unit 4: Lasers, Fiber Optics & Modern Applications',
          unitNumber: 4,
          description: 'Stimulated emission, Einstein coefficients, semiconductor lasers, total internal reflection, and optical fiber attenuation.',
          prerequisites: ['core_ph_3'],
          topics: ['Population Inversion', 'He-Ne & Diode Lasers', 'Numerical Aperture', 'Optical Fiber Modes'],
          learningOutcomes: ['Analyze optical modes in communication fiber cables', 'Compute acceptance angle and numerical aperture values']
        }
      ]
    }
  ],

  'B.Tech CSE (AI/DS)': [
    {
      id: 'aids_ds_fund',
      name: 'Data Science Fundamentals',
      code: 'DS101-AIDS',
      semester: 1,
      description: 'Principles of empirical data analysis, statistical hypotheses, and end-to-end data science life cycle.',
      nodes: [
        {
          id: 'aids_ds_1',
          title: 'Unit 1: Introduction to Data Science & Analytical Methodologies',
          unitNumber: 1,
          description: 'Data science pipeline, structured vs unstructured data, sampling theory, and metric definition.',
          prerequisites: [],
          topics: ['Pipeline Architecture', 'Data Types & Scales', 'Sampling Techniques', 'Exploratory Workflow'],
          learningOutcomes: ['Frame business problems as analytical questions', 'Formulate appropriate data collection and sampling plans']
        },
        {
          id: 'aids_ds_2',
          title: 'Unit 2: Statistical Inference & Exploratory Data Analysis',
          unitNumber: 2,
          description: 'Descriptive metrics, dispersion measures, normal distributions, central limit theorem, and hypothesis testing.',
          prerequisites: ['aids_ds_1'],
          topics: ['Central Limit Theorem', 'Z/T Hypothesis Tests', 'Correlation vs Causation', 'Covariance Matrices'],
          learningOutcomes: ['Perform two-sample parametric hypothesis tests', 'Summarize high-dimensional data via covariance distributions']
        },
        {
          id: 'aids_ds_3',
          title: 'Unit 3: Data Cleaning, Wrangling & Transformation',
          unitNumber: 3,
          description: 'Missing value imputation, outlier detection algorithms, feature normalization, and categorical encoding.',
          prerequisites: ['aids_ds_2'],
          topics: ['Imputation Strategies', 'Z-Score & IQR Outliers', 'Min-Max & Robust Scaling', 'One-Hot & Target Encoding'],
          learningOutcomes: ['Clean messy real-world survey datasets programmatically', 'Normalize numerical features to prevent gradient dominance']
        },
        {
          id: 'aids_ds_4',
          title: 'Unit 4: Predictive Modeling & Storytelling with Data',
          unitNumber: 4,
          description: 'Linear & logistic regression baselines, cross-validation splits, evaluation matrices, and executive dashboards.',
          prerequisites: ['aids_ds_3'],
          topics: ['Regression Baselines', 'K-Fold Validation', 'Precision/Recall & F1', 'Data Storytelling'],
          learningOutcomes: ['Fit baseline models and evaluate with F1/ROC-AUC', 'Communicate analytical findings through clear charts']
        }
      ]
    },
    {
      id: 'aids_r_prog',
      name: 'Intro to R',
      code: 'DS102-AIDS',
      semester: 1,
      description: 'Statistical computing, functional data transformation, and scientific data visual charts in R.',
      nodes: [
        {
          id: 'aids_r_1',
          title: 'Unit 1: R Environment Setup, Data Types & Vectors',
          unitNumber: 1,
          description: 'RStudio workspace, atomic vectors, matrices, lists, indexing operators, and vectorized logic.',
          prerequisites: [],
          topics: ['Atomic Vectors', 'Matrices & Arrays', 'List Hierarchies', 'Vectorized Operations'],
          learningOutcomes: ['Master R syntax, basic data structures, and atomic vectors', 'Perform vectorized element-wise computations']
        },
        {
          id: 'aids_r_2',
          title: 'Unit 2: Data Frames, Tibbles & Tidyverse Pipeline',
          unitNumber: 2,
          description: 'Data frame structures, dplyr pipe operators (%>%), filtering, selecting, mutating, and grouped summaries.',
          prerequisites: ['aids_r_1'],
          topics: ['Tibble Structures', 'Dplyr Pipeline (%>%)', 'Group By & Summarize', 'Joins & Merges'],
          learningOutcomes: ['Chain data transformation stages using tidyverse pipes', 'Aggregate tabular metrics grouped across category factors']
        },
        {
          id: 'aids_r_3',
          title: 'Unit 3: Data Visualization with ggplot2',
          unitNumber: 3,
          description: 'Grammar of graphics, geometric layers (geoms), aesthetic mappings, faceting, and thematic styling.',
          prerequisites: ['aids_r_2'],
          topics: ['Aesthetic Mappings', 'Geom Layers (Scatter/Box/Bar)', 'Facet Grids', 'Custom Themes'],
          learningOutcomes: ['Compose layered visualizations using ggplot2 grammar', 'Facet complex distributions into multi-panel comparison grids']
        },
        {
          id: 'aids_r_4',
          title: 'Unit 4: Statistical Computing & Markdown Reports',
          unitNumber: 4,
          description: 'Probability distributions, parametric tests, linear model fitting (lm), and dynamic RMarkdown documentation.',
          prerequisites: ['aids_r_3'],
          topics: ['Distribution Sampling', 'ANOVA & T-Tests', 'Linear Models (lm)', 'RMarkdown Knitting'],
          learningOutcomes: ['Execute statistical regressions and ANOVA in R', 'Generate reproducible research documents using RMarkdown']
        }
      ]
    }
  ],

  'B.Tech CSE': [
    {
      id: 'cse_prog_fund',
      name: 'Computer Programming Fundamentals',
      code: 'CS101-CSE',
      semester: 1,
      description: 'Foundations of procedural programming, memory architectures, structured data, and algorithm analysis in C.',
      nodes: [
        {
          id: 'cse_prog_1',
          title: 'Unit 1: Computational Thinking & C Syntax',
          unitNumber: 1,
          description: 'Problem decomposition, execution environments, primitive types, arithmetic operators, and control branching.',
          prerequisites: [],
          topics: ['Problem Decomposition', 'Syntax & Compilation', 'Control Branching', 'Iteration Constructs'],
          learningOutcomes: ['Formulate procedural solutions to mathematical algorithms', 'Implement validated branch logic using standard C']
        },
        {
          id: 'cse_prog_2',
          title: 'Unit 2: Functions, Arrays & Dynamic Buffers',
          unitNumber: 2,
          description: 'Call stack dynamics, scope lifetimes, multi-dimensional array operations, and string manipulation pipelines.',
          prerequisites: ['cse_prog_1'],
          topics: ['Stack Frames & Recursion', 'Multi-Dimensional Arrays', 'String Manipulation', 'Buffer Safety'],
          learningOutcomes: ['Design modular software using decoupled functions', 'Manipulate contiguous memory buffers with boundary safety']
        },
        {
          id: 'cse_prog_3',
          title: 'Unit 3: Pointers, Memory Architectures & Structs',
          unitNumber: 3,
          description: 'Pointer arithmetic, dynamic heap allocation, composite struct definitions, and reference parameter passing.',
          prerequisites: ['cse_prog_2'],
          topics: ['Pointer Arithmetic', 'Heap Allocation (malloc/free)', 'Composite Structures', 'Reference Semantics'],
          learningOutcomes: ['Manage runtime memory allocation without resource leaks', 'Model real-world entities through composite C structures']
        },
        {
          id: 'cse_prog_4',
          title: 'Unit 4: File Streams & System Compilation',
          unitNumber: 4,
          description: 'Sequential and random file access, multi-file modular builds, preprocessor pipelines, and header hygiene.',
          prerequisites: ['cse_prog_3'],
          topics: ['File Streams (fopen/fread)', 'Preprocessor Macros', 'Multi-File Builds', 'Static Linking'],
          learningOutcomes: ['Persist binary structured records to non-volatile storage', 'Architect clean multi-source compilation pipelines']
        }
      ]
    },
    {
      id: 'cse_discrete_math',
      name: 'Discrete Mathematical Structures',
      code: 'MA101-CSE',
      semester: 1,
      description: 'Mathematical reasoning, combinatorics, discrete probability, relations, and foundational graph theory for computing.',
      nodes: [
        {
          id: 'cse_math_1',
          title: 'Unit 1: Set Theory, Relations & Propositional Logic',
          unitNumber: 1,
          description: 'Set operations, Cartesian products, equivalence relations, truth tables, and propositional equivalence.',
          prerequisites: [],
          topics: ['Set Algebra', 'Equivalence Classes', 'Propositional Calculus', 'Boolean Connectives'],
          learningOutcomes: ['Prove relation equivalence and partial order properties', 'Construct formal truth verification tables']
        },
        {
          id: 'cse_math_2',
          title: 'Unit 2: Predicate Calculus & Proof Techniques',
          unitNumber: 2,
          description: 'Universal and existential quantifiers, mathematical induction, contradiction proofs, and well-ordering.',
          prerequisites: ['cse_math_1'],
          topics: ['First-Order Quantifiers', 'Direct & Indirect Proofs', 'Strong Induction', 'Invariants'],
          learningOutcomes: ['Formulate rigorous mathematical induction proofs', 'Model domain constraints using predicate formulas']
        },
        {
          id: 'cse_math_3',
          title: 'Unit 3: Combinatorics, Recurrences & Generating Functions',
          unitNumber: 3,
          description: 'Permutations, combinations, pigeonhole principle, homogeneous recurrence relations, and Master Theorem.',
          prerequisites: ['cse_math_2'],
          topics: ['Permutations & Combinations', 'Pigeonhole Applications', 'Recurrence Relations', 'Master Theorem'],
          learningOutcomes: ['Solve recurrence equations for algorithmic asymptotic bounds', 'Apply counting principles to computational complexity']
        },
        {
          id: 'cse_math_4',
          title: 'Unit 4: Graph Theory & Algebraic Structures',
          unitNumber: 4,
          description: 'Graph representations, Euler and Hamiltonian circuits, spanning trees, groups, rings, and monoids.',
          prerequisites: ['cse_math_3'],
          topics: ['Graph Representations', 'Eulerian & Hamiltonian Paths', 'Minimum Spanning Trees', 'Group Theory Basics'],
          learningOutcomes: ['Represent network topologies using graph matrices', 'Evaluate algebraic closure and associativity in computing systems']
        }
      ]
    }
  ],

  'B.Tech CSE (Cyber Security) EC-Council': [
    {
      id: 'cyber_net_sec',
      name: 'Network Security Basics',
      code: 'CS101-CYBER',
      semester: 1,
      description: 'Foundations of network defense, perimeter controls, packet inspection, and threat identification protocols.',
      nodes: [
        {
          id: 'cyber_net_1',
          title: 'Unit 1: Network Defense Architecture & OSI Models',
          unitNumber: 1,
          description: 'Layered security models, TCP/IP handshake mechanics, port scanning vectors, and threat categorization.',
          prerequisites: [],
          topics: ['OSI Model Security', 'TCP/IP Protocol Suite', 'Port Scanning Analysis', 'Threat Landscapes'],
          learningOutcomes: ['Analyze network communication traces across protocol layers', 'Identify unauthorized port probes and reconnaissance']
        },
        {
          id: 'cyber_net_2',
          title: 'Unit 2: Perimeter Security, Firewalls & IDS/IPS',
          unitNumber: 2,
          description: 'Packet filtering, stateful firewalls, intrusion detection architectures, and rule set configuration.',
          prerequisites: ['cyber_net_1'],
          topics: ['Stateful Firewalls', 'Signature vs Anomaly IDS', 'Perimeter Demarcation', 'Rule Optimization'],
          learningOutcomes: ['Configure packet filter rules for perimeter protection', 'Analyze intrusion alerts from automated sensors']
        },
        {
          id: 'cyber_net_3',
          title: 'Unit 3: Packet Inspection & Traffic Protocol Analysis',
          unitNumber: 3,
          description: 'Deep packet inspection, protocol disassembly, Wireshark packet capture, and rogue payload identification.',
          prerequisites: ['cyber_net_2'],
          topics: ['Packet Disassembly', 'Wireshark Filtering', 'DNS & ARP Spoofing', 'Payload Extraction'],
          learningOutcomes: ['Inspect network captures for malicious signatures', 'Detect protocol poisoning attacks on local segments']
        },
        {
          id: 'cyber_net_4',
          title: 'Unit 4: Incident Response & Defensive Hardening',
          unitNumber: 4,
          description: 'Incident triage workflows, OS baseline hardening, endpoint containment, and audit log correlation.',
          prerequisites: ['cyber_net_3'],
          topics: ['Incident Triage (NIST)', 'OS Security Hardening', 'Audit Log Correlation', 'Containment Strategies'],
          learningOutcomes: ['Execute structured containment procedures during breaches', 'Harden baseline operating systems against unauthorized elevation']
        }
      ]
    },
    {
      id: 'cyber_crypto_fund',
      name: 'Cryptography Fundamentals',
      code: 'CS102-CYBER',
      semester: 1,
      description: 'Mathematical foundations of encryption, symmetric and asymmetric ciphers, integrity hashing, and key infrastructures.',
      nodes: [
        {
          id: 'cyber_crypto_1',
          title: 'Unit 1: Classical Ciphers & Symmetric Encryption',
          unitNumber: 1,
          description: 'Substitution and transposition ciphers, Shannon secrecy models, stream ciphers, and pseudo-random generators.',
          prerequisites: [],
          topics: ['Classical Cryptography', 'Shannon Perfect Secrecy', 'Stream Ciphers', 'Entropy Measures'],
          learningOutcomes: ['Evaluate computational security of classical cipher variants', 'Compute entropy thresholds for cryptographic keys']
        },
        {
          id: 'cyber_crypto_2',
          title: 'Unit 2: Modern Block Ciphers & AES Architecture',
          unitNumber: 2,
          description: 'Feistel networks, substitution-permutation networks, AES state transformations, and block cipher modes.',
          prerequisites: ['cyber_crypto_1'],
          topics: ['Feistel Architecture', 'AES State Transformations', 'Cipher Modes (CBC, GCM)', 'Padding Oracles'],
          learningOutcomes: ['Explain internal rounds and transformations of AES-256', 'Select appropriate authenticated encryption cipher modes']
        },
        {
          id: 'cyber_crypto_3',
          title: 'Unit 3: Asymmetric Cryptography & RSA Standards',
          unitNumber: 3,
          description: 'Number theory foundations, Euler totient function, RSA key generation, and Diffie-Hellman key exchanges.',
          prerequisites: ['cyber_crypto_2'],
          topics: ['Modular Arithmetic & Totient', 'RSA Key Generation', 'Diffie-Hellman Key Exchange', 'Discrete Logarithms'],
          learningOutcomes: ['Compute RSA public and private key pairs securely', 'Trace secure key exchange negotiations over untrusted channels']
        },
        {
          id: 'cyber_crypto_4',
          title: 'Unit 4: Hash Functions, Digital Signatures & PKI',
          unitNumber: 4,
          description: 'Cryptographic hash functions (SHA-2/3), collision resistance, digital signature verification, and X.509 PKI.',
          prerequisites: ['cyber_crypto_3'],
          topics: ['Collision Resistance', 'HMAC Generation', 'Digital Signatures', 'X.509 Certificate Authorities'],
          learningOutcomes: ['Verify document authenticity using cryptographic signatures', 'Audit certificate validation chains in public key infrastructures']
        }
      ]
    }
  ],

  'B.Tech CSE (DS) IBM': [
    {
      id: 'ds_ibm_bigdata',
      name: 'Big Data Foundations with IBM Cloud',
      code: 'CS101-DS-IBM',
      semester: 1,
      description: 'Enterprise data architectures, cloud storage paradigms, distributed computing, and data pipeline governance.',
      nodes: [
        {
          id: 'ds_ibm_1',
          title: 'Unit 1: Enterprise Data Ecosystems & Cloud Storage',
          unitNumber: 1,
          description: 'Data lakehouses, object storage architectures on IBM Cloud, data tiering, and unstructured data ingestion.',
          prerequisites: [],
          topics: ['Data Lakehouse Concept', 'IBM Cloud Object Storage', 'Storage Tiering', 'Data Ingestion Workflows'],
          learningOutcomes: ['Design cloud object storage layouts for big data repositories', 'Configure role-based access for analytical cloud buckets']
        },
        {
          id: 'ds_ibm_2',
          title: 'Unit 2: Distributed Processing with Hadoop & Spark',
          unitNumber: 2,
          description: 'HDFS distributed storage, MapReduce computational paradigms, Apache Spark in-memory execution, and Resilient Distributed Datasets.',
          prerequisites: ['ds_ibm_1'],
          topics: ['HDFS Block Distribution', 'MapReduce Architecture', 'Spark RDD & DataFrames', 'In-Memory Compute'],
          learningOutcomes: ['Formulate parallel processing logic using Spark transformations', 'Benchmark latency differences between disk and memory computing']
        },
        {
          id: 'ds_ibm_3',
          title: 'Unit 3: Data Ingestion Pipelines & Stream Analytics',
          unitNumber: 3,
          description: 'Batch vs streaming ingestion, Apache Kafka message queuing, real-time windowing metrics, and event hubs.',
          prerequisites: ['ds_ibm_2'],
          topics: ['Kafka Message Brokers', 'Stream Windowing', 'Event-Driven Ingestion', 'Latency Optimization'],
          learningOutcomes: ['Build continuous real-time data streaming consumers', 'Calculate aggregations across sliding temporal data windows']
        },
        {
          id: 'ds_ibm_4',
          title: 'Unit 4: Cloud Data Governance & Security Compliance',
          unitNumber: 4,
          description: 'Data cataloging with IBM Watson Knowledge Catalog, lineage tracing, data masking, and compliance frameworks.',
          prerequisites: ['ds_ibm_3'],
          topics: ['Data Lineage Tracing', 'Watson Knowledge Catalog', 'Data Masking Protocols', 'Regulatory Compliance'],
          learningOutcomes: ['Trace enterprise data provenance across transformation stages', 'Implement automated masking for personally identifiable attributes']
        }
      ]
    },
    {
      id: 'ds_stat_analysis',
      name: 'Applied Statistical Analysis',
      code: 'CS102-DS-IBM',
      semester: 1,
      description: 'Probability foundations, parametric and non-parametric hypothesis tests, multivariate linear regressions, and forecasting.',
      nodes: [
        {
          id: 'ds_stat_1',
          title: 'Unit 1: Probability Distributions & Sample Spaces',
          unitNumber: 1,
          description: 'Discrete and continuous probability spaces, Bayes Theorem, binomial, Poisson, and normal distributions.',
          prerequisites: [],
          topics: ['Bayesian Probability', 'Probability Density Functions', 'Cumulative Distributions', 'Normal Variates'],
          learningOutcomes: ['Calculate conditional probabilities using Bayes Theorem', 'Fit empirical observations to standard probability density functions']
        },
        {
          id: 'ds_stat_2',
          title: 'Unit 2: Inferential Statistics & Hypothesis Testing',
          unitNumber: 2,
          description: 'Central limit theorem, confidence intervals, Student t-tests, Chi-square independence tests, and p-value inference.',
          prerequisites: ['ds_stat_1'],
          topics: ['Confidence Intervals', 'T-Tests & Z-Tests', 'Chi-Square Analysis', 'Type I & II Errors'],
          learningOutcomes: ['Conduct two-sample statistical hypothesis assessments', 'Interpret statistical significance and effect size metrics']
        },
        {
          id: 'ds_stat_3',
          title: 'Unit 3: Multivariate Regression & ANOVA Models',
          unitNumber: 3,
          description: 'Ordinary least squares multivariate estimation, collinearity diagnostics, ANOVA factorial designs, and residual analysis.',
          prerequisites: ['ds_stat_2'],
          topics: ['Ordinary Least Squares', 'Multicollinearity (VIF)', 'Factorial ANOVA', 'Residual Homoscedasticity'],
          learningOutcomes: ['Estimate multivariate regression coefficients rigorously', 'Diagnose model specification errors through residual analysis']
        },
        {
          id: 'ds_stat_4',
          title: 'Unit 4: Time Series Decompositions & Forecasting',
          unitNumber: 4,
          description: 'Trend, seasonal, and irregular decomposition, auto-correlation functions, ARIMA time series modeling, and forecasting.',
          prerequisites: ['ds_stat_3'],
          topics: ['Time Series Decomposition', 'Stationarity Tests (ADF)', 'ARIMA Formulations', 'Forecasting Metrics'],
          learningOutcomes: ['Decompose complex sequential signals into seasonal trends', 'Generate accurate baseline forecasts with ARIMA models']
        }
      ]
    }
  ],

  'B.Tech CSE (Robotics & AI)': [
    {
      id: 'robot_kin_sens',
      name: 'Kinematics & Sensors',
      code: 'CS101-ROBOT',
      semester: 1,
      description: 'Spatial coordinate transformations, forward and inverse kinematics, actuator controls, and multi-sensor fusion.',
      nodes: [
        {
          id: 'robot_kin_1',
          title: 'Unit 1: Coordinate Transforms & Forward Kinematics',
          unitNumber: 1,
          description: 'Homogeneous transformation matrices, Denavit-Hartenberg parameters, frame rotations, and end-effector pose calculations.',
          prerequisites: [],
          topics: ['Homogeneous Transformations', 'DH Convention', 'Spatial Rotations', 'Forward Kinematics'],
          learningOutcomes: ['Formulate DH parameter tables for articulated robot arms', 'Compute end-effector spatial coordinates in global frames']
        },
        {
          id: 'robot_kin_2',
          title: 'Unit 2: Inverse Kinematic Solutions & Jacobian Matrices',
          unitNumber: 2,
          description: 'Geometric and algebraic inverse kinematics, singularities, velocity kinematics, and manipulator Jacobian matrices.',
          prerequisites: ['robot_kin_1'],
          topics: ['Geometric Inverse Kinematics', 'Jacobian Formulations', 'Singularity Avoidance', 'Velocity Control'],
          learningOutcomes: ['Solve joint angles for target workspace trajectories', 'Identify kinematic singularity states to avoid command saturation']
        },
        {
          id: 'robot_kin_3',
          title: 'Unit 3: Actuator Dynamics & Pulse Width Control',
          unitNumber: 3,
          description: 'DC motor torque-speed curves, stepper motors, servo feedback loops, PID motion controllers, and PWM driver circuits.',
          prerequisites: ['robot_kin_2'],
          topics: ['DC & Stepper Motor Dynamics', 'PID Control Loops', 'PWM Drivers & H-Bridges', 'Encoder Feedback'],
          learningOutcomes: ['Tune PID controller gains for position stability', 'Interface microcontrollers with motor driver circuitry']
        },
        {
          id: 'robot_kin_4',
          title: 'Unit 4: Sensor Fusion, IMUs & Lidar Odometry',
          unitNumber: 4,
          description: 'Inertial measurement units, Kalman filtering, lidar point cloud acquisition, and wheel odometry integration.',
          prerequisites: ['robot_kin_3'],
          topics: ['IMU Calibration', 'Kalman Filter Estimation', 'Lidar Point Clouds', 'Odometry Dead Reckoning'],
          learningOutcomes: ['Fuse accelerometer and gyroscope data via Kalman filters', 'Process raw 2D lidar scans for obstacle mapping']
        }
      ]
    },
    {
      id: 'robot_embedded_cpp',
      name: 'Embedded C++',
      code: 'CS102-ROBOT',
      semester: 1,
      description: 'Modern C++ patterns for constrained microcontrollers, hardware register mapping, interrupts, and real-time scheduling.',
      nodes: [
        {
          id: 'robot_cpp_1',
          title: 'Unit 1: Embedded C++ Standards & Memory Constraints',
          unitNumber: 1,
          description: 'Constrained C++ standards, zero-cost abstractions, avoiding heap allocation in embedded loops, and static memory guarantees.',
          prerequisites: [],
          topics: ['Zero-Cost Abstractions', 'Heap-Free Programming', 'Static Assertions', 'Bit Manipulation'],
          learningOutcomes: ['Write deterministic C++ applications for microcontrollers', 'Ensure deterministic memory layouts without dynamic fragmentation']
        },
        {
          id: 'robot_cpp_2',
          title: 'Unit 2: Hardware Register Interfacing & GPIO Timers',
          unitNumber: 2,
          description: 'Memory-mapped I/O, volatile pointers, direct peripheral register access, timer prescalers, and PWM registers.',
          prerequisites: ['robot_cpp_1'],
          topics: ['Memory-Mapped I/O', 'Volatile Semantics', 'Timer Prescaling', 'Peripheral Clocks'],
          learningOutcomes: ['Manipulate peripheral registers directly via typed pointer templates', 'Configure hardware timers for microsecond accuracy']
        },
        {
          id: 'robot_cpp_3',
          title: 'Unit 3: Interrupt Service Routines & Concurrency',
          unitNumber: 3,
          description: 'Hardware interrupt vectors, ISR latency minimization, atomic primitives, and volatile ring buffers.',
          prerequisites: ['robot_cpp_2'],
          topics: ['Interrupt Vectors', 'ISR Critical Sections', 'Atomic Operations', 'Lock-Free Ring Buffers'],
          learningOutcomes: ['Write non-blocking interrupt routines for sensor events', 'Implement thread-safe ring buffers for serial data streams']
        },
        {
          id: 'robot_cpp_4',
          title: 'Unit 4: Real-Time Operating Systems (RTOS) Basics',
          unitNumber: 4,
          description: 'FreeRTOS task scheduling, priority preemption, semaphores, message queues, and watchdog timer maintenance.',
          prerequisites: ['robot_cpp_3'],
          topics: ['FreeRTOS Task Lifecycles', 'Preemptive Scheduling', 'Binary Semaphores', 'Watchdog Supervisions'],
          learningOutcomes: ['Decompose robot control tasks into prioritized RTOS threads', 'Synchronize concurrent sensor tasks using RTOS semaphores']
        }
      ]
    }
  ],

  'B.Tech CSE (UX OR UI)': [
    {
      id: 'uxui_design_thinking',
      name: 'Design Thinking & User Research',
      code: 'CS101-UXUI',
      semester: 1,
      description: 'User-centered design methodologies, qualitative research, empathy mapping, wireframing, and iterative user testing.',
      nodes: [
        {
          id: 'uxui_dt_1',
          title: 'Unit 1: Principles of Design Thinking & Empathy Mapping',
          unitNumber: 1,
          description: 'Stages of design thinking, user empathy interviews, observation techniques, and synthesis of empathy maps.',
          prerequisites: [],
          topics: ['Design Thinking Stages', 'Empathy Interviews', 'Synthesis Frameworks', 'Observation Studies'],
          learningOutcomes: ['Conduct structured contextual user discovery interviews', 'Synthesize observations into actionable empathy maps']
        },
        {
          id: 'uxui_dt_2',
          title: 'Unit 2: User Persona Development & Journey Mapping',
          unitNumber: 2,
          description: 'Archetypal user personas, goal-directed behavior, customer journey touchpoints, and friction point discovery.',
          prerequisites: ['uxui_dt_1'],
          topics: ['Persona Segmentation', 'Journey Touchpoints', 'Friction Point Analysis', 'Experience Mapping'],
          learningOutcomes: ['Construct validated user personas based on research data', 'Map multi-stage end-to-end customer journeys']
        },
        {
          id: 'uxui_dt_3',
          title: 'Unit 3: Low-Fidelity Prototyping & Wireframing',
          unitNumber: 3,
          description: 'Information architecture, card sorting, low-fidelity paper wireframes, and rapid interactive mockups.',
          prerequisites: ['uxui_dt_2'],
          topics: ['Information Architecture', 'Card Sorting Workflows', 'Paper Wireframing', 'Rapid Clickable Mockups'],
          learningOutcomes: ['Organize navigational taxonomy through card sorting tests', 'Author rapid interactive wireframes for conceptual review']
        },
        {
          id: 'uxui_dt_4',
          title: 'Unit 4: Usability Testing & Iterative Validation',
          unitNumber: 4,
          description: 'Usability test protocols, task completion metrics, System Usability Scale (SUS), and iterative backlog prioritization.',
          prerequisites: ['uxui_dt_3'],
          topics: ['Usability Test Facilitation', 'Task Completion Metrics', 'SUS Evaluation', 'Iterative Revisions'],
          learningOutcomes: ['Facilitate observed usability testing sessions with target users', 'Calculate quantitative SUS benchmarks to measure usability improvements']
        }
      ]
    },
    {
      id: 'uxui_hci',
      name: 'Human-Computer Interaction',
      code: 'CS102-UXUI',
      semester: 1,
      description: 'Cognitive psychology, Fitts Law, visual hierarchy, interaction patterns, design tokens, and universal accessibility.',
      nodes: [
        {
          id: 'uxui_hci_1',
          title: 'Unit 1: Cognitive Frameworks & Mental Models',
          unitNumber: 1,
          description: 'Hick-Hyman law, Fitts law, cognitive load theory, mental models vs conceptual models, and error prevention.',
          prerequisites: [],
          topics: ['Hick & Fitts Laws', 'Cognitive Load Types', 'Mental Model Mappings', 'Error Prevention Design'],
          learningOutcomes: ['Optimize visual touch targets according to Fitts law formulas', 'Minimize extraneous cognitive load in complex task forms']
        },
        {
          id: 'uxui_hci_2',
          title: 'Unit 2: Visual Hierarchy, Typography & Spatial Layout',
          unitNumber: 2,
          description: 'Gestalt principles, typographic scale systems, 8pt spatial grid grids, contrast ratios, and scanning patterns.',
          prerequisites: ['uxui_hci_1'],
          topics: ['Gestalt Grouping Rules', 'Modular Typography Scales', '8pt Spatial Systems', 'F-Pattern Eye Scanning'],
          learningOutcomes: ['Structure layout views that follow natural eye scan patterns', 'Implement consistent spatial spacing using 8pt grid metrics']
        },
        {
          id: 'uxui_hci_3',
          title: 'Unit 3: Interaction Patterns & Accessible Affordances',
          unitNumber: 3,
          description: 'Micro-interactions, feedback loops, state transitions, WCAG 2.1 AA/AAA compliance, and screen-reader semantics.',
          prerequisites: ['uxui_hci_2'],
          topics: ['Micro-Interactions', 'Interaction States', 'WCAG 2.1 Guidelines', 'Keyboard Navigability'],
          learningOutcomes: ['Design accessible interfaces that pass WCAG AA standards', 'Provide clear affordances across idle, hover, active, and focus states']
        },
        {
          id: 'uxui_hci_4',
          title: 'Unit 4: Design Systems, Tokens & Component Specifications',
          unitNumber: 4,
          description: 'Atomic design methodology, design token architectures, component states, and engineering handoff specifications.',
          prerequisites: ['uxui_hci_3'],
          topics: ['Atomic Design Systems', 'Design Token Pipelines', 'Component Variant Sets', 'Handoff Specifications'],
          learningOutcomes: ['Build scalable component libraries governed by design tokens', 'Generate comprehensive specs for frontend engineering teams']
        }
      ]
    }
  ],

  'BCA (SP AI & DS)': [
    {
      id: 'bca_c_prog',
      name: 'Programming in C',
      code: 'BCA101-AIDS',
      semester: 1,
      description: 'Fundamental procedural programming, data representation, logic formulation, and structured algorithms.',
      nodes: [
        {
          id: 'bca_c_1',
          title: 'Unit 1: Problem Decomposition & Algorithmic Logic',
          unitNumber: 1,
          description: 'Flowchart conventions, pseudo-code logic, data types, variable declarations, and arithmetic operations.',
          prerequisites: [],
          topics: ['Flowcharting Rules', 'Variables & Data Types', 'Operators & Expressions', 'Input/Output Functions'],
          learningOutcomes: ['Deconstruct numerical problems into structured algorithmic steps', 'Write basic procedural programs in standard C']
        },
        {
          id: 'bca_c_2',
          title: 'Unit 2: Control Structures & Modular Functions',
          unitNumber: 2,
          description: 'Conditional branching, loop iterations, function definitions, parameter passing, and recursive calls.',
          prerequisites: ['bca_c_1'],
          topics: ['If-Else & Switch Trees', 'Loop Iterations (for/while)', 'Modular Functions', 'Call-by-Value'],
          learningOutcomes: ['Control code execution paths using conditional constructs', 'Decompose repetitive tasks into modular functions']
        },
        {
          id: 'bca_c_3',
          title: 'Unit 3: Arrays, Pointers & Dynamic Allocation',
          unitNumber: 3,
          description: 'Single and multi-dimensional arrays, pointer declarations, memory addresses, and dynamic allocation.',
          prerequisites: ['bca_c_2'],
          topics: ['Array Traversals', 'Pointers & Addresses', 'Dynamic Memory (malloc)', 'String Functions'],
          learningOutcomes: ['Search and sort sequential data arrays efficiently', 'Manipulate pointers and allocate heap memory buffers']
        },
        {
          id: 'bca_c_4',
          title: 'Unit 4: Data Structures & File Organization',
          unitNumber: 4,
          description: 'User-defined structures, unions, file I/O operations, text file parsing, and error handling.',
          prerequisites: ['bca_c_3'],
          topics: ['Structures & Unions', 'File Streams (fopen/fclose)', 'Record Storage', 'Error Verification'],
          learningOutcomes: ['Model complex record items using typed C structures', 'Store and read data records from persistent disk files']
        }
      ]
    },
    {
      id: 'bca_dbms',
      name: 'Database Management Systems',
      code: 'BCA102-AIDS',
      semester: 1,
      description: 'Relational data models, SQL queries, entity-relationship schemas, normalization, and transaction handling.',
      nodes: [
        {
          id: 'bca_dbms_1',
          title: 'Unit 1: Relational Data Models & ER Schemas',
          unitNumber: 1,
          description: 'Database architecture, entity-relationship diagrams, cardinalities, relational tables, and primary/foreign keys.',
          prerequisites: [],
          topics: ['Database Architecture', 'ER Diagram Notations', 'Keys & Constraints', 'Relational Schemas'],
          learningOutcomes: ['Design entity-relationship diagrams for business domains', 'Map conceptual ER schemas into normalized relational tables']
        },
        {
          id: 'bca_dbms_2',
          title: 'Unit 2: SQL Querying, Joins & Subqueries',
          unitNumber: 2,
          description: 'DDL, DML, DCL commands, table creation, inner/outer joins, aggregate functions, and nested subqueries.',
          prerequisites: ['bca_dbms_1'],
          topics: ['SQL DDL & DML', 'Inner & Outer Joins', 'Aggregate Grouping', 'Nested Subqueries'],
          learningOutcomes: ['Author SQL queries joining multiple relational tables', 'Extract business intelligence metrics using aggregate functions']
        },
        {
          id: 'bca_dbms_3',
          title: 'Unit 3: Schema Normalization & Functional Dependencies',
          unitNumber: 3,
          description: 'Functional dependencies, Armstrong axioms, 1NF, 2NF, 3NF, and Boyce-Codd normal form (BCNF).',
          prerequisites: ['bca_dbms_2'],
          topics: ['Functional Dependencies', 'First & Second Normal Forms', 'Third Normal Form (3NF)', 'BCNF Decompositions'],
          learningOutcomes: ['Identify redundant data attributes using functional dependencies', 'Normalize relational tables to 3NF to eliminate insertion anomalies']
        },
        {
          id: 'bca_dbms_4',
          title: 'Unit 4: Transaction Processing & ACID Guarantees',
          unitNumber: 4,
          description: 'Transaction states, Atomicity, Consistency, Isolation, Durability (ACID), concurrency conflicts, and write-ahead logs.',
          prerequisites: ['bca_dbms_3'],
          topics: ['ACID Properties', 'Concurrency Conflicts', 'Serializability', 'Log-Based Recovery'],
          learningOutcomes: ['Evaluate transaction schedules for conflict serializability', 'Implement locking mechanisms to ensure data integrity']
        }
      ]
    },
    {
      id: 'bca_web_tech',
      name: 'Web Technologies',
      code: 'BCA103-AIDS',
      semester: 1,
      description: 'Client-side web development, HTML5 markup, responsive CSS3 styling, JavaScript programming, and DOM manipulation.',
      nodes: [
        {
          id: 'bca_web_1',
          title: 'Unit 1: HTML5 Document Structure & CSS3 Styling',
          unitNumber: 1,
          description: 'Document structure, semantic HTML tags, CSS selectors, box model properties, and styling fundamentals.',
          prerequisites: [],
          topics: ['HTML5 Semantic Elements', 'CSS Selectors & Cascading', 'Box Model Metrics', 'Text & Color Styling'],
          learningOutcomes: ['Author semantic and accessible HTML document structures', 'Apply CSS styling rules adhering to the box model']
        },
        {
          id: 'bca_web_2',
          title: 'Unit 2: Responsive Flexbox & Grid Frameworks',
          unitNumber: 2,
          description: 'Mobile responsive design, CSS media queries, flexbox axis alignment, and two-dimensional CSS grids.',
          prerequisites: ['bca_web_1'],
          topics: ['Responsive Viewports', 'Media Query Breakpoints', 'Flexbox Alignment', 'CSS Grid Systems'],
          learningOutcomes: ['Build fluid web layouts adapting across mobile and desktop devices', 'Organize content components using modern Flexbox alignment']
        },
        {
          id: 'bca_web_3',
          title: 'Unit 3: JavaScript Programming & Event Handling',
          unitNumber: 3,
          description: 'JavaScript variables, data types, control flow, functions, event listeners, and interactive UI behavior.',
          prerequisites: ['bca_web_2'],
          topics: ['Variables & Scoping', 'Event Listeners', 'Form Validation', 'DOM Tree Queries'],
          learningOutcomes: ['Add client-side form validation using JavaScript', 'Handle user click and keyboard events dynamically']
        },
        {
          id: 'bca_web_4',
          title: 'Unit 4: Asynchronous Data Fetching & DOM Operations',
          unitNumber: 4,
          description: 'JSON format, asynchronous fetch requests, promise handling, dynamic HTML generation, and browser storage.',
          prerequisites: ['bca_web_3'],
          topics: ['JSON Data Format', 'Fetch API Calls', 'Dynamic DOM Injection', 'LocalStorage APIs'],
          learningOutcomes: ['Fetch data from public web APIs asynchronously', 'Update page content dynamically without full page reloads']
        }
      ]
    }
  ],

  'BCA (H) (Sp AI & DS) (Research)': [
    {
      id: 'bcar_adv_python',
      name: 'Advanced Python for Scientific Computing',
      code: 'BCAR102-AIDS',
      semester: 1,
      description: 'Vectorized computing, multi-dimensional array manipulation, Pandas data analysis, and scientific visualization.',
      nodes: [
        {
          id: 'bcar_py_1',
          title: 'Unit 1: Python Scopes, Memory & Advanced Collections',
          unitNumber: 1,
          description: 'Memory references, mutable vs immutable internals, generator expressions, decorators, and functional programming.',
          prerequisites: [],
          topics: ['Memory Internals', 'Generator Pipelines', 'Function Decorators', 'Functional Primitives'],
          learningOutcomes: ['Implement memory-efficient data processing generators', 'Use function decorators to wrap computational profiling']
        },
        {
          id: 'bcar_py_2',
          title: 'Unit 2: Numerical Matrix Computing with NumPy',
          unitNumber: 2,
          description: 'Multi-dimensional ndarrays, broadcasting rules, matrix decompositions, and linear algebra operations.',
          prerequisites: ['bcar_py_1'],
          topics: ['NumPy Arrays & Strides', 'Vector Broadcasting', 'Matrix Decompositions', 'Linear Algebra Inverses'],
          learningOutcomes: ['Execute high-performance vectorized computations using NumPy', 'Solve systems of linear equations via matrix operations']
        },
        {
          id: 'bcar_py_3',
          title: 'Unit 3: Data Wrangling & Manipulation with Pandas',
          unitNumber: 3,
          description: 'DataFrame structures, multi-index hierarchies, grouped aggregations, merging datasets, and cleaning messy data.',
          prerequisites: ['bcar_py_2'],
          topics: ['Pandas Series & DataFrames', 'Multi-Index Groupings', 'Merge & Join Operations', 'Missing Value Strategies'],
          learningOutcomes: ['Wrangle large multi-dimensional research datasets with Pandas', 'Aggregate quantitative statistics across categorical groups']
        },
        {
          id: 'bcar_py_4',
          title: 'Unit 4: Scientific Plotting & Reproducible Notebooks',
          unitNumber: 4,
          description: 'Matplotlib scientific figures, Seaborn statistical plots, dynamic visual styles, and Jupyter documentation.',
          prerequisites: ['bcar_py_3'],
          topics: ['Matplotlib Custom Figures', 'Seaborn Statistical Plots', 'Exporting Vector Visuals', 'Jupyter Reproducibility'],
          learningOutcomes: ['Generate publication-quality vector charts for academic research', 'Package reproducible computational workflows in Jupyter notebooks']
        }
      ]
    }
  ],

  'BCA (Cyber Security)': [
    {
      id: 'bcacyber_law_sec',
      name: 'Fundamentals of Cyber Law & Security',
      code: 'BCA101-SEC',
      semester: 1,
      description: 'Information security principles, cyber crime classification, IT regulatory acts, privacy, and forensic investigation.',
      nodes: [
        {
          id: 'bcacyber_sec_1',
          title: 'Unit 1: Information Security Concepts & Threat Vectors',
          unitNumber: 1,
          description: 'Confidentiality, Integrity, Availability triad, malware classifications, social engineering vectors, and vulnerabilities.',
          prerequisites: [],
          topics: ['CIA Triad Pillars', 'Malware Types (Ransomware/Trojans)', 'Social Engineering Attacks', 'Vulnerability Assessment'],
          learningOutcomes: ['Evaluate corporate systems against the CIA security triad', 'Identify attack vectors used in common social engineering schemes']
        },
        {
          id: 'bcacyber_sec_2',
          title: 'Unit 2: Cyber Law Frameworks & IT Act Regulations',
          unitNumber: 2,
          description: 'Indian Information Technology Act provisions, electronic contracts, digital signatures, and cyber offenses penalties.',
          prerequisites: ['bcacyber_sec_1'],
          topics: ['Information Technology Act', 'Legal Status of Digital Signatures', 'Cyber Offense Penalties', 'Regulatory Jurisdictions'],
          learningOutcomes: ['Identify legal liabilities associated with common cyber offenses', 'Ensure digital contracts comply with national IT Act provisions']
        },
        {
          id: 'bcacyber_sec_3',
          title: 'Unit 3: Data Protection, Privacy & Compliance Policies',
          unitNumber: 3,
          description: 'Personal data protection acts, GDPR principles, privacy by design, security auditing standards, and corporate compliance.',
          prerequisites: ['bcacyber_sec_2'],
          topics: ['Data Privacy Principles', 'GDPR & DPDP Acts', 'Privacy by Design', 'Security Audit Checklists'],
          learningOutcomes: ['Audit organizational data handling against data protection laws', 'Implement privacy-by-design principles into application workflows']
        },
        {
          id: 'bcacyber_sec_4',
          title: 'Unit 4: Digital Evidence Handling & Forensic Procedures',
          unitNumber: 4,
          description: 'Chain of custody procedures, forensic imaging of storage media, volatile memory capture, and courtroom admissible evidence.',
          prerequisites: ['bcacyber_sec_3'],
          topics: ['Chain of Custody Protocols', 'Bit-Stream Disk Imaging', 'Memory Acquisition', 'Admissible Evidence Rules'],
          learningOutcomes: ['Document unbroken chain of custody records for seized storage drives', 'Perform forensic bit-stream disk images without altering source data']
        }
      ]
    },
    {
      id: 'bcacyber_os_shell',
      name: 'Operating Systems & Shell Scripting',
      code: 'BCA102-SEC',
      semester: 1,
      description: 'Operating system structures, process lifecycles, memory virtualization, Bash automation, and security auditing.',
      nodes: [
        {
          id: 'bcacyber_os_1',
          title: 'Unit 1: OS Kernel Architectures & Process Scheduling',
          unitNumber: 1,
          description: 'Monolithic vs microkernels, system calls, process state lifecycles, CPU scheduling algorithms, and inter-process signals.',
          prerequisites: [],
          topics: ['Kernel vs User Space', 'System Call Execution', 'Process Scheduling Policies', 'IPC Signals'],
          learningOutcomes: ['Trace process lifecycle transitions during system execution', 'Analyze CPU scheduling fairness across competing process tasks']
        },
        {
          id: 'bcacyber_os_2',
          title: 'Unit 2: Memory Paging, Segmentation & File Systems',
          unitNumber: 2,
          description: 'Virtual memory address translation, page replacement algorithms, file system permissions, and inode tables.',
          prerequisites: ['bcacyber_os_1'],
          topics: ['Virtual Memory & MMU', 'Page Replacement Policies', 'Inode Architectures', 'File Access Permissions'],
          learningOutcomes: ['Calculate virtual to physical address translations in paged memory', 'Configure secure POSIX file permission matrices for sensitive assets']
        },
        {
          id: 'bcacyber_os_3',
          title: 'Unit 3: Bash Shell Automation & Linux Utilities',
          unitNumber: 3,
          description: 'Command line utilities (grep, sed, awk), Bash variables, control loops, functions, and automated script pipelines.',
          prerequisites: ['bcacyber_os_2'],
          topics: ['Text Processing (grep/sed/awk)', 'Shell Control Loops', 'Script Functions & Exit Codes', 'Pipeline Redirections'],
          learningOutcomes: ['Parse server access logs using command line text utilities', 'Author robust Bash scripts to automate routine administrative tasks']
        },
        {
          id: 'bcacyber_os_4',
          title: 'Unit 4: System Permissions, Access Control & Auditing',
          unitNumber: 4,
          description: 'User and group management, sudoers rules, auditd log generation, cron scheduling, and system service hardening.',
          prerequisites: ['bcacyber_os_3'],
          topics: ['User/Group Administration', 'Sudo Security Configurations', 'System Auditing (auditd)', 'Systemd Service Hardening'],
          learningOutcomes: ['Configure least-privilege administrative access via sudoers policies', 'Audit security event logs to detect suspicious privilege escalations']
        }
      ]
    }
  ],

  'BCA (Hons./ Hons. with Research)': [
    {
      id: 'bcah_comp_arch',
      name: 'Computer Architecture & Organization',
      code: 'BCAH101',
      semester: 1,
      description: 'Digital logic gates, arithmetic units, register transfer logic, CPU instruction cycles, and memory hierarchies.',
      nodes: [
        {
          id: 'bcah_arch_1',
          title: 'Unit 1: Digital Logic Gates & Arithmetic Logic Units',
          unitNumber: 1,
          description: 'Boolean algebra simplification, Karnaugh maps, adders, multiplexers, decoders, and sequential flip-flops.',
          prerequisites: [],
          topics: ['Karnaugh Map Minimization', 'Adders & Subtractors', 'Multiplexers & Decoders', 'Flip-Flops & Registers'],
          learningOutcomes: ['Simplify Boolean logic expressions using Karnaugh maps', 'Design combinational circuits for multi-bit arithmetic units']
        },
        {
          id: 'bcah_arch_2',
          title: 'Unit 2: Register Transfer Logic & Micro-Operations',
          unitNumber: 2,
          description: 'Common bus architecture, register transfer language (RTL), arithmetic, logic, and shift micro-operations.',
          prerequisites: ['bcah_arch_1'],
          topics: ['Common Bus Organization', 'RTL Notations', 'Arithmetic Micro-Operations', 'Shift Operations'],
          learningOutcomes: ['Trace data movement across shared computer bus architectures', 'Specify control micro-operations using formal RTL notation']
        },
        {
          id: 'bcah_arch_3',
          title: 'Unit 3: Central Processing Unit & Addressing Modes',
          unitNumber: 3,
          description: 'Instruction formats, addressing modes (immediate, direct, indirect, indexed), instruction cycle states, and stacks.',
          prerequisites: ['bcah_arch_2'],
          topics: ['Instruction Formats', 'Addressing Mode Categories', 'Fetch-Decode-Execute Cycles', 'Stack Organization'],
          learningOutcomes: ['Analyze operand resolution across various CPU addressing modes', 'Trace instruction execution cycles through fetch and decode phases']
        },
        {
          id: 'bcah_arch_4',
          title: 'Unit 4: Memory Hierarchies & Input-Output Interfaces',
          unitNumber: 4,
          description: 'Cache memory mappings (direct, associative), virtual memory paging, programmed I/O, interrupts, and direct memory access.',
          prerequisites: ['bcah_arch_3'],
          topics: ['Cache Mapping Techniques', 'Hit Rates & Miss Penalties', 'Programmed I/O vs DMA', 'Interrupt Controllers'],
          learningOutcomes: ['Calculate cache hit ratios and memory access latencies', 'Explain direct memory access controller data transfers']
        }
      ]
    },
    {
      id: 'bcah_java_prog',
      name: 'Object Oriented Programming in Java',
      code: 'BCAH102',
      semester: 1,
      description: 'Object-oriented software design, JVM internals, inheritance, exception hierarchies, and Java collections.',
      nodes: [
        {
          id: 'bcah_java_1',
          title: 'Unit 1: JVM Architecture, Classes & Object Semantics',
          unitNumber: 1,
          description: 'Java Virtual Machine bytecode execution, garbage collection overview, class declarations, constructors, and access modifiers.',
          prerequisites: [],
          topics: ['JVM Bytecode & ClassLoader', 'Class & Object Concepts', 'Constructors & Overloading', 'Access Control Levels'],
          learningOutcomes: ['Compile and execute Java classes on the Java Virtual Machine', 'Implement encapsulated class models with constructors']
        },
        {
          id: 'bcah_java_2',
          title: 'Unit 2: Inheritance, Abstract Classes & Interfaces',
          unitNumber: 2,
          description: 'Class inheritance hierarchies, method overriding, super keyword, abstract classes, and multiple interface implementation.',
          prerequisites: ['bcah_java_1'],
          topics: ['Inheritance Structures', 'Method Overriding & Polymorphism', 'Abstract Class Contracts', 'Interface Implementations'],
          learningOutcomes: ['Architect reusable class hierarchies using inheritance', 'Define decoupled interface contracts for flexible implementation']
        },
        {
          id: 'bcah_java_3',
          title: 'Unit 3: Exception Hierarchies & I/O File Streams',
          unitNumber: 3,
          description: 'Checked vs unchecked exceptions, try-catch-finally blocks, custom exception classes, byte and character file streams.',
          prerequisites: ['bcah_java_2'],
          topics: ['Checked/Unchecked Exceptions', 'Custom Exception Classes', 'Byte & Character Streams', 'Try-With-Resources'],
          learningOutcomes: ['Handle runtime anomalies safely using structured exception handlers', 'Read and write formatted data streams to file systems']
        },
        {
          id: 'bcah_java_4',
          title: 'Unit 4: Java Collections Framework & Generic Typing',
          unitNumber: 4,
          description: 'ArrayList, LinkedList, HashSet, HashMap, Iterator patterns, comparable/comparator sorting, and generic classes.',
          prerequisites: ['bcah_java_3'],
          topics: ['List & Set Collections', 'Map Implementations', 'Iterators & Comparators', 'Type-Safe Generics'],
          learningOutcomes: ['Select optimal collection structures based on access complexity', 'Implement type-safe collections using Java generic parameters']
        }
      ]
    }
  ],

  'MCA': [
    {
      id: 'mca_adv_algo',
      name: 'Advanced Data Structures & Algorithms',
      code: 'MCA101',
      semester: 1,
      description: 'Balanced search trees, network flow algorithms, dynamic programming, NP-completeness, and approximation strategies.',
      nodes: [
        {
          id: 'mca_algo_1',
          title: 'Unit 1: Asymptotic Analysis & Balanced Search Trees',
          unitNumber: 1,
          description: 'Amortized time analysis, Red-Black trees, AVL tree balance rotations, B-Trees for database indexing, and Fibonacci heaps.',
          prerequisites: [],
          topics: ['Amortized Analysis', 'Red-Black Tree Rotations', 'B-Tree Node Splits', 'Fibonacci Heaps'],
          learningOutcomes: ['Calculate amortized complexity bounds for dynamic data structures', 'Maintain balancing invariants in Red-Black and B-Tree structures']
        },
        {
          id: 'mca_algo_2',
          title: 'Unit 2: Graph Algorithms, Network Flow & Min-Cut',
          unitNumber: 2,
          description: 'Dijkstra and Bellman-Ford shortest paths, Ford-Fulkerson maximum flow, Edmonds-Karp min-cut, and bipartite matching.',
          prerequisites: ['mca_algo_1'],
          topics: ['Shortest Path Variants', 'Ford-Fulkerson Max Flow', 'Min-Cut Theorem', 'Bipartite Maximum Matching'],
          learningOutcomes: ['Solve network capacity routing problems using maximum flow algorithms', 'Model complex logistical matching as bipartite graph assignments']
        },
        {
          id: 'mca_algo_3',
          title: 'Unit 3: Dynamic Programming & Greedy Strategies',
          unitNumber: 3,
          description: 'Optimal substructure, overlapping subproblems, memoization vs tabulation, knapsack variants, and sequence alignment.',
          prerequisites: ['mca_algo_2'],
          topics: ['Memoization vs Tabulation', 'Matrix Chain Multiplication', '0/1 Knapsack Solutions', 'Longest Common Subsequence'],
          learningOutcomes: ['Formulate recurrence relations for complex optimization problems', 'Design space-optimized dynamic programming tabular solutions']
        },
        {
          id: 'mca_algo_4',
          title: 'Unit 4: NP-Completeness & Approximation Algorithms',
          unitNumber: 4,
          description: 'Polynomial time reductions, P vs NP classification, NP-complete proofs (SAT, 3-SAT, Vertex Cover), and vertex cover approximations.',
          prerequisites: ['mca_algo_3'],
          topics: ['Polynomial Verifiability', 'NP-Complete Reductions', 'Traveling Salesperson Bounds', 'Greedy Approximations'],
          learningOutcomes: ['Execute formal polynomial reductions between computational problems', 'Design approximation algorithms with provable error bounds']
        }
      ]
    },
    {
      id: 'mca_ent_db',
      name: 'Enterprise Database Systems & NoSQL',
      code: 'MCA102',
      semester: 1,
      description: 'Query optimization, distributed concurrency, write-ahead logging, document stores, and eventual consistency models.',
      nodes: [
        {
          id: 'mca_db_1',
          title: 'Unit 1: Query Optimization & Indexing Strategies',
          unitNumber: 1,
          description: 'Relational algebra equivalence rules, cost-based query optimizers, B+ Tree index scans, hash indexes, and execution plans.',
          prerequisites: [],
          topics: ['Cost-Based Optimization', 'B+ Tree Index Seek vs Scan', 'Hash Indexing Properties', 'EXPLAIN Query Plans'],
          learningOutcomes: ['Analyze database query execution plans to identify bottleneck table scans', 'Design covering index strategies for high-frequency queries']
        },
        {
          id: 'mca_db_2',
          title: 'Unit 2: Distributed Concurrency Control & WAL Protocols',
          unitNumber: 2,
          description: 'Two-phase locking (2PL), multi-version concurrency control (MVCC), write-ahead logging (ARIES), and distributed 2PC.',
          prerequisites: ['mca_db_1'],
          topics: ['Two-Phase Locking', 'MVCC Snapshot Isolation', 'ARIES Recovery Protocol', 'Two-Phase Commit (2PC)'],
          learningOutcomes: ['Explain how MVCC provides snapshot isolation without read locks', 'Trace distributed transaction commit phases across multiple database nodes']
        },
        {
          id: 'mca_db_3',
          title: 'Unit 3: Document & Key-Value Stores (MongoDB / Redis)',
          unitNumber: 3,
          description: 'Non-relational data modeling, JSON/BSON document representations, sharding keys, in-memory caching with Redis, and eviction.',
          prerequisites: ['mca_db_2'],
          topics: ['Document Schema Design', 'Sharding Key Selection', 'Redis In-Memory Data Structures', 'Cache Invalidation Rules'],
          learningOutcomes: ['Design scalable document schemas for hierarchical business entities', 'Implement write-through and cache-aside patterns with Redis']
        },
        {
          id: 'mca_db_4',
          title: 'Unit 4: CAP Theorem & Eventual Consistency Models',
          unitNumber: 4,
          description: 'CAP theorem tradeoffs, PACELC theorem, quorum consensus (N, R, W), vector clocks, and conflict-free replicated data types.',
          prerequisites: ['mca_db_3'],
          topics: ['CAP & PACELC Theorems', 'Quorum Read/Write Rules', 'Vector Clocks & Timestamps', 'Conflict Resolution Models'],
          learningOutcomes: ['Evaluate distributed database architectures for availability vs consistency', 'Configure quorum parameters to achieve tuneable consistency levels']
        }
      ]
    },
    {
      id: 'mca_cloud_arch',
      name: 'Modern Web Architecture & Cloud APIs',
      code: 'MCA103',
      semester: 1,
      description: 'Microservices architecture, REST/GraphQL APIs, message queues, containerization with Docker, and cloud infrastructure.',
      nodes: [
        {
          id: 'mca_web_1',
          title: 'Unit 1: RESTful Services & HTTP State Models',
          unitNumber: 1,
          description: 'HTTP/2 and HTTP/3 transport, REST idempotency, status code semantics, API rate limiting, and JWT token authentication.',
          prerequisites: [],
          topics: ['HTTP Transport Models', 'REST Idempotent Methods', 'JWT Stateless Tokens', 'Token Refresh Workflows'],
          learningOutcomes: ['Design secure RESTful web APIs adhering to standard HTTP semantics', 'Implement stateless authentication using cryptographic JWT tokens']
        },
        {
          id: 'mca_web_2',
          title: 'Unit 2: Microservices & Event-Driven Message Brokers',
          unitNumber: 2,
          description: 'Monolith decomposition, service boundary definition, asynchronous message queues (RabbitMQ/Kafka), and saga patterns.',
          prerequisites: ['mca_web_1'],
          topics: ['Service Domain Boundaries', 'Event-Driven Queues', 'Saga Distributed Workflows', 'Circuit Breakers'],
          learningOutcomes: ['Decompose monolithic backends into decoupled domain microservices', 'Implement resilient event-driven communications with message queues']
        },
        {
          id: 'mca_web_3',
          title: 'Unit 3: Serverless Functions & Containerization (Docker)',
          unitNumber: 3,
          description: 'Docker image authoring, multi-stage builds, container networking, serverless cold starts, and cloud runtime triggers.',
          prerequisites: ['mca_web_2'],
          topics: ['Dockerfile Optimization', 'Multi-Stage Container Builds', 'Serverless Event Triggers', 'Cold Start Mitigations'],
          learningOutcomes: ['Author minimal secure Docker container images for microservices', 'Deploy event-triggered serverless functions with optimized cold start latencies']
        },
        {
          id: 'mca_web_4',
          title: 'Unit 4: Cloud Native Deployment & Infrastructure as Code',
          unitNumber: 4,
          description: 'Kubernetes pods, services, and ingresses, automated CI/CD deployment pipelines, declarative infrastructure, and observability.',
          prerequisites: ['mca_web_3'],
          topics: ['Kubernetes Pod Deployment', 'Ingress Routing Rules', 'CI/CD Pipeline Automation', 'Prometheus Observability'],
          learningOutcomes: ['Configure declarative Kubernetes service manifests for scalable clusters', 'Implement automated CI/CD workflows for containerized applications']
        }
      ]
    }
  ],

  'MCA (AI & ML) Microsoft Certifications': [
    {
      id: 'mca_ms_ai_eng',
      name: 'Azure AI Engineering & Cognitive Services',
      code: 'MCA-AI-101',
      semester: 1,
      description: 'Enterprise machine learning workloads, Microsoft Azure AI services, conversational AI agents, and computer vision deployment.',
      nodes: [
        {
          id: 'mca_ms_1',
          title: 'Unit 1: Azure Machine Learning Studio & Cloud Workspaces',
          unitNumber: 1,
          description: 'Provisioning Azure ML workspaces, compute instances, compute clusters, registered datastores, and automated ML pipelines.',
          prerequisites: [],
          topics: ['Azure ML Workspaces', 'Compute Clusters', 'Data Assets & Datastores', 'Automated ML Runs'],
          learningOutcomes: ['Provision Azure Machine Learning workspace resources', 'Execute automated machine learning experiments']
        },
        {
          id: 'mca_ms_2',
          title: 'Unit 2: Cognitive Services & Applied NLP Solutions',
          unitNumber: 2,
          description: 'Pre-trained cognitive language models, Azure OpenAI API integration, sentiment analysis, entity extraction, and conversational bots.',
          prerequisites: ['mca_ms_1'],
          topics: ['Azure OpenAI Service', 'Language Understanding Models', 'Text Analytics & Sentiment', 'Conversational AI Bots'],
          learningOutcomes: ['Integrate cognitive language models into enterprise systems', 'Deploy intelligent conversational bots with Azure Bot Service']
        },
        {
          id: 'mca_ms_3',
          title: 'Unit 3: Computer Vision & Document Intelligence',
          unitNumber: 3,
          description: 'Image classification, object detection with Custom Vision, OCR document intelligence, and video spatial analysis.',
          prerequisites: ['mca_ms_2'],
          topics: ['Azure Computer Vision', 'Custom Vision Model Training', 'Form Recognizer & OCR', 'Spatial Analysis Pipelines'],
          learningOutcomes: ['Train custom image classification models on cloud compute', 'Extract structured tabular data using Document Intelligence']
        },
        {
          id: 'mca_ms_4',
          title: 'Unit 4: Responsible AI & Enterprise MLOps',
          unitNumber: 4,
          description: 'Fairness metrics, error analysis, model explainability with InterpretML, drift monitoring, and automated CI/CD for AI models.',
          prerequisites: ['mca_ms_3'],
          topics: ['Responsible AI Principles', 'Model Drift Detection', 'MLflow Registry Integration', 'Azure DevOps CI/CD for AI'],
          learningOutcomes: ['Implement ethical guardrails and bias detection metrics', 'Orchestrate continuous deployment pipelines for cloud models']
        }
      ]
    },
    {
      id: 'mca_ms_deep_learn',
      name: 'Deep Learning & Neural Architectures',
      code: 'MCA-AI-102',
      semester: 1,
      description: 'Multi-layer perceptrons, backpropagation gradients, convolutional vision models, sequence modeling, and transformer blocks.',
      nodes: [
        {
          id: 'mca_dl_1',
          title: 'Unit 1: Neural Network Foundations & PyTorch Tensors',
          unitNumber: 1,
          description: 'Tensor math, automatic differentiation engines, multilayer perceptrons, activation functions, and gradient descent optimizers.',
          prerequisites: [],
          topics: ['Tensor Operations', 'Autograd Gradient Engine', 'Multi-Layer Perceptrons', 'Loss Functions & Optimizers'],
          learningOutcomes: ['Construct end-to-end feedforward networks in PyTorch', 'Compute backpropagation gradients with stochastic gradient descent']
        },
        {
          id: 'mca_dl_2',
          title: 'Unit 2: Convolutional Networks & Feature Extraction',
          unitNumber: 2,
          description: '2D convolutions, pooling strides, batch normalization, residual architectures (ResNet), and transfer learning strategies.',
          prerequisites: ['mca_dl_1'],
          topics: ['Convolution Kernels', 'Pooling & Normalization', 'Residual Networks (ResNet)', 'Transfer Learning Strategies'],
          learningOutcomes: ['Architect convolutional layers for image feature extraction', 'Fine-tune pre-trained vision backbones on custom domain datasets']
        },
        {
          id: 'mca_dl_3',
          title: 'Unit 3: Sequence Modeling & Transformer Encoders',
          unitNumber: 3,
          description: 'Recurrent cells (LSTM/GRU), vanishing gradient mitigations, scaled dot-product attention, multi-head attention, and positional encodings.',
          prerequisites: ['mca_dl_2'],
          topics: ['Recurrent Cells (LSTM/GRU)', 'Self-Attention Mechanisms', 'Transformer Blocks', 'Positional Encoding'],
          learningOutcomes: ['Model temporal dependencies using gated recurrent units', 'Implement scaled dot-product attention in custom layers']
        },
        {
          id: 'mca_dl_4',
          title: 'Unit 4: Generative Models & Parameter-Efficient Fine-Tuning',
          unitNumber: 4,
          description: 'Variational autoencoders, diffusion foundations, Low-Rank Adaptation (LoRA), quantization techniques (QLoRA), and model serving.',
          prerequisites: ['mca_dl_3'],
          topics: ['Variational Autoencoders', 'Diffusion Foundations', 'Low-Rank Adaptation (LoRA)', 'Inference Optimization'],
          learningOutcomes: ['Formulate generative model training objectives', 'Fine-tune large language models using parameter-efficient adapters']
        }
      ]
    }
  ],

  'B.Sc. (H) DS': [
    {
      id: 'bsc_ds_stats',
      name: 'Statistical Methods & Exploratory Data Analysis',
      code: 'BSCDS-101',
      semester: 1,
      description: 'Probability spaces, discrete and continuous random variables, parametric inference, hypothesis testing, and exploratory visual analytics.',
      nodes: [
        {
          id: 'bsc_ds_st_1',
          title: 'Unit 1: Descriptive Statistics & Probability Foundations',
          unitNumber: 1,
          description: 'Measures of central tendency, dispersion, sample variance, conditional probability, Bayes theorem, and probability mass functions.',
          prerequisites: [],
          topics: ['Measures of Central Tendency', 'Variance & Skewness', 'Conditional Probability & Bayes Rule', 'Random Variables'],
          learningOutcomes: ['Calculate statistical moments on multivariate datasets', 'Apply Bayes theorem to diagnostic probability problems']
        },
        {
          id: 'bsc_ds_st_2',
          title: 'Unit 2: Theoretical Distributions & Sampling Theorems',
          unitNumber: 2,
          description: 'Binomial, Poisson, uniform, exponential, and normal distributions, standard normal z-scores, and the Central Limit Theorem.',
          prerequisites: ['bsc_ds_st_1'],
          topics: ['Binomial & Poisson Models', 'Normal Distribution & Z-Scores', 'Central Limit Theorem', 'Sampling Distributions'],
          learningOutcomes: ['Model real phenomena using standard probability distributions', 'Demonstrate Central Limit Theorem bounds empirically']
        },
        {
          id: 'bsc_ds_st_3',
          title: 'Unit 3: Hypothesis Testing & Parametric Significance',
          unitNumber: 3,
          description: 'Null and alternative hypotheses, Type I/II errors, p-value criteria, Student t-tests, paired t-tests, Chi-square tests, and ANOVA.',
          prerequisites: ['bsc_ds_st_2'],
          topics: ['Null & Alternative Hypotheses', 'Student t-Tests', 'Chi-Square Goodness of Fit', 'ANOVA Testing'],
          learningOutcomes: ['Formulate rigorous scientific hypotheses', 'Conduct two-sample t-tests and one-way ANOVA analyses']
        },
        {
          id: 'bsc_ds_st_4',
          title: 'Unit 4: Correlation & Linear Regression Models',
          unitNumber: 4,
          description: 'Covariance, Pearson and Spearman correlation, Ordinary Least Squares regression, coefficient interpretation, and residual analysis.',
          prerequisites: ['bsc_ds_st_3'],
          topics: ['Pearson & Spearman Correlation', 'Ordinary Least Squares', 'Residual Diagnostics', 'Multicollinearity & VIF'],
          learningOutcomes: ['Fit bivariate and multiple linear regression models', 'Validate residual normality and homoscedasticity assumptions']
        }
      ]
    },
    {
      id: 'bsc_ds_python',
      name: 'Python for Data Science & Numerical Computing',
      code: 'BSCDS-102',
      semester: 1,
      description: 'NumPy vectorized arrays, pandas tabular manipulations, exploratory visualizations with Matplotlib/Seaborn, and clean data pipelines.',
      nodes: [
        {
          id: 'bsc_ds_py_1',
          title: 'Unit 1: NumPy Array Architecture & Vectorized Math',
          unitNumber: 1,
          description: 'Ndarray memory layout, slicing, striding, broadcasting semantics, universal functions, and matrix algebra operations.',
          prerequisites: [],
          topics: ['Ndarray Slicing & Memory Views', 'Broadcasting Rules', 'Universal Functions (ufuncs)', 'Linear Algebra Routines'],
          learningOutcomes: ['Leverage NumPy vectorization to eliminate explicit iteration loops', 'Perform matrix decompositions and eigenvalue calculations']
        },
        {
          id: 'bsc_ds_py_2',
          title: 'Unit 2: Pandas DataFrames & Tabular Transformations',
          unitNumber: 2,
          description: 'Series and DataFrame data models, filtering, handling nulls, multi-level indexing, groupby aggregations, and tabular joins.',
          prerequisites: ['bsc_ds_py_1'],
          topics: ['Series & DataFrame Structures', 'Hierarchical Indexing', 'Groupby Aggregations', 'Merge & Reshape Operations'],
          learningOutcomes: ['Ingest and clean heterogeneous structured CSV/Excel files', 'Execute split-apply-combine aggregations with groupby']
        },
        {
          id: 'bsc_ds_py_3',
          title: 'Unit 3: Exploratory Data Visualization & Insight Synthesis',
          unitNumber: 3,
          description: 'Matplotlib object-oriented interfaces, Seaborn statistical plots, distribution histograms, pair plots, and categorical plots.',
          prerequisites: ['bsc_ds_py_2'],
          topics: ['Matplotlib Figure Canvas', 'Seaborn Distribution Plots', 'Correlation Heatmaps', 'Multi-panel FacetGrids'],
          learningOutcomes: ['Generate production quality statistical visualizations', 'Synthesize exploratory patterns into quantitative executive summaries']
        },
        {
          id: 'bsc_ds_py_4',
          title: 'Unit 4: Data Cleaning & Automated ETL Pipelines',
          unitNumber: 4,
          description: 'Imputation strategies for missing values, interquartile range outlier detection, feature standardization, and pipeline chaining.',
          prerequisites: ['bsc_ds_py_3'],
          topics: ['Handling Missing Values (Imputation)', 'Outlier Detection (IQR/Z-Score)', 'Feature Scaling (StandardScaler/MinMax)', 'Pipeline Automation'],
          learningOutcomes: ['Design automated tabular data preprocessing pipelines', 'Apply robust imputation strategies to corrupted datasets']
        }
      ]
    }
  ],

  'B.Sc. (H) Cyber Security': [
    {
      id: 'bsc_cs_defense',
      name: 'Information Security Principles & Network Defense',
      code: 'BSCCS-101',
      semester: 1,
      description: 'Core security models, CIA triad, TCP/IP network protocol analysis, firewall architectures, and host defense mechanisms.',
      nodes: [
        {
          id: 'bsc_cs_def_1',
          title: 'Unit 1: Security Fundamentals & Threat Modeling',
          unitNumber: 1,
          description: 'Confidentiality, integrity, availability, STRIDE threat taxonomy, threat modeling, attack surfaces, and security controls.',
          prerequisites: [],
          topics: ['CIA Triad & Non-Repudiation', 'STRIDE Threat Modeling', 'Vulnerability vs Threat vs Risk', 'Attack Surface Analysis'],
          learningOutcomes: ['Assess organizational attack vectors using STRIDE', 'Categorize security controls by preventative, detective, and corrective roles']
        },
        {
          id: 'bsc_cs_def_2',
          title: 'Unit 2: Network Protocol Vulnerabilities & Packet Analysis',
          unitNumber: 2,
          description: 'TCP/IP handshake mechanics, packet headers, Wireshark packet capture, ARP cache poisoning, DNS spoofing, and port scanning.',
          prerequisites: ['bsc_cs_def_1'],
          topics: ['TCP Three-Way Handshake Exploits', 'DNS Spoofing & ARP Poisoning', 'Wireshark Packet Inspection', 'Port Scanning Strategies'],
          learningOutcomes: ['Analyze live packet captures to identify malicious traffic', 'Detect unauthorized ARP spoofing and MITM attempts']
        },
        {
          id: 'bsc_cs_def_3',
          title: 'Unit 3: Firewalls & Intrusion Detection Systems',
          unitNumber: 3,
          description: 'Packet filtering, stateful inspection, next-generation firewalls, Snort signature writing, and intrusion prevention rules.',
          prerequisites: ['bsc_cs_def_2'],
          topics: ['Stateful vs Stateless Packet Filtering', 'Next-Generation Firewalls (NGFW)', 'Snort IDS Rule Writing', 'DMZ Network Topology'],
          learningOutcomes: ['Author custom Snort detection signatures for signature-based IDS', 'Design perimeter DMZ network boundaries with iptables rules']
        },
        {
          id: 'bsc_cs_def_4',
          title: 'Unit 4: Host Hardening & Defensive Endpoint Security',
          unitNumber: 4,
          description: 'Principle of least privilege, file permission hardening, audit daemon logging, patch cadence, and endpoint monitoring.',
          prerequisites: ['bsc_cs_def_3'],
          topics: ['Least Privilege & Access Control Lists (ACL)', 'System Audit Logging (Syslog/SIEM)', 'Patch Management Systems', 'Endpoint Detection & Response'],
          learningOutcomes: ['Harden Linux and Windows servers against common privilege escalations', 'Configure centralized syslog alerting for anomalous host actions']
        }
      ]
    },
    {
      id: 'bsc_cs_crypto',
      name: 'Applied Cryptography & Secure Communications',
      code: 'BSCCS-102',
      semester: 1,
      description: 'Mathematical foundation of cryptography, symmetric/asymmetric algorithms, hashing, digital certificates, and TLS secure protocols.',
      nodes: [
        {
          id: 'bsc_cs_cry_1',
          title: 'Unit 1: Classical Ciphers & Modular Arithmetic',
          unitNumber: 1,
          description: 'Historical substitution and transposition ciphers, modular arithmetic, greatest common divisor, and cryptanalysis fundamentals.',
          prerequisites: [],
          topics: ['Substitution & Transposition Ciphers', 'Modular Arithmetic & GCD', 'Frequency Analysis & Cryptanalysis', 'One-Time Pad Information Security'],
          learningOutcomes: ['Break classical substitution schemes through frequency analysis', 'Perform modular exponentiation for cryptographic key derivations']
        },
        {
          id: 'bsc_cs_cry_2',
          title: 'Unit 2: Symmetric Block Ciphers & Hash Functions',
          unitNumber: 2,
          description: 'Feistel networks, AES substitution-permutation networks, cipher block modes (CBC, GCM), SHA-256 properties, and HMAC.',
          prerequisites: ['bsc_cs_cry_1'],
          topics: ['AES & DES Block Structures', 'Cipher Modes (CBC, GCM, CTR)', 'SHA-2 & SHA-3 Hash Properties', 'HMAC Message Authentication'],
          learningOutcomes: ['Implement AES-GCM authenticated encryption routines', 'Verify data integrity and authenticity using SHA-256 HMAC tokens']
        },
        {
          id: 'bsc_cs_cry_3',
          title: 'Unit 3: Asymmetric Cryptography & Key Distribution',
          unitNumber: 3,
          description: 'Prime number factorization, RSA public-private key generation, discrete logarithms, and Diffie-Hellman key exchange.',
          prerequisites: ['bsc_cs_cry_2'],
          topics: ['RSA Key Generation & Decryption', 'Diffie-Hellman Key Exchange', 'Elliptic Curve Cryptography (ECC)', 'Discrete Logarithm Problem'],
          learningOutcomes: ['Derive public and private RSA key pairs from prime integers', 'Execute secure Diffie-Hellman key exchange over insecure channels']
        },
        {
          id: 'bsc_cs_cry_4',
          title: 'Unit 4: Digital Signatures & Public Key Infrastructure',
          unitNumber: 4,
          description: 'Digital Signature Standard, X.509 certificate formats, certificate authority trust hierarchies, and TLS handshake workflows.',
          prerequisites: ['bsc_cs_cry_3'],
          topics: ['Digital Signature Standard (DSS)', 'X.509 Certificate Chain Verification', 'Certificate Authorities (CA)', 'TLS 1.3 Handshake Architecture'],
          learningOutcomes: ['Validate X.509 certificate trust chains and revocation lists', 'Trace TLS 1.3 cryptographic key derivation and session protection']
        }
      ]
    }
  ],

  'B.Sc. (H) CS': [
    {
      id: 'bsc_cs_cpp',
      name: 'Object Oriented Programming with C++',
      code: 'BSCC-101',
      semester: 1,
      description: 'Modern C++, memory semantics, pointer arithmetic, class design, virtual method dispatch, and Standard Template Library algorithms.',
      nodes: [
        {
          id: 'bsc_c_cpp_1',
          title: 'Unit 1: C++ Foundations & Dynamic Memory Management',
          unitNumber: 1,
          description: 'C++ primitive types, pointers, pointer arithmetic, reference variables, dynamic heap allocation with new/delete, and namespaces.',
          prerequisites: [],
          topics: ['Primitive Types & References', 'Pointers & Pointer Arithmetic', 'Dynamic Memory (new/delete)', 'Scope & Namespaces'],
          learningOutcomes: ['Allocate and safely deallocate heap memory in C++', 'Manipulate raw pointers and references without memory leaks']
        },
        {
          id: 'bsc_c_cpp_2',
          title: 'Unit 2: Classes, Constructors & Encapsulation',
          unitNumber: 2,
          description: 'Class declarations, member visibility, constructor overloading, copy constructors, destructor cleanup, and operator overloading.',
          prerequisites: ['bsc_c_cpp_1'],
          topics: ['Encapsulation & Access Modifiers', 'Constructors & Destructors', 'Deep Copy vs Shallow Copy', 'Operator Overloading'],
          learningOutcomes: ['Implement rule of three (copy constructor, assignment operator, destructor)', 'Overload arithmetic and stream operators for custom classes']
        },
        {
          id: 'bsc_c_cpp_3',
          title: 'Unit 3: Inheritance, Polymorphism & Virtual Tables',
          unitNumber: 3,
          description: 'Single, multiple, and hierarchical inheritance, virtual functions, runtime dynamic binding, pure virtual methods, and vtables.',
          prerequisites: ['bsc_c_cpp_2'],
          topics: ['Single & Multiple Inheritance', 'Virtual Functions & Late Binding', 'Abstract Classes & Pure Virtuals', 'vtable Runtime Mechanics'],
          learningOutcomes: ['Design flexible class hierarchies with polymorphism', 'Trace virtual table lookup mechanics during runtime dispatch']
        },
        {
          id: 'bsc_c_cpp_4',
          title: 'Unit 4: Templates & Standard Template Library (STL)',
          unitNumber: 4,
          description: 'Function templates, class templates, STL sequential containers (vector, list), associative maps, iterators, and exception handling.',
          prerequisites: ['bsc_c_cpp_3'],
          topics: ['Function & Class Templates', 'STL Containers (vector, list, map)', 'STL Iterators & Algorithms', 'Exception Handling Mechanisms'],
          learningOutcomes: ['Author reusable generic algorithms with C++ templates', 'Harness STL vectors and maps for optimal algorithmic complexity']
        }
      ]
    },
    {
      id: 'bsc_cs_math',
      name: 'Discrete Mathematical Structures for Computing',
      code: 'BSCC-102',
      semester: 1,
      description: 'Propositional logic, predicate calculus, set theory, binary relations, graph theory, trees, and recurrence relations.',
      nodes: [
        {
          id: 'bsc_c_m_1',
          title: 'Unit 1: Propositional Logic & Mathematical Proofs',
          unitNumber: 1,
          description: 'Truth tables, logical connectives, propositional equivalences, universal and existential quantifiers, and mathematical induction.',
          prerequisites: [],
          topics: ['Truth Tables & Logical Equivalences', 'Universal & Existential Quantifiers', 'Direct & Indirect Proofs', 'Mathematical Induction'],
          learningOutcomes: ['Evaluate complex Boolean expressions via truth tables', 'Prove mathematical theorems using formal induction techniques']
        },
        {
          id: 'bsc_c_m_2',
          title: 'Unit 2: Sets, Relations & Partial Orderings',
          unitNumber: 2,
          description: 'Set identities, Cartesian products, equivalence relations, equivalence classes, partial orderings, and Hasse diagrams.',
          prerequisites: ['bsc_c_m_1'],
          topics: ['Set Operations & Power Sets', 'Equivalence Relations & Partitions', 'Partial Order Sets (Posets)', 'Hasse Diagrams'],
          learningOutcomes: ['Demonstrate equivalence relation properties on binary mappings', 'Construct Hasse diagrams for partial ordering lattices']
        },
        {
          id: 'bsc_c_m_3',
          title: 'Unit 3: Graph Theory & Shortest Path Trees',
          unitNumber: 3,
          description: 'Graph terminology, adjacency matrix and list representation, Euler and Hamiltonian circuits, spanning trees, and Dijkstra algorithm.',
          prerequisites: ['bsc_c_m_2'],
          topics: ['Graph Representations (Adjacency Matrix/List)', 'Eulerian & Hamiltonian Paths', 'Spanning Trees (Kruskal/Prim)', 'Shortest Paths (Dijkstra)'],
          learningOutcomes: ['Model computational networks as directed and undirected graphs', 'Compute minimal spanning trees using greedy algorithms']
        },
        {
          id: 'bsc_c_m_4',
          title: 'Unit 4: Combinatorics & Recurrence Relations',
          unitNumber: 4,
          description: 'Permutations, combinations, pigeonhole principle, solving linear homogeneous and non-homogeneous recurrence relations.',
          prerequisites: ['bsc_c_m_3'],
          topics: ['Permutations & Combinations', 'Pigeonhole Principle', 'Solving Linear Recurrence Relations', 'Generating Functions'],
          learningOutcomes: ['Solve recurrence relations using characteristic equations', 'Apply pigeonhole principle bounds to algorithmic constraints']
        }
      ]
    }
  ]
};

export const SPECIALIZATION_OPTIONS: SpecializationOption[] = [
  'B.Tech CSE (AI & ML)',
  'B.Tech CSE',
  'B.Tech CSE (Cyber Security) EC-Council',
  'B.Tech CSE (DS) IBM',
  'B.Tech CSE (Robotics & AI)',
  'B.Tech CSE (UX OR UI)',
  'BCA (SP AI & DS)',
  'BCA (H) (Sp AI & DS) (Research)',
  'BCA (Cyber Security)',
  'BCA (Hons./ Hons. with Research)',
  'MCA',
  'MCA (AI & ML) Microsoft Certifications',
  'B.Sc. (H) DS',
  'B.Sc. (H) Cyber Security',
  'B.Sc. (H) CS',
  // Backward compatibility aliases
  'B.Tech CSE (AI/ML)',
  'B.Tech CSE (Core)',
  'B.Tech CSE (AI/DS)',
];

export const getSubjectsForSpecialization = (spec: SpecializationOption | string): CurriculumSubject[] => {
  if (!spec) return [];
  const trimmed = spec.trim();
  if (trimmed.toLowerCase() === 'b.tech cse (ai/ml)' || trimmed.toLowerCase() === 'b.tech cse (ai & ml)') {
    return CURRICULUM_DATA['B.Tech CSE (AI & ML)'] || CURRICULUM_DATA['B.Tech CSE (AI/ML)'] || [];
  }
  return CURRICULUM_DATA[trimmed as SpecializationOption] || CURRICULUM_DATA[spec as SpecializationOption] || [];
};

export const getSubjectData = (spec: SpecializationOption | string, subjectNameOrId: string): CurriculumSubject | undefined => {
  const list = getSubjectsForSpecialization(spec);
  return list.find(s => s.name === subjectNameOrId || s.id === subjectNameOrId);
};

export const getCurriculumCourses = (): Course[] => {
  const result: Course[] = [];
  const seen = new Set<string>();
  Object.values(CURRICULUM_DATA).forEach(subjectList => {
    subjectList.forEach(sub => {
      if (!seen.has(sub.code)) {
        seen.add(sub.code);
        result.push({
          id: sub.code,
          code: sub.code,
          name: sub.name,
          credits: 4,
          facultyName: 'Prof. Raman',
          facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
          roomDefault: 'Room 302, Aryabhata Block',
          colorTag: '#0F766E',
        });
      }
    });
  });
  return result;
};
