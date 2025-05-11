<?php
$host = 'localhost';
$dbname = 'notes';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("DB Connection failed: " . $e->getMessage());
}

$json = '[
  {
    "courseCode": "ITCS333",
    "title": "Mobile Application Development",
    "description": "Mobile Application Development course covering cross-platform development using frameworks like React Native and Flutter. Includes UI design principles and API integration for mobile apps.",
    "course": "Information System",
    "createdAt": "2025-05-02"
  },
  {
    "courseCode": "ITCS325",
    "title": "Data Structures and Algorithms",
    "description": "Data Structures and Algorithms course focusing on arrays, linked lists, trees, graphs, and algorithm complexity analysis. Practical implementation in Java and Python.",
    "course": "Information System",
    "createdAt": "2024-04-10"
  },
  {
    "courseCode": "ITCS316",
    "title": "Database Systems",
    "description": "Database Systems fundamentals covering relational database design, SQL queries, normalization, and transaction management with hands-on MySQL projects.",
    "course": "Information System",
    "createdAt": "2023-12-15"
  },
  {
    "courseCode": "ITCS389",
    "title": "Software Engineering",
    "description": "Software Engineering principles including Agile methodologies, UML diagrams, design patterns, and software testing techniques for full project lifecycle development.",
    "course": "Information System",
    "createdAt": "2025-04-10"
  },
  {
    "courseCode": "ITCS347",
    "title": "Operating Systems",
    "description": "Operating Systems concepts including process management, memory allocation, file systems, and virtualization with practical exercises in Linux environment.",
    "course": "Information System",
    "createdAt": "2024-05-05"
  },
  {
    "courseCode": "ITCS214",
    "title": "Computer Networks",
    "description": "Computer Networks fundamentals covering TCP/IP stack, routing protocols, network security, and socket programming with Wireshark lab exercises.",
    "course": "Information System",
    "createdAt": "2023-05-07"
  },
  {
    "courseCode": "ITCS114",
    "title": "Introduction to Programming",
    "description": "Introduction to Programming using Python covering basic syntax, control structures, functions, and object-oriented programming concepts for beginners.",
    "course": "Information System",
    "createdAt": "2022-02-18"
  },
  {
    "courseCode": "ITCS113",
    "title": "Discrete Mathematics",
    "description": "Discrete Mathematics for Computer Science including logic, sets, relations, combinatorics, and graph theory with applications to computing problems.",
    "course": "Information System",
    "createdAt": "2021-11-04"
  },
  {
    "courseCode": "ITCS453",
    "title": "Web Development",
    "description": "Web Development fundamentals covering HTML5, CSS3, JavaScript, and responsive design principles with Bootstrap framework implementation.",
    "course": "Information System",
    "createdAt": "2025-04-26"
  },
  {
    "courseCode": "ITCS498",
    "title": "Senior Capstone Project",
    "description": "Senior Capstone Project where student teams design, develop and present complete software solutions addressing real-world business problems.",
    "course": "Information System",
    "createdAt": "2023-08-28"
  },
  {
    "courseCode": "ITCS444",
    "title": "Artificial Intelligence",
    "description": "Artificial Intelligence fundamentals including search algorithms, machine learning basics, neural networks, and natural language processing concepts.",
    "course": "Information System",
    "createdAt": "2025-03-17"
  },
  {
    "courseCode": "ITCS389",
    "title": "Cybersecurity Essentials",
    "description": "Cybersecurity Essentials covering encryption methods, authentication protocols, ethical hacking principles, and security best practices for system protection.",
    "course": "Information System",
    "createdAt": "2025-04-30"
  },
  {
    "courseCode": "MATHS101",
    "title": "Calculus One",
    "description": "Introduction to differential and integral calculus, limits, continuity, and applications to real-world problems.",
    "course": "Science",
    "createdAt": "2024-06-25"
  },
  {
    "courseCode": "MATHS102",
    "title": "Calculus Two",
    "description": "Advanced topics in calculus including multivariable functions, partial derivatives, and multiple integrals.",
    "course": "Science",
    "createdAt": "2025-04-12"
  },
  {
    "courseCode": "MATHS211",
    "title": "Linear Algebra",
    "description": "Vector spaces, matrices, determinants, eigenvalues, and linear transformations with engineering applications.",
    "course": "Science",
    "createdAt": "2023-10-02"
  },
  {
    "courseCode": "PHYCS101",
    "title": "Physics One",
    "description": "Fundamentals of mechanics, thermodynamics, and wave motion with laboratory experiments.",
    "course": "Science",
    "createdAt": "2021-07-08"
  },
  {
    "courseCode": "PHYCS102",
    "title": "Physics Two",
    "description": "Electromagnetism, optics, and modern physics concepts like relativity and quantum mechanics.",
    "course": "Science",
    "createdAt": "2022-03-22"
  },
  {
    "courseCode": "ACC122",
    "title": "Accounting",
    "description": "Principles of financial accounting, balance sheets, income statements, and cash flow management.",
    "course": "Business",
    "createdAt": "2025-04-14"
  },
  {
    "courseCode": "MNG261",
    "title": "Accounting",
    "description": "Principles of financial accounting, balance sheets, income statements, and cash flow management.",
    "course": "Business",
    "createdAt": "2025-04-11"
  }
]';

$data = json_decode($json, true);

if ($data === null) {
    die("Invalid JSON");
}

$sql = "INSERT INTO notes (course_code, course_name, course_description, course_type, course_date) 
        VALUES (:code, :name, :desc, :type, :date)
        ON DUPLICATE KEY UPDATE 
            course_name = VALUES(course_name),
            course_description = VALUES(course_description),
            course_type = VALUES(course_type),
            course_date = VALUES(course_date)";

$stmt = $pdo->prepare($sql);

foreach ($data as $course) {
    $stmt->execute([
        ':code' => $course['courseCode'],
        ':name' => $course['title'],
        ':desc' => $course['description'],
        ':type' => $course['course'],
        ':date' => $course['createdAt']
    ]);
}?>
