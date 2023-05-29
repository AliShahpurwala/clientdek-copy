export function formatAPIKey(key) {
    return key.charAt(0).toUpperCase() + key.replace(/_(id|.)/g, function(a){
        if (a === "_id") {
            return " #";
        } else {
            return " " + a.charAt(1).toUpperCase();
        }
    }).slice(1);
}
