const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nurseryRoutes = require('./routes/nurseryRoutes'); // ✅ Correct path
const categoryRoutes = require('./routes/categoryRoutes');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Required for parsing JSON

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// ✅ This is the key line:
app.use('/api/nursery', nurseryRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
