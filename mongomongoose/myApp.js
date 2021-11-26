require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const personSchema = new Schema({
  name: { type: String, required: true },
  age: Number,
  favoriteFoods: [String]
});

const Person = mongoose.model("Person", personSchema);

const createAndSavePerson = (done) => {
  
  var daniel = new Person({name: "Daniel Leinweber", age: 34, favoriteFoods: ["pizza", "fresh fruit"]});

  daniel.save((err, data) => {
    if (err) {
      return console.log(err);
    }

    done(null, data)
  });

};

const createManyPeople = (arrayOfPeople, done) => {
  
  Person.create(arrayOfPeople, (err, people) => {
    if (err) {
      return console.log(err);
    }

    done(null, people);
  });

};

const findPeopleByName = (personName, done) => {

  Person.find({name: personName}, (err, personFound) => {
    if (err) {
      return console.log(err);
    }

    done(null, personFound);
  });

};

const findOneByFood = (food, done) => {
  
  Person.findOne({favoriteFoods: food}, (err, personFound) => {
    if (err) {
      return console.log(err);
    }

    done(null, personFound);
  });

};

const findPersonById = (personId, done) => {
  
  Person.findById(personId, (err, person) => {
    if (err) {
      return console.log(err);
    }

    done(null, person);
  });

};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  Person.findById(personId, (err, person) => {
    if (err) {
      return console.log(err);
    }
  
    person.favoriteFoods.push(foodToAdd);

    person.save((err, updatedPerson) => {
      if (err) {
        return console.log(err);
      }

      done(null, updatedPerson)
    })
  })
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate({name: personName}, {age: ageToSet}, {new: true}, (err, updatedPerson) => {
    if (err) {
      return console.log(err);
    }

    done(null, updatedPerson);
  })
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(
    personId,
    (err, person) => {
      if (err) {
        return console.log(err);
      }

      done(null, person);
    }
  ); 
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";

  Person.remove({name: nameToRemove}, (err, response) => {
    if (err) {
      return console.log(err);
    }
    
    done(null, response);
  });
  
};

const queryChain = (done) => {
  const foodToSearch = "burrito";

  Person
    .find({ favoriteFoods: foodToSearch })
    .sort({ name: 1 })
    .limit(2)
    .select({ age: 0 })
    .exec(function(err, people) {
      if (err) {
        return console.log(err);
      }
      
      done(null, people);
    });
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
