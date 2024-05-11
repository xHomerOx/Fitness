import mongoose from "mongoose";

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  age: {
    type: Number,
    require: true,
    min: 18,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: "student",
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },
});

export const userModel = mongoose.model(usersCollection, usersSchema);
