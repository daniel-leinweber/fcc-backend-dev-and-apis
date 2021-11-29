const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  }
)

// Error handling
app.use((err, req, res, next) => {
  
  let errorCode
  let errorMessage

  if (err.errors) {
    // Mongoose error
    errorCode = 400
    const keys = Object.keys(err.errors)
    errorMessage = err.errors[keys[0]].message
  } else {
    // Generic error
    errorCode = err.status || 500
    errorMessage = err.message || 'Internal Server Error'
  }

  res.status(errCode).type('txt').send(errorMessage)

})

// DB Schemas
const userSchema = new mongoose.Schema({ username: String })
const User = mongoose.model('User', userSchema)

const exerciseSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date, default: Date.now()}
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

// Endpoints
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create a new user
app.post('/api/users', (req, res) => {
  
  const username = req.body.username

  User.findOne({username: username}, (err, storedUsername) => {
    
    if (err) {
      return
    }

    if (storedUsername) {
      res.send(`the username <${username}> is already in use`)
    } else {
      const newUser = new User({username: username})
      newUser.save((err, createdUser) => {
        if (err) {
          return
        }
        res.json({username: username, _id: createdUser._id})
      })
    }

  })

})

// Get all users
app.get('/api/users', (req, res) => {
  User.find({}, 'username _id', (err, users) => {
    let output = []
    users.map((user) => {
      output.push(user)
    })
    res.send(output)
  })
})

// Add exercise for user
app.post('/api/users/:userId/exercises', (req, res) => {
  
  const userId = req.params.userId
  const description = req.body.description
  const duration = req.body.duration
  let date = req.body.date

  if(date === undefined) {
    date = Date.now()
  }

  User.findById(userId, (err, user) => {
    if (err) {
      return
    }
    if (user) {

      const newExercise = new Exercise({
        userId: user._id,
        description: description,
        duration: duration
      })

      if (date.length > 0) {
        newExercise.date = new Date(date)
      }

      newExercise.save((err, createdExercise) => {
        if (err) {
          return
        }
        res.json({
          _id: createdExercise.userId, 
          username: user.username,
          date: createdExercise.date.toDateString(),
          duration: createdExercise.duration,
          description: createdExercise.description
        })
      })

    }
  })  

})

// Get all exercises of user
app.get('/api/users/:userId/logs', (req, res) => {
  
  const userId = req.params.userId
  let fromParam = req.query.from
  let toParam = req.query.to
  let limitParam = req.query.limit

  User.findById(userId, 'username _id', (err, user) => {
    
    if (err) {
      return
    }

    if (fromParam === undefined) {
      fromParam = new Date(0)
    }

    if (toParam === undefined) {
      toParam = new Date()
    }

    if (limitParam === undefined) {
      limitParam = 0
    } else {
      limitParam = parseInt(limitParam)
    }

    const query = Exercise.find({
      userId: userId,
      date: { $gte: fromParam, $lte: toParam}
    }, 'description duration date', (err) => {
      if (err) {
        return
      }
    }).sort({
      date: -1
    }).limit(limitParam)

    query.exec((err, exercises) => {
      
      if (err) {
        return
      }

      let logs = []
      exercises.map((exercise) => {
        logs.push({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString()
        })
      })

      res.json({ _id: user._id, username: user.username, count: exercises.length, log: logs})

    })

  })

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
