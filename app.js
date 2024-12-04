// FUNCTIONS
function r_e(id) {
  return document.querySelector(`#${id}`);
}

// NAVBAR
// mobile burger
r_e("burger").addEventListener("click", () => {
  r_e("nav-links").classList.toggle("is-active");
});

// USER AUTHENTIFICATION

//add event js
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

// adding an event to a collection
document.querySelector("#event_submit")?.addEventListener("click", () => {
  let name = document.querySelector("#event_name").value;
  let location = document.querySelector("#event_location").value;
  let date = document.querySelector("#event_date").value;
  let time = document.querySelector("#event_time").value;
  let type = document.querySelector("#event_type").value;
  let description = document.querySelector("#event_description").value;
  let upload = document.querySelector("#image_upload").value;

  let event = {
    name: name,
    location: location,
    date: date,
    time: time,
    type: type,
    description: description,
    upload: upload,
  };

  db.collection("events")
    .add(event)
    .then(() => {
      configure_message_bar("Event added successfully!");
      add_mod.classList.remove("is-active");
      e.preventDefault();
    });
  show_events(true);
  event_form.reset();
});

function show_events(isAdmin) {
  db.collection("events")
    .get()
    .then((data) => {
      let docs = data.docs;

      // Sort events by date (newest first)
      docs.sort((a, b) => {
        let dateA = new Date(a.data().date);
        let dateB = new Date(b.data().date);
        return dateB - dateA;
      });

      let html = ``;

      // Loop through events and generate HTML
      docs.forEach((event) => {
        let date = new Date(event.data().date);
        let formattedDate = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        let eventTime = new Date("1970-01-01T" + event.data().time + "Z");
        let formattedTime = eventTime.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        html += `<div class="columns mt-2">
        <div class="column is-12">
        <div class="box">
        <div class="columns">
          <div class="column is-5 ml-4">
            <img src="${
              event.data().image || "indeximages/a1.png"
            }" class="smaller_image" alt="Event" />
          </div>
          <div class="column is-7 mt-4">
            <p class="is-size-3 darkbrown has-text-weight-bold">${
              event.data().name
            }</p><br />
            <p class="is-size-5 darkbrown">Location: ${
              event.data().location
            }</p>
            <p class="is-size-5 darkbrown">Date: ${formattedDate}</p>
            <p class="is-size-5 darkbrown">Time: ${formattedTime}</p>
            <p class="is-size-5 darkbrown">Type: ${event.data().type}</p>
            <br />
            <p class="is-size-5 darkbrown">${event.data().description}</p>
            <br/>
            <button class="button checkin_btn" data-event-id="${
              event.id
            }">Check In</button><div class="checkin-message-bar is-italic has-text-weight-bold pt-3" id="checkin-message-bar-${
          event.id
        }"></div>`;

        // Add delete button for admin users
        if (isAdmin) {
          const attendance = event.data().attendance || [];
          if (attendance.length > 0) {
            html += `<br /><div style="background-color:#e1d2b8"><p class="is-size-4 mt-3 p-2 has-text-weight-bold">Attendance</p><p class="pl-4 pr-4 is-italic has-text-weight-bold">Total Count: ${attendance.length}</p><p class="pl-4 pr-4 is-italic has-text-weight-bold" style="background-color:#e1d2b8">Attendees:</p><select class="att-dropdown"><option value="default" selected>Attendee Emails</option>`;
            attendance.forEach((email) => {
              html += `<option class="pl-5 pr-5 pb-2" style="background-color:#e1d2b8">${email}</option>`;
            });
            html += `</select>`;
          }

          html += `</div><br />
            <button class="button learn_btn" 
              onclick="deleteEvent('${event.id}')">
              Delete Event
            </button>`;
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
            let event = firebase.firestore().collection("events").doc(eventId);
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
    })
    .catch((err) => {
      console.error("Error fetching events:", err);
      document.querySelector("#all_events").innerHTML = `
        <p class="has-text-danger">Failed to load events. Please try again later.</p>`;
    });
}
show_events();

// sign in JS
let signinbtn = r_e("signinbtn");
let signinmod = r_e("si-mod");
let signinbg = r_e("si-bg");
let signinform = r_e("si-form");

signinbtn?.addEventListener("click", () => {
  signinmod.classList.add("is-active");
});

signinbg?.addEventListener("click", () => {
  signinmod.classList.remove("is-active");
});

// sign up in JS
let signupbtn = r_e("signupbtn");
let signupmod = r_e("su-mod");
let signupbg = r_e("su-bg");
let signupsubmit = r_e("su-submit");
let signupform = r_e("su-form");

signupbtn?.addEventListener("click", () => {
  signupmod.classList.add("is-active");
});

signupbg?.addEventListener("click", () => {
  signupmod.classList.remove("is-active");
});

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

  // Show the message bar
  msgbar.classList.remove("is-hidden");

  setTimeout(() => {
    msgbar.classList.add("is-hidden");
    msgbar.innerHTML = "";
  }, 5000); // 5 seconds timeout
}

// sign out code
let signoutbtn = r_e("signoutbtn");
signoutbtn?.addEventListener("click", () => {
  // test event listener works
  // display message to let user know they signed out
  auth.signOut().then(() => {
    configure_message_bar("You are now logged out!");
  });
});

// Sign up
r_e("submit_user")?.addEventListener("click", () => {
  let email = r_e("email").value;
  let pass = r_e("pass").value;
  // console.log(email, pass);

  auth.createUserWithEmailAndPassword(email, pass).then((user) => {
    configure_message_bar(`${auth.currentUser.email} has signed up!`);
    signupmod.classList.remove("is-active");

    console.log(user.user.uid);
    db.collection("users").doc(user.user.email).set({
      admin: 0,
    });
  });
});

// Sign in
r_e("submit_user_")?.addEventListener("click", () => {
  let email = r_e("email2").value;
  let pass = r_e("pass2").value;
  // console.log(email, pass);

  auth
    .signInWithEmailAndPassword(email, pass)
    .then((user) => {
      configure_message_bar(`Welcome back ${auth.currentUser.email}!`);
      signinmod.classList.add("is-hidden");
    })
    .catch((err) => {
      // show the paragraph with ID messages
      r_e("messages2").classList.remove("is-hidden");
      // make text color red
      r_e("messages2").classList.add("has-text-danger");
      // show the error message
      r_e("messages2").innerHTML =
        "Email or password is invalid. Please try again.";
    });
});

function configure_nav_bar(nameuser) {
  // check if there is a current user

  let signedinlinks = document.querySelectorAll(".signedin");
  let signedoutlinks = document.querySelectorAll(".signedout");

  if (nameuser) {
    // user exists

    // show all elements with the class signedin

    signedinlinks.forEach((l) => {
      l.classList.remove("is-hidden");
    });

    // hide all elements with the class signedout

    signedoutlinks.forEach((l) => {
      l.classList.add("is-hidden");
    });
  } else {
    // no current user

    // hide all elements with the class signedin
    signedinlinks.forEach((l) => {
      l.classList.add("is-hidden");
    });

    // show all elements with the class signedout

    signedoutlinks.forEach((l) => {
      l.classList.remove("is-hidden");
    });
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log(user.uid);
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
    // don't show user information as user isn't currently authenticated
    all_users(0);
    update_status(0, "", "", "");
  }
});

r_e("signoutbtn")?.addEventListener("click", () => {
  auth.signOut().then(() => {
    // alert("you are signed out");
  });
});

// all non-admin users (column 3)
function all_users(mode) {
  // we know mode can be either 'edit', 'view', or '0'
  // if view mode, only a list of users is shown
  // if edit mode, you can change the user roles
  // if 0, don't show any user details - user isn't authenticated

  if (mode == 0) {
    // don't show any user data
    r_e("registered_users").innerHTML = "";
    r_e("admin_users").innerHTML = "";
    // exit the function and don't run the rest of the code
    return;
  }

  // fill the 3rd column - non admin users
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

  // fill the 4th column - Admin users
  db.collection("users")
    .where("admin", "==", 1)
    .get()
    .then((data) => {
      mydocs = data.docs;
      let html = ``;
      mydocs.forEach((d) => {
        // we want to make sure that current user can't change their own status .. they should remain admin at all times
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
        const isAdmin = doc.data()?.admin === 1; // Admin flag is 1 for admin users
        toggleAdminNav(isAdmin); // Pass the correct admin flag to the function
      })
      .catch((err) => {
        console.error("Error fetching admin data:", err);
      });
  } else {
    // Hide admin nav if no user is logged in
    toggleAdminNav(false);
  }
});
function toggleAdminNav(isAdmin) {
  const adminNav = r_e("admin_nav"); // Get the admin navbar item
  if (isAdmin) {
    adminNav.classList.remove("is-hidden"); // Show the admin button
  } else {
    adminNav.classList.add("is-hidden"); // Hide the admin button
  }
}

// Event button for admins
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in, check their admin status
    db.collection("users")
      .doc(user.email)
      .get()
      .then((doc) => {
        const isAdmin = doc.data()?.admin === 1; // Check if admin flag is set
        toggleAddEventButton(isAdmin); // Toggle the button visibility
      })
      .catch((err) => {
        console.error("Error fetching admin data:", err);
        toggleAddEventButton(false); // Hide the button if there's an error
      });
  } else {
    // No user is logged in, hide the button
    toggleAddEventButton(false);
  }
});
function toggleAddEventButton(isAdmin) {
  const addEventButton = r_e("add_btn"); // Get the Add Event button
  if (isAdmin) {
    addEventButton.classList.remove("is-hidden"); // Show the button
  } else {
    addEventButton.classList.add("is-hidden"); // Hide the button
  }
}

// function renderEvents(isAdmin) {
//   const eventsContainer = r_e("all_events");
//   eventsContainer.innerHTML = ""; // Clear previous content

//   db.collection("events")
//     .get()
//     .then((snapshot) => {
//       snapshot.docs.forEach((doc) => {
//         const event = doc.data();
//         const eventId = doc.id;

//         // Create event element
//         const eventDiv = document.createElement("div");
//         eventDiv.classList.add("columns", "mt-2");

//         show_events();

//         // Add delete button if the user is an admin
//         if (isAdmin) {
//           const deleteButton = document.createElement("button");
//           deleteButton.classList.add(
//             "button",
//             "is-danger",
//             "mt-2",
//             "delete-btn"
//           );
//           deleteButton.textContent = "Delete Event";
//           deleteButton.addEventListener("click", () => deleteEvent(eventId)); // Attach delete event listener

//           // Append the button inside the event details column
//           eventDiv.querySelector(".event-details").appendChild(deleteButton);
//         }

//         eventsContainer.appendChild(eventDiv);
//       });
//     })
//     .catch((err) => {
//       console.error("Error fetching events:", err);
//     });
// }
// Firestore delete event
function deleteEvent(eventId) {
  // Delete the event from Firestore
  db.collection("events")
    .doc(eventId)
    .delete()
    .then(() => {
      configure_message_bar("Event deleted successfully!");
      show_events(true); // Refresh the event list for the admin
    })
    .catch((err) => {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
    });
}
// Show Delete button for only admins
auth.onAuthStateChanged((user) => {
  if (user) {
    // Check if the user is an admin
    db.collection("users")
      .doc(user.email)
      .get()
      .then((doc) => {
        const isAdmin = doc.data()?.admin === 1; // Check admin status
        show_events(isAdmin); // Pass admin status to show_events
      })
      .catch((err) => {
        console.error("Error checking admin role:", err);
        show_events(false); // Render events without delete buttons in case of error
      });
  } else {
    show_events(false); // Render events without delete buttons for logged-out users
  }
});

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
  // console.log("update status");
  // console.log(yn, uid, email)
  r_e("logged_in_user").innerHTML = yn;
  r_e("is_user_admin").innerHTML = admin;
  (r_e("current_user_id").innerHTML = uid),
    (r_e("user_email").innerHTML = email);
}

r_e("home").addEventListener("click", () => {
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
});

r_e("about").addEventListener("click", () => {
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
});

r_e("events").addEventListener("click", () => {
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
});

r_e("contact").addEventListener("click", () => {
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
});

r_e("abbi").addEventListener("click", () => {
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
});

r_e("david").addEventListener("click", () => {
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
});

r_e("grace").addEventListener("click", () => {
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
});

r_e("lacey").addEventListener("click", () => {
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
});

r_e("ruby").addEventListener("click", () => {
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
});

r_e("shu_lan").addEventListener("click", () => {
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
});

r_e("admin").addEventListener("click", () => {
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
});

r_e("learn_more").addEventListener("click", () => {
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
});

// HOME PAGE IMG UPLOAD
const fileInput = document.querySelector(
  "#upcoming_event_img input[type=file]"
);
const imageElement = document.getElementById("upcoming_event_img_placeholder");
const fileNameElement = document.querySelector(
  "#upcoming_event_img .file-name"
);
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    fileNameElement.textContent = file.name;
    reader.onload = (event) => {
      imageElement.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});
// CHECK IN BUTTON
