//uuid style formula for making unique id
import { uuidv4 } from "./uuidv4.js";
//bcrypt is for encrypting passwords
const bcrypt = dcodeIO.bcrypt;
//fake database => set "database" to session storage so it will persist
let db = [];
if (sessionStorage.getItem("db")) {
  db = JSON.parse(sessionStorage.getItem("db"));
} else {
  sessionStorage.setItem("db", JSON.stringify([]));
}
console.log(db);
//class constructor to mimic database model
class User {
  constructor(id, name, lastname, email, password) {
    this.id = id;
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
  }
}
//state object to store input from form
const state = {
  name: "",
  lastname: "",
  email: "",
  password1: "",
  password2: "",
};
//HTML elements
const regForm = document.getElementById("regForm");
const loginForm = document.getElementById("loginForm");
const regMessageDiv = document.getElementById("regMessageDiv");
const logMessageDiv = document.getElementById("logMessageDiv");
const usersDiv = document.getElementById("usersDiv");
const editUserDiv = document.getElementById("editUserDiv");
const editMessageDiv = document.createElement("div");
//assign submit functions to forms
regForm.onsubmit = submitRegistration;
loginForm.onsubmit = submitLogin;
//get all form inputs and add event listener
const inputs = [...document.querySelectorAll("input")];
for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("input", handleInput);
}
//callback for event listener for all inputs
//sets the state object variables to whatever user enters in form
function handleInput(e) {
  let { name, value } = e.target;
  state[name] = value;
}
//registration
function submitRegistration(e) {
  //prevents page from refreshing
  e.preventDefault();
  //clear out any messages
  regMessageDiv.innerHTML = "";
  logMessageDiv.innerHTML = "";
  //get variables from state => destructuring
  let { name, lastname, email, password1, password2 } = state;
  //do passwords match?
  if (password1 === password2) {
    //if they match, password equals password1
    let password = password1;
    //generates a unique id for the new user
    let id = uuidv4();
    //checks to see if there is anything in the database
    if (db.length > 0) {
      for (let i = 0; i < db.length; i++) {
        //checks to see if user email is already registered
        if (db[i].email === email) {
          regMessageDiv.innerHTML =
            "<small style='color:red;'>Email Already in Database</small>";
          return;
        } else {
          //If email is not in database, user can register
          //encrypting password
          let hashed = bcrypt.hashSync(password, 10);
          //reassigning password to pass to database
          password = hashed;
          //making new user object
          let newUser = new User(id, name, lastname, email, password);
          //pushing new user to database
          db.push(newUser);
          //saving database to storage
          sessionStorage.setItem("db", JSON.stringify(db));
          //letting user know s/he is registered
          regMessageDiv.innerHTML =
            "<small style='color:red;'>Registered</small>";
          renderUsers();
          clearInputs(inputs);
          clearState(state);
          return;
        }
      }
    } else {
      //if database length is zero, go ahead and register userf
      let hashed = bcrypt.hashSync(password, 10);
      password = hashed;
      let newUser = new User(id, name, lastname, email, password);
      db.push(newUser);
      sessionStorage.setItem("db", JSON.stringify(db));
      regMessageDiv.innerHTML = "<small style='color:red;'>Registered</small>";
      clearInputs(inputs);
      clearState(state);
      renderUsers();
      return;
    }
  } else {
    regMessageDiv.innerHTML =
      "<small style='color:red;'>Passwords do not match</small>";
    return;
  }
}

function submitLogin(e) {
  //prevents page from refreshing
  e.preventDefault();
  //clears out all messages
  logMessageDiv.innerHTML = "";
  regMessageDiv.innerHTML = "";
  //gets email and password from state
  let { email, password1 } = state;
  //gets the database out of session storage
  db = JSON.parse(sessionStorage.getItem("db"));
  //going through database to see if the email is there
  for (let i = 0; i < db.length; i++) {
    //assigns the value of password1 to passport
    let password = password1;
    if (db[i].email === email) {
      //if email is in database checks the password
      if (bcrypt.compareSync(password, db[i].password)) {
        //if password passes, send message
        logMessageDiv.innerHTML = "<h3 style='color:red;'>Logged in</h3>";
        clearInputs(inputs);
        clearState(state);
        return;
      } else {
        //if password fails, send message
        logMessageDiv.innerHTML =
          "<small style='color:red;'>There was a problem with the password</small>";
        clearInputs(inputs);
        clearState(state);
        return;
      }
    } else {
      //if the email was not in the database, send message
      logMessageDiv.innerHTML =
        "<small style='color:red;'>The Email was not in our database</small>";
      clearInputs(inputs);
      clearState(state);
      return;
    }
  }
}
//function to clear inputs
function clearInputs(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].value = "";
  }
}
//function to clear state
function clearState(obj) {
  for (let key in obj) {
    obj[key] = "";
  }
}

function renderUsers() {
  regMessageDiv.innerHTML = "";
  logMessageDiv.innerHTML = "";
  let users = JSON.parse(sessionStorage.getItem("db"));
  usersDiv.innerHTML = "";
  let usersUl = document.createElement("ul");
  usersDiv.append(usersUl);
  for (let i = 0; i < users.length; i++) {
    let li = document.createElement("li");
    li.innerHTML =
      "<p>" +
      users[i].name +
      " " +
      users[i].lastname +
      "</p><p>" +
      users[i].email +
      "</p>";
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "DELETE";
    deleteBtn.addEventListener("click", () => deleteUser(users[i].id));
    let editBtn = document.createElement("button");
    editBtn.innerText = "EDIT";
    editBtn.addEventListener("click", () => editUser(users[i].id));
    li.append(deleteBtn);
    li.append(editBtn);
    usersUl.append(li);
  }
}
renderUsers();

function deleteUser(id) {
  let users = JSON.parse(sessionStorage.getItem("db"));
  let meanGirls = [];
  for (let i = 0; i < users.length; i++) {
    if (id !== users[i].id) {
      meanGirls.push(users[i]);
    }
  }
  sessionStorage.setItem("db", JSON.stringify(meanGirls));
  usersDiv.innerHTML = "";
  renderUsers();
}

function editUser(id) {
  editUserDiv.innerHTML = "";
  let users = JSON.parse(sessionStorage.getItem("db"));
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      state.name = users[i].name;
      state.lastname = users[i].lastname;
      state.email = users[i].email;
      const form = document.createElement("form");
      //name
      const nameLabel = document.createElement("label");
      nameLabel.setAttribute("for", "editName");
      nameLabel.innerText = "First Name";
      const nameInput = document.createElement("input");
      nameInput.setAttribute("name", "name");
      nameInput.setAttribute("type", "text");
      nameInput.setAttribute("id", "editName");
      nameInput.setAttribute("value", users[i].name);
      nameInput.addEventListener("input", handleInput);
      form.append(nameLabel);
      form.append(nameInput);
      //lastname
      const lastnameLabel = document.createElement("label");
      lastnameLabel.setAttribute("for", "editLastname");
      lastnameLabel.innerText = "Last Name";
      const lastnameInput = document.createElement("input");
      lastnameInput.setAttribute("name", "lastname");
      lastnameInput.setAttribute("type", "text");
      lastnameInput.setAttribute("id", "editLastname");
      lastnameInput.setAttribute("value", users[i].lastname);
      lastnameInput.addEventListener("input", handleInput);
      form.append(lastnameLabel);
      form.append(lastnameInput);
      //email
      const emailLabel = document.createElement("label");
      emailLabel.setAttribute("for", "editEmail");
      emailLabel.innerText = "Email";
      const emailInput = document.createElement("input");
      emailInput.setAttribute("name", "email");
      emailInput.setAttribute("type", "text");
      emailInput.setAttribute("id", "editEmail");
      emailInput.setAttribute("value", users[i].email);
      emailInput.addEventListener("input", handleInput);
      form.append(emailLabel);
      form.append(emailInput);
      //password 1
      const password1Label = document.createElement("label");
      password1Label.setAttribute("for", "editPassword1");
      password1Label.innerText = "Password";
      const password1Input = document.createElement("input");
      password1Input.setAttribute("name", "password1");
      password1Input.setAttribute("id", "editPassword1");
      password1Input.addEventListener("input", handleInput);
      form.append(password1Label);
      form.append(password1Input);
      //password 2
      const password2Label = document.createElement("label");
      password2Label.setAttribute("for", "editPassword2");
      password2Label.innerText = "Please Re-enter Password";
      const password2Input = document.createElement("input");
      password2Input.setAttribute("name", "password2");
      password2Input.setAttribute("id", "editPassword2");
      password2Input.addEventListener("input", handleInput);
      form.append(password2Label);
      form.append(password2Input);
      //button
      const submitBtn = document.createElement("button");
      submitBtn.setAttribute("type", "submit");
      submitBtn.innerText = "EDIT";
      form.append(submitBtn);
      form.addEventListener("submit", (e) => handleEdit(e, users[i].id));
      editUserDiv.append(form);
      editUserDiv.append(editMessageDiv);
    }
  }
}

function handleEdit(e, id) {
  e.preventDefault();
  let users = JSON.parse(sessionStorage.getItem("db"));
  if (state.password1 !== state.password2) {
    editMessageDiv.innerHTML =
      "<small style='color:red;' >Passwords do not match</small>";
    return;
  } else {
    let youveChanged = [];
    console.log("USERS ", users);
    for (let i = 0; i < users.length; i++) {
      let password = "";
      if (users[i].id === id) {
        if (state.password1 !== "") {
          let hashed = bcrypt.hashSync(state.password1, 10);
          password = hashed;
        } else {
          password = users[i].password;
        }
        users[i].name = state.name;
        users[i].lastname = state.lastname;
        users[i].email = state.email;
        users[i].password = password;
        console.log("USERI ", users[i]);
      }

      youveChanged.push(users[i]);
    }
    sessionStorage.setItem("db", JSON.stringify(youveChanged));
    clearState(state);
    clearInputs(inputs);
    editUserDiv.innerHTML = "";
    renderUsers();
  }
}
