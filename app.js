function r_e(id) {
  return document.querySelector(`#${id}`);
}

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
