CREATE DATABASE notes;

CREATE TABLE notes (
    course_code CHAR(7) PRIMARY KEY,
    course_name VARCHAR(50) NOT NULL,
    course_description TEXT NOT NULL,
    course_type VARCHAR(20) NOT NULL,
    course_date DATE NOT NULL
)

