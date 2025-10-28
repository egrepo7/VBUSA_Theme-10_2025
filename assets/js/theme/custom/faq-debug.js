/**
 * FAQ Debug Helper
 * Console commands for testing the dynamic FAQ system
 */

// Test FAQ loading for different categories
window.testFAQs = {
    // Test loading FAQ data
    async loadData() {
        try {
            const response = await fetch(window.location.origin + '/assets/content/faq-data.json');
            const data = await response.json();
            console.log('FAQ Data loaded successfully:', data);
            return data;
        } catch (error) {
            console.error('Failed to load FAQ data:', error);
            return null;
        }
    },
    
    // Test URL category detection
    testUrlMapping(testUrl = window.location.pathname) {
        const urlMappings = {
            'volleyball-nets': ['volleyball-nets', 'nets'],
            'volleyball-poles': ['volleyball-poles', 'poles'], 
            'complete-systems': ['complete-systems', 'systems'],
            'outdoor-systems': ['outdoor-systems', 'outdoor'],
            'portable-systems': ['portable-systems', 'portable']
        };
        
        for (const [category, patterns] of Object.entries(urlMappings)) {
            if (patterns.some(pattern => testUrl.includes(pattern))) {
                console.log(`URL "${testUrl}" matches category: ${category}`);
                return category;
            }
        }
        
        console.log(`URL "${testUrl}" does not match any FAQ category`);
        return null;
    },
    
    // Test FAQ loading for specific category
    async testCategory(categoryKey) {
        const data = await this.loadData();
        if (!data) return;
        
        const categoryFAQs = data[categoryKey];
        if (categoryFAQs) {
            console.log(`Found ${categoryFAQs.length} FAQs for category "${categoryKey}":`, categoryFAQs);
        } else {
            console.log(`No FAQs found for category "${categoryKey}"`);
        }
        return categoryFAQs;
    },
    
    // Show all available categories
    async showCategories() {
        const data = await this.loadData();
        if (!data) return;
        
        console.log('Available FAQ categories:');
        Object.keys(data).forEach(category => {
            console.log(`  - ${category} (${data[category].length} questions)`);
        });
    },
    
    // Force reload FAQs on current page
    async reloadFAQs() {
        const faqContainer = document.querySelector('.faq-list');
        if (!faqContainer) {
            console.error('FAQ container not found on this page');
            return;
        }
        
        // Clear existing FAQs
        faqContainer.innerHTML = '';
        
        // Reload dynamic FAQs
        if (typeof loadDynamicFAQs === 'function') {
            await loadDynamicFAQs();
            console.log('FAQs reloaded successfully');
        } else {
            console.error('loadDynamicFAQs function not available');
        }
    }
};

// Auto-run basic tests if in development mode
if (window.location.hostname.includes('localhost') || window.location.hostname.includes('.dev')) {
    console.log('FAQ Debug Helper loaded. Try these commands:');
    console.log('  testFAQs.showCategories() - Show all available FAQ categories');
    console.log('  testFAQs.testUrlMapping() - Test current URL category detection');
    console.log('  testFAQs.testCategory("volleyball-nets") - Test specific category');
    console.log('  testFAQs.reloadFAQs() - Force reload FAQs on current page');
}
