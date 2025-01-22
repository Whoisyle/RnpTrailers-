// DOM Elements
const trailerForm = document.getElementById('trailer-form');
const trailerGrid = document.getElementById('trailers');
const trailerSearch = document.getElementById('trailer-search');
const filterType = document.getElementById('filter-type');
const sortBy = document.getElementById('sort-by');
const contactForm = document.getElementById('contact-form');
const customerForm = document.getElementById('customer-form');
const scanIdBtn = document.getElementById('scan-id');
const scanDocsBtn = document.getElementById('scan-docs');
const customerTable = document.getElementById('customer-records');
const customerSearch = document.getElementById('customer-search');

// Client-side trailer management
const clientTrailers = JSON.parse(localStorage.getItem('trailers')) || [];

// Customer data storage
const customers = JSON.parse(localStorage.getItem('customers')) || [];

// Trailer Class
class Trailer {
    constructor(name, type, price, status, description, specs, images) {
        this.id = Date.now();
        this.name = name;
        this.type = type;
        this.price = price;
        this.status = status;
        this.description = description;
        this.specs = specs;
        this.images = images;
        this.dateAdded = new Date();
        // Add new properties
        this.licensePlate = '';
        this.vin = '';
        this.maintenanceHistory = [];
        this.rentalHistory = [];
    }
}

// Add Rental Agreement class
class RentalAgreement {
    constructor(trailerId, customerId, startDate, endDate) {
        this.id = Date.now();
        this.trailerId = trailerId;
        this.customerId = customerId;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.status = 'Active';
        this.dateCreated = new Date();
        this.totalCost = 0;
        this.deposit = 0;
        this.notes = '';
    }

    calculateStatus() {
        const now = new Date();
        if (now > this.endDate) {
            return 'Overdue';
        }
        if (now < this.startDate) {
            return 'Scheduled';
        }
        return 'Active';
    }
}

// Event Listeners
trailerForm.addEventListener('submit', handleTrailerSubmit);
trailerSearch.addEventListener('input', filterTrailers);
filterType.addEventListener('change', filterTrailers);
sortBy.addEventListener('change', filterTrailers);
contactForm?.addEventListener('submit', handleContactSubmit);
customerForm.addEventListener('submit', handleCustomerSubmit);
scanIdBtn.addEventListener('click', () => scanDocument('ID'));
scanDocsBtn.addEventListener('click', () => scanDocument('Documents'));

// Handle Trailer Form Submission
async function handleTrailerSubmit(e) {
    try {
        e.preventDefault();

        const formData = new FormData(trailerForm);
        const images = await handleImageUpload();

        const trailer = new Trailer(
            formData.get('trailer-name'),
            formData.get('trailer-type'),
            parseFloat(formData.get('rental-price')),
            formData.get('trailer-status'),
            formData.get('trailer-description'),
            {
                length: formData.get('length'),
                width: formData.get('width'),
                capacity: formData.get('capacity')
            },
            images
        );

        clientTrailers.push(trailer);
        saveTrailers();
        renderTrailers();
        trailerForm.reset();
    } catch (error) {
        showError('Error adding trailer. Please try again.');
        console.error(error);
    }
}

// Handle Image Upload
async function handleImageUpload() {
    const fileInput = document.getElementById('trailer-image');
    const files = Array.from(fileInput.files);
    const images = [];

    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) continue; // Skip files larger than 5MB
        try {
            const base64 = await convertToBase64(file);
            images.push(base64);
        } catch (error) {
            console.error('Error processing image:', error);
        }
    }

    return images;
}

// Convert Image to Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Filter and Sort Trailers
function filterTrailers() {
    let filtered = [...clientTrailers];
    const searchTerm = trailerSearch.value.toLowerCase();
    const typeFilter = filterType.value;
    const sortValue = sortBy.value;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(trailer => 
            trailer.name.toLowerCase().includes(searchTerm) ||
            trailer.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply type filter
    if (typeFilter) {
        filtered = filtered.filter(trailer => trailer.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortValue) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    renderTrailers(filtered);
}

// Render Trailers
function renderTrailers(trailersToRender = clientTrailers) {
    trailerGrid.innerHTML = '';
    
    trailersToRender.forEach(trailer => {
        const card = createTrailerCard(trailer);
        trailerGrid.appendChild(card);
    });
}

// Create Trailer Card
function createTrailerCard(trailer) {
    const statusClass = getStatusClass(trailer.status);
    const card = document.createElement('div');
    card.className = 'trailer-card';
    
    card.innerHTML = `
        <img src="${trailer.images[0] || 'images/placeholder.jpg'}" alt="${trailer.name}">
        <div class="trailer-info">
            <h3>${trailer.name}</h3>
            <p class="type">${trailer.type}</p>
            <p class="price">$${trailer.price.toFixed(2)}/day</p>
            <p class="status ${statusClass}">${trailer.status}</p>
            <div class="specs">
                <span>L: ${trailer.specs.length}ft</span>
                <span>W: ${trailer.specs.width}ft</span>
                <span>Cap: ${trailer.specs.capacity}lbs</span>
            </div>
            <button onclick="rentTrailer(${trailer.id})" 
                    class="btn btn-primary"
                    ${trailer.status !== 'available' ? 'disabled' : ''}>
                Rent Now
            </button>
        </div>
    `;
    
    return card;
}

// Handle Contact Form Submission
function handleContactSubmit(e) {
    e.preventDefault();
    // Add your contact form handling logic here
    alert('Thank you for your message. We will get back to you soon!');
    e.target.reset();
}

// Save Trailers to localStorage
function saveTrailers() {
    localStorage.setItem('trailers', JSON.stringify(clientTrailers));
}

// Add rental functionality
function rentTrailer(trailerId) {
    const trailer = clientTrailers.find(t => t.id === trailerId);
    if (trailer && trailer.status === 'available') {
        trailer.status = 'rented';
        saveTrailers();
        renderTrailers();
    }
}

// Add status color indicators
function getStatusClass(status) {
    switch(status) {
        case 'available': return 'status-available';
        case 'rented': return 'status-rented';
        case 'maintenance': return 'status-maintenance';
        default: return '';
    }
}

// Add error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('main').prepend(errorDiv);
    
    // Add animation
    errorDiv.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => {
        errorDiv.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

// Add after clientTrailers initialization
const sampleTrailers = [
    {
        id: 1,
        name: "Utility Trailer 5x8",
        type: "utility",
        price: 45.00,
        status: "available",
        description: "Perfect for small moves and garden supplies",
        specs: {
            length: "8",
            width: "5",
            capacity: "2000"
        },
        images: [],
        dateAdded: new Date()
    },
    {
        id: 2,
        name: "Enclosed Cargo 6x12",
        type: "enclosed",
        price: 75.00,
        status: "available",
        description: "Weather-protected cargo trailer",
        specs: {
            length: "12",
            width: "6",
            capacity: "3500"
        },
        images: [],
        dateAdded: new Date()
    },
    {
        id: 3,
        name: "Car Hauler 7x16",
        type: "car",
        price: 95.00,
        status: "rented",
        description: "Heavy duty car trailer with ramps",
        specs: {
            length: "16",
            width: "7",
            capacity: "7000"
        },
        images: [],
        dateAdded: new Date()
    }
];

// Add this function after initialization
function loadSampleData() {
    if (clientTrailers.length === 0) {
        clientTrailers.push(...sampleTrailers);
        saveTrailers();
        renderTrailers();
    }
}

// Update initialization
function initialize() {
    renderTrailers();
    loadSampleData();
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    trailerGrid.appendChild(loadingDiv);
    
    // Simulate loading delay
    setTimeout(() => {
        loadingDiv.remove();
        renderTrailers();
    }, 1000);
}

// Replace the existing renderTrailers() call with:
initialize();

// Scanner functionality
async function initializeScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        return stream;
    } catch (error) {
        showError('Camera access denied. Please enable camera permissions.');
        return null;
    }
}

async function scanDocument(type) {
    const preview = document.getElementById('id-scan-preview');
    preview.classList.add('scanning');
    
    try {
        const stream = await initializeScanner();
        if (!stream) return;

        // Simulate scanning process
        setTimeout(() => {
            preview.classList.remove('scanning');
            // In a real app, this would process the scanned image
            showSuccess(`${type} scanned successfully!`);
        }, 2000);

    } catch (error) {
        showError('Scanning failed. Please try again.');
        preview.classList.remove('scanning');
    }
}

// Customer form handling
function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(customerForm);
    const customer = {
        id: Date.now(),
        name: formData.get('customer-name'),
        license: formData.get('license-number'),
        phone: formData.get('customer-phone'),
        email: formData.get('customer-email'),
        address: formData.get('customer-address'),
        rentals: [],
        dateAdded: new Date()
    };

    customers.push(customer);
    saveCustomers();
    renderCustomerTable();
    customerForm.reset();
    showSuccess('Customer added successfully!');
}

// Render customer table
function renderCustomerTable() {
    customerTable.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.license}</td>
            <td>${customer.phone}</td>
            <td>${customer.email}</td>
            <td>${customer.rentals.length}</td>
            <td class="customer-actions">
                <button onclick="editCustomer(${customer.id})" class="btn btn-secondary">Edit</button>
                <button onclick="viewRentals(${customer.id})" class="btn btn-primary">View Rentals</button>
            </td>
        `;
        customerTable.appendChild(row);
    });
}

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(customers));
}

// Initialize customer table
renderCustomerTable();

// Add this function to create placeholder images
function createPlaceholderImages() {
    const images = {
        logo: 'data:image/png;base64,...', // Base64 encoded logo
        placeholder: 'data:image/jpeg;base64,...', // Base64 encoded placeholder
        scan: 'data:image/jpeg;base64,...', // Base64 encoded scan placeholder
        favicon: 'data:image/x-icon;base64,...' // Base64 encoded favicon
    };
    
    // Use these in place of missing images
    document.querySelectorAll('img').forEach(img => {
        if (img.src.includes('logo.png')) img.src = images.logo;
        if (img.src.includes('placeholder.jpg')) img.src = images.placeholder;
        if (img.src.includes('scan-placeholder.jpg')) img.src = images.scan;
    });
}

// Call after page load
window.addEventListener('load', createPlaceholderImages);

// Add rental management functions
function createRentalAgreement(trailerId, customerId, startDate, endDate) {
    const rental = new RentalAgreement(trailerId, customerId, startDate, endDate);
    const trailer = clientTrailers.find(t => t.id === trailerId);
    const customer = customers.find(c => c.id === customerId);
    
    if (!trailer || !customer) {
        showError('Invalid trailer or customer');
        return null;
    }

    // Calculate rental duration and cost
    const days = (rental.endDate - rental.startDate) / (1000 * 60 * 60 * 24);
    rental.totalCost = days * trailer.price;
    rental.deposit = trailer.price * 0.5; // 50% deposit

    // Update trailer status
    trailer.status = 'rented';
    trailer.rentalHistory.push(rental);

    // Update customer rentals
    customer.rentals.push(rental);

    // Save changes
    saveTrailers();
    saveCustomers();
    
    return rental;
}

// Add to existing showError function
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('main').prepend(successDiv);
    
    successDiv.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => {
        successDiv.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// Add reporting functions
function generateReport(type = 'revenue') {
    const month = document.getElementById('report-month').value;
    const [year, monthNum] = month.split('-');
    
    switch(type) {
        case 'revenue':
            generateRevenueReport(year, monthNum);
            break;
        case 'utilization':
            generateUtilizationReport(year, monthNum);
            break;
        case 'overdue':
            generateOverdueReport();
            break;
        case 'customer':
            generateCustomerReport(year, monthNum);
            break;
    }
}

function generateRevenueReport(year, month) {
    const rentals = getAllRentals();
    const monthlyRevenue = calculateMonthlyRevenue(rentals, year, month);
    const lastMonthRevenue = calculateMonthlyRevenue(rentals, year, month - 1);
    const trend = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);

    // Update metrics
    document.getElementById('total-revenue').textContent = monthlyRevenue.toFixed(2);
    document.getElementById('revenue-trend').textContent = `${trend}%`;
    
    // Update chart
    updateRevenueChart(rentals, year, month);
}

function generateUtilizationReport(year, month) {
    const stats = calculateUtilizationStats();
    const tbody = document.querySelector('#utilization-stats tbody');
    tbody.innerHTML = '';

    Object.entries(stats).forEach(([type, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${data.total}</td>
            <td>${data.active}</td>
            <td>${data.rate}%</td>
            <td>$${data.revenue.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function generateOverdueReport() {
    const overdueRentals = getOverdueRentals();
    const tbody = document.querySelector('#overdue-rentals tbody');
    tbody.innerHTML = '';

    let totalOverdue = 0;
    overdueRentals.forEach(rental => {
        const customer = customers.find(c => c.id === rental.customerId);
        const trailer = clientTrailers.find(t => t.id === rental.trailerId);
        const daysOverdue = calculateDaysOverdue(rental);
        const amountDue = calculateOverdueAmount(rental);
        totalOverdue += amountDue;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${trailer.name}</td>
            <td>${formatDate(rental.endDate)}</td>
            <td>${daysOverdue}</td>
            <td>$${amountDue.toFixed(2)}</td>
            <td>
                <button onclick="contactCustomer(${customer.id})" class="btn btn-secondary">Contact</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('overdue-count').textContent = overdueRentals.length;
    document.getElementById('overdue-amount').textContent = `$${totalOverdue.toFixed(2)}`;
}

// Helper functions
function getAllRentals() {
    return clientTrailers.reduce((all, trailer) => [...all, ...trailer.rentalHistory], []);
}

function calculateMonthlyRevenue(rentals, year, month) {
    return rentals
        .filter(rental => {
            const rentalDate = new Date(rental.startDate);
            return rentalDate.getFullYear() === parseInt(year) && 
                   rentalDate.getMonth() === parseInt(month) - 1;
        })
        .reduce((sum, rental) => sum + rental.totalCost, 0);
}

function calculateUtilizationStats() {
    const stats = {};
    clientTrailers.forEach(trailer => {
        if (!stats[trailer.type]) {
            stats[trailer.type] = {
                total: 0,
                active: 0,
                revenue: 0,
                rate: 0
            };
        }
        stats[trailer.type].total++;
        if (trailer.status === 'rented') {
            stats[trailer.type].active++;
        }
        stats[trailer.type].revenue += trailer.rentalHistory.reduce((sum, rental) => 
            sum + rental.totalCost, 0);
        stats[trailer.type].rate = (stats[trailer.type].active / 
            stats[trailer.type].total * 100).toFixed(1);
    });
    return stats;
}

function getOverdueRentals() {
    const now = new Date();
    return getAllRentals().filter(rental => 
        rental.status === 'Active' && new Date(rental.endDate) < now);
}

// Event Listeners for Reports
document.getElementById('generate-report').addEventListener('click', () => {
    const type = document.getElementById('report-type').value;
    generateReport(type);
});

document.getElementById('export-report').addEventListener('click', exportReportToCSV);

// Initialize report with current month
document.getElementById('report-month').value = 
    new Date().toISOString().slice(0, 7);
generateReport();

// Add after scanner functionality
const barcodeScanner = {
    init() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector("#scanner-container"),
                constraints: {
                    facingMode: "environment"
                },
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader"]
            }
        }, function(err) {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Scanner initialized successfully");
        });

        Quagga.onDetected(this.onBarcodeDetected);
    },

    onBarcodeDetected(result) {
        const code = result.codeResult.code;
        document.getElementById('license-number').value = code;
        showSuccess('License scanned successfully!');
        this.stop();
    },

    start() {
        this.init();
        Quagga.start();
    },

    stop() {
        Quagga.stop();
    }
};

// Add signature capture functionality
const signaturePad = {
    pad: null,
    
    init() {
        const canvas = document.getElementById('signature-pad');
        this.pad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
    },

    clear() {
        this.pad.clear();
    },

    save() {
        if (this.pad.isEmpty()) {
            showError('Please provide a signature');
            return null;
        }
        return this.pad.toDataURL();
    }
};

// Enhance rental agreement handling
function handleRentalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(rentalForm);
    const signature = signaturePad.save();
    
    if (!signature) return;

    const rental = createRentalAgreement(
        formData.get('rental-trailer'),
        formData.get('rental-customer'),
        formData.get('rental-start'),
        formData.get('rental-end')
    );

    if (rental) {
        rental.signature = signature;
        rental.paymentStatus = 'Pending';
        rental.depositPaid = false;
        
        updatePaymentStatus(rental);
        generateRentalDocument(rental);
        addToCalendar(rental);
        
        showSuccess('Rental agreement created successfully!');
        rentalForm.reset();
        signaturePad.clear();
    }
}

// Payment handling
function updatePaymentStatus(rental) {
    const paymentStatuses = {
        'Pending': { color: 'orange', icon: '⏳' },
        'Partial': { color: 'blue', icon: '↗' },
        'Completed': { color: 'green', icon: '✓' },
        'Overdue': { color: 'red', icon: '!' }
    };

    const statusElement = document.createElement('div');
    statusElement.className = 'payment-status';
    statusElement.innerHTML = `
        <span class="status-icon" style="color: ${paymentStatuses[rental.paymentStatus].color}">
            ${paymentStatuses[rental.paymentStatus].icon}
        </span>
        ${rental.paymentStatus}
    `;

    return statusElement;
}

// Calendar integration
function addToCalendar(rental) {
    const calendar = {
        events: JSON.parse(localStorage.getItem('calendar-events')) || []
    };

    const event = {
        id: rental.id,
        title: `Rental: ${rental.trailerName}`,
        start: rental.startDate,
        end: rental.endDate,
        type: 'rental',
        status: rental.status
    };

    calendar.events.push(event);
    localStorage.setItem('calendar-events', JSON.stringify(calendar.events));

    // Set reminders
    setRentalReminders(rental);
}

// Reminder system
function setRentalReminders(rental) {
    const reminders = [
        {
            date: new Date(rental.startDate),
            message: `Pickup reminder for ${rental.trailerName}`
        },
        {
            date: new Date(rental.endDate),
            message: `Return reminder for ${rental.trailerName}`
        }
    ];

    reminders.forEach(reminder => {
        const notification = new Notification(reminder.message, {
            body: `Scheduled for ${reminder.date.toLocaleDateString()}`,
            icon: 'favicon.ico'
        });
    });
}