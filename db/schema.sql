-- Create database --
DROP DATABASE IF EXISTS staff_db;
CREATE DATABASE staff_db;

-- Switch database --
USE staff_db;

-- Create table: Department --
CREATE TABLE department (
    id INT AUTO_INCREAMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

-- Create table: Role --
CREATE TABLE role (
    id INT AUTO_INCREAMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY(department_id)
    REFERENCES department(id)
    ON DELETE CASCADE
);

-- Create table: Employee --
CREATE TABLE employee(
    id INT AUTO_INCREAMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    FOREIGN KEY(role_id)
    REFERENCES role(id)
    ON DELETE CASCADE,
    FOREIGN KEY(manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);