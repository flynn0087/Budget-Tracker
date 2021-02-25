let db;
const request = window.indexedDB.open("budget", 1);

//creates storage for the objects that are awating being "online"
request.onupgradeneeded = function(evt) {
    const db = evt.target.result;
    const budgetStore = db.createObjectStore("budget", { 
        keyPath: "id", 
        autoIncrement: true 
    });
    budgetStore.createIndex("amountIndex", "amount");
};

//checks if online before reading the database
request.onsuccess = () => {
    db = request.result;
};

//gives error if not online
request.onerror = () => {
    console.log("There was an error");
};

//creates a transaction on the budget DB, store the object
function saveRecord(record) {
    const transaction = db.transaction(["budget"], "readwrite");
    const budgetStore = transaction.objectStore("budget");
    budgetStore.add(record);
    console.log(record);
};

//this section compares the online database to the budget and merges them
function checkDatabase() {
    const transaction = db.transaction(["budget"], "readwrite");
    const budgetStore = transaction.objectStore("budget");
    const getAll = budgetStore.getAll();

    getAll.onsucess = function() {
        
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
            const budgetStore = transaction.objectStore("budget");
            budgetStore.clear();
        });        
    };
};

//this listens for being back online
window.addEventListener("online", checkDatabase);