let db = () => {
    const request = window.indexedDB.open("budget", 1);

//creates storage for the objects that are awating being "online"
    request.onupgradeneeded = function(evt) {
        const db = evt.target.result;
        const budgetStore = db.createObjectStore("budget", { keyPath: "id", autoIncrement: true });
        budgetStore.createIndex("nameIndex", "name");
        budgetStore.createIndex("valueIndex", "value");
        budgetStore.createIndex("dateIndex", "date");
    };
};    

//creates a transaction on the budget DB, determines if online
let saveRecord = (record) => {
    const request = window.indexedDB.open("budget", 1);
    request.onerror = function(evt) {
        console.log("There was an error");
    };
    request.onsucess = () => {
        const db = request.result;
        const transaction = db.transaction(["budget"], "readwrite");
        const budgetStore = transaction.objectStore("budget");
        budgetStore.add({ name: record.name, value: record.value, date: record.date});
    };
};

//this section compares the online database to the budget and merges them
function checkDatabase() {
    const transaction = db.transaction(["budget"], "readwrite");
    const store = transaction.objectStore("budget");
    const getAll = store.getAll();

    getAll.onsucess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["budget"], "readwrite");
                const store = transaction.objectStore("budget");
                store.clear();
            });
        }
    };
};

//this listens for being back online
window.addEventListener("online", checkDatabase);