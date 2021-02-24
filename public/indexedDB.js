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

request.onerror = function(evt) {
    console.log("There was an error");
};

