import express from ""express"";
import mongoose from ""mongoose"";
import dotenv from ""dotenv"";
import cors from ""cors"";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once(""open"", async () => {

  const collections =
    await mongoose.connection.db.listCollections().toArray();

  console.log(
    collections.map(c => c.name)
  );

});

const tripSchema = new mongoose.Schema({
  Date: { type: String, required: true },
  Taker: { type: String, required: true },
  RoadLocation: { type: String, required: true },
  NipsQty: { type: Number, required: true, min: 0 },
  BigsPapersQty: { type: Number, required: true, min: 0 },
  BigsClsQty: { type: Number, required: true, min: 0 },
});

// Create or get the model
const Trip =
  mongoose.models.Trip || mongoose.model(""Trip"", tripSchema);

// POST /insert – save a new trip entry
app.post(""/trip/insert"", async (req, res) => {
  try {
    const {
      Date,
      Taker,
      RoadLocation,
      NipsQty,
      BigsPapersQty,
      BigsClsQty,
    } = req.body;

    // Basic type conversion (mongoose will also cast)
    const tripData = {
      Date: String(Date),
      Taker: String(Taker),
      RoadLocation: String(RoadLocation),
      NipsQty: Number(NipsQty),
      BigsPapersQty: Number(BigsPapersQty),
      BigsClsQty: Number(BigsClsQty),
    };

    const trip = new Trip(tripData);
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error(""Error saving trip:"", err);
    res.status(500).json({ error: ""Failed to save trip entry"" });
  }
});

// GET /data – retrieve all trip entries
app.get(""/trip/data"", async (req, res) => {
  try {
    const trips = await Trip.find({});
    res.json(trips);
  } catch (err) {
    console.error(""Error fetching trips:"", err);
    res.status(500).json({ error: ""Failed to retrieve trip entries"" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(Server is running on port );
});

export default app;
