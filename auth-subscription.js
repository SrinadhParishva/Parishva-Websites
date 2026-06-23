/**
 * PARISHVA BRANDING STUDIO — AUTHENTICATION & SUBSCRIPTION LOGIC
 * Handles Firebase Auth, Firestore sync, and custom premium UI states.
 */

let firebaseLoadingPromise = null;
let isFirebaseInitialized = false;

function loadFirebaseAndInit() {
    if (firebaseLoadingPromise) return firebaseLoadingPromise;

    firebaseLoadingPromise = new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined') {
            runAuthSubscription();
            resolve();
            return;
        }

        const scripts = [
            "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
            "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js",
            "https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js",
            "firebase-config.js"
        ];

        const loadScript = (src) => {
            return new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = src;
                s.async = true;
                s.onload = res;
                s.onerror = rej;
                document.head.appendChild(s);
            });
        };

        // Load sequentially: app, then compat libs + config
        loadScript(scripts[0])
            .then(() => Promise.all([
                loadScript(scripts[1]),
                loadScript(scripts[2])
            ]))
            .then(() => loadScript(scripts[3]))
            .then(() => {
                console.log("[Firebase] SDKs dynamically loaded successfully.");
                runAuthSubscription();
                resolve();
            })
            .catch(err => {
                console.error("[Firebase] Error loading SDKs:", err);
                firebaseLoadingPromise = null;
                reject(err);
            });
    });

    return firebaseLoadingPromise;
}

document.addEventListener('DOMContentLoaded', () => {
    // Queue idle loading of Firebase SDKs after 2 seconds to not block critical path / LCP
    window.addEventListener('load', () => {
        setTimeout(loadFirebaseAndInit, 2000);
    });

    // Setup lazy load triggers for user interactions
    setupLazyLoadTriggers();
});

function setupLazyLoadTriggers() {
    const triggers = [
        document.getElementById('nav-subscribe-btn'),
        document.getElementById('mobile-subscribe-btn'),
        document.getElementById('inline-subscribe-form')
    ];

    triggers.forEach(el => {
        if (!el) return;
        el.addEventListener('click', loadFirebaseAndInit);
        el.addEventListener('mouseenter', loadFirebaseAndInit);
        el.addEventListener('focus', loadFirebaseAndInit);
    });
}

function runAuthSubscription() {
    if (isFirebaseInitialized) return;
    isFirebaseInitialized = true;

    const db = window.db || firebase.database();
    const auth = window.auth || firebase.auth();

    // DOM Elements
    const modal = document.getElementById('subscription-modal');
    const closeBtn = document.getElementById('sub-modal-close-btn');
    const signupForm = document.getElementById('sub-signup-form');
    const loginForm = document.getElementById('sub-login-form');
    const signupTab = document.getElementById('tab-signup');
    const loginTab = document.getElementById('tab-login');
    const signupContainer = document.getElementById('form-signup-container');
    const loginContainer = document.getElementById('form-login-container');
    const dashboardContainer = document.getElementById('profile-dashboard-container');
    const errorMsgContainer = document.getElementById('auth-error-box');
    const socialAuthWrapper = document.getElementById('social-auth-wrapper');

    // UI Buttons
    const navSubscribeBtn = document.getElementById('nav-subscribe-btn');
    const mobileSubscribeBtn = document.getElementById('mobile-subscribe-btn');
    const inlineWidgetForm = document.getElementById('inline-subscribe-form');
    const inlineWidgetEmail = document.getElementById('inline-subscribe-email');
    const btnGoogleLogin = document.getElementById('btn-google-login');

    // Profile Dashboard Elements
    const profileName = document.getElementById('profile-name-val');
    const profileEmail = document.getElementById('profile-email-val');
    const subscribeToggle = document.getElementById('subscribe-status-toggle');
    const statusDot = document.getElementById('sub-status-dot');
    const statusText = document.getElementById('sub-status-text');
    const logoutBtn = document.getElementById('btn-logout');

    let currentUser = null;

    // ── 1. MODAL STATE FUNCTIONS ──
    const openModal = (tab = 'signup') => {
        if (!modal) return;
        
        // Hide mobile navigation drawer if open
        const drawer = document.getElementById('mobile-drawer');
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (drawer && drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            toggleBtn.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
        }

        modal.classList.add('active');
        document.body.classList.add('overflow-hidden');
        document.documentElement.classList.add('overflow-hidden');
        
        if (currentUser) {
            showDashboard();
        } else {
            switchTab(tab);
        }
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');
        resetForms();
    };

    const switchTab = (tab) => {
        if (!signupTab || !loginTab || !signupContainer || !loginContainer || !dashboardContainer) return;
        
        errorMsgContainer.style.display = 'none';
        dashboardContainer.classList.remove('active');

        // Hide all form containers first
        signupContainer.classList.remove('active');
        loginContainer.classList.remove('active');

        signupTab.classList.remove('active');
        loginTab.classList.remove('active');

        if (tab === 'signup') {
            signupTab.classList.add('active');
            signupContainer.classList.add('active');
            if (socialAuthWrapper) socialAuthWrapper.style.display = 'block';
        } else if (tab === 'login') {
            loginTab.classList.add('active');
            loginContainer.classList.add('active');
            if (socialAuthWrapper) socialAuthWrapper.style.display = 'block';
        }
    };

    const showDashboard = () => {
        if (!signupContainer || !loginContainer || !dashboardContainer || !signupTab || !loginTab) return;
        errorMsgContainer.style.display = 'none';
        signupContainer.classList.remove('active');
        loginContainer.classList.remove('active');
        signupTab.style.display = 'none';
        loginTab.style.display = 'none';
        
        if (socialAuthWrapper) socialAuthWrapper.style.display = 'none';
        
        const tabsHeader = document.querySelector('.auth-tabs');
        if (tabsHeader) tabsHeader.style.borderBottom = 'none';

        dashboardContainer.classList.add('active');
    };

    const resetForms = () => {
        if (signupForm) signupForm.reset();
        if (loginForm) loginForm.reset();
        if (signupTab && loginTab) {
            signupTab.style.display = 'block';
            loginTab.style.display = 'block';
        }
        if (socialAuthWrapper) socialAuthWrapper.style.display = 'block';
        
        const tabsHeader = document.querySelector('.auth-tabs');
        if (tabsHeader) tabsHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
        if (errorMsgContainer) errorMsgContainer.style.display = 'none';
    };

    const showError = (message) => {
        if (!errorMsgContainer) return;
        errorMsgContainer.innerText = message;
        errorMsgContainer.style.display = 'block';
    };

    // ── 2. EVENT LISTENERS SETUP ──
    const handleSubscribeTrigger = (e) => {
        e.preventDefault();
        openModal(currentUser ? 'dashboard' : 'signup');
    };

    if (navSubscribeBtn) {
        navSubscribeBtn.addEventListener('click', handleSubscribeTrigger);
    }
    
    if (mobileSubscribeBtn) {
        mobileSubscribeBtn.addEventListener('click', handleSubscribeTrigger);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (signupTab) {
        signupTab.addEventListener('click', () => switchTab('signup'));
    }

    if (loginTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
    }

    // Google Sign-In trigger
    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', () => signInWithGoogle());
    }

    // Connect custom cursor to new dynamically loaded selectors
    const refreshCursorListeners = () => {
        if (typeof initCustomCursor === 'function') {
            // Re-run cursor bindings for any new button/tabs
            const hoverElements = modal.querySelectorAll('a, button, select, input');
            const cursor = document.getElementById('cursor');
            const ring = document.getElementById('cursor-ring');
            if (cursor && ring) {
                hoverElements.forEach(el => {
                    el.addEventListener('mouseenter', () => {
                        cursor.style.width = '6px';
                        cursor.style.height = '6px';
                        cursor.style.background = '#e2c47a';
                        ring.style.width = '52px';
                        ring.style.height = '52px';
                        ring.style.opacity = '1';
                        ring.style.borderColor = '#e2c47a';
                    });
                    el.addEventListener('mouseleave', () => {
                        cursor.style.width = '10px';
                        cursor.style.height = '10px';
                        cursor.style.background = '#d4a24d';
                        ring.style.width = '36px';
                        ring.style.height = '36px';
                        ring.style.opacity = '0.6';
                        ring.style.borderColor = '#d4a24d';
                    });
                });
            }
        }
    };

    // ── Google Authentication ──
    const signInWithGoogle = () => {
        errorMsgContainer.style.display = 'none';
        if (window.location.protocol === 'file:') {
            showError("Google Sign-In is not supported when opening index.html directly via file://. Please serve this folder using a local web server (e.g., Live Server or npx serve) to test this function.");
            return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                return db.ref('users/' + user.uid).once('value').then((snapshot) => {
                    if (!snapshot.exists()) {
                        return db.ref('users/' + user.uid).set({
                            uid: user.uid,
                            name: user.displayName || 'Subscribed Member',
                            email: user.email,
                            phone: user.phoneNumber || 'Not provided',
                            isSubscribed: true,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        });
                    }
                });
            })
            .then(() => {
                console.log("Google Sign-In successful.");
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'login', { method: 'Google' });
                }
                closeModal();
            })
            .catch((error) => {
                console.error("Google sign-in error:", error);
                showError(error.message);
            });
    };



    // ── 3. AUTHENTICATION HANDLERS ──

    // Register User
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMsgContainer.style.display = 'none';

            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const isSubscribed = document.getElementById('signup-subscribe-check').checked;

            if (!name || !email || !password) {
                showError("Please fill in all details.");
                return;
            }

            // Client-side config validation check
            if (auth.config && auth.config.apiKey === "YOUR_API_KEY_HERE") {
                showError("Firebase configuration is not completed yet. Please configure firebase-config.js.");
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    // Update Auth Profile Display Name
                    return user.updateProfile({
                        displayName: name
                    }).then(() => {
                        // Create Database User Document
                        return db.ref('users/' + user.uid).set({
                            uid: user.uid,
                            name: name,
                            email: email,
                            isSubscribed: isSubscribed,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        });
                    });
                })
                .then(() => {
                    // Explode gold particles on success
                    const signupBtnRect = document.getElementById('btn-signup-submit').getBoundingClientRect();
                    if (typeof createExplosion === 'function') {
                        createExplosion(signupBtnRect);
                    }
                    console.log("Account created successfully and profile synced.");
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'sign_up', { method: 'Email Signup Form' });
                    }
                })
                .catch((error) => {
                    console.error("Signup error:", error);
                    showError(error.message);
                });
        });
    }

    // Login User
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMsgContainer.style.display = 'none';

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showError("Please enter email and password.");
                return;
            }

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Logged in successfully.");
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'login', { method: 'Email Login Form' });
                    }
                    closeModal();
                })
                .catch((error) => {
                    console.error("Login error:", error);
                    showError(error.message);
                });
        });
    }

    // Logout User
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                console.log("Sign out successful.");
                closeModal();
            }).catch((error) => {
                console.error("Sign out error:", error);
            });
        });
    }

    // Toggle Subscription Preference (Live Sync to Firestore)
    if (subscribeToggle) {
        subscribeToggle.addEventListener('change', (e) => {
            if (!currentUser) return;

            const isChecked = e.target.checked;
            db.ref('users/' + currentUser.uid).update({
                isSubscribed: isChecked
            }).then(() => {
                updateSubscriptionUI(isChecked);
                // Trigger gold explosion relative to the toggle switch
                const toggleRect = subscribeToggle.getBoundingClientRect();
                if (typeof createExplosion === 'function') {
                    createExplosion(toggleRect);
                }
                console.log(`Subscription status updated: ${isChecked}`);
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'update_subscription_preference', { subscribed: isChecked });
                }
            }).catch((error) => {
                console.error("Error updating subscription status:", error);
                subscribeToggle.checked = !isChecked; // Revert switch UI on error
            });
        });
    }

    // Helper: update subscription display labels & classes
    const updateSubscriptionUI = (isSubscribed) => {
        if (isSubscribed) {
            statusDot.className = 'status-pulse-dot subscribed';
            statusText.innerText = 'SUBSCRIBED';
            statusText.parentElement.className = 'status-indicator-wrap subscribed';
            subscribeToggle.checked = true;
        } else {
            statusDot.className = 'status-pulse-dot unsubscribed';
            statusText.innerText = 'NOT SUBSCRIBED';
            statusText.parentElement.className = 'status-indicator-wrap unsubscribed';
            subscribeToggle.checked = false;
        }
    };

    // ── 4. LIVE INLINE NEWSLETTER WIDGET ACTION ──
    if (inlineWidgetForm) {
        inlineWidgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInputVal = inlineWidgetEmail.value.trim();
            if (!emailInputVal) return;

            if (typeof window.gtag === 'function') {
                window.gtag('event', 'submit_newsletter_widget', { prefilled: !!emailInputVal });
            }

            if (currentUser) {
                // If user is already logged in, automatically make sure they are subscribed and show modal
                db.ref('users/' + currentUser.uid).update({
                    isSubscribed: true
                }).then(() => {
                    updateSubscriptionUI(true);
                    openModal('dashboard');
                    const widgetBtnRect = inlineWidgetForm.querySelector('button').getBoundingClientRect();
                    if (typeof createExplosion === 'function') {
                        createExplosion(widgetBtnRect);
                    }
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'sign_up', { method: 'Newsletter Widget (LoggedIn)' });
                    }
                });
            } else {
                // Redirect logged-out user to Register Modal and prefill email field
                openModal('signup');
                const signupEmailInput = document.getElementById('signup-email');
                if (signupEmailInput) {
                    signupEmailInput.value = emailInputVal;
                }
            }
        });
    }

    // ── 5. AUTHENTICATION STATE OBSERVER ──
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        
        if (user) {
            console.log("Subscriber authenticated:", user.email);
            
            // 1. Change Nav Button to Profile Button with display name
            if (navSubscribeBtn) {
                navSubscribeBtn.innerHTML = `<span class="nav-pulse"></span> Profile`;
                navSubscribeBtn.className = 'nav-profile-btn';
            }
            if (mobileSubscribeBtn) {
                mobileSubscribeBtn.innerHTML = 'View Profile';
            }

            // 2. Fetch User Profile Doc from Database for Dashboard Display
            db.ref('users/' + user.uid).on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Populate Dashboard fields
                    if (profileName) profileName.innerText = data.name || user.displayName || 'Subscribed Member';
                    if (profileEmail) profileEmail.innerText = data.email || user.email;
                    
                    updateSubscriptionUI(data.isSubscribed);
                } else {
                    // Backup populate if profile document wasn't created yet
                    if (profileName) profileName.innerText = user.displayName || 'Subscribed Member';
                    if (profileEmail) profileEmail.innerText = user.email;
                    updateSubscriptionUI(true);
                }
                refreshCursorListeners();
            }, (error) => {
                console.error("Error reading database profile:", error);
            });

            // 3. If modal is currently open, show dashboard directly
            if (modal && modal.classList.contains('active')) {
                showDashboard();
            }

        } else {
            console.log("No subscriber authenticated.");
            currentUser = null;

            // Restore Nav Button state
            if (navSubscribeBtn) {
                navSubscribeBtn.innerHTML = 'Subscribe';
                navSubscribeBtn.className = 'nav-cta';
            }
            if (mobileSubscribeBtn) {
                mobileSubscribeBtn.innerHTML = 'Subscribe';
            }

            // Hide profile fields
            resetForms();
            
            // If modal is active, switch to signup state since user logged out
            if (modal && modal.classList.contains('active')) {
                switchTab('signup');
            }
        }
        refreshCursorListeners();
    });

    // Run initial cursor mapping
    refreshCursorListeners();
}
