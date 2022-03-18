const inquirer = require("inquirer");
var figlet = require("figlet");
const gradient = require("gradient-string");
const logo = require("asciiart-logo");
const {
  selectAll,
  insertInto,
  deleteFrom,
  getDepts,
  getRoles,
  getManagers,
  getEmpBy,
  updateEmp,
  getDeptBudget,
  getId,
} = require("./utils/queries");

// console.log(
//   logo({
//     name: "Staff Tracker",
//     font: "ANSI Shadow",
//     lineChars: 10,
//     padding: 2,
//     margin: 3,
//   }).render()
// );

// figlet.text(
//   "Staff Tracker",
//   {
//     border: 1,
//   },
//   function (err, data) {
//     if (err) {
//       console.log("Something went wrong...");
//       console.dir(err);
//       return;
//     }
//     console.log(gradient("cyan", "pink")(data));
//   }
// );

// console.log(gradient("cyan", "pink")("Hello world!"));

// selectAll("department");
// selectAll("role");
// selectAll("employee");

// insertInto("department", { name: "Demo" });
// insertInto("employee", {
//   first_name: "BFirst",
//   last_name: "BLast",
//   role_id: 1,
//   manager_id: null,
// });
// insertInto("role", { title: "Demo Role", salary: 50000, department_id: 6 });

// const departments = getDepts();
// console.log(departments);
// getRoles();
// getManagers();
// getDeptBudget(3);
// deleteFrom("department", 17);
// console.log(getDepts());
// getEmpBy("department", 1);
// getEmpBy("manager", 2);
// updateEmp(5, "manager", 2);
// getId("employee", "John Doe");
// getId("department", "Marketing");
// getId("role", "Business Development Manager");

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
      "Delete a Department",
      "Delete a Role",
      "Delete an Employee",
      "View Department Budget",
    ],
  },
];

inquirer.prompt(choices).then((input) => {
  console.log(input);
});
