CREATE TABLE notes (
    course_code CHAR(7) PRIMARY KEY,
    course_name VARCHAR(50) NOT NULL,
    course_description TEXT NOT NULL,
    course_type VARCHAR(20) NOT NULL,
    course_date DATE NOT NULL
);

INSERT INTO notes(
    course_code,
    course_name,
    course_description,
    course_type,
    course_date
)
VALUES(
    'ITCS333',
    'Mobile Application Development',
    'Mobile Application Development course covering cross-platform development using frameworks like React Native and Flutter. Includes UI design principles and API integration for mobile apps.',
    'Information System',
    '2025-05-02'
),(
    'ITCS325',
    'Data Structures and Algorithms',
    'Data Structures and Algorithms course focusing on arrays, linked lists, trees, graphs, and algorithm complexity analysis. Practical implementation in Java and Python.',
    'Information System',
    '2024-04-10'
),(
    'ITCS316',
    'Database Systems',
    'Database Systems fundamentals covering relational database design, SQL queries, normalization, and transaction management with hands-on MySQL projects.',
    'Information System',
    '2023-12-15'
),(
    'ITCS389',
    'Cybersecurity Essentials',
    'Cybersecurity Essentials covering encryption methods, authentication protocols, ethical hacking principles, and security best practices for system protection.',
    'Information System',
    '2025-04-30'
),(
    'ITCS347',
    'Operating Systems',
    'Operating Systems concepts including process management, memory allocation, file systems, and virtualization with practical exercises in Linux environment.',
    'Information System',
    '2024-05-05'
),(
    'ITCS214',
    'Computer Networks',
    'Computer Networks fundamentals covering TCP/IP stack, routing protocols, network security, and socket programming with Wireshark lab exercises.',
    'Information System',
    '2023-05-07'
),(
    'ITCS114',
    'Introduction to Programming',
    'Introduction to Programming using Python covering basic syntax, control structures, functions, and object-oriented programming concepts for beginners.',
    'Information System',
    '2022-02-18'
),(
    'ITCS113',
    'Discrete Mathematics',
    'Discrete Mathematics for Computer Science including logic, sets, relations, combinatorics, and graph theory with applications to computing problems.',
    'Information System',
    '2021-11-04'
),(
    'ITCS453',
    'Web Development',
    'Web Development fundamentals covering HTML5, CSS3, JavaScript, and responsive design principles with Bootstrap framework implementation.',
    'Information System',
    '2025-04-26'
),(
    'ITCS498',
    'Senior Capstone Project',
    'Senior Capstone Project where student teams design, develop and present complete software solutions addressing real-world business problems.',
    'Information System',
    '2023-08-28'
),(
    'ITCS444',
    'Artificial Intelligence',
    'Artificial Intelligence fundamentals including search algorithms, machine learning basics, neural networks, and natural language processing concepts.',
    'Information System',
    '2025-03-17'
),(
    'MATHS101',
    'Calculus One',
    'Introduction to differential and integral calculus, limits, continuity, and applications to real-world problems.',
    'Science',
    '2024-06-25'
),(
    'MATHS102',
    'Calculus Two',
    'Advanced topics in calculus including multivariable functions, partial derivatives, and multiple integrals.',
    'Science',
    '2025-04-12'
),(
    'MATHS211',
    'Linear Algebra',
    'Vector spaces, matrices, determinants, eigenvalues, and linear transformations with engineering applications.',
    'Science',
    '2023-10-02'
),(
    'PHYCS101',
    'Physics One',
    'Fundamentals of mechanics, thermodynamics, and wave motion with laboratory experiments.',
    'Science',
    '2021-07-08'
),(
    'PHYCS102',
    'Physics Two',
    'Electromagnetism, optics, and modern physics concepts like relativity and quantum mechanics.',
    'Science',
    '2022-03-22'
),(
    'ACC122',
    'Accounting',
    'Principles of financial accounting, balance sheets, income statements, and cash flow management.',
    'Business',
    '2025-04-14'
),(
    'MNG261',
    'Accounting',
    'Principles of financial accounting, balance sheets, income statements, and cash flow management.',
    'Business',
    '2025-04-11'
);