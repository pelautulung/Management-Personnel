// Storage helper: simple localStorage wrapper with JSON helpers
(function () {
    const impl = {
        get(key) {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, value); } catch (e) {}
        },
        remove(key) {
            try { localStorage.removeItem(key); } catch (e) {}
        },
        // JSON helpers
        getJSON(key) {
            try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
        },
        setJSON(key, obj) {
            try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
        }
    };

    // expose both names for compatibility
    window.StorageHelper = impl;
    window.storage = impl;
    window.Storage = impl;
})();
