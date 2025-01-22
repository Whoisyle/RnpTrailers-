function testApp() {
    console.log('Running tests...');
    
    // Test adding a trailer
    const testTrailer = {
        name: "Test Trailer",
        type: "utility",
        price: 50.00,
        status: "available",
        description: "Test description",
        specs: {
            length: "10",
            width: "6",
            capacity: "3000"
        }
    };
    
    // Simulate form submission
    const form = document.getElementById('trailer-form');
    Object.entries(testTrailer).forEach(([key, value]) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
    });
    
    form.dispatchEvent(new Event('submit'));
    
    // Test search
    const search = document.getElementById('trailer-search');
    search.value = 'Test';
    search.dispatchEvent(new Event('input'));
    
    // Test filter
    const filter = document.getElementById('filter-type');
    filter.value = 'utility';
    filter.dispatchEvent(new Event('change'));
    
    console.log('Tests completed');
}

// Run tests after page load
window.addEventListener('load', testApp); 