class HistoryManager {
    constructor() {
        this.history = [];
    }

    addEntry(entry) {
        const timestamp = new Date().toISOString();
        this.history.push({ entry, timestamp });
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
    }
}

// Example usage:
const historyManager = new HistoryManager();
historyManager.addEntry('Converted 5 miles to kilometers.');
console.log(historyManager.getHistory());

// Export the module
export default HistoryManager;