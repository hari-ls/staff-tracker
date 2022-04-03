// Imports
const mysql = require("mysql2");
const db = require("../config/connection");
const cTable = require("console.table");

// Queries
class Query {
  constructor(table) {
    this.table = table;
  }
  //
  run(sql) {
    db.query(sql, (err, data) => {
      if (err) {
        console.log(err);
      }
      const [obj] = data;
      id = obj.id;
      console.log(obj, id, this.table);
    });
    return id;
  }
  // view all departments, view all roles, view all employees
  list() {
    let query;
    switch (this.table) {
      case "department":
        query = `SELECT id, name FROM department`;
        break;
      case "role":
        query = `SELECT role.id, title, department.name as department, salary FROM role LEFT JOIN department ON role.department_id = department.id`;
        break;
      case "employee":
        query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name as department, role.salary, concat(m.first_name,' ',m.last_name) as manager FROM employee m RIGHT JOIN employee e ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id`;
        break;
      default:
        console.log("Invalid values");
    }
    const sql = query;
    db.query(sql, (err, data) => {
      if (err) {
        console.log(err);
      }
      console.table(`\n`, data);
      return data;
    });
  }
  // add a department, add a role, add an employee
  add(values) {
    let attr, valStr, valIns;
    switch (this.table) {
      case "department":
        attr = ["name"];
        valStr = `VALUES(?)`;
        valIns = [values.name];
        break;
      case "role":
        attr = ["title", "salary", "department_id"];
        valStr = `VALUES(?, ?, ?)`;
        valIns = [values.title, values.salary, values.department_id];
        break;
      case "employee":
        if (values.manager_id) {
          attr = ["first_name", "last_name", "role_id", "manager_id"];
          valStr = `VALUES(?, ?, ?, ?)`;
          valIns = [
            values.first_name,
            values.last_name,
            values.role_id,
            values.manager_id,
          ];
        } else {
          attr = ["first_name", "last_name", "role_id"];
          valStr = `VALUES(?, ?, ?)`;
          valIns = [values.first_name, values.last_name, values.role_id];
        }
        break;
      default:
        console.log("Invalid values");
    }
    const sql = `INSERT INTO ${this.table} (${[...attr]}) ${valStr}`;
    db.query(sql, [...valIns], (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log("Data added!");
    });
  }
  // delete departments, delete roles, delete employees
  remove(id) {
    const sql = `DELETE FROM ${this.table} WHERE id = ${id}`;
    db.query(sql, (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log("Data removed!");
    });
  }
  // // get id of the value
  // id(value) {
  //   let query, match, id;
  //   switch (this.table) {
  //     case "department":
  //       match = value;
  //       query = `SELECT id FROM department WHERE name = "${match}"`;
  //       break;
  //     case "role":
  //       match = value;
  //       query = `SELECT id FROM role WHERE title = "${match}"`;
  //       break;
  //     case "employee":
  //       match = value.split(" ");
  //       query = `SELECT id FROM employee WHERE first_name = "${match[0]}" AND last_name = "${match[1]}"`;
  //       break;
  //     default:
  //       console.log("Invalid type");
  //   }
  //   const sql = query;
  //   db.query(sql, (err, data) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //     const [obj] = data;
  //     id = obj.id;
  //     console.log(obj, id, this.table);
  //   });
  //   return id;
  // }
}

// ----- // ----- //

// get all departments
const getDepts = () => {
  const sql = `SELECT name FROM department`;
  db.query(sql, (err, data) => {
    if (err) {
      console.log(err);
    }
    const departments = data.map((department) => department.name);
    return departments;
  });
};
// get all roles
const getRoles = () => {
  const sql = `SELECT title FROM role`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
    }
    // console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available

    const roles = results.map(({ title }) => {
      return title;
    });
    // const d = [...roles];
    console.log(roles);
    // result = roles;
    return roles;
  });
  //   return result;
};
// get all managers
// const getManagers = () => {
//   const sql = `SELECT concat(m.first_name,' ',m.last_name) as name FROM employee e INNER JOIN employee m ON m.id = e.manager_id`;
//   db.query(sql, (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     const managers = data.map((manager) => manager.name);
//     console.log(managers);
//     return managers;
//   });
// };
// update an employee role, update employee managers
const updateEmp = (id, param, key) => {
  const sql = `UPDATE employee SET ${param}_id = ${key} WHERE id = ${id}`;
  db.query(sql, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log("Data updated", data);
  });
};
// view employee by manager, view employee by department
const getEmpBy = (type, id) => {
  let query;
  switch (type) {
    case "manager":
      query = `SELECT concat(first_name,' ',last_name) as name FROM employee WHERE employee.manager_id = ${id}`;
      console.log("m");
      break;
    case "department":
      query = `SELECT concat(first_name,' ',last_name) as name FROM employee CROSS JOIN role WHERE employee.role_id = role.id AND role.department_id = ${id}`;
      console.log(query);
      break;
    default:
      console.log("Incorrect type");
  }
  const sql = query;
  db.query(sql, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
  });
};
// view budget by department
// const getDeptBudget = (deptId) => {
//   const sql = `SELECT SUM(salary) as total FROM role CROSS JOIN employee WHERE employee.role_id = role.id AND role.department_id = ${deptId}`;
//   db.query(sql, (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     const [obj] = data;
//     return obj.total;
//   });
// };
// get id
// const getId = (table, value) => {
//   let sql, match;
//   switch (table) {
//     case "department":
//       match = value;
//       sql = `SELECT id FROM department WHERE name = "${match}"`;
//       break;
//     case "role":
//       match = value;
//       sql = `SELECT id FROM role WHERE title = "${match}"`;
//       break;
//     case "employee":
//       match = value.split(" ");
//       sql = `SELECT id FROM employee WHERE first_name = "${match[0]}" AND last_name = "${match[1]}"`;
//       break;
//     default:
//       console.log("Invalid type");
//   }
//   db.query(sql, (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     const [obj] = data;
//     console.log(obj.id);
//   });
// };

// Exports
module.exports = {
  Query,
  // selectAll,
  // insertInto,
  // deleteFrom,
  getDepts,
  getRoles,
  // getManagers,
  getEmpBy,
  updateEmp,
  // getDeptBudget,
  // getId,
};
