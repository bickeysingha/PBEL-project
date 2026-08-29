const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
  },
  { timestamps: true }
);

// Same category name cannot be created twice for the same user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);