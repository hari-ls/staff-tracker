-- Insert values into tables --
INSERT INTO department (name)
VALUES("Sales"),
    ("Marketing"),
    ("Accounting"),
    ("Operations");

INSERT INTO role (title, salary, department_id)
VALUES("Business Development Manager", 90000, 1),
    ("Accountant", 120000, 3),
    ("Store Manager", 140000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES("John", "Doe", 1, NULL),
    ("Marry", "Jane", 2, NULL),
    ("Sam", "Jackson", 3, 1),
    ("Ben", "Roach", 4, 1);