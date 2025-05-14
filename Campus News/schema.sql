-- Create the campus_news database
CREATE DATABASE IF NOT EXISTS campus_news;
USE campus_news;

-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INT,
    author VARCHAR(100),
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Insert default categories
INSERT INTO categories (name) VALUES
('academic'),
('events'),
('sports'),
('culture')
ON DUPLICATE KEY UPDATE name = VALUES(name);
