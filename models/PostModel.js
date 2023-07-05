const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    text: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    picUrl: {
      type: String,
    },
    likes: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'user' },
      },
    ],
    comments: [
      {
        text: { type: String, required: true },
        _id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'user' },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('post', PostSchema);
