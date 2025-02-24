(function () {
  const signInModal = document.querySelector(".sign-in");
  const signInOpenButton = document.querySelector(".nav__link--sign-js");
  const signInCloseButton = signInModal.querySelector(".modal__close");
  const signInForm = document.forms.signIn;
  const signInLoader = signInModal.querySelector(".loader--js");
  const isLogin = localStorage.getItem("token");

  if (isLogin) {
    rerenderLinks();
  }

  interactiveWindow(signInModal, signInOpenButton, signInCloseButton);

  const login = (event) => {
    event.preventDefault();
    const email = signInForm.elements.email;
    const password = signInForm.elements.password;
    const inputs = [...signInForm.querySelectorAll("input")];

    let errors = {};
    let requiredInputs = [];

    clearForm();

    if (!isEmailValid(email.value)) {
      errors.email =
        "Please enter a valid email address (your entry is not in the format 'somebody@example.com')";
    } else {
      setSuccessText(email);
    }

    if (password.value.length <= 6) {
      errors.password = "The password must be more than 6 characters";
    } else {
      setSuccessText(password);
    }

    inputs.forEach((input) => {
      if (input.hasAttribute("required")) {
        requiredInputs.push(input);
      }
    });

    requiredInputs.forEach((input) => {
      if (!input.value.length) {
        errors[input.name] = "This field is required";
      }
    });

    if (Object.keys(errors).length) {
      Object.keys(errors).forEach((key) => {
        const messageError = errors[key];
        const input = signInForm.elements[key];
        setErrorText(input, messageError);
      });
    } else {
      const data = {
        email: email.value,
        password: password.value,
      };
      signInLoader.classList.add("hidden");
      sendRequest({
        url: "/api/users/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.success) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.userId);
            showMessage("You have successfully sign in!", "success");
            rerenderLinks();
            setTimeout(() => {
              location.pathname = "/profile.html";
            }, 2000);
          } else {
            throw response;
          }
        })
        .catch((error) => {
          if (error._message) console.log(error._message);
          showMessage("No email/password combination found!", "error");
        })
        .finally(() => {
          interactiveModal(signInModal);
          signInLoader.classList.add("hidden");
          clearForm();
          signInForm.reset();
        });
    }
  };

  signInForm.addEventListener("submit", login);
})();
