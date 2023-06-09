const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require('./service-account-file.json');

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "beasiswa-indonesia"
});

const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
const messaging = admin.messaging(firebaseApp)
const firestore = admin.firestore(firebaseApp)

// Subscribe Route
app.post("/subscribe", async (req, res) => {
  const { token, topic } = req.body;
  await firestore.collection("subscription").add({
    token,
    topic,
  })
  messaging.subscribeToTopic([token], topic)
    .then((response) => {
      console.log('Successfully subscribed to topic: ', response);
      res.json({
        message: "Berhasil subscribe ke topik: " + topic,
        status: 200
      })
    })
    .catch((error) => {
      console.log('Error subscribing to topic: ', error);
      res.json({
        message: "Gagal subscribe ke topik: " + topic,
        status: 500
      })
    });
});

app.post("/unsubscribe", async (req, res) => {
  const { token, topic } = req.body;
  messaging.unsubscribeFromTopic(token, topic)
    .then((response) => {
      console.log('Successfully unsubscribed from topic: ', response);
      res.json({
        message: "Berhasil unsubscribe dari topik: " + topic,
        status: 200
      })
    })
    .catch((error) => {
      console.log('Error unsubscribing from topic: ', error);
      res.json({
        message: "Gagal unsubscribe dari topik: " + topic,
        status: 500
      })
    });
});

app.post("/send", (req, res) => {
  const { 
    title,
    body,
    link = "http://beasiswa-indonesia.netlify.app/scholarships",
    imageUrl = "https://www.umn.ac.id/wp-content/uploads/2022/06/BEASISWA-1125x675.jpeg",
    topic= "beasiswa-indonesia"
  } = req.body;
  
  const message = {
    webpush: {
      fcm_options: {
        link,
      },
      notification: {
        title,
        body,
        image: imageUrl,
      },
    },
    topic
  };
  messaging.send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.json({
        message: "Berhasil mengirim notifikasi ke topik: " + topic,
        status: 200
      })
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      res.json({
        message: "Gagal mengirim notifikasi ke topik: " + topic,
        status: 500
      })
    });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
