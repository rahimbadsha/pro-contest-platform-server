const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service.json'); // আপনার ফাইলের নাম অনুযায়ী ঠিক করুন

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
