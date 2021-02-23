let db;
//new db request for a budget database
const request = indexedDB.open("budget", 1);

//creates storage for the objects that are awating being "online"
request.onupgradeneeded = function(evt) {
    const db = evt.target.result;
    db.createObjectStore("pending", { autoIncement: true });
};