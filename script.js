const ADMIN_CREDENTIALS = {
    email: "adeyemikhaleed123@gmail.com",
    password: "olayinka5230"
};

// State Management
let appData = {
    contacts: [],
    targetThreshold: 500,
    broadcastMessage: ""
};

let isAdminAuthenticated = false;

// Load saved context on execution
if (localStorage.getItem('Xyron_vcf_data')) {
    appData = JSON.parse(localStorage.getItem('Xyron_vcf_data'));
}

// UI Elements Tracking
const adminPanel = document.getElementById('adminPanel');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const contactForm = document.getElementById('contactForm');
const downloadBulkBtn = document.getElementById('downloadBulkBtn');
const systemNotice = document.getElementById('systemNotice');

// Login Modal Specific Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const closeModalBtn = document.getElementById('closeModalBtn');

// Init App View
function updateUI() {
    const currentCount = appData.contacts.length;
    const target = appData.targetThreshold;
    const percentage = Math.min(Math.floor((currentCount / target) * 100), 100);
    
    document.getElementById('progressText').innerText = `${percentage}%`;
    document.getElementById('currentCountText').innerText = currentCount;
    document.getElementById('targetCountText').innerText = target;
    document.getElementById('adminTotalCount').innerText = currentCount;
    document.getElementById('targetThresholdInput').value = target;
    document.getElementById('broadcastInput').value = appData.broadcastMessage;

    // Handle Notice Banner
    if (appData.broadcastMessage.trim() !== "") {
        systemNotice.innerText = appData.broadcastMessage;
        systemNotice.classList.remove('hidden');
    } else {
        systemNotice.classList.add('hidden');
    }

    // Download Locking Mechanism
    if (currentCount >= target) {
        downloadBulkBtn.disabled = false;
        downloadBulkBtn.classList.remove('disabled');
        downloadBulkBtn.innerText = "ᴅᴏᴡɴʟᴏᴀᴅ ʙᴜʟᴋ ᴠᴄꜰ";
    } else {
        downloadBulkBtn.disabled = true;
        downloadBulkBtn.classList.add('disabled');
        downloadBulkBtn.innerText = "ʟᴏᴄᴋᴇᴅ ᴜɴᴛɪʟ ᴛᴀʀɢᴇᴛ";
    }
}

function saveData() {
    localStorage.setItem('Xyron_vcf_data', JSON.stringify(appData));
    updateUI();
}

// Admin Panel Button Click Logic
adminToggleBtn.addEventListener('click', () => {
    if (isAdminAuthenticated) {
        // Toggle view if already logged in
        adminPanel.classList.toggle('hidden');
        adminToggleBtn.innerText = adminPanel.classList.contains('hidden') ? "ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ" : "ᴄᴏsᴇ ᴘᴀɴᴇʟ";
    } else {
        // Open Login Modal if not logged in
        loginModal.classList.remove('hidden');
    }
});

// Close login window without submitting
closeModalBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

// Authentication Checker Action
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = document.getElementById('adminEmail').value.trim();
    const passVal = document.getElementById('adminPassword').value;

    if (emailVal === ADMIN_CREDENTIALS.email && passVal === ADMIN_CREDENTIALS.password) {
        isAdminAuthenticated = true;
        loginModal.classList.add('hidden');
        adminPanel.classList.remove('hidden'); // Show Panel instantly
        adminToggleBtn.innerText = "ᴄᴏsᴇ ᴘᴀɴᴇʟ";
        loginForm.reset();
    } else {
        alert("❌ Invalid Admin Credentials. Access Denied.");
    }
});

// Admin Configuration Settings Form Handler
document.getElementById('saveAdminSettings').addEventListener('click', () => {
    if (!isAdminAuthenticated) return;
    const newThreshold = parseInt(document.getElementById('targetThresholdInput').value);
    const newBroadcast = document.getElementById('broadcastInput').value;

    if (!isNaN(newThreshold) && newThreshold > 0) {
        appData.targetThreshold = newThreshold;
    }
    appData.broadcastMessage = newBroadcast;
    
    saveData();
    alert("Admin panel configurations synchronized successfully.");
});

// Wipe storage pipeline
document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (!isAdminAuthenticated) return;
    if (confirm("Are you sure you want to permanently delete all submitted user data?")) {
        appData.contacts = [];
        saveData();
    }
});

// JSON Export Array Data Outflow
document.getElementById('exportDataBtn').addEventListener('click', () => {
    if (!isAdminAuthenticated) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData.contacts, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "Xyron_contacts_backup.json");
    dlAnchor.click();
});

// User Form Data Push Input
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('fullName').value.trim();
    const phoneInput = document.getElementById('phoneNumber').value.trim();

    const itemExists = appData.contacts.some(c => c.phone === phoneInput);
    if (itemExists) {
        alert("This contact number is already logged inside the pending queue.");
        return;
    }

    appData.contacts.push({ name: nameInput, phone: phoneInput });
    saveData();
    
    contactForm.reset();
    alert("Your contact details have been linked to the vcf.");
});

// Bulk Generator Execution Loop Array to VCF Data String Block
downloadBulkBtn.addEventListener('click', () => {
    if (appData.contacts.length < appData.targetThreshold) return;

    let masterVcfContent = "";
    appData.contacts.forEach(contact => {
        masterVcfContent += "BEGIN:VCARD\n" +
                            "VERSION:3.0\n" +
                            `FN:${contact.name}\n` +
                            `TEL;TYPE=CELL:${contact.phone}\n` +
                            "END:VCARD\n";
    });

    const blob = new Blob([masterVcfContent], { type: 'text/vcard;charset=utf-8;' });
    const fileUrl = URL.createObjectURL(blob);
    
    const tempLink = document.createElement('a');
    tempLink.href = fileUrl;
    tempLink.download = `Xyron_Tech_${appData.contacts.length}_Contacts.vcf`;
    
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(fileUrl);
});

// Initialization
updateUI();
