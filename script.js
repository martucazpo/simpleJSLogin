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
console.log(db)
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
    }
  } else {
    regMessageDiv.innerHTML =
      "<small style='color:red;'>Passwords do not match</small>";
  }
  //clears inputs, cleans out state
  clearInputs(inputs);
  clearState(state);
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
      } else {
        //if password fails, send message
        logMessageDiv.innerHTML =
          "<small style='color:red;'>There was a problem with the password</small>";
      }
    } else {
      //if the email was not in the database, send message
      logMessageDiv.innerHTML =
        "<small style='color:red;'>The Email was not in our database</small>";
    }
  }
  //clears inputs
  clearInputs(inputs);
  clearState(state);
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
