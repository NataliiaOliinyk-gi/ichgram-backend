export const handleSaveError = (error, doc, next) => {
    if (error.name === "MongoServerError" && error.code === 11000) {
        error.status = 409; // Conflict
    } else {
        error.status = 400; // Bad Request
    }
    next();
};
export const setUpdateSettings = function (next) {
    this.options.new = true;
    this.options.runValidatiors = true;
    next();
}