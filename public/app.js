// GLOBAL FUNCTIONS
// grab an element based on the ID
function r_e(id) {
  return document.querySelector(`#${id}`);
}
// message bar functions
function configure_message_bar(msg) {
  r_e("message-bar").innerHTML = msg;

  r_e("message-bar").classList.remove("is-hidden");

  setTimeout(() => {
    r_e("message-bar").classList.add("is-hidden");
    r_e("message-bar").innerHTML = "";
  }, 3000);
}
function configure_checkin_message_bar(eventId, msg) {
  const msgbar = document.getElementById(`checkin-message-bar-${eventId}`);
  msgbar.innerHTML = msg;

  // show the message bar
  msgbar.classList.remove("is-hidden");

  setTimeout(() => {
    msgbar.classList.add("is-hidden");
    msgbar.innerHTML = "";
  }, 5000);
}

// NAVBAR
// mobile burger
r_e("burger").addEventListener("click", () => {
  r_e("nav-links").classList.toggle("is-active");
});
// NAVBAR CHANGES BASED ON USER STATUS
function configure_nav_bar(nameuser) {
  // check if there is a current user
  let signedinlinks = document.querySelectorAll(".signedin");
  let signedoutlinks = document.querySelectorAll(".signedout");

  if (nameuser) {
    signedinlinks.forEach((l) => {
      l.classList.remove("is-hidden");
    });
    signedoutlinks.forEach((l) => {
      l.classList.add("is-hidden");
    });
  } else {
    signedinlinks.forEach((l) => {
      l.classList.add("is-hidden");
    });
    signedoutlinks.forEach((l) => {
      l.classList.remove("is-hidden");
    });
  }
}

// ADD EVENT FUNCTIONALITY
let add_btn = r_e("add_btn");
let add_mod = r_e("add-mod");
let add_bg = r_e("add-bg");
let event_form = r_e("event-form");

add_btn?.addEventListener("click", () => {
  add_mod.classList.add("is-active");
});
add_bg?.addEventListener("click", () => {
  add_mod.classList.remove("is-active");
});

// add the event to the collection
document
  .querySelector("#event_submit")
  ?.addEventListener("click", async (e) => {
    e.preventDefault();
    let name = document.querySelector("#event_name").value;
    let location = document.querySelector("#event_location").value;
    let date = document.querySelector("#event_date").value;
    let time = document.querySelector("#event_time").value;
    let type = document.querySelector("#event_type").value;
    let description = document.querySelector("#event_description").value;
    let imageUpload = document.querySelector("#image_upload").files[0];

    if (
      !name ||
      !location ||
      !date ||
      !time ||
      !type ||
      !description ||
      !imageUpload
    ) {
      r_e("eventerrmsg").classList.remove("is-hidden");
      // make text color red
      r_e("eventerrmsg").classList.add("has-text-danger");
      // show the error message
      r_e("eventerrmsg").innerHTML = "Please fill out all of the fields";

      setTimeout(() => {
        r_e("eventerrmsg").classList.add("is-hidden");
        r_e("eventerrmsg").innerHTML = "";
      }, 5000);
    }

    const storageRef = firebase
      .storage()
      .ref(`event_images/${imageUpload.name}`);
    storageRef
      .put(imageUpload)
      .then((uploadTaskSnapshot) => uploadTaskSnapshot.ref.getDownloadURL())
      .then((imageUrl) => {
        // store event info in the firebase db as a new doc
        let event = {
          name: name,
          location: location,
          date: date,
          time: time,
          type: type,
          description: description,
          image: imageUrl,
        };

        return db.collection("events").add(event);
      })
      .then(() => {
        configure_message_bar("Event added successfully!");
        alert("Form Submitted!");
        add_mod.classList.remove("is-active");
        event_form.reset();
        show_events(true);
      });
  });

// DELETE EVENT FUNCTIONALITY
function deleteEvent(eventId) {
  let eventDoc = db.collection("events").doc(eventId);

  eventDoc.get().then(function (doc) {
    if (doc.exists) {
      let imageUrl = doc.data().image;

      if (imageUrl) {
        let storageRef = firebase.storage().refFromURL(imageUrl);

        storageRef.delete().then(function () {
          eventDoc.delete().then(function () {
            configure_message_bar("Event and image deleted successfully!");
            show_events(true);
          });
        });
      } else {
        eventDoc.delete().then(function () {
          configure_message_bar("Event deleted successfully!");
          show_events(true);
        });
      }
    }
  });
}

// DISPLAY EVENTS
function show_events(isAdmin) {
  db.collection("events")
    .get()
    .then((data) => {
      let docs = data.docs;

      // Sort events by date (newest to oldest)
      docs.sort((a, b) => {
        let dateA = new Date(a.data().date);
        let dateB = new Date(b.data().date);
        return dateB - dateA;
      });

      let html = ``;

      firebase.auth().onAuthStateChanged((user) => {
        let userEmail = user ? user.email : null;

        docs.forEach((event) => {
          let eventData = event.data();
          let date = new Date(eventData.date);
          let formattedDate = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          });

          let eventTime = new Date("1970-01-01T" + eventData.time);
          let formattedTime = eventTime.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });

          // Check if user has attended/checked in
          let isCheckedIn =
            userEmail && eventData.attendance?.includes(userEmail);

          // Generate the dynamic event info
          html += `<div class="columns mt-2">
            <div class="column is-12" style="max-width: 1300px; margin: 0 auto">
            <div class="box">
            <div class="columns">
              <div class="column has-text-centered">
                <img src="${
                  eventData.image || "indeximages/a1.png"
                }" alt="Event" />
              </div>
              <div class="column is-two-thirds">
                <p class="is-size-3 darkbrown has-text-weight-bold">${
                  eventData.name
                }${
            isAdmin
              ? `<button class="button learn_btn deletebtn is-pulled-right" onclick="deleteEvent('${event.id}')">X</button>`
              : ""
          }</p><br />
                <p class="is-size-5 darkbrown">Location: ${
                  eventData.location
                }</p>
                <p class="is-size-5 darkbrown">Date: ${formattedDate}</p>
                <p class="is-size-5 darkbrown">Time: ${formattedTime}</p>
                <p class="is-size-5 darkbrown">Type: ${eventData.type}</p>
                <br />
                <p class="is-size-5 darkbrown">${eventData.description}</p>
                <br/>
                <button class="button checkin_btn ${
                  isCheckedIn ? "checked-in" : ""
                }" data-event-id="${event.id}" ${
            isCheckedIn ? "disabled" : ""
          }>${isCheckedIn ? "Checked In" : "Check In"}</button>
                <div class="checkin-message-bar is-italic has-text-weight-bold pt-3" id="checkin-message-bar-${
                  event.id
                }"></div>`;

          if (isAdmin) {
            const attendance = eventData.attendance || [];
            if (attendance.length > 0) {
              html += `<div style="background-color:#e1d2b8"><p class="pl-4 pr-4 pb-2 pt-2 has-text-weight-bold">Total Check Ins: ${attendance.length}</p><select class="att-dropdown"><option value="default" selected>Attendee Emails</option>`;
              attendance.forEach((email) => {
                html += `<option class="pl-5 pr-5 pb-2" style="background-color:#e1d2b8">${email}</option>`;
              });
              html += `</select></div>`;
            }
          }

          html += `</div></div></div></div></div>`;
        });

        document.querySelector("#all_events").innerHTML = html;

        // CHECKIN BUTTON FUNCTIONALITY
        const checkinbuttons = document.querySelectorAll(".checkin_btn");

        checkinbuttons.forEach((button) => {
          button.addEventListener("click", () => {
            let user = firebase.auth().currentUser;
            let eventId = button.getAttribute("data-event-id");

            if (user) {
              let useremail = user.email;
              let event = firebase
                .firestore()
                .collection("events")
                .doc(eventId);
              event.update({
                attendance: firebase.firestore.FieldValue.arrayUnion(useremail),
              });
              button.innerText = "Checked In";
              button.classList.add("checked-in");
              button.disabled = true;
              configure_checkin_message_bar(
                eventId,
                "You are now checked in. Welcome to our event!"
              );
            } else {
              configure_checkin_message_bar(
                eventId,
                "Please sign in to check in!"
              );
            }
          });
        });
      });
    })
    .catch((err) => {
      document.querySelector("#all_events").innerHTML = `
          <p class="has-text-danger">Failed to load events. Please try again later.</p>`;
    });
}
show_events();

// SIGN UP, SIGN IN, SIGN OUT FUNCTIONALITY
// sign in JS
let signinbtn = r_e("signinbtn");
let signinmod = r_e("si-mod");
let signinbg = r_e("si-bg");
let signinform = r_e("si-form");

signinbtn.addEventListener("click", () => {
  signinmod.classList.add("is-active");
});

signinbg.addEventListener("click", () => {
  signinmod.classList.remove("is-active");
});

// sign up in JS
let signupbtn = r_e("signupbtn");
let signupmod = r_e("su-mod");
let signupbg = r_e("su-bg");
let signupsubmit = r_e("su-submit");
let signupform = r_e("su-form");

signupbtn.addEventListener("click", () => {
  signupmod.classList.add("is-active");
});

signupbg.addEventListener("click", () => {
  signupmod.classList.remove("is-active");
});

// sign out code
let signoutbtn = r_e("signoutbtn");
signoutbtn.addEventListener("click", () => {
  // test event listener works
  // display message to let user know they signed out
  auth.signOut().then(() => {
    configure_message_bar("You are now logged out!");
    signinmod.classList.remove("is-active");
    signinform.reset();
  });
  r_e("nav-links").classList.remove("is-active");
});

// SIGN UP/SIGN IN FORMS
// Sign up form
r_e("signup-form").addEventListener("submit", (event) => {
  event.preventDefault();

  let email = r_e("email").value;
  let pass = r_e("pass").value;
  let firstname = r_e("first_name").value;
  let lastname = r_e("last_name").value;
  // check that all fields are filled
  if (!email || !pass || !firstname || !lastname) {
    // show error if all the fields are not filled
    r_e("messages3").classList.remove("is-hidden");
    r_e("messages3").classList.add("has-text-danger");
    r_e("messages3").innerHTML = "Please fill out all fields.";
    // hide error message after a few seconds
    setTimeout(() => {
      r_e("messages3").classList.add("is-hidden");
      r_e("messages3").innerHTML = "";
    }, 5000);
    return;
  }
  // create account
  auth
    .createUserWithEmailAndPassword(email, pass)
    .then((user) => {
      configure_message_bar(`You have successfully signed up. Welcome!`);
      signupmod.classList.remove("is-active");

      db.collection("users").doc(user.user.email).set({
        admin: 0,
        first_name: firstname,
        last_name: lastname,
        email: email,
      });
      r_e("signup-form").reset();
    })
    // show account creation error if email or password can't be used
    .catch((error) => {
      r_e("messages3").classList.remove("is-hidden");
      r_e("messages3").classList.add("has-text-danger");
      r_e("messages3").innerHTML = error.message;
      // hide error message after a few seconds
      setTimeout(() => {
        r_e("messages3").classList.add("is-hidden");
        r_e("messages3").innerHTML = "";
      }, 5000);
    });
  r_e("nav-links").classList.remove("is-active");
});

// Sign in form
r_e("si-form").addEventListener("submit", (event) => {
  event.preventDefault();

  let email = r_e("email2").value;
  let pass = r_e("pass2").value;

  // check that email and passwords are filled
  if (!email || !pass) {
    r_e("messages2").classList.remove("is-hidden");
    r_e("messages2").classList.add("has-text-danger");
    r_e("messages2").innerHTML = "Please fill out both email and password.";
    return;
  }

  auth
    .signInWithEmailAndPassword(email, pass)
    .then((user) => {
      db.collection("users")
        .doc(user.user.email)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const firstname = doc.data().first_name;
            configure_message_bar(`Welcome back ${firstname}!`);
          }
        });
      signinmod.classList.remove("is-active");
      r_e("signup-form").reset();
    })
    // show error message on modal if email or password is wrong
    .catch((err) => {
      r_e("messages2").classList.remove("is-hidden");
      r_e("messages2").classList.add("has-text-danger");
      r_e("messages2").innerHTML =
        "Email or password is invalid. Please try again.";
    });
  // hide error message after a few seconds
  setTimeout(() => {
    r_e("messages2").classList.add("is-hidden");
    r_e("messages2").innerHTML = "";
  }, 5000);

  r_e("nav-links").classList.remove("is-active");
});

// ADMIN DASHBOARD
auth.onAuthStateChanged((user) => {
  if (user) {
    configure_nav_bar(auth.currentUser.email);
    r_e("email-nav").innerHTML = auth.currentUser.email;

    db.collection("users")
      .doc(user.email)
      .get()
      .then((d) => {
        // possible admin values are 0 or 1
        // admin value of 1 means admin user. a value of 0 means no admin
        let admin = d.data().admin;

        if (admin == 0) {
          // a signed-in user can only view a list of users
          all_users("view");
        } else {
          // a signed-in admin user can view and edit user roles
          all_users("edit");
        }

        update_status(1, admin, user.uid, user.email);
      });
  } else {
    configure_nav_bar();
    // don't show user information as if they aren't authenticated
    all_users(0);
    update_status(0, "", "", "");
  }
});

// all non-admin users (column 3)
function all_users(mode) {
  // view mode shows list of users, edit mode allows admin to change user roles, 0 means that user is not authenticated
  if (mode == 0) {
    r_e("registered_users").innerHTML = "";
    r_e("admin_users").innerHTML = "";
    return;
  }

  // NON-ADMIN USERS
  db.collection("users")
    .where("admin", "==", 0)
    .get()
    .then((data) => {
      mydocs = data.docs;
      let html = ``;
      mydocs.forEach((d) => {
        html += `<p>${d.id}</p>`;
        if (mode == "edit")
          html += `<button id="${d.id}" onclick="make_admin('${d.id}')">Make Admin</button></p>`;
      });
      r_e("registered_users").innerHTML = html;
    });

  // ADMIN USERS
  db.collection("users")
    .where("admin", "==", 1)
    .get()
    .then((data) => {
      mydocs = data.docs;
      let html = ``;
      mydocs.forEach((d) => {
        // only admins can change user status
        if (d.id != auth.currentUser.email) html += `<p>${d.id}</p>`;
        if (mode == "edit" && d.id != auth.currentUser.email)
          html += `<button id="${d.id}" onclick="make_regular_user('${d.id}')">Make Regular User</button></p>`;
      });
      r_e("admin_users").innerHTML = html;
    });
}
auth.onAuthStateChanged((user) => {
  if (user) {
    // Check admin role from Firestore
    db.collection("users")
      .doc(user.email)
      .get()
      .then((doc) => {
        const isAdmin = doc.data()?.admin === 1;
        toggleAdminNav(isAdmin);
      });
  } else {
    // Hide admin nav if no user is logged in
    toggleAdminNav(false);
  }
});
function toggleAdminNav(isAdmin) {
  const adminNav = r_e("admin_nav");
  // Show or hide ADMIN NAV button
  if (isAdmin) {
    adminNav.classList.remove("is-hidden");
  } else {
    adminNav.classList.add("is-hidden");
  }
}

// Toggle event button for admins
auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection("users")
      .doc(user.email)
      .get()
      .then((doc) => {
        const isAdmin = doc.data()?.admin === 1;
        toggleAddEventButton(isAdmin);
      })
      .catch((err) => {
        toggleAddEventButton(false);
      });
  } else {
    toggleAddEventButton(false);
  }
});
function toggleAddEventButton(isAdmin) {
  const addEventButton = r_e("add_btn");
  if (isAdmin) {
    addEventButton.classList.remove("is-hidden");
  } else {
    addEventButton.classList.add("is-hidden");
  }
}

// Show delete event button only for admins
auth.onAuthStateChanged((user) => {
  if (user) {
    // Check if the user is an admin
    db.collection("users")
      .doc(user.email)
      .get()
      .then((doc) => {
        const isAdmin = doc.data()?.admin === 1;
        show_events(isAdmin);
      })
      .catch((err) => {
        show_events(false);
      });
  } else {
    show_events(false);
  }
});

// FUNCTIONS FOR ADMINS
function make_admin(id) {
  db.collection("users")
    .doc(id)
    .set({
      admin: 1,
    })
    .then(() => all_users("edit"));
}
function make_regular_user(id) {
  db.collection("users")
    .doc(id)
    .set({
      admin: 0,
    })
    .then(() => all_users("edit"));
}
function update_status(yn, admin, uid, email) {
  r_e("logged_in_user").innerHTML = yn;
  r_e("is_user_admin").innerHTML = admin;
  (r_e("current_user_id").innerHTML = uid),
    (r_e("user_email").innerHTML = email);
}

// PAGE NAVIGATION
// default document title is "Home" when page is loaded
document.addEventListener("DOMContentLoaded", () => {
  readURL();
  document.title = "Home";
});

// add page listener
// url function, check when url is different
function readURL() {
  const url = window.location.href;
  if (url.includes("#home")) {
    setPageToHome();
  } else if (url.includes("#about")) {
    setPageToAbout();
  } else if (url.includes("#events")) {
    setPageToEvents();
  } else if (url.includes("#contact")) {
    setPageToContact();
  } else if (url.includes("admin_nav")) {
    setPageToAdmin();
  } else if (url.includes("#grace")) {
    setPageToGrace();
  } else if (url.includes("#ruby")) {
    setPageToRuby();
  } else if (url.includes("#lacey")) {
    setPageToLacey();
  } else if (url.includes("#shu_lan")) {
    setPageToShuLan();
  } else if (url.includes("#david")) {
    setPageToDavid();
  } else if (url.includes("#abbi")) {
    setPageToAbbi();
  } else {
    setPageToHome();
  }
}

// Run when the URL changes due to navigation
window.addEventListener("hashchange", readURL);

// home page
function setPageToHome() {
  document.title = "Home";
  r_e("hometab").classList.remove("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
  r_e("nav-links").classList.remove("is-active");
}

// about us page
function setPageToAbout() {
  document.title = "About";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.remove("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
  r_e("nav-links").classList.remove("is-active");
}

// events page
function setPageToEvents() {
  document.title = "Events";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.remove("is-hidden");
  r_e("all_events").classList.remove("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
  r_e("nav-links").classList.remove("is-active");
}

// contact us page
function setPageToContact() {
  document.title = "Contact";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.remove("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
  r_e("nav-links").classList.remove("is-active");
}

// eboard member profiles
function setPageToAbbi() {
  document.title = "Abbi Stickels";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.remove("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
}

function setPageToDavid() {
  document.title = "David Izzo";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.remove("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
}

function setPageToGrace() {
  document.title = "Grace Drayton";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.remove("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
}

function setPageToLacey() {
  document.title = "Lacey Coyne";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.remove("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
}

function setPageToRuby() {
  document.title = "Ruby Slavin";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.remove("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
}

function setPageToShuLan() {
  document.title = "Shu Lan Schaut";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.add("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.remove("is-hidden");
}

// admin page
function setPageToAdmin() {
  document.title = "Admin";
  r_e("hometab").classList.add("is-hidden");
  r_e("abouttab").classList.add("is-hidden");
  r_e("eventstab").classList.add("is-hidden");
  r_e("all_events").classList.add("is-hidden");
  r_e("contacttab").classList.add("is-hidden");
  r_e("admintab").classList.remove("is-hidden");
  r_e("about_abbi").classList.add("is-hidden");
  r_e("about_david").classList.add("is-hidden");
  r_e("about_grace").classList.add("is-hidden");
  r_e("about_lacey").classList.add("is-hidden");
  r_e("about_ruby").classList.add("is-hidden");
  r_e("about_shu_lan").classList.add("is-hidden");
  r_e("nav-links").classList.remove("is-active");
}

// onload
async function onloadImage() {
  const imgElement = document.getElementById("upcoming_event_img_placeholder");
  try {
    const folderRef = firebase.storage().ref("uploads");
    const result = await folderRef.listAll();

    if (result.items.length == 0) {
      console.log("Error: no images found in database.");
      return;
    }

    const fileDataList = await Promise.all(
      result.items.map(async (item) => {
        const metadata = await item.getMetadata();
        return {
          name: metadata.name,
          fullPath: metadata.fullPath,
          updated: new Date(metadata.updated),
        };
      })
    );

    // finding most recently uploaded image
    let mostRecentFile = fileDataList[0];
    for (let i = 0; i < fileDataList.length; i++) {
      if (fileDataList[i].updated > mostRecentFile.updated) {
        mostRecentFile = fileDataList[i];
      }
    }

    // console.log(mostRecentFile.name);
    // const mrfRef = folderRef.child(mostRecentFile.fullPath);
    const mrfRef = firebase.storage().ref(mostRecentFile.fullPath);
    // console.log("fullPath: " + mostRecentFile.fullPath);
    const url = await mrfRef.getDownloadURL();
    // console.log("reached");
    // console.log("new url: " + url);

    imgElement.src = url;
  } catch (error) {
    console.log("Error loading image.");
  }
}

window.onload = onloadImage;

// HOME PAGE IMG UPLOAD
const fileInput = document.querySelector(
  "#upcoming_event_img input[type=file]"
);
const imageElement = document.getElementById("upcoming_event_img_placeholder");
const fileNameElement = document.querySelector(
  "#upcoming_event_img .file-name"
);

fileInput.addEventListener("change", async () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const storageRef = firebase.storage().ref(`uploads/${file.name}`);
    fileNameElement.textContent = file.name;

    try {
      // Upload file to Firebase Storage
      const snapshot = await storageRef.put(file);
      alert("image uploaded");
      console.log("Uploaded a blob or file!");

      // Get the download URL
      const downloadURL = await snapshot.ref.getDownloadURL();
      console.log("File available at", downloadURL);

      // Set the image source to the Firebase URL
      imageElement.src = downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }
});

// // HOME PAGE IMG UPLOAD old
// const fileInput = document.querySelector(
//   "#upcoming_event_img input[type=file]"
// );
// const imageElement = document.getElementById("upcoming_event_img_placeholder");
// const fileNameElement = document.querySelector(
//   "#upcoming_event_img .file-name"
// );
// fileInput.addEventListener("change", () => {
//   if (fileInput.files.length > 0) {
//     const file = fileInput.files[0];
//     const reader = new FileReader();
//     fileNameElement.textContent = file.name;
//     reader.onload = (event) => {
//       imageElement.src = event.target.result;
//     };
//     reader.readAsDataURL(file);
//   }
// });

// Hide Event upload on home page
auth.onAuthStateChanged((user) => {
  const fileUploadElement = document.getElementById("upcoming_event_img");

  if (user) {
    // Fetch user document from Firestore using the authenticated user's email
    db.collection("users")
      .doc(user.email)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const admin = doc.data().admin; // Retrieve the 'admin' field

          if (admin === 1) {
            // Show the file upload section if the user is an admin
            fileUploadElement.style.display = "block";
          } else {
            // Hide the file upload section if the user is not an admin
            fileUploadElement.style.display = "none";
          }
        } else {
          console.error("No such document for the user!");
          fileUploadElement.style.display = "none"; // Hide the element by default
        }
      })
      .catch((error) => {
        console.error("Error fetching user document:", error);
        fileUploadElement.style.display = "none"; // Hide the element in case of an error
      });
  } else {
    // Hide the file upload section if no user is authenticated
    fileUploadElement.style.display = "none";
  }
});
