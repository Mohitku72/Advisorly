// LOGIN SYSTEM

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const DEMO_EMAIL = "student@lpu.in";
const DEMO_PASSWORD = "Lpu@123";

// Check existing login
function checkLogin() {
    const savedUser = sessionStorage.getItem("advisorUser");

    if (savedUser) {
        showDashboard(savedUser);
    } else {
        showLogin();
    }
}

function showLogin() {
    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");
}

function showDashboard(email) {
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");

    document.getElementById("studentDisplay").textContent =
        email.split("@")[0];

    displayAppointments();
}

// Login button
loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        sessionStorage.setItem("advisorUser", email);
        loginMessage.textContent = "Login successful!";
        loginMessage.style.color = "green";

        showDashboard(email);
    } else {
        loginMessage.textContent = "Invalid email or password!";
        loginMessage.style.color = "red";
    }
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", function() {
    sessionStorage.removeItem("advisorUser");
    showLogin();
    loginForm.reset();
    loginMessage.textContent = "";
});


// APPOINTMENT SYSTEM

const form = document.getElementById("bookingForm");
const appointmentList = document.getElementById("appointmentList");
const message = document.getElementById("message");

const totalCount = document.getElementById("totalCount");
const upcomingCount = document.getElementById("upcomingCount");

let appointments = JSON.parse(
    localStorage.getItem("advisorAppointments") || "[]"
);

// Get today's date
const dateInput = document.getElementById("date");

function getToday() {
    const today = new Date();
    return new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];
}

dateInput.min = getToday();

// Save appointments
function saveAppointments() {
    localStorage.setItem(
        "advisorAppointments",
        JSON.stringify(appointments)
    );
}

// Display appointments
function displayAppointments() {
    appointmentList.innerHTML = "";

    if (appointments.length === 0) {
        appointmentList.innerHTML =
            '<p class="empty">No appointments booked yet.</p>';
    }

    appointments.forEach(function(appointment) {
        const card = document.createElement("div");
        card.className = "appointment-card";

        const heading = document.createElement("h3");
        heading.textContent = appointment.advisor;
        card.appendChild(heading);

        const details = [
            "Student: " + appointment.name,
            "Date: " + appointment.date,
            "Time: " + appointment.time,
            "Purpose: " + appointment.purpose
        ];

        details.forEach(function(detail) {
            const paragraph = document.createElement("p");
            paragraph.textContent = detail;
            card.appendChild(paragraph);
        });

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel Appointment";
        cancelButton.className = "cancel-btn";

        cancelButton.addEventListener("click", function() {
            cancelAppointment(appointment.id);
        });

        card.appendChild(cancelButton);
        appointmentList.appendChild(card);
    });

    totalCount.textContent = appointments.length;

    const upcoming = appointments.filter(function(appointment) {
        return appointment.date >= getToday();
    });

    upcomingCount.textContent = upcoming.length;
}

// Book appointment
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const advisor = document.getElementById("advisor").value;
    const date = dateInput.value;
    const time = document.getElementById("time").value;
    const purpose = document.getElementById("purpose").value.trim();

    if (!name || !advisor || !date || !time || !purpose) {
        message.textContent = "Please fill all fields.";
        message.style.color = "red";
        return;
    }

    if (date < getToday()) {
        message.textContent = "Please select a future date.";
        message.style.color = "red";
        return;
    }

    // Check booked slot
    const alreadyBooked = appointments.some(function(appointment) {
        return appointment.advisor === advisor &&
               appointment.date === date &&
               appointment.time === time;
    });

    if (alreadyBooked) {
        message.textContent = "This time slot is already booked!";
        message.style.color = "red";
        return;
    }

    const newAppointment = {
        id: Date.now(),
        name: name,
        advisor: advisor,
        date: date,
        time: time,
        purpose: purpose
    };

    appointments.push(newAppointment);

    saveAppointments();
    displayAppointments();

    message.textContent = "Appointment booked successfully!";
    message.style.color = "green";

    form.reset();
    dateInput.min = getToday();
});

// Cancel appointment
function cancelAppointment(id) {
    appointments = appointments.filter(function(appointment) {
        return appointment.id !== id;
    });

    saveAppointments();
    displayAppointments();

    message.textContent = "Appointment cancelled successfully!";
    message.style.color = "green";
}

// Start application
checkLogin();