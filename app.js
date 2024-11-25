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
      alert("New event added!");
    });
});

function show_events() {
  db.collection("events")
    .get()
    .then((data) => {
      let docs = data.docs;

      let html = ``;
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
          <div class="column is-5 ml-4">
            <img src="indeximages/a1.png" class="smaller_image" alt="Event" />
          </div>
          <div class="column is-7 mt-4 mr-4">
            <p class="is-size-3">${event.data().name}</p><br />
            <p class="is-size-4">Location: ${event.data().location}</p>
            <p class="is-size-4">Date: ${formattedDate}</p>
            <p class="is-size-4">Time: ${formattedTime}</p>
            <p class="is-size-4">Type: ${event.data().type}</p>
            <br />
            <p class="is-size-5">${event.data().description}</p>
          </div>
        </div>`;
      });

      document.querySelector("#all_events").innerHTML = html;
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
    console.log("user");
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

  auth.signInWithEmailAndPassword(email, pass).then((user) => {});
});

auth.onAuthStateChanged((user) => {
  if (user) {
    // console.log(user);
    // r_e("info").innerHTML = `<p>You are signed in as ${user.email} </p>`;
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
