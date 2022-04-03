const mysql = require("mysql2");
const db = require("./config/connection");
const inquirer = require("inquirer");
var figlet = require("figlet");
const gradient = require("gradient-string");
const cTable = require("console.table");

// Choices for selection
const choices = [
  {
    type: "list",
    name: "selection",
    message: "What would you like to do?",
    choices: [
      "View All Departments",
      "View All Roles",
      "View All Employees",
      "Add a Department",
      "Add a Role",
      "Add an Employee",
      "Update an Employee Role",
      "Update an Employee Manager",
      "View Employees by Manager",
      "View Employees by Department",
      "Delete Departments",
      "Delete Roles",
      "Delete Employees",
      "View Department Budget",
      "Quit",
    ],
  },
];
// Start
const start = () => {
  figlet.text("Staff Tracker", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(gradient("cyan", "pink")(data));
    db.connect((err) => {
      if (err) {
        console.log(err);
      }
      ask();
    });
  });
};
// End
const end = () => {
  figlet.text("Thank you!", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(gradient("cyan", "pink")(data));
  });
  db.end();
  process.exit(0);
};

const ask = () => {
  inquirer.prompt(choices).then((input) => {
    switch (input.selection) {
      case "View All Departments":
        viewAllDepartments();
        break;
      case "View All Roles":
        viewAllRoles();
        break;
      case "View All Employees":
        viewAllEmployees();
        break;
      case "Add a Department":
        addDepartment();
        break;
      case "Add a Role":
        addRole();
        break;
      case "Add an Employee":
        addEmployee();
        break;
      case "Update an Employee Role":
        updateEmployeeRole();
        break;
      case "Update an Employee Manager":
        updateEmployeeManager();
        break;
      case "View Employees by Manager":
        viewEmployeesByManager();
        break;
      case "View Employees by Department":
        viewEmployeesByDepartment();
        break;
      case "Delete Departments":
        deleteDepartments();
        break;
      case "Delete Roles":
        deleteRoles();
        break;
      case "Delete Employees":
        deleteEmployees();
        break;
      case "View Department Budget":
        viewDepartmentBudget();
        break;
      default:
        end();
    }
  });
};

const viewAllDepartments = () => {
  db.query(
    `SELECT id, name FROM department ORDER BY name ASC`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      console.log(cTable.getTable(results));
      ask();
    }
  );
};

const viewAllRoles = () => {
  db.query(
    `SELECT role.id, title, department.name as department, salary FROM role LEFT JOIN department ON role.department_id = department.id`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      console.log(cTable.getTable(results));
      ask();
    }
  );
};

const viewAllEmployees = () => {
  db.query(
    `SELECT e.id, e.first_name, e.last_name, role.title, department.name as department, role.salary, concat(m.first_name,' ',m.last_name) as manager FROM employee m RIGHT JOIN employee e ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      console.log(cTable.getTable(results));
      ask();
    }
  );
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "What is the name of the department?",
      },
    ])
    .then((response) => {
      db.query(
        `INSERT INTO department (name) VALUES(?)`,
        [response.departmentName],
        (err, results) => {
          if (err) {
            console.log(err);
          }
          console.log(`Added ${response.departmentName} to the database`);
          ask();
        }
      );
    });
};

const addRole = () => {
  db.query(`SELECT name as department FROM department`, (err, results) => {
    if (err) {
      console.log(err);
    }
    const departments = results.map(({ department }) => {
      return department;
    });
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "What is the name of the role?",
        },
        {
          type: "input",
          name: "roleSalary",
          message: "What is the salary of the role?",
        },
        {
          type: "list",
          name: "roleDepartment",
          message: "Which department does the role belong to?",
          choices: departments,
        },
      ])
      .then((response) => {
        db.query(
          `INSERT INTO role (title, salary, department_id) VALUES(?, ?, (SELECT id FROM department WHERE name = ?))`,
          [response.roleTitle, response.roleSalary, response.roleDepartment],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log(`Added ${response.roleTitle} to the database`);
            ask();
          }
        );
      });
  });
};

const addEmployee = () => {
  db.query(`SELECT title as role FROM role`, (err, results) => {
    if (err) {
      console.log(err);
    }
    const roles = results.map(({ role }) => {
      return role;
    });
    db.query(
      `SELECT concat(first_name,' ',last_name) as employee FROM employee`,
      (err, results) => {
        if (err) {
          console.log(err);
        }
        const employees = results.map(({ employee }) => {
          return employee;
        });
        inquirer
          .prompt([
            {
              type: "input",
              name: "empFirstName",
              message: "What is the first name of the employee?",
            },
            {
              type: "input",
              name: "empLastName",
              message: "What is the last name of the employee?",
            },
            {
              type: "list",
              name: "empRole",
              message: "What is the role of the employee?",
              choices: roles,
            },
            {
              type: "list",
              name: "empManager",
              message: "Who is the manager of the employee?",
              choices: [...employees, "None"],
            },
          ])
          .then((response) => {
            let manNames = response.empManager.split(" ");
            let manSubQuery = `(SELECT id FROM (SELECT * FROM employee) as m WHERE m.first_name = ? AND m.last_name = ?)`;
            if (response.empManager === "None") {
              manNames = [null];
              manSubQuery = `?`;
            }
            db.query(
              `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?, ?, (SELECT id FROM role WHERE title = ?), ${manSubQuery})`,
              [
                response.empFirstName,
                response.empLastName,
                response.empRole,
                ...manNames,
              ],
              (err, data) => {
                if (err) {
                  console.log(err);
                }
                console.log(
                  `Added ${response.empFirstName} ${response.empLastName} to the database`
                );
                ask();
              }
            );
          });
      }
    );
  });
};

const updateEmployeeRole = () => {
  db.query(
    `SELECT concat(first_name,' ',last_name) as employee FROM employee`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      const employeeList = results.map(({ employee }) => {
        return employee;
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Select an employee to update role:",
            choices: employeeList,
          },
        ])
        .then((response) => {
          let empNames = response.employee.split(" ");
          db.query(`SELECT title as role FROM role`, (err, results) => {
            if (err) {
              console.log(err);
            }
            const roles = results.map(({ role }) => {
              return role;
            });
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "role",
                  message: "Select a role to apply:",
                  choices: roles,
                },
              ])
              .then((response) => {
                db.query(
                  `UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE first_name = ? AND last_name = ?`,
                  [response.role, ...empNames],
                  (err, data) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log(
                      `Role updated for ${empNames[0]} ${empNames[1]}`
                    );
                    ask();
                  }
                );
              });
          });
        });
    }
  );
};

const updateEmployeeManager = () => {
  db.query(
    `SELECT concat(first_name,' ',last_name) as employee FROM employee`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      const employees = results.map(({ employee }) => {
        return employee;
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Select an employee to update thier manager:",
            choices: employees,
          },
        ])
        .then((response) => {
          let empNames = response.employee.split(" ");
          // fetch other employees
          db.query(
            `SELECT concat(first_name,' ',last_name) as other_employee FROM employee WHERE first_name != ? AND last_name != ?`,
            [...empNames],
            (err, results) => {
              if (err) {
                console.log(err);
              }
              // process results
              const otherEmployees = results.map(({ other_employee }) => {
                return other_employee;
              });
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Select an employee to set an manager:",
                    choices: ["None", ...otherEmployees],
                  },
                ])
                .then((response) => {
                  let manNames = response.manager.split(" ");
                  let manSubQuery = `(SELECT id FROM (SELECT * FROM employee) as m WHERE m.first_name = ? AND m.last_name = ?)`;
                  if (response.manager === "None") {
                    manNames = [null];
                    manSubQuery = `?`;
                  }
                  // Update employee manager
                  db.query(
                    `UPDATE employee SET manager_id = ${manSubQuery} WHERE first_name = ? AND last_name = ?`,
                    [...manNames, ...empNames],
                    (err, results) => {
                      if (err) {
                        console.log(err);
                      }
                      console.log(
                        `Manager updated for ${empNames[0]} ${empNames[1]}`
                      );
                      ask();
                    }
                  );
                });
            }
          );
        });
    }
  );
};

const viewEmployeesByManager = () => {
  db.query(
    `SELECT DISTINCT concat(m.first_name,' ',m.last_name) as manager FROM employee e INNER JOIN employee m ON m.id = e.manager_id`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      // store managers
      const managers = results.map(({ manager }) => {
        return manager;
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "manager",
            message: "Select a manager to view thier managed employees:",
            choices: managers,
          },
        ])
        .then((response) => {
          const manNames = response.manager.split(" ");
          // run query
          db.query(
            `SELECT concat(employee.first_name,' ',employee.last_name) as employees FROM employee CROSS JOIN employee manager ON employee.manager_id = manager.id AND manager.id = (SELECT id FROM employee WHERE first_name = ? AND last_name = ?)`,
            [...manNames],
            (err, results) => {
              if (err) {
                console.log(err);
              }
              console.log(cTable.getTable(results));
              ask();
            }
          );
        });
    }
  );
};

const viewEmployeesByDepartment = () => {
  db.query(`SELECT name as department FROM department`, (err, results) => {
    if (err) {
      console.log(err);
    }
    // store departments
    const departments = results.map(({ department }) => {
      return department;
    });
    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Select a department to view thier employees:",
          choices: departments,
        },
      ])
      .then((response) => {
        db.query(
          `SELECT concat(employee.first_name,' ',employee.last_name) as employees FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name = ?`,
          [response.department],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log(cTable.getTable(results));
            ask();
          }
        );
      });
  });
};

const deleteDepartments = () => {
  db.query(`SELECT name as department FROM department`, (err, results) => {
    if (err) {
      console.log(err);
    }
    const departments = results.map(({ department }) => {
      return department;
    });
    inquirer
      .prompt([
        {
          type: "checkbox",
          name: "selectedDepartments",
          message: "Select the departments to be deleted:",
          choices: departments,
        },
      ])
      .then((response) => {
        let noOfRows = response.selectedDepartments.map((i) => `?`);
        let queryParams = noOfRows.join(", ");
        db.query(
          `DELETE FROM department WHERE name IN (${queryParams})`,
          [...response.selectedDepartments],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log("Departments deleted!");
            ask();
          }
        );
      });
  });
};

const deleteRoles = () => {
  db.query(`SELECT title as role FROM role`, (err, results) => {
    if (err) {
      console.log(err);
    }
    const roles = results.map(({ role }) => {
      return role;
    });
    inquirer
      .prompt([
        {
          type: "checkbox",
          name: "selectedRoles",
          message: "Select the roles to be deleted:",
          choices: roles,
        },
      ])
      .then((response) => {
        console.log(response);
        let noOfRows = response.selectedRoles.map((i) => `?`);
        let queryParams = noOfRows.join(", ");
        db.query(
          `DELETE FROM role WHERE title IN (${queryParams})`,
          [...response.selectedRoles],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log("Roles deleted!");
            ask();
          }
        );
      });
  });
};

const deleteEmployees = () => {
  db.query(
    `SELECT concat(first_name,' ',last_name) as employee FROM employee`,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      const employees = results.map(({ employee }) => {
        return employee;
      });
      inquirer
        .prompt([
          {
            type: "checkbox",
            name: "selectedEmployees",
            message: "Select the employees to be deleted:",
            choices: employees,
          },
        ])
        .then((response) => {
          let noOfRows = response.selectedEmployees.map((i) => `?`);
          let queryParams = noOfRows.join(", ");
          db.query(
            `DELETE from employee WHERE concat(first_name,' ',last_name) IN (${queryParams});`,
            [...response.selectedEmployees],
            (err, results) => {
              if (err) {
                console.log(err);
              }
              console.log("Employees deleted!");
              ask();
            }
          );
        });
    }
  );
};

const viewDepartmentBudget = () => {
  db.query(`SELECT name as department FROM department`, (err, results) => {
    if (err) {
      console.log(err);
    }
    // set param
    const departments = results.map(({ department }) => {
      return department;
    });
    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Get the total utlilised budget for selected department:",
          choices: departments,
        },
      ])
      .then((response) => {
        db.query(
          `SELECT SUM(salary) as total FROM role CROSS JOIN employee WHERE employee.role_id = role.id AND role.department_id = (SELECT id FROM department WHERE name = ?)`,
          [response.department],
          (err, data) => {
            if (err) {
              console.log(err);
            }
            const [obj] = data;
            console.log(
              `Total utlised budget for ${response.department} is ${obj.total}`
            );
            ask();
          }
        );
      });
  });
};

const init = () => {
  start();
};

init();
