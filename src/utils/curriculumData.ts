import { SpecializationOption, SyllabusNode } from '../types';

export interface CurriculumSubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  description: string;
  nodes: SyllabusNode[];
}

export const CURRICULUM_DATA: Record<SpecializationOption, CurriculumSubject[]> = {
  'B.Tech CSE (AI/ML)': [
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
  ],

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
  ]
};

export const SPECIALIZATION_OPTIONS: SpecializationOption[] = [
  'B.Tech CSE (AI/ML)',
  'B.Tech CSE (Core)',
  'B.Tech CSE (AI/DS)',
];

export const getSubjectsForSpecialization = (spec: SpecializationOption): CurriculumSubject[] => {
  return CURRICULUM_DATA[spec] || [];
};

export const getSubjectData = (spec: SpecializationOption, subjectNameOrId: string): CurriculumSubject | undefined => {
  const list = getSubjectsForSpecialization(spec);
  return list.find(s => s.name === subjectNameOrId || s.id === subjectNameOrId);
};
