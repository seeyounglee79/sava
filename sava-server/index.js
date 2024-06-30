const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB 연결 설정
const mongoUri = 'mongodb+srv://sylec15:<password>@cluster0.1sv9vss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.sendStatus(201);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'secret');
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.post('/api/posts', async (req, res) => {
  const { title, content, token } = req.body;
  try {
    const { id } = jwt.verify(token, 'secret');
    const post = new Post({ title, content, author: id });
    await post.save();
    res.sendStatus(201);
  } catch {
    res.sendStatus(401);
  }
});

app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().populate('author', 'username');
  res.json(posts);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
