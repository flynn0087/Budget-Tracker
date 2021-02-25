let db = () => {
    const request = window.indexedDB.open("budget", 1);

//creates storage for the objects that are awating being "online"
    request.onupgradeneeded = function(evt) {
        const db = evt.target.result;
        db.createObjectStore("budget", { keyPath: "id", autoIncrement: true });
    };
};    

//creates a transaction on the budget DB, store the object
let saveRecord = (record) => {
    const request = window.indexedDB.open("budget", 1);
    request.onerror = function(evt) {
        console.log("There was an error");
    };
    request.onsucess = () => {
        const db = request.result;
        const transaction = db.transaction(["budget"], "readwrite");
        const store = transaction.objectStore("budget");
        store.add(record);
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