let db;
//new db request for a budget database
const request = indexedDB.open("budget", 1);

//creates storage for the objects that are awating being "online"
request.onupgradeneeded = function(evt) {
    const db = evt.target.result;
    db.createObjectStore("pending", { autoIncement: true });
};

//checks if online before reading the database
request.onsuccess = function(evt) {
    db = evt.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

//gives error if not online
request.onerror = function(evt) {
    console.log("There was an error");
};

//creates a transaction on the pending DB, store the object
function pendingRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

//this section compares the online database to the pending and merges them
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
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
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
};

//this listens for being back online
window.addEventListener("online", checkDatabase);