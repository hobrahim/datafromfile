var stripe = Stripe(
  "pk_live_51OEvPCFe6QKUExUDJY5E9iaoaFtHXCC3LUn5bmZZhVGn2tR0igRrEIH41MoOGak4SSrOYHND2mppubjQikNR1EGN00WarewfOK"
);

document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatusAndUpdateUI();
  setupPlanSelectionHandlers();
  // setupPlanToggle();
});

function checkLoginStatusAndUpdateUI() {
  const storedUserMail = localStorage.getItem('user_email');
  // fetch("https://us-central1-extract-1-402612.cloudfunctions.net/check-login")
  //   .then((response) => response.json())
  //   .then((data) => {

  const button4 = document.querySelector(".login-button");
  const button3 = document.querySelector(".btn-getstarted")
  const logoutButton = document.querySelector(".logout-button");
  const manageSubButton = document.querySelector(
    ".manage-subscription-button"
  );
  

  if (storedUserMail) {
    button4.style.display = "none";
    button3.style.display = "none"
    logoutButton.style.display = "block";
    manageSubButton.style.display = "block";
  } else {

    button4.style.display = "block";
    logoutButton.style.display = "none";
    manageSubButton.style.display = "none";
  }
  // });
}

function logout() {
  localStorage.removeItem("user_email");
  window.location.href = "login.html";
}

function manageSubscription() {
  const user_email = localStorage.getItem("user_email");
  if (user_email) {
    fetch("https://us-central1-extract-1-402612.cloudfunctions.net/login/manage-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_email }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const { redirectUrl } = data;
        window.location.href = redirectUrl;
      })
      .catch((error) => {
        // This will catch the error thrown from the conflict response
        alert(error.message);
        // Optionally, redirect the user to the manage subscription page
        window.location.href = "index.html";
      });
  } else {
    window.location.href = "login.html";
  }

}

function setupPlanSelectionHandlers() {
  const planButtons = document.querySelectorAll(".text-plan");
  planButtons.forEach((a) => {
    a.addEventListener("click", function () {
      const planName = this.parentNode.querySelector("h3").innerText;
      handlePlanSelection(planName);
    });
  });
}

function handlePlanSelection(planName) {
  // fetch("https://us-central1-extract-1-402612.cloudfunctions.net/check-login")
  // .then((response) => response.json())
  // .then((data) => {
  const storedUserMail = localStorage.getItem('user_email');
  if (storedUserMail) {
    createCheckoutSession(planName, storedUserMail);
  } else {
    window.location.href = "login.html";
  }
  // });
}

function createCheckoutSession(planName, userEmail) {
  const planIdMapping = {
    "Individual Monthly Plan": "price_1ObrfnFe6QKUExUDDxFZSKt7",
    "Small Office Monthly Plan": "price_1ObrfmFe6QKUExUDJpmjHRjv",
    "Enterprise Monthly Plan": "price_1ObrfkFe6QKUExUDy33fnwaL",
    "Individual Yearly Plan": "price_1ObrfiFe6QKUExUDFw0z7Tut",
    "Small Office Yearly Plan": "price_1ObrfgFe6QKUExUDU6CPJQ71",
    "Enterprise Yearly Plan": "price_1Obrf6Fe6QKUExUDDO45KL4N",
  };

  const planId = planIdMapping[planName];
  if (!planId) {
    alert("Plan not found");
    return;
  }

  fetch("https://us-central1-extract-1-402612.cloudfunctions.net/login/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId: planId, user_email: userEmail }),
  })
    .then((response) => {
      if (!response.ok && response.status === 409) {
        // Handle the conflict response
        return response.json().then((data) => {
          throw new Error(data.error);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Redirect to Stripe Checkout
      return stripe.redirectToCheckout({ sessionId: data.sessionId });
    })
    .catch((error) => {
      // This will catch the error thrown from the conflict response
      alert(error.message);
      // Optionally, redirect the user to the manage subscription page
      // window.location.href = "/manage-subscription";
      manageSubscription();
    });
}

function handleFormSubmit(event) {
  event.preventDefault();
  console.log("Contact Form submitted!");
  // Logic to submit contact form data
}

function handleDownload(event) {
  console.log(`Download button for ${event.target.textContent} clicked!`);
  // Logic for download action
}
function toggleNav() {
  if (window.innerWidth <= 768) { // Adjust 768 to your mobile breakpoint
    var navLinks = document.getElementById("navLinks");
    var hamburgerIcon = document.querySelector(".hamburger-icon");

    if (navLinks.style.display === "flex") {
      navLinks.style.display = "none";
      hamburgerIcon.classList.remove("active");
    } else {
      navLinks.style.display = "flex";
      hamburgerIcon.classList.add("active");
    }
  }
}

function closeNav() {
  if (window.innerWidth <= 768) { // Adjust 768 to your mobile breakpoint
    var navLinks = document.getElementById("navLinks");
    var hamburgerIcon = document.querySelector(".hamburger-icon");
    navLinks.style.display = "none";
    hamburgerIcon.classList.remove("active");
  }
}



function setupPlanToggle() {
  var planToggle = document.getElementById("plan-toggle");
  var monthlyPlans = document.querySelectorAll(".plan-monthly");
  var yearlyPlans = document.querySelectorAll(".plan-yearly");
  var monthlyMiddle = document.querySelectorAll(".middle-card");
  var yearlyMiddle = document.querySelectorAll(".yearly-middle-card");

  planToggle.addEventListener("change", function () {
    toggleVisibility(yearlyPlans, planToggle.checked);
    toggleVisibility(yearlyMiddle, planToggle.checked);
    toggleVisibility(monthlyPlans, !planToggle.checked);
    toggleVisibility(monthlyMiddle, !planToggle.checked);
  });

  planToggle.dispatchEvent(new Event("change"));
}

function toggleVisibility(elements, show) {
  elements.forEach((element) => {
    element.style.display = show ? "flex" : "none";
  });
}
