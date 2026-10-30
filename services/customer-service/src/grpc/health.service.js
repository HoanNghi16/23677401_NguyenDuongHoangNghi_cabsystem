
export const healthService = {
    Check(_call, callback) {
        callback(null, {
            status: "SERVING"
        });
    }
};
