const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("../service-account-file.json");

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "beasiswa-indonesia"
});

const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
const messaging = admin.messaging(firebaseApp)

// Subscribe Route
app.post("/subscribe", (req, res) => {
  const { token } = req.body;
  console.log(token);
  messaging.subscribeToTopic([token], 'beasiswa-indonesia')
    .then((response) => {
      console.log('Successfully subscribed to topic:', response);
      res.json({ message: "Subscribed" })
    })
    .catch((error) => {
      console.log('Error subscribing to topic:', error);
      res.json({ message: "Error" })
    });
});

app.post("/send", (req, res) => {
  const { 
    title,
    body,
    link = "http://localhost:3000/scholarships",
    imageUrl = "https://www.umn.ac.id/wp-content/uploads/2022/06/BEASISWA-1125x675.jpeg"
  } = req.body;
  
  const message = {
    notification: {
      title,
      body,
      image: imageUrl,
    },
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
    topic: "beasiswa-indonesia"
  };
  messaging.send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.json({ message: "Success" })
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      res.json({ message: "Error" })
    });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
