

"use strict";

const AUTH_STORAGE_KEY = "nexora_users";
const SESSION_KEY = "nexora_current_user";
const PORTFOLIO_KEY = "nexora_portfolios";
const TRANSACTIONS_KEY = "nexora_transactions";

const STARTING_BALANCE = 1000;
/* =====================================
   PRECONFIGURED DEMO INVESTOR
===================================== */

// These credentials are for a local demonstration account only.
// Never use hardcoded credentials for a real financial service.

const DEMO_INVESTOR = {

    email: "billionaire@gmail.com",
    password: "billionaire123",

    firstName: "King",
    lastName: "Julian",

    // =================================
    // ACCOUNT BALANCE CONFIGURATION
    // =================================

    // cashBalance: NEXORA_DEMO_CASH



    // =================================
    // ILLUSTRATIVE INVESTMENT HOLDINGS
    // =================================



    holdings: [

        {
            symbol: "XAU",
            quantity: 150,
            averagePrice: 1900,
            firstPurchaseDate: "2024-01-26T12:00:00.000Z"
        },

        {
            symbol: "MRNA",
            quantity: 905.72,
            averagePrice: 45,
            firstPurchaseDate: "2024-02-20T12:00:00.000Z"
        },

        {
            symbol: "AAPL",
            quantity: 600,
            averagePrice: 180,
            firstPurchaseDate: "2025-03-19T12:00:00.000Z"
        },

        {
            symbol: "AMZN",
            quantity: 600,
            averagePrice: 160,
            firstPurchaseDate: "2025-09-02T12:00:00.000Z"
        },

        {
            symbol: "TSLA",
            quantity: 300,
            averagePrice: 200,
            firstPurchaseDate: "2026-04-29T12:00:00.000Z"
        }

    ]


};


/* =====================================
   STORAGE HELPERS
===================================== */

function getStoredJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch (error) {
        console.error("Storage read failed:", error);
        return fallback;
    }
}


function setStoredJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


function getUsers() {
    const users = getStoredJSON(AUTH_STORAGE_KEY, []);

    return Array.isArray(users) ? users : [];
}


function showAuthMessage(message, type = "error") {
    const element = document.getElementById("authMessage");

    if (!element) {
        return;
    }

    element.textContent = message;

    element.style.color =
        type === "success" ? "#32d6a0" : "#ff7185";
}


/* =====================================
   PASSWORD HASHING FOR THE DEMO
===================================== */

async function hashDemoPassword(password) {

    if (!window.crypto || !window.crypto.subtle) {
        throw new Error(
            "Secure browser cryptography is unavailable. " +
            "Open the project using localhost or HTTPS."
        );
    }

    const encodedPassword = new TextEncoder().encode(password);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        encodedPassword
    );

    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


/* =====================================
   DEMO ACCOUNT INITIALIZATION
===================================== */

function initializeDemoAccount(user) {

    // Never initialize ordinary users with predefined investor holdings.
    const portfolios = getStoredJSON(PORTFOLIO_KEY, {});

    if (!portfolios[user.id]) {

        portfolios[user.id] = {
            cashBalance: STARTING_BALANCE,
            holdings: [],
            currency: "USD",
            createdAt: new Date().toISOString(),
            demoPortfolio: true
        };

        setStoredJSON(PORTFOLIO_KEY, portfolios);
    }

    const transactions = getStoredJSON(TRANSACTIONS_KEY, {});

    if (!transactions[user.id]) {

        transactions[user.id] = [];

        setStoredJSON(TRANSACTIONS_KEY, transactions);
    }
}

/* =====================================
   INITIALIZE PRECONFIGURED INVESTOR
===================================== */

function initializePreconfiguredInvestor(user) {

    const portfolios = getStoredJSON(PORTFOLIO_KEY, {});
    const transactions = getStoredJSON(TRANSACTIONS_KEY, {});

    const DEMO_PORTFOLIO_VERSION = 100;

    const portfolioVersionKey =
        `nexora_demo_portfolio_version_${user.id}`;

    // Initialize or update the predefined portfolio.

    if (!portfolios[user.id]) {

        portfolios[user.id] = {
            cashBalance: DEMO_INVESTOR.cashBalance,

            holdings: DEMO_INVESTOR.holdings.map(holding => ({
                ...holding
            })),

            currency: "USD",
            createdAt: new Date().toISOString(),
            demoPortfolio: true
        };

        localStorage.setItem(
            portfolioVersionKey,
            String(DEMO_PORTFOLIO_VERSION)
        );

    } else if (
        localStorage.getItem(portfolioVersionKey) !==
        String(DEMO_PORTFOLIO_VERSION)
    ) {

        // Update predefined holdings while preserving cash.

        portfolios[user.id].holdings =
            DEMO_INVESTOR.holdings.map(holding => ({
                ...holding
            }));

        localStorage.setItem(
            portfolioVersionKey,
            String(DEMO_PORTFOLIO_VERSION)
        );

    }

    // Preserve existing non-illustrative transactions.

    const existingTransactions = Array.isArray(transactions[user.id])
        ? transactions[user.id]
        : [];

    const existingUserTransactions = existingTransactions.filter(
        transaction => transaction.illustrative !== true
    );

    // Generate the latest illustrative transaction history.

    const updatedIllustrativeTransactions =
        createIllustrativeTransactions();

    transactions[user.id] = [
        ...existingUserTransactions,
        ...updatedIllustrativeTransactions
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Save portfolio and transactions.

    setStoredJSON(PORTFOLIO_KEY, portfolios);

    setStoredJSON(TRANSACTIONS_KEY, transactions);

}

/* =====================================
   ILLUSTRATIVE TRANSACTION HISTORY
===================================== */

/* =====================================
   PREDEFINED DEMO TRANSACTION HISTORY
===================================== */

// Edit this list to control the Recent Transactions
// displayed for the predefined demonstration account.
//
// All entries are illustrative sample records.
// They do not change portfolio balances or holdings.

const PREDEFINED_DEMO_TRANSACTIONS = [

    {
        id: "demo-tx-001",
        asset: "Bitcoin",
        symbol: "WITHDRAWAL",
        type: "SELL",
        amount: 2000000,
        date: "2026-11-07",
        realizedProfit: 510609,
        description: " "
    },

    {
        id: "demo-tx-002",
        asset: "Crude Oil",
        symbol: "WTI",
        type: "BUY",
        amount: 328618,
        date: "2025-09-02",
        description: "Asset purchase"
    },

    {
        id: "demo-tx-003",
        asset: "Tesla",
        symbol: "TSLA",
        type: "BUY",
        amount: 475500,
        date: "2025-03-19",
        description: "Stock purchase"
    },

    {
        id: "demo-tx-004",
        asset: "Moderna",
        symbol: "MRNA",
        type: "BUY",
        amount: 45000,
        date: "2024-02-20",
        description: "Stock purchase"
    },  

    {
        id: "demo-tx-005",
        asset: "Gold",
        symbol: "XAU",
        type: "BUY",
        amount: 570000,
        date: "2024-01-26",
        description: "Gold purchase"
    },

    {
        id: "demo-tx-006",
        asset: "Bitcoin",
        symbol: "DEPOSIT",
        type: "BUY",
        amount: 1500000,
        date: "2024-01-25",
        realizedProfit: 45000,
        description: " "
    }

];


// Convert the editable configuration into the format
// expected by the existing dashboard.

function createIllustrativeTransactions() {

    return PREDEFINED_DEMO_TRANSACTIONS.map(transaction => {

        const amount = Number(transaction.amount);
        const date = new Date(
            `${transaction.date}T12:00:00.000Z`
        );

        return {

            id: transaction.id,

            type: transaction.type.toUpperCase(),

            symbol: transaction.symbol,

            name: transaction.asset,

            total: amount,

            date: date.toISOString(),

            realizedProfit:
                transaction.realizedProfit === undefined
                    ? undefined
                    : Number(transaction.realizedProfit),

            simulated: true,

            illustrative: true,

            description:
                transaction.description || "Illustrative activity"

        };

    }).sort((a, b) => new Date(b.date) - new Date(a.date));

}


/* =====================================
   CURRENT DEMO SESSION
===================================== */

function getCurrentUser() {

    const userId = sessionStorage.getItem(SESSION_KEY);

    if (!userId) {
        return null;
    }

    const user = getUsers().find(item => item.id === userId);

    return user || null;
}


function setCurrentUser(user) {
    sessionStorage.setItem(SESSION_KEY, user.id);
}


function logoutDemoUser() {
    sessionStorage.removeItem(SESSION_KEY);

    window.location.href = "login.html";
}


/* =====================================
   REGISTRATION
===================================== */

async function handleRegistration(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const firstName =
        document.getElementById("firstName").value.trim();

    const lastName =
        document.getElementById("lastName").value.trim();

    const email =
        document.getElementById("registerEmail").value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("registerPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    if (!firstName || !lastName || !email) {

        showAuthMessage("Please complete all required fields.");

        return;
    }


    if (password.length < 12) {

        showAuthMessage(
            "Please use a password with at least 12 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        showAuthMessage(
            "Your passwords do not match."
        );

        return;
    }


    const users = getUsers();

    const emailExists = users.some(
        user => user.email === email
    );


    if (emailExists) {

        showAuthMessage(
            "An account with this email already exists in this browser."
        );

        return;
    }


    const submitButton =
        form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";


    try {

        const passwordHash = await hashDemoPassword(password);

        const user = {

            id: crypto.randomUUID(),

            firstName,
            lastName,
            email,

            passwordHash,

            accountType: "demo",

            createdAt: new Date().toISOString()

        };


        users.push(user);

        setStoredJSON(AUTH_STORAGE_KEY, users);

        initializeDemoAccount(user);

        setCurrentUser(user);

        showAuthMessage(
            "Your account has been created.",
            "success"
        );


        window.location.href = "dashboard.html";


    } catch (error) {

        console.error(error);

        showAuthMessage(
            error.message || "Unable to create the account."
        );

    } finally {

        submitButton.disabled = false;

        submitButton.innerHTML =
            'Create account <i class="fa-solid fa-arrow-right"></i>';

    }

}


/* =====================================
   LOGIN
===================================== */

// Paste this function above your existing handleLogin(event) function:

/* =====================================
   PRECONFIGURED DEMO LOGIN
===================================== */

async function handlePreconfiguredDemoLogin(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const email = document
        .getElementById("loginEmail")
        .value.trim()
        .toLowerCase();

    const password = document
        .getElementById("loginPassword")
        .value;

    if (
        email !== DEMO_INVESTOR.email ||
        password !== DEMO_INVESTOR.password
    ) {
        return false;
    }

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Opening portfolio...";

    try {

        const users = getUsers();

        let user = users.find(
            item => item.email === DEMO_INVESTOR.email
        );

        if (!user) {

            user = {
                id: crypto.randomUUID(),
                firstName: DEMO_INVESTOR.firstName,
                lastName: DEMO_INVESTOR.lastName,
                email: DEMO_INVESTOR.email,
                passwordHash: await hashDemoPassword(
                    DEMO_INVESTOR.password
                ),
                accountType: "preconfigured-demo",
                createdAt: new Date().toISOString()
            };

            users.push(user);

            setStoredJSON(AUTH_STORAGE_KEY, users);
        }

        // DEFAULT PRECONFIGURED DEMO PROFILE
        user.phone = "+1 862 431 7641";
        user.createdAt = "2024-01-15T12:00:00.000Z";

        // Save the updated predefined account
        setStoredJSON(AUTH_STORAGE_KEY, users);

        initializePreconfiguredInvestor(user);

        setCurrentUser(user);

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        showAuthMessage(
            error.message || "Unable to open the portfolio."
        );

        submitButton.disabled = false;
        submitButton.innerHTML =
            'Log in <i class="fa-solid fa-arrow-right"></i>';
    }

    return true;
}

/* =====================================
   LOGIN
===================================== */

async function handleLogin(event) {

    event.preventDefault();

    // Handle the predefined investor account first.
    const isPreconfiguredDemo =
        await handlePreconfiguredDemoLogin(event);

    if (isPreconfiguredDemo) {
        return;
    }

    const form = event.currentTarget;

    // This above 3 lines  lets the predefined credentials open the sample portfolio while other registered users continue through your existing login process.

    const email =
        document.getElementById("loginEmail").value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("loginPassword").value;


    const users = getUsers();

    const user = users.find(
        item => item.email === email
    );


    if (!user) {

        showAuthMessage(
            "Unable to log in with those details. Check your email and password."
        );

        return;
    }


    const submitButton =
        form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";


    try {

        const passwordHash = await hashDemoPassword(password);


        if (passwordHash !== user.passwordHash) {

            showAuthMessage(
                "Unable to log in with those details. Check your email and password."
            );

            return;
        }


        initializeDemoAccount(user);

        setCurrentUser(user);

        window.location.href = "dashboard.html";


    } catch (error) {

        console.error(error);

        showAuthMessage(
            error.message || "Unable to log in."
        );

    } finally {

        submitButton.disabled = false;

        submitButton.innerHTML =
            'Log in <i class="fa-solid fa-arrow-right"></i>';

    }

}


/* =====================================
   FORM EVENT LISTENERS
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const registrationForm =
        document.getElementById("registerForm");

    if (registrationForm) {

        registrationForm.addEventListener(
            "submit",
            handleRegistration
        );

    }


    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }

});
